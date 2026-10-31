import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface SendWhatsAppRequest {
  phone: string;
  message: string;
  instanceUrl?: string;
  apiKey?: string;
  instanceName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { phone, message, instanceUrl, apiKey, instanceName }: SendWhatsAppRequest = await req.json();

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: 'Parâmetros phone e message são obrigatórios' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const cleanPhone = phone.replace(/\D/g, '');

    // Se houver configuração da Evolution API ou Z-API
    if (instanceUrl && apiKey) {
      try {
        let endpoint = '';
        let payload: any = {};
        let headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'apikey': apiKey,
        };

        // Detecta se é Evolution API ou Z-API pelo formato da URL ou parâmetros
        if (instanceUrl.includes('evolution') || instanceName) {
          // Exemplo padrão Evolution API v2
          endpoint = `${instanceUrl.replace(/\/+$/, '')}/message/sendText/${instanceName || 'default'}`;
          payload = {
            number: cleanPhone,
            text: message,
          };
        } else {
          // Exemplo padrão Z-API
          endpoint = `${instanceUrl.replace(/\/+$/, '')}/send-text`;
          headers['Client-Token'] = apiKey;
          payload = {
            phone: cleanPhone,
            message: message,
          };
        }

        const response = await fetch(endpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          return new Response(
            JSON.stringify({ success: true, provider: 'api', data }),
            { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
          );
        } else {
          console.warn('Falha na API oficial do WhatsApp, ativando fallback wa.me');
        }
      } catch (apiError) {
        console.error('Erro ao chamar API do WhatsApp, ativando fallback:', apiError);
      }
    }

    // Fallback para wa.me
    const encodedMessage = encodeURIComponent(message);
    const waMeUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

    return new Response(
      JSON.stringify({
        success: true,
        provider: 'fallback_wame',
        waMeUrl,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
