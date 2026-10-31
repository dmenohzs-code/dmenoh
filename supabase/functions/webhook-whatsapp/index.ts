import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

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
    const body = await req.json();
    
    // Normalização básica de payload (Evolution API / Z-API / Genérico)
    let phone = '';
    let messageText = '';
    let pushName = '';

    if (body.data && body.data.key && body.data.message) {
      // Formato Evolution API
      phone = body.data.key.remoteJid?.replace(/\D/g, '') || '';
      messageText = body.data.message.conversation || body.data.message.extendedTextMessage?.text || '';
      pushName = body.data.pushName || 'Cliente';
    } else if (body.phone && body.text) {
      // Formato Z-API / Genérico
      phone = body.phone.replace(/\D/g, '');
      messageText = body.text.message || body.text || '';
      pushName = body.senderName || 'Cliente';
    } else if (body.messages && body.messages.length > 0) {
      phone = body.messages[0].from?.replace(/\D/g, '') || '';
      messageText = body.messages[0].body || '';
    }

    if (!phone || !messageText) {
      return new Response(JSON.stringify({ status: 'ignored', reason: 'Missing phone or message' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 1. Salvar mensagem na tabela whatsapp_messages
    await supabase.from('whatsapp_messages').insert([
      {
        phone,
        sender: 'client',
        message: messageText,
        created_at: new Date().toISOString(),
      }
    ]);

    // 2. Verificar se o bot está pausado para este número (transbordo para atendente)
    // Podemos checar em uma tabela de atendimento ou store_settings / active chats
    const { data: activeChat } = await supabase
      .from('whatsapp_messages')
      .select('*')
      .eq('phone', phone)
      .order('created_at', { ascending: false })
      .limit(1);

    // Simulação de verificação de bot pausado (se houver flag bot_paused)
    const isBotPaused = activeChat && activeChat[0]?.bot_paused === true;

    if (isBotPaused) {
      // Bot pausado, apenas armazena a mensagem para o atendente humano responder no painel
      return new Response(JSON.stringify({ status: 'success', bot: 'paused' }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Executar o fluxo do chatbot
    const textLower = messageText.trim().toLowerCase();
    let replyMessage = '';

    if (textLower.includes('cardapio') || textLower.includes('menu') || textLower.includes('olá') || textLower.includes('ola') || textLower.includes('inicio')) {
      // Buscar categorias e produtos ativos
      const { data: categories } = await supabase.from('categories').select('name').eq('is_available', true);
      const catList = categories ? categories.map(c => `- ${c.name}`).join('\n') : '';
      
      replyMessage = `🤖 Olá *${pushName}*! Seja bem-vindo à nossa loja.\n\nConfira nossas categorias disponíveis:\n${catList}\n\nResponda com o nome do produto ou digite *STATUS* para ver seu pedido ou *ATENDENTE* para falar com nossa equipe.`;
    } else if (textLower.includes('status') || textLower.includes('pedido')) {
      // Buscar último pedido do cliente
      const { data: orders } = await supabase
        .from('orders')
        .select('id, status, total')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false })
        .limit(1);

      if (orders && orders.length > 0) {
        const ord = orders[0];
        replyMessage = `📦 Seu último pedido #${ord.id} está com o status: *${ord.status}*. Valor total: R$ ${ord.total}`;
      } else {
        replyMessage = `❌ Não encontramos pedidos recentes associados ao seu número ${phone}.`;
      }
    } else if (textLower.includes('atendente') || textLower.includes('humano') || textLower.includes('suporte')) {
      // Transbordo para atendente
      replyMessage = `👤 Entendido! Estamos transferindo seu atendimento para um atendente humano. Aguarde um momento. O bot foi pausado para esta conversa.`;
      
      // Atualiza mensagens recentes para pausar o bot
      await supabase
        .from('whatsapp_messages')
        .update({ bot_paused: true })
        .eq('phone', phone);
    } else {
      replyMessage = `🤖 Não entendi bem. Digite *CARDAPIO* para ver nossos produtos, *STATUS* para acompanhar seu pedido ou *ATENDENTE* para falar com nossa equipe.`;
    }

    // Salvar resposta do bot
    await supabase.from('whatsapp_messages').insert([
      {
        phone,
        sender: 'bot',
        message: replyMessage,
        created_at: new Date().toISOString(),
      }
    ]);

    // Disparar envio via Edge Function send-whatsapp interna ou retornar resposta
    return new Response(
      JSON.stringify({ status: 'success', reply: replyMessage }),
      { status: 200, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
});
