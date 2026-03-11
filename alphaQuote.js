
// /.netlify/functions/metalsLatest
// Usa Metals API (metalsapi.com/metalsapi.org) para histórico e calcular variações
// Requer METALS_API_KEY

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try{
    const key = process.env.METALS_API_KEY;
    if(!key) return { statusCode:500, body: JSON.stringify({error:'Missing METALS_API_KEY'}) };
    const code = (event.queryStringParameters && event.queryStringParameters.code) || 'XAU';
    const end = new Date(); const start = new Date(Date.now()-400*24*3600*1000);
    // Algumas instâncias usam metalsapi.org, outras metals-api.com; ajuste conforme sua conta
    const url = `https://metals-api.com/api/timeseries?access_key=${key}&start_date=${start.toISOString().slice(0,10)}&end_date=${end.toISOString().slice(0,10)}&base=USD&symbols=${encodeURIComponent(code)}`;
    const res = await fetch(url); const data = await res.json();
    const rates = data.rates || {}; const dates = Object.keys(rates).sort();
    if (!dates.length) throw new Error('No metals data');
    const lastDate = dates[dates.length-1];
    const last = rates[lastDate][code];
    function findPast(days){
      const target = new Date(Date.now()-days*24*3600*1000).toISOString().slice(0,10);
      // escolher data mais próxima >= target
      let idx = dates.findIndex(d=>d>=target); if (idx<0) idx=dates.length-1; return rates[dates[idx]][code];
    }
    const changes = {
      d1: ((last - findPast(1))/findPast(1))*100,
      d7: ((last - findPast(7))/findPast(7))*100,
      d30: ((last - findPast(30))/findPast(30))*100,
      d365: ((last - findPast(365))/findPast(365))*100
    };
    return { statusCode:200, body: JSON.stringify({ code, price:last, changes }) };
  }catch(e){ return { statusCode:500, body: JSON.stringify({error:e.message}) } }
};
