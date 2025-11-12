import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache do token OAuth
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

// Tipos para normalização de dados
interface NormalizedAsset {
  oem_asset_id: string;
  asset_name?: string;
  make: string;
  model?: string;
  serial_number?: string;
  operating_hours?: number;
  fuel_percent?: number;
  engine_speed?: number;
  latitude?: number;
  longitude?: number;
  altitude?: number;
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
  console.log('Client ID:', clientId);

  // Using Azure AD OAuth 2.0 client credentials flow with Caterpillar's tenant ID
  const tenantId = 'ceb177bf-013b-49ab-8a9c-4abce32afc1e';
  const tokenUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  
  // Construct the scope - use the scope provided by user
  const scope = `${clientId}/.default`;
  
  const body = new URLSearchParams({
    'grant_type': 'client_credentials',
    'client_id': clientId,
    'client_secret': clientSecret,
    'scope': scope
  });
  
  console.log('Token URL:', tokenUrl);
  console.log('Scope:', scope);
  console.log('Request body (without secret):', { grant_type: 'client_credentials', client_id: clientId, scope });
  
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
    throw new Error(`Failed to get OAuth token: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const token = data.access_token;
  
  if (!token) {
    throw new Error('No access token in response');
  }
  
  cachedToken = token;
  
  // Define expiração com margem de segurança (5 minutos antes)
  tokenExpiry = Date.now() + ((data.expires_in || 3600) - 300) * 1000;
  
  console.log('OAuth token obtained successfully');
  return token;
}

async function callCaterpillarAPI(endpoint: string, token: string) {
  return retryWithBackoff(async () => {
    const baseUrl = 'https://api.cat.com/telematics/iso15143';
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
      
      // Handle 404 as empty fleet rather than error
      if (response.status === 404) {
        console.log('No records found, returning empty fleet');
        return { fleet: { equipment: [] } };
      }
      
      // Para rate limit e server errors, lançar erro para retry
      if ([429, 500, 502, 503, 504].includes(response.status)) {
        throw response;
      }
      
      throw new Error(`API call failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  });
}

// Normalização de dados para formato canônico
function normalizeAsset(raw: any): NormalizedAsset {
  const equipment = raw;
  const header = equipment.header || {};
  const location = equipment.location || {};
  const hours = equipment.cumulativeOperatingHours || {};
  const fuel = equipment.fuelRemaining || {};
  const engine = equipment.engineStatus || {};

  return {
    oem_asset_id: header.equipmentID || header.equipmentId || '',
    asset_name: header.model || '',
    make: header.make || 'Caterpillar',
    model: header.model || '',
    serial_number: header.serialNumber || '',
    operating_hours: hours.hour || 0,
    fuel_percent: fuel.percent || 0,
    engine_speed: engine.speed || 0,
    latitude: location.latitude,
    longitude: location.longitude,
    altitude: location.altitude,
  };
}

function normalizeFleet(rawData: any): { assets: NormalizedAsset[] } {
  const equipment = rawData?.fleet?.equipment || [];
  
  if (!Array.isArray(equipment)) {
    console.warn('Equipment is not an array:', equipment);
    return { assets: [] };
  }
  
  const assets = equipment.map((item: any) => normalizeAsset(item));
  console.log(`Normalized ${assets.length} assets`);
  
  return { assets };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'fleet', normalize = true } = await req.json();

    // Obter token OAuth
    const token = await getCaterpillarToken();

    let data;
    
    switch (method) {
      case 'fleet':
        // Buscar snapshot da frota
        const page = endpoint || '1';
        const rawFleetData = await callCaterpillarAPI(`/fleet/${page}`, token);
        data = normalize ? normalizeFleet(rawFleetData) : rawFleetData;
        break;
        
      case 'equipment':
        // Buscar snapshot de equipamento específico
        const rawEquipmentData = await callCaterpillarAPI(endpoint, token);
        data = normalize ? { asset: normalizeAsset(rawEquipmentData) } : rawEquipmentData;
        break;
        
      case 'faults':
        // Buscar time series de faults
        data = await callCaterpillarAPI(endpoint, token);
        break;
        
      case 'locations':
        // Buscar time series de localizações
        data = await callCaterpillarAPI(endpoint, token);
        break;
        
      default:
        throw new Error(`Unknown method: ${method}`);
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

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
