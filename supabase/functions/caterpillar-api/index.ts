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

    // Diagnostic endpoint (like Python diagnostics.py)
    if (method === 'diagnostics') {
      console.log('Running diagnostics...');
      const hours = parseInt(endpoint || '6');
      const diagnosticResult = {
        timestamp: new Date().toISOString(),
        base_api: 'https://api.cat.com',
        hours_window: hours,
        endpoints_tested: [] as any[],
        assets: { path: null as string | null, count: 0, sample: null as any },
        telemetry: {
          locations: { attempted: false, count: 0, last_ts: null as string | null },
          hours: { attempted: false, count: 0, last_ts: null as string | null },
          faults: { attempted: false, count: 0, last_ts: null as string | null },
          fuel: { attempted: false, count: 0, last_ts: null as string | null },
        },
        status: 'unknown' as string,
        recommendations: [] as string[],
        token_info: {
          obtained: true,
          expires_in: 3600,
        }
      };

      // Test all asset endpoints
      const endpointsToTest = [
        '/telematics/iso15143/assets',
        '/assets',
        '/visionlink/assets',
        '/visionlink/v2/assets',
        '/v1/assets',
        '/api/assets',
        '/fleet/equipment',
      ];

      for (const endpoint of endpointsToTest) {
        try {
          const testUrl = `${endpoint}?pageSize=1`;
          const data = await callCaterpillarAPI(testUrl, token);
          const items = data?.fleet?.equipment || data?.items || data?.value || [];
          
          diagnosticResult.endpoints_tested.push({
            path: endpoint,
            status: 'success',
            items_found: items.length,
          });

          if (items.length > 0 && !diagnosticResult.assets.path) {
            diagnosticResult.assets.path = endpoint;
            diagnosticResult.assets.sample = items[0];
            
            // Get full count
            const fullData = await callCaterpillarAPI(`${endpoint}?pageSize=100`, token);
            const allItems = fullData?.fleet?.equipment || fullData?.items || fullData?.value || [];
            diagnosticResult.assets.count = allItems.length;
          }
        } catch (error) {
          diagnosticResult.endpoints_tested.push({
            path: endpoint,
            status: 'failed',
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }

      // Determine overall status
      if (diagnosticResult.assets.count > 0) {
        diagnosticResult.status = 'ok';
      } else {
        diagnosticResult.status = 'no_assets';
        diagnosticResult.recommendations = [
          'Verify Client ID is authorized for CEQ organization in VisionLink/ISO product',
          'Check that each CEQ serial has "Data Sharing/AEMP" enabled in Manage Assets',
          'Confirm subscription level supports API access (not "Daily" tier)',
          'Validate API entitlements in Caterpillar portal',
          'Check if the correct product API base URL is being used',
        ];
      }

      console.log(`Diagnostic complete: ${diagnosticResult.status}, ${diagnosticResult.assets.count} assets found`);

      return new Response(
        JSON.stringify(diagnosticResult, null, 2),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // High-level endpoints (matching Python client)
    if (method === 'assets') {
      console.log('Fetching assets...');
      const page = endpoint || '1';
      
      // Try multiple endpoint variations based on diagnostic script
      const endpointsToTry = [
        `/telematics/iso15143/assets?pageSize=100&page=${page}`,
        `/assets?pageSize=100&page=${page}`,
        `/visionlink/assets?pageSize=100&page=${page}`,
        `/visionlink/v2/assets?pageSize=100&page=${page}`,
        `/v1/assets?pageSize=100&page=${page}`,
        `/api/assets?pageSize=100&page=${page}`,
        `/fleet/equipment?pageSize=100&page=${page}`,
      ];
      
      let data;
      let successEndpoint = null;
      
      for (const endpoint of endpointsToTry) {
        try {
          console.log(`Trying endpoint: ${endpoint}`);
          data = await callCaterpillarAPI(endpoint, token);
          successEndpoint = endpoint;
          console.log(`✓ Success with endpoint: ${endpoint}`);
          break;
        } catch (e) {
          console.log(`✗ Failed endpoint: ${endpoint}`);
          continue;
        }
      }
      
      if (!data) {
        console.error('All asset endpoints failed. Recommendations:');
        console.error('1. Verify Client ID is authorized for CEQ Org in VisionLink/ISO product');
        console.error('2. Check that each CEQ serial has "Data Sharing/AEMP" enabled');
        console.error('3. Confirm subscription level supports API access (not "Daily" tier)');
        console.error('4. Validate entitlements in Caterpillar portal');
        
        return new Response(
          JSON.stringify({ 
            assets: [],
            diagnostic: {
              status: 'no_assets',
              message: 'Unable to fetch assets from any known endpoint',
              recommendations: [
                'Verify Client ID authorization for CEQ organization',
                'Enable Data Sharing/AEMP for equipment serials',
                'Check API subscription level eligibility',
                'Validate entitlements in Caterpillar portal'
              ]
            }
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const normalized = normalizeFleet(data);
      console.log(`✓ Normalized ${normalized.assets.length} assets from ${successEndpoint}`);
      
      return new Response(
        JSON.stringify(normalized),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (method === 'locations') {
      console.log(`Fetching locations: ${endpoint}`);
      try {
        const data = await callCaterpillarAPI(endpoint, token);
        const items = data?.locations || data?.items || data || [];
        const normalized = normalizeCollection(items, normalizeLocation);
        console.log(`✓ Normalized ${normalized.length} locations`);
        
        return new Response(
          JSON.stringify(normalized),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Failed to fetch locations: ${error}`);
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (method === 'hours') {
      console.log(`Fetching hours: ${endpoint}`);
      try {
        const data = await callCaterpillarAPI(endpoint, token);
        const items = data?.hours || data?.items || data || [];
        const normalized = normalizeCollection(items, normalizeHours);
        console.log(`✓ Normalized ${normalized.length} hour records`);
        
        return new Response(
          JSON.stringify(normalized),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Failed to fetch hours: ${error}`);
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (method === 'faults') {
      console.log(`Fetching faults: ${endpoint}`);
      try {
        const data = await callCaterpillarAPI(endpoint, token);
        const items = data?.faults || data?.items || data || [];
        const normalized = normalizeCollection(items, normalizeFault);
        console.log(`✓ Normalized ${normalized.length} faults`);
        
        return new Response(
          JSON.stringify(normalized),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Failed to fetch faults: ${error}`);
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    if (method === 'fuel') {
      console.log(`Fetching fuel: ${endpoint}`);
      try {
        const data = await callCaterpillarAPI(endpoint, token);
        const items = data?.fuel || data?.items || data || [];
        const normalized = normalizeCollection(items, normalizeFuel);
        console.log(`✓ Normalized ${normalized.length} fuel records`);
        
        return new Response(
          JSON.stringify(normalized),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error) {
        console.error(`Failed to fetch fuel: ${error}`);
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
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
