/**
 * fetch-scores.js
 * Corre en GitHub Actions cada 5 minutos.
 * Busca resultados del Mundial 2026 en ESPN y guarda data/scores.json
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const ESPN_TO_SPANISH = {
  'Mexico': 'México', 'South Africa': 'Sudáfrica', 'South Korea': 'Corea del Sur',
  'Czech Republic': 'República Checa', 'Czechia': 'República Checa',
  'Canada': 'Canadá', 'Bosnia and Herzegovina': 'Bosnia', 'Bosnia & Herzegovina': 'Bosnia',
  'Qatar': 'Qatar', 'Switzerland': 'Suiza', 'Brazil': 'Brasil', 'Morocco': 'Marruecos',
  'Haiti': 'Haití', 'Scotland': 'Escocia', 'United States': 'Estados Unidos',
  'USA': 'Estados Unidos', 'Paraguay': 'Paraguay', 'Australia': 'Australia',
  'Turkey': 'Turquía', 'Turkiye': 'Turquía', 'Germany': 'Alemania',
  'Curacao': 'Curazao', 'Curaçao': 'Curazao',
  "Cote d'Ivoire": 'Costa de Marfil', "Côte d'Ivoire": 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil', 'Ecuador': 'Ecuador', 'Netherlands': 'Países Bajos',
  'Japan': 'Japón', 'Sweden': 'Suecia', 'Tunisia': 'Túnez', 'Belgium': 'Bélgica',
  'Egypt': 'Egipto', 'Iran': 'Irán', 'New Zealand': 'Nueva Zelanda',
  'Spain': 'España', 'Cape Verde': 'Cabo Verde', 'Saudi Arabia': 'Arabia Saudita',
  'Uruguay': 'Uruguay', 'France': 'Francia', 'Senegal': 'Senegal', 'Iraq': 'Irak',
  'Norway': 'Noruega', 'Argentina': 'Argentina', 'Algeria': 'Argelia',
  'Austria': 'Austria', 'Jordan': 'Jordania', 'Portugal': 'Portugal',
  'DR Congo': 'RD de Congo', 'Democratic Republic of Congo': 'RD de Congo',
  'Congo DR': 'RD de Congo', 'Uzbekistan': 'Uzbekistán', 'Colombia': 'Colombia',
  'England': 'Inglaterra', 'Croatia': 'Croacia', 'Ghana': 'Ghana', 'Panama': 'Panamá',
};

const MATCHES = [
  {id:'A1',home:'México',away:'Sudáfrica'},{id:'A2',home:'Corea del Sur',away:'República Checa'},
  {id:'B1',home:'Canadá',away:'Bosnia'},{id:'D1',home:'Estados Unidos',away:'Paraguay'},
  {id:'B2',home:'Qatar',away:'Suiza'},{id:'C1',home:'Brasil',away:'Marruecos'},
  {id:'C2',home:'Haití',away:'Escocia'},{id:'D2',home:'Australia',away:'Turquía'},
  {id:'E1',home:'Alemania',away:'Curazao'},{id:'F1',home:'Países Bajos',away:'Japón'},
  {id:'E2',home:'Costa de Marfil',away:'Ecuador'},{id:'F2',home:'Suecia',away:'Túnez'},
  {id:'H1',home:'España',away:'Cabo Verde'},{id:'G1',home:'Bélgica',away:'Egipto'},
  {id:'H2',home:'Arabia Saudita',away:'Uruguay'},{id:'G2',home:'Irán',away:'Nueva Zelanda'},
  {id:'I1',home:'Francia',away:'Senegal'},{id:'I2',home:'Irak',away:'Noruega'},
  {id:'J1',home:'Argentina',away:'Argelia'},{id:'J2',home:'Austria',away:'Jordania'},
  {id:'K1',home:'Portugal',away:'RD de Congo'},{id:'L1',home:'Inglaterra',away:'Croacia'},
  {id:'L2',home:'Ghana',away:'Panamá'},{id:'K2',home:'Uzbekistán',away:'Colombia'},
  {id:'A3',home:'República Checa',away:'Sudáfrica'},{id:'B3',home:'Suiza',away:'Bosnia'},
  {id:'B4',home:'Canadá',away:'Qatar'},{id:'A4',home:'México',away:'Corea del Sur'},
  {id:'D3',home:'Estados Unidos',away:'Australia'},{id:'C3',home:'Escocia',away:'Marruecos'},
  {id:'C4',home:'Brasil',away:'Haití'},{id:'D4',home:'Turquía',away:'Paraguay'},
  {id:'F3',home:'Países Bajos',away:'Suecia'},{id:'E3',home:'Alemania',away:'Costa de Marfil'},
  {id:'E4',home:'Ecuador',away:'Curazao'},{id:'F4',home:'Túnez',away:'Japón'},
  {id:'H3',home:'España',away:'Arabia Saudita'},{id:'G3',home:'Bélgica',away:'Irán'},
  {id:'H4',home:'Uruguay',away:'Cabo Verde'},{id:'G4',home:'Nueva Zelanda',away:'Egipto'},
  {id:'J3',home:'Argentina',away:'Austria'},{id:'I3',home:'Francia',away:'Irak'},
  {id:'I4',home:'Noruega',away:'Senegal'},{id:'J4',home:'Jordania',away:'Argelia'},
  {id:'K3',home:'Portugal',away:'Uzbekistán'},{id:'L3',home:'Inglaterra',away:'Ghana'},
  {id:'L4',home:'Panamá',away:'Croacia'},{id:'K4',home:'Colombia',away:'RD de Congo'},
  {id:'B5',home:'Suiza',away:'Canadá'},{id:'B6',home:'Bosnia',away:'Qatar'},
  {id:'C5',home:'Marruecos',away:'Haití'},{id:'C6',home:'Brasil',away:'Escocia'},
  {id:'A5',home:'Sudáfrica',away:'Corea del Sur'},{id:'A6',home:'República Checa',away:'México'},
  {id:'E5',home:'Curazao',away:'Costa de Marfil'},{id:'E6',home:'Ecuador',away:'Alemania'},
  {id:'F5',home:'Japón',away:'Suecia'},{id:'F6',home:'Túnez',away:'Países Bajos'},
  {id:'D5',home:'Paraguay',away:'Australia'},{id:'D6',home:'Turquía',away:'Estados Unidos'},
  {id:'I5',home:'Noruega',away:'Francia'},{id:'I6',home:'Senegal',away:'Irak'},
  {id:'H5',home:'Cabo Verde',away:'Arabia Saudita'},{id:'H6',home:'Uruguay',away:'España'},
  {id:'G5',home:'Egipto',away:'Irán'},{id:'G6',home:'Nueva Zelanda',away:'Bélgica'},
  {id:'L5',home:'Croacia',away:'Ghana'},{id:'L6',home:'Panamá',away:'Inglaterra'},
  {id:'K5',home:'Colombia',away:'Portugal'},{id:'K6',home:'RD de Congo',away:'Uzbekistán'},
  {id:'J5',home:'Argelia',away:'Austria'},{id:'J6',home:'Jordania',away:'Argentina'},
];

function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FroporeoBot/1.0)', 'Accept': 'application/json' },
      timeout: 10000,
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error('JSON parse error')); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function findMatch(homeES, awayES) {
  let m = MATCHES.find(m => m.home === homeES && m.away === awayES);
  if (m) return { match: m, flipped: false };
  m = MATCHES.find(m => m.home === awayES && m.away === homeES);
  if (m) return { match: m, flipped: true };
  return null;
}

async function fetchDate(dateStr, scores) {
  const endpoints = [
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`,
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world.cup/scoreboard?dates=${dateStr}`,
  ];

  for (const url of endpoints) {
    try {
      const data = await fetchJSON(url);
      const events = data.events || [];
      if (events.length === 0) continue;

      for (const event of events) {
        try {
          const comp = event.competitions[0];
          const statusName = comp.status?.type?.name || '';
          if (statusName === 'STATUS_SCHEDULED') continue;

          const homeCmp = comp.competitors?.find(c => c.homeAway === 'home');
          const awayCmp = comp.competitors?.find(c => c.homeAway === 'away');
          if (!homeCmp || !awayCmp) continue;

          const homeEN = homeCmp.team?.displayName || '';
          const awayEN = awayCmp.team?.displayName || '';
          const homeES = ESPN_TO_SPANISH[homeEN] || homeEN;
          const awayES = ESPN_TO_SPANISH[awayEN] || awayEN;

          const found = findMatch(homeES, awayES);
          if (!found) { console.log(`  ⚠ Sin match: ${homeES} vs ${awayES}`); continue; }

          const { match, flipped } = found;
          let h = parseInt(homeCmp.score) || 0;
          let a = parseInt(awayCmp.score) || 0;
          if (flipped) [h, a] = [a, h];

          const liveStatuses = ['STATUS_IN_PROGRESS','STATUS_HALFTIME','STATUS_END_OF_PERIOD','STATUS_SHOOTOUT'];
          const status = liveStatuses.includes(statusName) ? 'live' : 'finished';

          scores[match.id] = { home: h, away: a, status, auto: true, updatedAt: new Date().toISOString() };
          console.log(`  ✓ ${match.id}: ${homeES} ${h}-${a} ${awayES} [${status}]`);
        } catch(e) { /* ignorar eventos con error */ }
      }
      return;
    } catch(e) {
      console.warn(`  Error endpoint ${url.includes('cup') ? 'cup' : 'world'}: ${e.message}`);
    }
  }
}

async function main() {
  console.log('🔄 Actualizando resultados del Mundial 2026...\n');
  const outputPath = path.join(__dirname, '..', 'data', 'scores.json');

  let existingScores = {};
  try { existingScores = JSON.parse(fs.readFileSync(outputPath, 'utf8')).scores || {}; } catch(e) {}

  const scores = { ...existingScores };
  const start = new Date('2026-06-11');
  const end   = new Date('2026-07-20');
  const today = new Date();
  const until = new Date(today); until.setDate(until.getDate() + 1);

  const cur = new Date(start);
  while (cur <= until && cur <= end) {
    const ds = cur.toISOString().slice(0,10).replace(/-/g,'');
    console.log(`📅 ${ds}`);
    await fetchDate(ds, scores);
    cur.setDate(cur.getDate() + 1);
  }

  const output = { scores, updatedAt: new Date().toISOString(), matchCount: Object.keys(scores).length };
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log(`\n✅ ${Object.keys(scores).length} resultados guardados.`);
}

main().catch(e => { console.error('❌', e); process.exit(1); });
