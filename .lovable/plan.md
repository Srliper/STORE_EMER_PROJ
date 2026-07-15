## Objetivo
Substituir o checkout via WhatsApp por um fluxo completo no site: cliente preenche endereço, calcula frete pelo Melhor Envio, paga com Mercado Pago (Pix/cartão/boleto), e o pedido fica registrado no banco. WhatsApp passa a ser apenas suporte.

## Pré-requisitos (você precisa fornecer)
1. **Token Melhor Envio** (Sandbox + Produção) — em https://melhorenvio.com.br → Configurações → Tokens
2. **Mercado Pago Access Token** — em https://www.mercadopago.com.br/developers → Suas integrações → Credenciais
3. **CEP de origem** (de onde os pedidos são enviados)

Vou pedir esses secrets depois que o plano for aprovado.

## Fluxo do usuário

```text
Carrinho → [Finalizar]
   ↓
Endereço (CEP, rua, número, bairro, cidade, UF)
   ↓
Cálculo de frete (lista PAC/Sedex/Jadlog com preço e prazo)
   ↓
Resumo (itens + frete + total) → [Pagar]
   ↓
Checkout Pro Mercado Pago (Pix, cartão, boleto)
   ↓
Webhook MP confirma → pedido status "pago"
   ↓
Página "Pedido confirmado" + admin vê em /admin/pedidos
```

## Mudanças no banco (migration)
Adicionar à tabela `pedidos`:
- `endereco_cep`, `endereco_rua`, `endereco_numero`, `endereco_complemento`, `endereco_bairro`, `endereco_cidade`, `endereco_uf`
- `frete_servico` (ex: "PAC"), `frete_prazo` (dias), `frete_valor`
- `mp_preference_id`, `mp_payment_id`, `pagamento_status` ("pendente"/"pago"/"falhou")

Status do pedido passa a fluir: `aguardando_pagamento` → `pago` → `enviado` → `entregue`.

## Arquivos a criar / editar

**Server functions** (`src/lib/`)
- `frete.functions.ts` — `calcularFrete({ cep, itens })` chama API Melhor Envio
- `pagamento.functions.ts` — `criarPreferenciaMP({ pedidoId })` cria preference no MP
- `pedidos.functions.ts` — atualizar para receber endereço/frete

**Webhook público** (`src/routes/api/public/mp-webhook.ts`)
- Recebe notificação do MP, valida, marca pedido como pago

**UI**
- `src/components/CheckoutDrawer.tsx` (novo) — substitui finalização do CartDrawer; 3 steps: endereço → frete → pagamento
- `src/routes/pedido-confirmado.tsx` (novo) — página de sucesso
- `src/components/CartDrawer.tsx` — trocar botão WhatsApp por "Finalizar compra" que abre CheckoutDrawer
- `src/routes/_authenticated/admin/pedidos.tsx` — exibir endereço + frete + status pagamento

**WhatsApp**
- Mantém botão flutuante só para dúvidas (sem envio de pedido)

## Detalhes técnicos

**Melhor Envio**: POST `/api/v2/me/shipment/calculate` com `from.postal_code`, `to.postal_code`, e produtos (peso/dimensões). Como produtos atuais não têm peso, vou adicionar campos `peso`, `altura`, `largura`, `comprimento` em `produtos` com defaults sensatos (perfume: 0.3kg / 15×8×8cm; vape: 0.2kg / 12×5×5cm; camisa: 0.3kg / 30×20×3cm).

**Mercado Pago**: SDK oficial `mercadopago` no servidor. Criar Preference com `back_urls` (sucesso/falha) e `notification_url` apontando para o webhook público. Verificar assinatura no webhook (header `x-signature`).

**Segurança**: validação Zod em todas entradas; webhook valida assinatura MP; pedido só vira "pago" via webhook (nunca pelo redirect do navegador).

## Fora do escopo (pra depois se quiser)
- Cupom de desconto
- Múltiplos endereços salvos por cliente
- Rastreio automático via Melhor Envio (etiqueta)
- Parcelamento customizado

Confirma que posso seguir? Depois te peço os 3 dados (token Melhor Envio, access token MP, CEP de origem).