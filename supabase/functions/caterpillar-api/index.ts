import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache do token OAuth
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Tipos para normalização de dados (INFRA canonical schema)
interface DeviceInfo {
  solution?: string;
  primary_device?: string;
  device_serial?: string;
  software_part?: string;
  hardware_part?: string;
  communication_method?: string;
  data_connection?: boolean;
}

interface NormalizedAsset {
  oem: string;
  oem_asset_id: string;
  name?: string;
  make: string;
  model?: string;
  serial?: string;
  subscription?: string;
  status?: string;
  device_info?: DeviceInfo;
}

interface NormalizedLocation {
  asset_ref: string;
  ts: string;
  lat?: number;
  lon?: number;
  speed?: number;
  heading?: number;
  source: string;
}

interface NormalizedHours {
  asset_ref: string;
  ts: string;
  hour_meter?: number;
  source: string;
}

interface NormalizedFault {
  asset_ref: string;
  ts: string;
  code?: string;
  severity?: string;
  description?: string;
  source: string;
}

interface NormalizedFuel {
  asset_ref: string;
  ts: string;
  fuel_used?: number;
  fuel_level?: number;
  source: string;
}

// Função auxiliar para retry com backoff exponencial
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 6,
  initialDelay = 1000
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      // Se não for erro de rate limit ou server error, não retenta
      if (error instanceof Response) {
        if (![429, 500, 502, 503, 504].includes(error.status)) {
          throw error;
        }
      }
      
      // Última tentativa
      if (attempt === maxRetries - 1) {
        throw lastError;
      }
      
      // Backoff exponencial com jitter
      const delay = initialDelay * Math.pow(2, attempt) + Math.random() * 1000;
      const maxDelay = 30000; // 30s max
      const actualDelay = Math.min(delay, maxDelay);
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(actualDelay)}ms`);
      await new Promise(resolve => setTimeout(resolve, actualDelay));
    }
  }
  
  throw lastError;
}

async function getCaterpillarToken(): Promise<string> {
  // Verificar se o token em cache ainda é válido
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken as string;
  }

  const clientId = Deno.env.get('CATERPILLAR_CLIENT_ID');
  const clientSecret = Deno.env.get('CATERPILLAR_CLIENT_SECRET');

  if (!clientId || !clientSecret) {
    throw new Error('Caterpillar credentials not configured');
  }

  console.log('Fetching new Caterpillar OAuth token...');

  // Using Azure AD OAuth 2.0 client credentials flow
  const tenantId = 'ceb177bf-013b-49ab-8a9c-4abce32afc1e';
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const scope = `${clientId}/.default`;
  
  const body = new URLSearchParams({
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
    'scope': scope
  });
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Token request failed:', response.status, errorText);
    throw new Error(`Failed to get OAuth token: ${response.status}`);
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
  
  console.log('OAuth token obtained successfully');
  return cachedToken as string;
}

async function callCaterpillarAPI(endpoint: string, token: string) {
  return retryWithBackoff(async () => {
    // Try different base URLs based on the API version
    const baseUrl = 'https://api.cat.com';
    const url = `${baseUrl}${endpoint}`;
    
    console.log('Calling Caterpillar API:', url);
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'X-Cat-API-Tracking-Id': crypto.randomUUID()
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API call failed:', response.status, errorText);
      
      if (response.status === 404) {
        console.log('No records found, returning empty result');
        return { fleet: { equipment: [] } };
      }
      
      if ([429, 500, 502, 503, 504].includes(response.status)) {
        throw response;
      }
      
      throw new Error(`API call failed: ${response.status}`);
    }

    return await response.json();
  });
}

// Normalization functions (canonical INFRA schema)
function normalizeAsset(raw: any): NormalizedAsset {
  const device = raw.device || raw.telematicsDevice || raw.telematics || {};
  
  return {
    oem: 'caterpillar',
    oem_asset_id: raw.id || raw.assetId || raw.assetID || '',
    name: raw.name || raw.assetName,
    make: raw.make || 'Caterpillar',
    model: raw.model,
    serial: raw.serialNumber || raw.serial,
    subscription: raw.subscriptionStatus || raw.subscription,
    status: raw.status || raw.assetStatus,
    device_info: {
      solution: device.solution || device.model || device.type,
      primary_device: device.primaryDevice || device.deviceModel,
      device_serial: device.serialNumber || device.serial || device.deviceSerial,
      software_part: device.softwarePartNumber || device.softwareVersion,
      hardware_part: device.hardwarePartNumber || device.hardwareVersion,
      communication_method: device.communicationMethod || device.connectivity,
      data_connection: device.dataConnection !== undefined ? device.dataConnection : device.hasDataConnection,
    },
  };
}

function normalizeLocation(raw: any): NormalizedLocation {
  const ts = raw.eventTime || raw.timestamp || raw.occurrenceTime || '';
  const lat = raw.lat || raw.latitude;
  const lon = raw.lon || raw.longitude;
  return {
    asset_ref: raw.assetId || raw.id || '',
    ts,
    lat,
    lon,
    speed: raw.speed,
    heading: raw.heading,
    source: 'visionlink',
  };
}

function normalizeHours(raw: any): NormalizedHours {
  const ts = raw.eventTime || raw.timestamp || '';
  return {
    asset_ref: raw.assetId || raw.id || '',
    ts,
    hour_meter: raw.hourMeter || raw.hours,
    source: 'visionlink',
  };
}

function normalizeFault(raw: any): NormalizedFault {
  const ts = raw.eventTime || raw.timestamp || '';
  return {
    asset_ref: raw.assetId || raw.id || '',
    ts,
    code: raw.faultCode || raw.code,
    severity: raw.severity,
    description: raw.description || raw.message,
    source: 'visionlink',
  };
}

function normalizeFuel(raw: any): NormalizedFuel {
  const ts = raw.eventTime || raw.timestamp || '';
  return {
    asset_ref: raw.assetId || raw.id || '',
    ts,
    fuel_used: raw.fuelUsed || raw.fuelConsumption,
    fuel_level: raw.fuelLevel,
    source: 'visionlink',
  };
}

function normalizeFleet(rawData: any): { assets: NormalizedAsset[] } {
  const equipment = rawData?.fleet?.equipment || [];
  
  if (!Array.isArray(equipment)) {
    console.warn('Equipment is not an array:', equipment);
    return { assets: [] };
  }
  
  const assets = equipment.map((item: any) => normalizeAsset(item));
  return { assets };
}

function normalizeCollection(rawData: any, normalizer: (raw: any) => any): any[] {
  const items: any[] = [];
  
  if (rawData && Array.isArray(rawData)) {
    for (const item of rawData) {
      items.push(normalizer(item));
    }
  }
  
  return items;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'assets' } = await req.json();
    const token = await getCaterpillarToken();

    // High-level endpoints (matching Python client)
    if (method === 'assets') {
      console.log('Fetching assets...');
      const page = endpoint || '1';
      
      // Try multiple endpoint variations
      let data;
      try {
        // Try ISO 15143-3 standard endpoint first
        data = await callCaterpillarAPI(`/telematics/iso15143/assets?pageSize=100&page=${page}`, token);
      } catch (e) {
        console.log('ISO endpoint failed, trying VisionLink endpoint...');
        try {
          data = await callCaterpillarAPI(`/visionlink/v2/assets?pageSize=100&page=${page}`, token);
        } catch (e2) {
          console.log('VisionLink v2 failed, trying fleet endpoint...');
          data = await callCaterpillarAPI(`/fleet/equipment?pageSize=100&page=${page}`, token);
        }
      }
      
      const normalized = normalizeFleet(data);
      console.log(`Normalized ${normalized.assets.length} assets`);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'locations') {
      console.log(`Fetching locations: ${endpoint}`);
      const data = await callCaterpillarAPI(endpoint, token);
      const items = data?.locations || data?.items || data || [];
      const normalized = normalizeCollection(items, normalizeLocation);
      console.log(`Normalized ${normalized.length} locations`);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'hours') {
      console.log(`Fetching hours: ${endpoint}`);
      const data = await callCaterpillarAPI(endpoint, token);
      const items = data?.hours || data?.items || data || [];
      const normalized = normalizeCollection(items, normalizeHours);
      console.log(`Normalized ${normalized.length} hour records`);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'faults') {
      console.log(`Fetching faults: ${endpoint}`);
      const data = await callCaterpillarAPI(endpoint, token);
      const items = data?.faults || data?.items || data || [];
      const normalized = normalizeCollection(items, normalizeFault);
      console.log(`Normalized ${normalized.length} faults`);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'fuel') {
      console.log(`Fetching fuel: ${endpoint}`);
      const data = await callCaterpillarAPI(endpoint, token);
      const items = data?.fuel || data?.items || data || [];
      const normalized = normalizeCollection(items, normalizeFuel);
      console.log(`Normalized ${normalized.length} fuel records`);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Legacy compatibility
    if (method === 'equipment') {
      console.log(`Fetching equipment: ${endpoint}`);
      const data = await callCaterpillarAPI(endpoint, token);
      const normalized = normalizeAsset(data);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    throw new Error(`Unknown method: ${method}`);

  } catch (error) {
    console.error('Error in caterpillar-api function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Check edge function logs for more information'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
