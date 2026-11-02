# FoodOS & WhatsApp ERP — Plataforma SaaS Multi-Empresas

Sistema completo de gestão e atendimento omnicanal para Lanchonetes, Pizzarias, Hamburguerias, Açaíterias, Pastelarias e Restaurantes.

## 🚀 Visão Geral
O **FoodOS & WhatsApp ERP** foi desenhado para operar em múltiplos modos de visualização (`viewMode`), alternando instantaneamente entre:
1. **Cliente (`cliente`)**: Experiência mobile-first de cardápio digital, montagem de itens complexos (pizzas fracionadas, açaí, lanches), sacola flutuante, checkout simulado e rastreador de pedidos em tempo real.
2. **Login (`login`)**: Tela de autenticação unificada e seleção de perfis empresariais/operadores.
3. **ERP Desktop (`erp`)**: Painel administrativo completo contendo:
   - **Dashboard**: Métricas financeiras e operacionais em tempo real.
   - **Kanban de Pedidos (Live)**: Gestão de fluxo de pedidos com alertas via Web Audio API.
   - **PDV (Frente de Caixa)**: Balcão rápido e emissão de comanda.
   - **Mapa de Mesas & Comandas**: Controle de salão e consumo por mesa.
   - **Motoboys & Entregas**: Despacho de rotas e disparo de WhatsApp automático para entregadores.
   - **Cardápio & Estoque**: Gestão de insumos, categorias e disponibilidade de itens.
   - **Caixa & Fechamento**: Abertura, fechamento, sangria e suprimento.
   - **Chat WhatsApp**: Atendimento omnichannel com transbordo de IA e atendente humano.
4. **KDS (`kds`)**: Kitchen Display System otimizado para operação de cozinha e montagem.

---

## 🛠️ Arquitetura e Supabase Edge Functions
O sistema integra-se nativamente com o Supabase através de duas Edge Functions robustas:

### 1. `send-whatsapp` (`supabase/functions/send-whatsapp/index.ts`)
- Responsável pelo disparo de mensagens via APIs oficiais (**Evolution API** ou **Z-API**) com fallback automático para `wa.me`.
- Suporta payload normalizado com número e mensagem.

### 2. `webhook-whatsapp` (`supabase/functions/webhook-whatsapp/index.ts`)
- Processa webhooks recebidos do WhatsApp.
- Gerencia o chatbot inteligente para exibição de cardápio, verificação de status de pedidos e transbordo (`bot_paused = true`) para atendimento humano.

---

## 📱 Como Executar o Projeto
1. Configure suas variáveis de ambiente do Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
2. Realize o deploy das Edge Functions:
   ```bash
   supabase functions deploy send-whatsapp
   supabase functions deploy webhook-whatsapp
   ```
3. Acesse a plataforma e utilize o **Master Switcher** superior para alternar entre os modos de operação.