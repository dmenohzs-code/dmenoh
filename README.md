# FoodOS Multi-Store & WhatsApp ERP

Plataforma SaaS Multi-Empresas e Multi-Segmentos projetada para Lanchonetes, Pizzarias, Hamburguerias, Açaíterias, Pastelarias e Restaurantes.

## 🚀 Módulos do Sistema

1. **Master Switcher**: Barra superior fixa para alternância instantânea entre lojas e segmentos.
2. **Dashboard / Visão Geral**: Métricas em tempo real de faturamento, pedidos e ticket médio.
3. **Kanban de Pedidos (Live)**: Painel de gestão de status com alerta sonoro nativo (Web Audio API).
4. **Cardápio Inteligente & Montadores**: Gestão de produtos e montadores avançados para Pizzas fracionadas, Açaí, Lanches e Marmitas.
5. **PDV (Frente de Caixa)**: Terminal de vendas rápidas com atalhos e emissão de cupom.
6. **Gestão de Mesas e Comandas**: Controle de salão, ocupação e fechamento de contas.
7. **Controle de Motoboys e Entregas**: Atribuição de rotas e despacho via WhatsApp.
8. **Controle de Estoque e Insumos**: Baixa automática por insumo ou produto final.
9. **Caixa e Fechamento**: Abertura, sangria, suprimento e fechamento diário.
10. **Chat WhatsApp & Atendimento**: Central de atendimento com bot automático e transbordo humano.
11. **Super Admin**: Configurações globais, planos e credenciais da API do WhatsApp (Evolution API / Z-API).

## 🛠️ Arquitetura e Execução

Este repositório contém a documentação completa e as Supabase Edge Functions (`send-whatsapp` e `webhook-whatsapp`) para integração real com o WhatsApp.
