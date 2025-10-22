import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cache do token OAuth
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

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

  const tokenUrl = 'https://fedlogin.cat.com/as/token.oauth2?pfidpadapterid=OAuthAdapterCCDS';
  
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
    },
    body: 'grant_type=client_credentials'
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
    throw new Error(`API call failed: ${response.status} ${errorText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, method = 'fleet' } = await req.json();

    // Obter token OAuth
    const token = await getCaterpillarToken();

    let data;
    
    switch (method) {
      case 'fleet':
        // Buscar snapshot da frota
        const page = endpoint || '1';
        data = await callCaterpillarAPI(`/fleet/${page}`, token);
        break;
        
      case 'equipment':
        // Buscar snapshot de equipamento específico
        // endpoint deve ser: "/fleet/equipment/makeModelSerial/{make}/{model}/{serialNumber}"
        data = await callCaterpillarAPI(endpoint, token);
        break;
        
      case 'faults':
        // Buscar time series de faults
        // endpoint deve ser: "/fleet/equipment/makeModelSerial/{make}/{model}/{serialNumber}/faults/{start}/{end}/{page}"
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
