/**
 * fetch-scores.js
 * Corre en GitHub Actions cada 5 minutos.
 * 1. Fetchea resultados del Mundial 2026 desde ESPN
 * 2. Detecta cambios: goles, inicio/fin de partido, "por comenzar"
 * 3. Envía push notifications vía OneSignal REST API
 * 4. Guarda data/scores.json y data/notifications-sent.json
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ─── Constantes ──────────────────────────────────────────────────────────────
const ONESIGNAL_APP_ID  = 'f20b4e99-f0f3-4700-ac24-b95d4f4d464b';
const UPCOMING_ALERT_MS = 7 * 60 * 1000; // ventana de detección (el Action corre c/5 min, dejamos margen)

// ─── Mapeo ESPN (inglés) → español ───────────────────────────────────────────
const ESPN_TO_SPANISH = {
  'Mexico':'México','South Africa':'Sudáfrica','South Korea':'Corea del Sur',
  'Czech Republic':'República Checa','Czechia':'República Checa',
  'Canada':'Canadá','Bosnia and Herzegovina':'Bosnia','Bosnia & Herzegovina':'Bosnia',
  'Bosnia-Herzegovina':'Bosnia','Bosnia':'Bosnia',
  'Qatar':'Qatar','Switzerland':'Suiza','Brazil':'Brasil','Morocco':'Marruecos',
  'Haiti':'Haití','Scotland':'Escocia','United States':'Estados Unidos','USA':'Estados Unidos',
  'Paraguay':'Paraguay','Australia':'Australia','Turkey':'Turquía','Turkiye':'Turquía',
  'Türkiye':'Turquía',
  'Germany':'Alemania','Curacao':'Curazao','Curaçao':'Curazao',
  "Cote d'Ivoire":'Costa de Marfil',"Côte d'Ivoire":'Costa de Marfil',
  'Ivory Coast':'Costa de Marfil','Ecuador':'Ecuador','Netherlands':'Países Bajos',
  'Japan':'Japón','Sweden':'Suecia','Tunisia':'Túnez','Belgium':'Bélgica',
  'Egypt':'Egipto','Iran':'Irán','New Zealand':'Nueva Zelanda','Spain':'España',
  'Cape Verde':'Cabo Verde','Saudi Arabia':'Arabia Saudita','Uruguay':'Uruguay',
  'France':'Francia','Senegal':'Senegal','Iraq':'Irak','Norway':'Noruega',
  'Argentina':'Argentina','Algeria':'Argelia','Austria':'Austria','Jordan':'Jordania',
  'Portugal':'Portugal','DR Congo':'RD de Congo','Democratic Republic of Congo':'RD de Congo',
  'Congo DR':'RD de Congo','Uzbekistan':'Uzbekistán','Colombia':'Colombia',
  'England':'Inglaterra','Croatia':'Croacia','Ghana':'Ghana','Panama':'Panamá',
};

// ─── Partidos del torneo ──────────────────────────────────────────────────────
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

// ─── HTTP helpers ──────────────────────────────────────────────────────────────
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

function postJSON(url, body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
        'Accept': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      },
      timeout: 15000,
    }, (res) => {
      let response = '';
      res.on('data', chunk => response += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(response) }); }
        catch(e) { resolve({ status: res.statusCode, body: response }); }
      });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data);
    req.end();
  });
}

// ─── OneSignal push sender ────────────────────────────────────────────────────
async function sendPush(apiKey, heading, content) {
  try {
    const result = await postJSON('https://onesignal.com/api/v1/notifications', {
      app_id: ONESIGNAL_APP_ID,
      included_segments: ['All'],
      headings: { en: heading, es: heading },
      contents: { en: content, es: content },
      priority: 10,
      url: 'https://fixture-froporeo-live.vercel.app/',
    }, apiKey);

    if (result.body && result.body.id) {
      console.log(`  📲 Push OK → "${heading}": ${content}`);
      return true;
    } else {
      console.warn(`  ⚠️ Push fallida (HTTP ${result.status}):`, JSON.stringify(result.body));
      return false;
    }
  } catch(e) {
    console.warn(`  ⚠️ Error enviando push:`, e.message);
    return false;
  }
}

// ─── Detección de cambios para notificaciones ─────────────────────────────────
function detectScoreChanges(prevScores, newScores) {
  const toSend = [];

  for (const [id, newS] of Object.entries(newScores)) {
    const match = MATCHES.find(m => m.id === id);
    if (!match) continue;
    const prevS = prevScores[id];

    // ① Partido arrancó
    if ((!prevS || prevS.status === 'finished') && newS.status === 'live') {
      toSend.push({
        key: `started-${id}`,
        heading: `🏟️ ¡Arrancó!`,
        content: `${match.home} vs ${match.away}`,
      });
    }

    // ② GOL(es)
    if (prevS && newS.status === 'live') {
      const prevHome = prevS.home ?? 0;
      const prevAway = prevS.away ?? 0;
      const diffHome = newS.home - prevHome;
      const diffAway = newS.away - prevAway;
      const scorerName = (newS.lastScorer && newS.lastScorer.name) ? newS.lastScorer.name : null;
      const scorerSide = newS.lastScorer ? newS.lastScorer.side : null;

      for (let i = 1; i <= diffHome; i++) {
        const h = prevHome + i;
        const who = (scorerSide === 'home' && scorerName) ? ` — ⚽ ${scorerName}` : '';
        toSend.push({
          key: `goal-${id}-h${h}-a${newS.away}`,
          heading: `⚽ ¡Gol de ${match.home}!`,
          content: `${match.home} ${h} – ${newS.away} ${match.away}${who}`,
        });
      }
      for (let i = 1; i <= diffAway; i++) {
        const a = prevAway + i;
        const who = (scorerSide === 'away' && scorerName) ? ` — ⚽ ${scorerName}` : '';
        toSend.push({
          key: `goal-${id}-h${newS.home}-a${a}`,
          heading: `⚽ ¡Gol de ${match.away}!`,
          content: `${match.home} ${newS.home} – ${a} ${match.away}${who}`,
        });
      }
    }

    // ③ Partido terminó
    if (prevS && prevS.status === 'live' && newS.status === 'finished') {
      toSend.push({
        key: `finished-${id}`,
        heading: `⏱️ ¡Final!`,
        content: `${match.home} ${newS.home} – ${newS.away} ${match.away}`,
      });
    }
  }

  return toSend;
}

function detectUpcoming(scheduledEvents) {
  const toSend = [];
  const now = Date.now();

  for (const { homeES, awayES, isoDate } of scheduledEvents) {
    const kickoff = new Date(isoDate).getTime();
    if (isNaN(kickoff)) continue;
    const msUntil = kickoff - now;
    if (msUntil > 0 && msUntil <= UPCOMING_ALERT_MS) {
      const match = MATCHES.find(m => m.home === homeES && m.away === awayES)
                 || MATCHES.find(m => m.home === awayES && m.away === homeES);
      if (!match) continue;
      // Clave diaria: evita re-notificar en cada corrida del Action
      const day = new Date(isoDate).toISOString().slice(0, 10);
      toSend.push({
        key: `upcoming-${match.id}-${day}`,
        heading: `⏰ ¡Está por comenzar!`,
        content: `${match.home} vs ${match.away} en 5 minutos`,
      });
    }
  }

  return toSend;
}

// ─── Fetch ESPN para una fecha ────────────────────────────────────────────────
function findMatch(homeES, awayES) {
  let m = MATCHES.find(m => m.home === homeES && m.away === awayES);
  if (m) return { match: m, flipped: false };
  m = MATCHES.find(m => m.home === awayES && m.away === homeES);
  if (m) return { match: m, flipped: true };
  return null;
}

async function fetchDate(dateStr, scores, debugLog, scheduledEvents) {
  const endpoints = [
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`,
    `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world.cup/scoreboard?dates=${dateStr}`,
  ];

  for (const url of endpoints) {
    try {
      const data = await fetchJSON(url);
      const events = data.events || [];
      debugLog.push({ date: dateStr, endpoint: url.includes('cup') ? 'cup' : 'world', eventsFound: events.length });
      if (events.length === 0) continue;

      for (const event of events) {
        try {
          const comp = event.competitions[0];
          const statusName = comp.status?.type?.name || '';

          const homeCmp = comp.competitors?.find(c => c.homeAway === 'home');
          const awayCmp = comp.competitors?.find(c => c.homeAway === 'away');
          if (!homeCmp || !awayCmp) continue;

          const homeEN = homeCmp.team?.displayName || '';
          const awayEN = awayCmp.team?.displayName || '';
          const homeES = ESPN_TO_SPANISH[homeEN] || homeEN;
          const awayES = ESPN_TO_SPANISH[awayEN] || awayEN;

          // Capturar partidos programados para detectar "por comenzar"
          if (statusName === 'STATUS_SCHEDULED') {
            scheduledEvents.push({ homeES, awayES, isoDate: event.date });
            debugLog.push({ date: dateStr, homeEN, awayEN, homeES, awayES, statusName, skipped: 'scheduled' });
            continue;
          }

          const found = findMatch(homeES, awayES);
          debugLog.push({ date: dateStr, homeEN, awayEN, homeES, awayES, statusName, matchedId: found?.match?.id ?? null });
          if (!found) { console.log(`  ⚠ Sin match: ${homeES} vs ${awayES} (raw: ${homeEN} vs ${awayEN})`); continue; }

          const { match, flipped } = found;
          let h = parseInt(homeCmp.score) || 0;
          let a = parseInt(awayCmp.score) || 0;
          if (flipped) [h, a] = [a, h];

          // Whitelist de estados FINALIZADOS (más robusto que listar todos los posibles
          // estados "en vivo" de ESPN, que incluyen STATUS_FIRST_HALF, STATUS_SECOND_HALF,
          // STATUS_EXTRA_TIME, etc. — cualquier estado que no sea scheduled ni finished se
          // trata como 'live' por defecto, para no perder ningún estado intermedio).
          const finishedStatuses = ['STATUS_FINAL','STATUS_FULL_TIME','STATUS_POSTPONED','STATUS_CANCELED','STATUS_FORFEIT','STATUS_ABANDONED'];
          const status = finishedStatuses.includes(statusName) ? 'finished' : 'live';

          // Best-effort: nombre del último goleador (si ESPN lo expone en "details")
          let lastScorer = null;
          try {
            const goals = (comp.details || []).filter(d =>
              (d.type?.text || '').toLowerCase().includes('goal') &&
              !(d.type?.text || '').toLowerCase().includes('own')
            );
            if (goals.length) {
              const last = goals[goals.length - 1];
              const scorerName = last.athletesInvolved?.[0]?.displayName
                || last.athletesInvolved?.[0]?.shortName
                || null;
              const teamId = last.team?.id;
              if (scorerName) {
                const isHomeScorer = teamId === homeCmp.team?.id;
                lastScorer = { name: scorerName, side: flipped ? (isHomeScorer?'away':'home') : (isHomeScorer?'home':'away') };
              }
            }
          } catch(e) { /* si ESPN no expone esto, seguimos sin nombre */ }

          scores[match.id] = { home: h, away: a, status, auto: true, updatedAt: new Date().toISOString(), lastScorer };
          console.log(`  ✓ ${match.id}: ${homeES} ${h}-${a} ${awayES} [${status}]${lastScorer ? ' ⚽ '+lastScorer.name : ''}`);
        } catch(e) {
          debugLog.push({ date: dateStr, error: e.message });
        }
      }
      return;
    } catch(e) {
      console.warn(`  Error endpoint ${url.includes('cup') ? 'cup' : 'world'}: ${e.message}`);
      debugLog.push({ date: dateStr, endpoint: url.includes('cup') ? 'cup' : 'world', fetchError: e.message });
    }
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Actualizando resultados del Mundial 2026...\n');

  const scoresPath  = path.join(__dirname, '..', 'data', 'scores.json');
  const debugPath   = path.join(__dirname, '..', 'data', 'debug.json');
  const sentPath    = path.join(__dirname, '..', 'data', 'notifications-sent.json');

  // Leer estado previo
  let existingScores = {};
  try { existingScores = JSON.parse(fs.readFileSync(scoresPath, 'utf8')).scores || {}; } catch(e) {}

  let sentKeys = new Set();
  try { sentKeys = new Set(JSON.parse(fs.readFileSync(sentPath, 'utf8')).keys || []); } catch(e) {}

  const scores         = { ...existingScores };
  const prevScores     = JSON.parse(JSON.stringify(existingScores)); // deep copy
  const debugLog       = [];
  const scheduledEvents = [];

  // Sólo re-fetchear días recientes (los partidos viejos ya están guardados y no cambian).
  // Esto mantiene cada iteración del loop rápida (~pocos segundos) para que el polling
  // real sea cada 60s y no se vaya alargando con días históricos innecesarios.
  const tournamentStart = new Date('2026-06-11');
  const tournamentEnd   = new Date('2026-07-20');
  const today = new Date();
  let start = new Date(today); start.setDate(start.getDate() - 2);
  let until = new Date(today); until.setDate(until.getDate() + 1);
  if (start < tournamentStart) start = tournamentStart;
  const end = until > tournamentEnd ? tournamentEnd : until;

  const cur = new Date(start);
  while (cur <= end) {
    const ds = cur.toISOString().slice(0,10).replace(/-/g,'');
    console.log(`📅 ${ds}`);
    await fetchDate(ds, scores, debugLog, scheduledEvents);
    cur.setDate(cur.getDate() + 1);
  }

  // Guardar scores.json y debug.json
  fs.mkdirSync(path.dirname(scoresPath), { recursive: true });
  fs.writeFileSync(scoresPath, JSON.stringify({
    scores,
    updatedAt: new Date().toISOString(),
    matchCount: Object.keys(scores).length,
  }, null, 2));
  fs.writeFileSync(debugPath, JSON.stringify({ generatedAt: new Date().toISOString(), debugLog }, null, 2));
  console.log(`\n✅ ${Object.keys(scores).length} resultados guardados.`);

  // ── Notificaciones ─────────────────────────────────────────────────────────
  const apiKey = process.env.ONESIGNAL_API_KEY;

  if (!apiKey) {
    console.warn('\n⚠️  ONESIGNAL_API_KEY no configurada — las notificaciones están desactivadas.');
    console.warn('   Agregala como Secret en: GitHub repo → Settings → Secrets → Actions → ONESIGNAL_API_KEY');
  } else {
    console.log('\n📲 Detectando cambios para notificaciones...');

    const toSend = [
      ...detectScoreChanges(prevScores, scores),
      ...detectUpcoming(scheduledEvents),
    ];

    let sent = 0, retried = 0;
    for (const notif of toSend) {
      if (sentKeys.has(notif.key)) {
        console.log(`  ↩️  Ya enviada: ${notif.key}`);
        continue;
      }
      const ok = await sendPush(apiKey, notif.heading, notif.content);
      if (ok) {
        sentKeys.add(notif.key);
        sent++;
      } else {
        retried++; // no se marca como enviada → se reintenta en la próxima iteración (60s)
      }
      // Pausa breve entre pushes para no saturar la API
      await new Promise(r => setTimeout(r, 300));
    }

    // Guardar claves enviadas (máximo 1000 para no crecer indefinidamente)
    const keysArray = Array.from(sentKeys).slice(-1000);
    fs.writeFileSync(sentPath, JSON.stringify({
      keys: keysArray,
      updatedAt: new Date().toISOString(),
      totalSent: keysArray.length,
    }, null, 2));

    console.log(`   ${sent} notificaciones enviadas, ${retried} a reintentar. Total acumulado: ${keysArray.length}`);
  }
}

main().catch(e => { console.error('❌', e); process.exit(1); });
