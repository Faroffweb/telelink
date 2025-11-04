import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, service = 'gplinks' } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Shortening URL:', url, 'using service:', service);

    let apiKey: string | undefined;
    let apiUrl: string;

    // Select API based on service
    switch (service) {
      case 'gplinks':
        apiKey = Deno.env.get('GPLINKS_API_KEY');
        if (!apiKey) {
          console.error('GPLINKS_API_KEY not configured');
          return new Response(
            JSON.stringify({ error: 'GPLinks not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `https://api.gplinks.com/api?api=${apiKey}&url=${encodeURIComponent(url)}`;
        break;

      case 'mdiskshortner':
        apiKey = Deno.env.get('MDISKSHORTNER_API_KEY');
        if (!apiKey) {
          console.error('MDISKSHORTNER_API_KEY not configured');
          return new Response(
            JSON.stringify({ error: 'MDisk Shortner not configured' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        apiUrl = `https://mdiskshortner.link/api?api=${apiKey}&url=${encodeURIComponent(url)}`;
        break;

      default:
        return new Response(
          JSON.stringify({ error: `Unsupported service: ${service}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log('Calling API:', apiUrl);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`${service} API error:`, response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to shorten link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`${service} response:`, data);

    // Handle response based on service
    let shortenedUrl: string | null = null;
    
    if (service === 'gplinks' && data.status === 'success' && data.shortenedUrl) {
      shortenedUrl = data.shortenedUrl;
    } else if (service === 'mdiskshortner' && data.shortenedUrl) {
      shortenedUrl = data.shortenedUrl;
    }

    if (shortenedUrl) {
      return new Response(
        JSON.stringify({ shortenedUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      console.error(`${service} unexpected response:`, data);
      return new Response(
        JSON.stringify({ error: data.message || 'Failed to shorten link' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('Error in shorten-link function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
