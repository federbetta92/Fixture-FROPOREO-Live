/**
 * fetch-scores.js
 * Corre en GitHub Actions cada 5 minutos (loop interno cada 60s).
 * 1. Fetchea resultados de FASE DE GRUPOS y ELIMINATORIAS desde ESPN
 * 2. Resuelve equipos de eliminatorias dinámicamente (standings + mejores terceros + ganadores de rondas previas)
 * 3. Detecta cambios: goles, inicio/fin de partido, penales, "por comenzar"
 * 4. Envía push notifications vía OneSignal REST API
 * 5. Guarda data/scores.json y data/notifications-sent.json
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const ONESIGNAL_APP_ID  = 'f20b4e99-f0f3-4700-ac24-b95d4f4d464b';
const UPCOMING_ALERT_MS = 6 * 60 * 1000;

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

// ─── Grupos ───────────────────────────────────────────────────────────────────
const GROUPS = {
  A:['México','Sudáfrica','Corea del Sur','República Checa'],
  B:['Canadá','Bosnia','Qatar','Suiza'],
  C:['Brasil','Marruecos','Haití','Escocia'],
  D:['Estados Unidos','Paraguay','Australia','Turquía'],
  E:['Alemania','Curazao','Costa de Marfil','Ecuador'],
  F:['Países Bajos','Japón','Suecia','Túnez'],
  G:['Bélgica','Egipto','Irán','Nueva Zelanda'],
  H:['España','Cabo Verde','Arabia Saudita','Uruguay'],
  I:['Francia','Senegal','Irak','Noruega'],
  J:['Argentina','Argelia','Austria','Jordania'],
  K:['Portugal','RD de Congo','Uzbekistán','Colombia'],
  L:['Inglaterra','Croacia','Ghana','Panamá'],
};

// ─── Partidos de fase de grupos ───────────────────────────────────────────────
const MATCHES = [
  {id:'A1',grp:'A',home:'México',away:'Sudáfrica'},{id:'A2',grp:'A',home:'Corea del Sur',away:'República Checa'},
  {id:'B1',grp:'B',home:'Canadá',away:'Bosnia'},{id:'D1',grp:'D',home:'Estados Unidos',away:'Paraguay'},
  {id:'B2',grp:'B',home:'Qatar',away:'Suiza'},{id:'C1',grp:'C',home:'Brasil',away:'Marruecos'},
  {id:'C2',grp:'C',home:'Haití',away:'Escocia'},{id:'D2',grp:'D',home:'Australia',away:'Turquía'},
  {id:'E1',grp:'E',home:'Alemania',away:'Curazao'},{id:'F1',grp:'F',home:'Países Bajos',away:'Japón'},
  {id:'E2',grp:'E',home:'Costa de Marfil',away:'Ecuador'},{id:'F2',grp:'F',home:'Suecia',away:'Túnez'},
  {id:'H1',grp:'H',home:'España',away:'Cabo Verde'},{id:'G1',grp:'G',home:'Bélgica',away:'Egipto'},
  {id:'H2',grp:'H',home:'Arabia Saudita',away:'Uruguay'},{id:'G2',grp:'G',home:'Irán',away:'Nueva Zelanda'},
  {id:'I1',grp:'I',home:'Francia',away:'Senegal'},{id:'I2',grp:'I',home:'Irak',away:'Noruega'},
  {id:'J1',grp:'J',home:'Argentina',away:'Argelia'},{id:'J2',grp:'J',home:'Austria',away:'Jordania'},
  {id:'K1',grp:'K',home:'Portugal',away:'RD de Congo'},{id:'L1',grp:'L',home:'Inglaterra',away:'Croacia'},
  {id:'L2',grp:'L',home:'Ghana',away:'Panamá'},{id:'K2',grp:'K',home:'Uzbekistán',away:'Colombia'},
  {id:'A3',grp:'A',home:'República Checa',away:'Sudáfrica'},{id:'B3',grp:'B',home:'Suiza',away:'Bosnia'},
  {id:'B4',grp:'B',home:'Canadá',away:'Qatar'},{id:'A4',grp:'A',home:'México',away:'Corea del Sur'},
  {id:'D3',grp:'D',home:'Estados Unidos',away:'Australia'},{id:'C3',grp:'C',home:'Escocia',away:'Marruecos'},
  {id:'C4',grp:'C',home:'Brasil',away:'Haití'},{id:'D4',grp:'D',home:'Turquía',away:'Paraguay'},
  {id:'F3',grp:'F',home:'Países Bajos',away:'Suecia'},{id:'E3',grp:'E',home:'Alemania',away:'Costa de Marfil'},
  {id:'E4',grp:'E',home:'Ecuador',away:'Curazao'},{id:'F4',grp:'F',home:'Túnez',away:'Japón'},
  {id:'H3',grp:'H',home:'España',away:'Arabia Saudita'},{id:'G3',grp:'G',home:'Bélgica',away:'Irán'},
  {id:'H4',grp:'H',home:'Uruguay',away:'Cabo Verde'},{id:'G4',grp:'G',home:'Nueva Zelanda',away:'Egipto'},
  {id:'J3',grp:'J',home:'Argentina',away:'Austria'},{id:'I3',grp:'I',home:'Francia',away:'Irak'},
  {id:'I4',grp:'I',home:'Noruega',away:'Senegal'},{id:'J4',grp:'J',home:'Jordania',away:'Argelia'},
  {id:'K3',grp:'K',home:'Portugal',away:'Uzbekistán'},{id:'L3',grp:'L',home:'Inglaterra',away:'Ghana'},
  {id:'L4',grp:'L',home:'Panamá',away:'Croacia'},{id:'K4',grp:'K',home:'Colombia',away:'RD de Congo'},
  {id:'B5',grp:'B',home:'Suiza',away:'Canadá'},{id:'B6',grp:'B',home:'Bosnia',away:'Qatar'},
  {id:'C5',grp:'C',home:'Marruecos',away:'Haití'},{id:'C6',grp:'C',home:'Brasil',away:'Escocia'},
  {id:'A5',grp:'A',home:'Sudáfrica',away:'Corea del Sur'},{id:'A6',grp:'A',home:'República Checa',away:'México'},
  {id:'E5',grp:'E',home:'Curazao',away:'Costa de Marfil'},{id:'E6',grp:'E',home:'Ecuador',away:'Alemania'},
  {id:'F5',grp:'F',home:'Japón',away:'Suecia'},{id:'F6',grp:'F',home:'Túnez',away:'Países Bajos'},
  {id:'D5',grp:'D',home:'Paraguay',away:'Australia'},{id:'D6',grp:'D',home:'Turquía',away:'Estados Unidos'},
  {id:'I5',grp:'I',home:'Noruega',away:'Francia'},{id:'I6',grp:'I',home:'Senegal',away:'Irak'},
  {id:'H5',grp:'H',home:'Cabo Verde',away:'Arabia Saudita'},{id:'H6',grp:'H',home:'Uruguay',away:'España'},
  {id:'G5',grp:'G',home:'Egipto',away:'Irán'},{id:'G6',grp:'G',home:'Nueva Zelanda',away:'Bélgica'},
  {id:'L5',grp:'L',home:'Croacia',away:'Ghana'},{id:'L6',grp:'L',home:'Panamá',away:'Inglaterra'},
  {id:'K5',grp:'K',home:'Colombia',away:'Portugal'},{id:'K6',grp:'K',home:'RD de Congo',away:'Uzbekistán'},
  {id:'J5',grp:'J',home:'Argelia',away:'Austria'},{id:'J6',grp:'J',home:'Jordania',away:'Argentina'},
];

// ─── Eliminatorias: estructura de KO (idéntica a app.js) ─────────────────────
const KO_ROUNDS = [
  { matches: [
    {id:'73', s1:{type:'group',pos:2,grp:'A'}, s2:{type:'group',pos:2,grp:'B'}},
    {id:'74', s1:{type:'group',pos:1,grp:'E'}, s2:{type:'best3'}},
    {id:'75', s1:{type:'group',pos:1,grp:'F'}, s2:{type:'group',pos:2,grp:'C'}},
    {id:'76', s1:{type:'group',pos:1,grp:'C'}, s2:{type:'group',pos:2,grp:'F'}},
    {id:'77', s1:{type:'group',pos:1,grp:'I'}, s2:{type:'best3'}},
    {id:'78', s1:{type:'group',pos:2,grp:'E'}, s2:{type:'group',pos:2,grp:'I'}},
    {id:'79', s1:{type:'group',pos:1,grp:'A'}, s2:{type:'best3'}},
    {id:'80', s1:{type:'group',pos:1,grp:'L'}, s2:{type:'best3'}},
    {id:'81', s1:{type:'group',pos:1,grp:'D'}, s2:{type:'best3'}},
    {id:'82', s1:{type:'group',pos:1,grp:'G'}, s2:{type:'best3'}},
    {id:'83', s1:{type:'group',pos:2,grp:'K'}, s2:{type:'group',pos:2,grp:'L'}},
    {id:'84', s1:{type:'group',pos:1,grp:'H'}, s2:{type:'group',pos:2,grp:'J'}},
    {id:'85', s1:{type:'group',pos:1,grp:'B'}, s2:{type:'best3'}},
    {id:'86', s1:{type:'group',pos:1,grp:'J'}, s2:{type:'group',pos:2,grp:'H'}},
    {id:'87', s1:{type:'group',pos:1,grp:'K'}, s2:{type:'best3'}},
    {id:'88', s1:{type:'group',pos:2,grp:'D'}, s2:{type:'group',pos:2,grp:'G'}},
  ]},
  { matches: [
    {id:'89', s1:{type:'winner',ko:'74'}, s2:{type:'winner',ko:'77'}},
    {id:'90', s1:{type:'winner',ko:'73'}, s2:{type:'winner',ko:'75'}},
    {id:'91', s1:{type:'winner',ko:'76'}, s2:{type:'winner',ko:'78'}},
    {id:'92', s1:{type:'winner',ko:'79'}, s2:{type:'winner',ko:'80'}},
    {id:'93', s1:{type:'winner',ko:'83'}, s2:{type:'winner',ko:'84'}},
    {id:'94', s1:{type:'winner',ko:'81'}, s2:{type:'winner',ko:'82'}},
    {id:'95', s1:{type:'winner',ko:'86'}, s2:{type:'winner',ko:'88'}},
    {id:'96', s1:{type:'winner',ko:'85'}, s2:{type:'winner',ko:'87'}},
  ]},
  { matches: [
    {id:'97', s1:{type:'winner',ko:'89'}, s2:{type:'winner',ko:'90'}},
    {id:'98', s1:{type:'winner',ko:'93'}, s2:{type:'winner',ko:'94'}},
    {id:'99', s1:{type:'winner',ko:'91'}, s2:{type:'winner',ko:'92'}},
    {id:'100',s1:{type:'winner',ko:'95'}, s2:{type:'winner',ko:'96'}},
  ]},
  { matches: [
    {id:'101',s1:{type:'winner',ko:'97'}, s2:{type:'winner',ko:'98'}},
    {id:'102',s1:{type:'winner',ko:'99'}, s2:{type:'winner',ko:'100'}},
  ]},
  { matches: [ {id:'103',s1:{type:'loser',ko:'101'}, s2:{type:'loser',ko:'102'}} ] },
  { matches: [ {id:'104',s1:{type:'winner',ko:'101'}, s2:{type:'winner',ko:'102'}} ] },
];

// Tabla oficial FIFA Annex C — combinación real Mundial 2026: B,D,E,F,I,J,K,L
const FIFA_BEST3_TABLE = {
  'B-D-E-F-I-J-K-L': { '74':'D','77':'F','79':'E','80':'K','81':'B','82':'I','85':'J','87':'L' },
};
const BEST3_SLOTS = {
  '74':['A','B','C','D','F'], '77':['C','D','F','G','H'], '79':['C','E','F','H','I'], '80':['E','H','I','J','K'],
  '81':['B','E','F','I','J'], '82':['A','E','H','I','J'], '85':['E','F','G','I','J'], '87':['D','E','I','J','L'],
};

let _best3Cache = null;
let _koTeamsCache = null;

function getScore(id, scores) { const s = scores[id]; return (s && s.status !== 'delete') ? s : null; }

function calcStandings(letter, scores) {
  const teams = GROUPS[letter];
  const st = {}; teams.forEach(t => st[t] = {pts:0,gf:0,gc:0});
  const gms = MATCHES.filter(m => m.grp === letter);
  let played = 0;
  gms.forEach(m => {
    const s = getScore(m.id, scores);
    if (!s) return;
    played++;
    st[m.home].gf += s.home; st[m.home].gc += s.away;
    st[m.away].gf += s.away; st[m.away].gc += s.home;
    if (s.home > s.away) st[m.home].pts += 3;
    else if (s.home < s.away) st[m.away].pts += 3;
    else { st[m.home].pts++; st[m.away].pts++; }
  });
  const sorted = teams.slice().sort((a,b) => st[b].pts-st[a].pts || (st[b].gf-st[b].gc)-(st[a].gf-st[a].gc) || st[b].gf-st[a].gf);
  return { sorted, st, complete: played >= 6 };
}

function calcBest3Assignments(scores) {
  const letters = Object.keys(GROUPS);
  const thirds = [];
  let completedGroups = 0;
  for (const letter of letters) {
    const { sorted, st, complete } = calcStandings(letter, scores);
    if (complete) completedGroups++;
    const team = sorted[2];
    if (team) thirds.push({ team, grp: letter, pts: st[team].pts, dg: st[team].gf-st[team].gc, gf: st[team].gf });
  }
  if (completedGroups < letters.length) return null;
  thirds.sort((a,b) => b.pts-a.pts || b.dg-a.dg || b.gf-a.gf || a.grp.localeCompare(b.grp));
  const best8 = thirds.slice(0, 8);
  if (best8.length < 8) return null;
  const comboKey = best8.map(t => t.grp).sort().join('-');
  if (FIFA_BEST3_TABLE[comboKey]) {
    const grpMap = Object.fromEntries(best8.map(t => [t.grp, t.team]));
    const assignment = {};
    Object.entries(FIFA_BEST3_TABLE[comboKey]).forEach(([mid, grp]) => { if (grpMap[grp]) assignment[mid] = grpMap[grp]; });
    return assignment;
  }
  // Fallback backtracking
  const slotsOrdered = Object.entries(BEST3_SLOTS).sort((a,b) => a[1].length-b[1].length);
  const assignment = {}; const used = new Set();
  function bt(i) {
    if (i >= slotsOrdered.length) return true;
    const [mid, elig] = slotsOrdered[i];
    const cands = best8.filter(t => elig.includes(t.grp) && !used.has(t.grp));
    for (const c of cands) {
      assignment[mid] = c.team; used.add(c.grp);
      if (bt(i+1)) return true;
      delete assignment[mid]; used.delete(c.grp);
    }
    return false;
  }
  return bt(0) ? assignment : null;
}

function getBest3Team(matchId, scores) {
  if (!_best3Cache) _best3Cache = calcBest3Assignments(scores);
  return _best3Cache ? _best3Cache[matchId] : null;
}

function findKoMatch(id) {
  for (const round of KO_ROUNDS) { const m = round.matches.find(x => x.id === id); if (m) return m; }
  return null;
}

function resolveTeam(source, matchId, scores) {
  if (!source) return null;
  if (source.type === 'group') {
    const { sorted, complete } = calcStandings(source.grp, scores);
    return complete ? sorted[source.pos-1] : null;
  }
  if (source.type === 'best3') return matchId ? getBest3Team(matchId, scores) : null;
  if (source.type === 'winner' || source.type === 'loser') {
    const koMatch = findKoMatch(source.ko);
    if (!koMatch) return null;
    const s = getScore(source.ko, scores);
    if (!s) return null;
    const t1 = resolveTeam(koMatch.s1, koMatch.id, scores);
    const t2 = resolveTeam(koMatch.s2, koMatch.id, scores);
    if (!t1 || !t2) return null;
    let winner, loser;
    if (s.penH != null && s.penA != null) { winner = s.penH > s.penA ? t1 : t2; loser = s.penH > s.penA ? t2 : t1; }
    else { winner = s.home > s.away ? t1 : t2; loser = s.home > s.away ? t2 : t1; }
    return source.type === 'winner' ? winner : loser;
  }
  return null;
}

function getResolvedKoTeams(scores) {
  if (_koTeamsCache) return _koTeamsCache;
  const map = {};
  for (const round of KO_ROUNDS) {
    for (const m of round.matches) {
      const t1 = resolveTeam(m.s1, m.id, scores);
      const t2 = resolveTeam(m.s2, m.id, scores);
      if (t1 && t2) map[m.id] = { home: t1, away: t2 };
    }
  }
  _koTeamsCache = map;
  return map;
}

// ─── HTTP helpers ──────────────────────────────────────────────────────────────
function fetchJSON(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; FroporeoBot/1.0)', 'Accept': 'application/json' }, timeout: 10000 },
      (res) => { let data=''; res.on('data', c=>data+=c); res.on('end', () => { try { resolve(JSON.parse(data)); } catch(e){ reject(new Error('JSON parse error')); } }); });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function postJSON(url, body, apiKey) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const u = new URL(url);
    const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Key ${apiKey}`, 'Accept': 'application/json', 'Content-Length': Buffer.byteLength(data) },
      timeout: 15000 }, (res) => { let r=''; res.on('data', c=>r+=c); res.on('end', () => { try { resolve({status:res.statusCode, body:JSON.parse(r)}); } catch(e){ resolve({status:res.statusCode, body:r}); } }); });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
    req.write(data); req.end();
  });
}

async function sendPush(apiKey, heading, content) {
  try {
    const result = await postJSON('https://onesignal.com/api/v1/notifications', {
      app_id: ONESIGNAL_APP_ID, included_segments: ['All'],
      headings: { en: heading, es: heading }, contents: { en: content, es: content },
      priority: 10, url: 'https://fixture-froporeo-live.vercel.app/',
    }, apiKey);
    if (result.body && result.body.id) { console.log(`  📲 Push OK → "${heading}": ${content}`); return true; }
    console.warn(`  ⚠️ Push fallida (HTTP ${result.status}):`, JSON.stringify(result.body));
    return false;
  } catch(e) { console.warn(`  ⚠️ Error enviando push:`, e.message); return false; }
}

// ─── Matching de equipos (grupos + eliminatorias) ────────────────────────────
function findMatchId(homeES, awayES, scores) {
  // 1. Grupos
  let m = MATCHES.find(x => x.home === homeES && x.away === awayES);
  if (m) return { id: m.id, flipped: false };
  m = MATCHES.find(x => x.home === awayES && x.away === homeES);
  if (m) return { id: m.id, flipped: true };
  // 2. Eliminatorias (equipos resueltos dinámicamente)
  const koTeams = getResolvedKoTeams(scores);
  for (const [id, teams] of Object.entries(koTeams)) {
    if (teams.home === homeES && teams.away === awayES) return { id, flipped: false };
    if (teams.home === awayES && teams.away === homeES) return { id, flipped: true };
  }
  return null;
}

const FINISHED_STATUSES = ['STATUS_FINAL','STATUS_FULL_TIME','STATUS_FINAL_PEN','STATUS_FINAL_AET','STATUS_POSTPONED','STATUS_CANCELED','STATUS_FORFEIT','STATUS_ABANDONED'];

async function fetchDate(dateStr, scores, debugLog, scheduledEvents) {
  const url = `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
  try {
    const data = await fetchJSON(url);
    const events = data.events || [];
    debugLog.push({ date: dateStr, eventsFound: events.length });

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

        if (statusName === 'STATUS_SCHEDULED') {
          scheduledEvents.push({ homeES, awayES, isoDate: event.date });
          continue;
        }

        const found = findMatchId(homeES, awayES, scores);
        if (!found) { console.log(`  ⚠ Sin match: ${homeES} vs ${awayES}`); continue; }
        const { id: matchId, flipped } = found;

        let h = parseInt(homeCmp.score) || 0;
        let a = parseInt(awayCmp.score) || 0;
        if (flipped) [h, a] = [a, h];

        const status = FINISHED_STATUSES.includes(statusName) ? 'finished' : 'live';

        // Penales (shootoutScore en cada competitor)
        let penH = null, penA = null;
        if (statusName === 'STATUS_FINAL_PEN' || homeCmp.shootoutScore != null || awayCmp.shootoutScore != null) {
          const hp = homeCmp.shootoutScore != null ? parseInt(homeCmp.shootoutScore) : null;
          const ap = awayCmp.shootoutScore != null ? parseInt(awayCmp.shootoutScore) : null;
          if (hp != null && ap != null) { penH = flipped ? ap : hp; penA = flipped ? hp : ap; }
        }

        // Trackear cuándo se vio 'live' por primera vez (evitar falsos finished prematuros)
        const prevEntry = scores[matchId];
        let firstLiveAt = prevEntry?.firstLiveAt || null;
        if (status === 'live' && !firstLiveAt) firstLiveAt = new Date().toISOString();

        let finalStatus = status;
        if (status === 'finished' && firstLiveAt) {
          const minutesLive = (Date.now() - new Date(firstLiveAt).getTime()) / 60000;
          if (minutesLive < 40) { console.log(`  ⚠️ ${matchId}: 'finished' a los ${minutesLive.toFixed(1)} min — ignorado, mantengo 'live'`); finalStatus = 'live'; }
        }

        scores[matchId] = {
          home: h, away: a, status: finalStatus, auto: true, updatedAt: new Date().toISOString(), firstLiveAt,
          ...(penH != null && penA != null ? { penH, penA } : {}),
        };
        // Invalidar caches dependientes (un nuevo resultado puede cambiar standings/KO)
        _best3Cache = null; _koTeamsCache = null;

        console.log(`  ✓ ${matchId}: ${homeES} ${h}-${a} ${awayES} [${finalStatus}]${penH!=null?` (pen ${penH}-${penA})`:''}`);
      } catch(e) { debugLog.push({ date: dateStr, error: e.message }); }
    }
  } catch(e) {
    console.warn(`  Error fetch ${dateStr}: ${e.message}`);
    debugLog.push({ date: dateStr, fetchError: e.message });
  }
}

// ─── Detección de cambios para notificaciones ─────────────────────────────────
function teamNameFor(matchId, scores) {
  const groupM = MATCHES.find(m => m.id === matchId);
  if (groupM) return { home: groupM.home, away: groupM.away };
  const koTeams = getResolvedKoTeams(scores);
  return koTeams[matchId] || null;
}

function detectScoreChanges(prevScores, newScores) {
  const toSend = [];
  for (const [id, newS] of Object.entries(newScores)) {
    const names = teamNameFor(id, newScores);
    if (!names) continue;
    const { home, away } = names;
    const prevS = prevScores[id];

    if ((!prevS || prevS.status === 'finished') && newS.status === 'live') {
      toSend.push({ key: `started-${id}`, heading: `🏟️ ¡Arrancó!`, content: `${home} vs ${away}` });
    }
    if (prevS && newS.status === 'live') {
      const prevHome = prevS.home ?? 0, prevAway = prevS.away ?? 0;
      const diffHome = newS.home - prevHome, diffAway = newS.away - prevAway;
      for (let i = 1; i <= diffHome; i++) { const h = prevHome+i; toSend.push({ key: `goal-${id}-h${h}-a${newS.away}`, heading: `⚽ ¡Gol de ${home}!`, content: `${home} ${h} – ${newS.away} ${away}` }); }
      for (let i = 1; i <= diffAway; i++) { const a = prevAway+i; toSend.push({ key: `goal-${id}-h${newS.home}-a${a}`, heading: `⚽ ¡Gol de ${away}!`, content: `${home} ${newS.home} – ${a} ${away}` }); }
    }
    if (prevS && prevS.status === 'live' && newS.status === 'finished') {
      const penTxt = (newS.penH != null && newS.penA != null) ? ` (pen ${newS.penH}-${newS.penA})` : '';
      toSend.push({ key: `finished-${id}`, heading: `⏱️ ¡Final!`, content: `${home} ${newS.home} – ${newS.away} ${away}${penTxt}` });
    }
  }
  return toSend;
}

function detectUpcoming(scheduledEvents, scores) {
  const toSend = [];
  const now = Date.now();
  // Construir lookup de nombre de equipo -> matchId (grupos + KO)
  const allMatches = [...MATCHES.map(m => ({ id: m.id, home: m.home, away: m.away }))];
  const koTeams = getResolvedKoTeams(scores);
  Object.entries(koTeams).forEach(([id, t]) => allMatches.push({ id, home: t.home, away: t.away }));

  for (const { homeES, awayES, isoDate } of scheduledEvents) {
    const kickoff = new Date(isoDate).getTime();
    if (isNaN(kickoff)) continue;
    const msUntil = kickoff - now;
    if (msUntil > 60000 && msUntil <= UPCOMING_ALERT_MS) {
      const match = allMatches.find(m => (m.home===homeES&&m.away===awayES) || (m.home===awayES&&m.away===homeES));
      if (!match) continue;
      const day = new Date(isoDate).toISOString().slice(0,10);
      toSend.push({ key: `upcoming-${match.id}-${day}`, heading: `⏰ ¡Está por comenzar!`, content: `${match.home} vs ${match.away} en minutos` });
    }
  }
  return toSend;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄 Actualizando resultados del Mundial 2026 (grupos + eliminatorias)...\n');

  const scoresPath = path.join(__dirname, '..', 'data', 'scores.json');
  const debugPath  = path.join(__dirname, '..', 'data', 'debug.json');
  const sentPath   = path.join(__dirname, '..', 'data', 'notifications-sent.json');

  let existingScores = {};
  try { existingScores = JSON.parse(fs.readFileSync(scoresPath, 'utf8')).scores || {}; } catch(e) {}
  let sentKeys = new Set();
  try { sentKeys = new Set(JSON.parse(fs.readFileSync(sentPath, 'utf8')).keys || []); } catch(e) {}

  const scores = { ...existingScores };
  const prevScores = JSON.parse(JSON.stringify(existingScores));
  const debugLog = [];
  const scheduledEvents = [];

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

  fs.mkdirSync(path.dirname(scoresPath), { recursive: true });
  fs.writeFileSync(scoresPath, JSON.stringify({ scores, updatedAt: new Date().toISOString(), matchCount: Object.keys(scores).length }, null, 2));
  fs.writeFileSync(debugPath, JSON.stringify({ generatedAt: new Date().toISOString(), debugLog }, null, 2));
  console.log(`\n✅ ${Object.keys(scores).length} resultados guardados (grupos + eliminatorias).`);

  const apiKey = process.env.ONESIGNAL_API_KEY;
  if (!apiKey) {
    console.warn('\n⚠️  ONESIGNAL_API_KEY no configurada.');
  } else {
    console.log('\n📲 Detectando cambios para notificaciones...');
    const toSend = [...detectScoreChanges(prevScores, scores), ...detectUpcoming(scheduledEvents, scores)];
    let sent = 0, retried = 0;
    for (const notif of toSend) {
      if (sentKeys.has(notif.key)) { console.log(`  ↩️  Ya enviada: ${notif.key}`); continue; }
      const ok = await sendPush(apiKey, notif.heading, notif.content);
      if (ok) { sentKeys.add(notif.key); sent++; } else { retried++; }
      await new Promise(r => setTimeout(r, 300));
    }
    const keysArray = Array.from(sentKeys).slice(-1000);
    fs.writeFileSync(sentPath, JSON.stringify({ keys: keysArray, updatedAt: new Date().toISOString(), totalSent: keysArray.length }, null, 2));
    console.log(`   ${sent} notificaciones enviadas, ${retried} a reintentar. Total: ${keysArray.length}`);
  }
}

main().catch(e => { console.error('❌', e); process.exit(1); });
