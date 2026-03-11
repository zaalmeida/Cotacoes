
import { fmt, pct, percentChange, nearestValueByTimestamp, daysAgoTs, nowPt } from './utils.js';
import { USE_SERVERLESS, ASSETS } from './config.example.js';

const elCards = document.getElementById('cards');
const setUpdated = () => document.getElementById('last-updated').textContent = 'Atualizado: ' + nowPt();

function cardTemplate(title, id){
  const wrap = document.createElement('section'); wrap.className='card';
  wrap.innerHTML = `
    <h2>${title}</h2>
    <div id="${id}"></div>
    <div class="note"></div>
  `;
  elCards.appendChild(wrap); return wrap;
}

function renderRow(container, label, price, changes){
  const row = document.createElement('div'); row.className='row';
  const chips = `
    <span class="chip ${changes.d1>=0?'up':'down'}">24h ${pct(changes.d1)}</span>
    <span class="chip ${changes.d7>=0?'up':'down'}">7d ${pct(changes.d7)}</span>
    <span class="chip ${changes.d30>=0?'up':'down'}">1m ${pct(changes.d30)}</span>
    <span class="chip ${changes.d365>=0?'up':'down'}">1a ${pct(changes.d365)}</span>`;
  row.innerHTML = `<span class="sym">${label}</span><span class="price">${fmt(price, 4)}</span><span class="chips">${chips}</span>`;
  container.appendChild(row);
}

async function cachedFetch(key, url, ttlMs=60000){
  const now = Date.now();
  const c = localStorage.getItem(key);
  if (c){ try{ const {ts,data}=JSON.parse(c); if (now-ts < ttlMs) return data; }catch{ /* */ } }
  const res = await fetch(url); const data = await res.json();
  localStorage.setItem(key, JSON.stringify({ts:now, data})); return data;
}

// -------- FOREX via exchangerate.host (timeseries) --------
async function loadForex(){
  const box = cardTemplate('Forex', 'fx');
  const cont = box.querySelector('#fx');
  for(const p of ASSETS.forex){
    const end = new Date(); const start = new Date(Date.now()-400*24*3600*1000);
    const url = `https://api.exchangerate.host/timeseries?start_date=${start.toISOString().slice(0,10)}&end_date=${end.toISOString().slice(0,10)}&base=${p.base}&symbols=${p.quote}`;
    const data = await cachedFetch(`fx_${p.base}_${p.quote}`, url, 10*60*1000);
    const rates = data?.rates || {};
    const dates = Object.keys(rates).sort();
    const last = rates[dates[dates.length-1]]?.[p.quote];
    function getPast(days){
      const target = new Date(Date.now()-days*24*3600*1000).toISOString().slice(0,10);
      // procurar a data disponível mais próxima (para fins práticos)
      let idx = dates.findIndex(d=>d>=target); if (idx<0) idx = dates.length-1;
      return rates[dates[idx]]?.[p.quote];
    }
    const chg = {
      d1: percentChange(last, getPast(1)),
      d7: percentChange(last, getPast(7)),
      d30: percentChange(last, getPast(30)),
      d365: percentChange(last, getPast(365))
    };
    renderRow(cont, `${p.base}/${p.quote}`, last, chg);
  }
  box.querySelector('.note').textContent = 'Fonte: exchangerate.host (timeseries)';
}

// -------- CRIPTO via CoinGecko (market_chart) --------
async function loadCrypto(){
  const box = cardTemplate('Criptomoedas', 'crypto');
  const cont = box.querySelector('#crypto');
  for(const c of ASSETS.crypto){
    // 30d para 24h/7d/30d + 365d para 1y
    const url30 = `https://api.coingecko.com/api/v3/coins/${c.id}/market_chart?vs_currency=usd&days=30`;
    const url365= `https://api.coingecko.com/api/v3/coins/${c.id}/market_chart?vs_currency=usd&days=365&interval=daily`;
    const d30 = await cachedFetch(`cg_${c.id}_30`, url30, 60*1000);
    const d365= await cachedFetch(`cg_${c.id}_365`, url365, 5*60*1000);
    const pSeries = (d30?.prices||[]).concat([]); // shallow
    const last = pSeries.length? pSeries[pSeries.length-1][1] : null;
    const chg = {
      d1: percentChange(last, nearestValueByTimestamp(pSeries, daysAgoTs(1))),
      d7: percentChange(last, nearestValueByTimestamp(pSeries, daysAgoTs(7))),
      d30: percentChange(last, pSeries[0]?.[1]),
      d365: percentChange(last, nearestValueByTimestamp(d365?.prices||[], daysAgoTs(365)))
    };
    renderRow(cont, `${c.sym}/USD`, last, chg);
  }
  box.querySelector('.note').textContent = 'Fonte: CoinGecko market_chart';
}

// -------- METAIS via serverless (ou placeholder) --------
async function loadMetals(){
  const box = cardTemplate('Metais preciosos (USD/oz)', 'metals');
  const cont = box.querySelector('#metals');
  for (const m of ASSETS.metals){
    if (USE_SERVERLESS) {
      const data = await cachedFetch(`metal_${m.code}`, `/.netlify/functions/metalsLatest?code=${m.code}`, 5*60*1000);
      renderRow(cont, `${m.name} (${m.code})`, data.price, data.changes);
    } else {
      // Sem serverless, mostrar aviso e valor mock (se desejar, edite em /api)
      const mockUrl = `./api/${m.code.toLowerCase()}.json`;
      try{
        const data = await cachedFetch(`metal_mock_${m.code}`, mockUrl, 60*60*1000);
        if (data) { renderRow(cont, `${m.name} (${m.code})`, data.price, data.changes); }
      }catch{ renderRow(cont, `${m.name} (${m.code})`, null, {d1:null,d7:null,d30:null,d365:null}); }
    }
  }
  box.querySelector('.note').textContent = USE_SERVERLESS ? 'Fonte: Metals API (via função serverless)' : 'Ative funções serverless para dados em tempo real';
}

// -------- PETRÓLEO via serverless (ou placeholder) --------
async function loadOil(){
  const box = cardTemplate('Petróleo (USD/bbl)', 'oil');
  const cont = box.querySelector('#oil');
  for (const o of ASSETS.oil){
    if (USE_SERVERLESS) {
      const data = await cachedFetch(`oil_${o.code}`, `/.netlify/functions/oilLatest?code=${o.code}`, 5*60*1000);
      renderRow(cont, `${o.name}`, data.price, data.changes);
    } else {
      try{ const data = await cachedFetch(`oil_mock_${o.code}`, `./api/${o.code.toLowerCase()}.json`, 60*60*1000);
           if (data) renderRow(cont, `${o.name}`, data.price, data.changes);
      }catch{ renderRow(cont, `${o.name}`, null, {d1:null,d7:null,d30:null,d365:null}); }
    }
  }
  box.querySelector('.note').textContent = USE_SERVERLESS ? 'Fonte: OilPriceAPI (via função serverless)' : 'Ative funções serverless para dados em tempo real';
}

// -------- ÍNDICES & AÇÕES via serverless (ou placeholder) --------
async function loadEquities(){
  const box = cardTemplate('Índices & Ações', 'eq');
  const cont = box.querySelector('#eq');
  for(const s of ASSETS.equities){
    if (USE_SERVERLESS) {
      const data = await cachedFetch(`eq_${s.symbol}`, `/.netlify/functions/alphaQuote?symbol=${s.symbol}`, 2*60*1000);
      renderRow(cont, s.name, data.price, data.changes);
    } else {
      try{ const data = await cachedFetch(`eq_mock_${s.symbol}`, `./api/${s.symbol.toLowerCase()}.json`, 60*60*1000);
           if (data) renderRow(cont, s.name, data.price, data.changes);
      }catch{ renderRow(cont, s.name, null, {d1:null,d7:null,d30:null,d365:null}); }
    }
  }
  box.querySelector('.note').textContent = USE_SERVERLESS ? 'Fonte: Alpha Vantage (via função serverless)' : 'Ative funções serverless para dados em tempo real';
}

async function init(){
  setUpdated();
  await Promise.all([loadForex(), loadCrypto(), loadMetals(), loadOil(), loadEquities()]);
}
init();
