[README.md](https://github.com/user-attachments/files/25914091/README.md)

# Mercados Hoje — Dashboard estático (GitHub Pages / Netlify)

Dashboard de cotações com **comparativos de 24h, 7 dias, 1 mês e 1 ano** para:
- **Forex** (ex.: EUR/USD) — via exchangerate.host (sem chave)
- **Criptomoedas** (BTC, ETH) — via CoinGecko (sem chave)
- **Metais preciosos** (XAU, XAG) — via Metals API (serverless)
- **Petróleo** (Brent, WTI) — via OilPriceAPI (serverless)
- **Índices/Ações** (SPY, MSFT) — via Alpha Vantage (serverless)

> ⚠️ Em **GitHub Pages** (sem funções), os blocos de Metais/Petróleo/Ações usam **JSON de exemplo** em `/api/*.json`. Para dados reais, publique no **Netlify** e ative as funções serverless.

## Como usar

### Opção A) GitHub Pages (sem chaves)
1. Faça upload desta pasta para um repositório.
2. Ative **Settings → Pages** e escolha a branch (root).
3. Abra `https://<utilizador>.github.io/<repo>/`.
   - Forex e Cripto já funcionam com dados reais.
   - Metais, Petróleo, Ações usam `/api/*.json` de exemplo.

### Opção B) Netlify (com funções serverless)
1. **Deploy** no Netlify (ligar ao Git ou *drag & drop*).
2. Em **Site settings → Environment variables**, defina:
   - `ALPHA_VANTAGE_KEY` (Alpha Vantage)
   - `OILPRICEAPI_TOKEN` (OilPriceAPI)
   - `METALS_API_KEY` (Metals API)
3. Abra `assets/config.example.js` e altere `USE_SERVERLESS` para `true`.
4. Refaça o deploy. Agora Metais/Petróleo/Ações vêm de funções serverless.

## Como são calculadas as variações (%)

- **Forex**: endpoint `timeseries` da exchangerate.host (histórico até 365 dias). Calcula-se a variação entre o preço mais recente e o valor aproximado há **1, 7, 30 e 365 dias**. \[Fonte: exchangerate.host docs e repositório público com `timeseries`/`fluctuation`.\]  
- **Cripto**: endpoint `coins/{id}/market_chart` da CoinGecko para **30 dias** (usado em 24h/7d/30d) e **365 dias** (para 1y). Seleciona-se o ponto temporal mais próximo e calcula-se a percentagem. \[Fonte: CoinGecko API docs.\]
- **Metais**: `timeseries` da Metals API (base USD). A função serverless devolve já os deltas (24h/7d/30d/1y). \[Fonte: Metals API páginas oficiais.\]
- **Petróleo**: endpoint de **histórico** da OilPriceAPI (intervalo diário). A função serverless devolve deltas. \[Fonte: OilPriceAPI docs.\]
- **Ações/Índices**: Alpha Vantage `TIME_SERIES_DAILY`. A função serverless encontra o fecho útil mais próximo a 1, 7, 30 e 365 dias e calcula as percentagens. \[Fonte: Alpha Vantage docs.\]

## Personalização
- Edite `assets/config.example.js` para alterar **ativos** (pares forex, ids CoinGecko, códigos de metais/petróleo, símbolos de ações).
- Estilos em `assets/style.css`.

## Notas de quota/limites
- CoinGecko tem limites por minuto para o *free tier*; evite pedir muitos ativos de uma vez.
- Alpha Vantage *free* impõe limites por minuto/dia — as funções já pedem apenas o necessário.
- Em produção, considere cache adicionais (serverless) para respeitar limites.

## Créditos e Termos
- Atribua as fontes quando exigido pelos termos de uso de cada API.

