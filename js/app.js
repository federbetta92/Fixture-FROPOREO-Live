// ════════════════════════════════════════════════════
//  DATA
// ════════════════════════════════════════════════════
const ABBR = {
  'México':'MEX','Sudáfrica':'RSA','Corea del Sur':'KOR','República Checa':'CZE','Chequia':'CZE',
  'Canadá':'CAN','Bosnia':'BIH','Qatar':'QAT','Suiza':'SUI',
  'Brasil':'BRA','Marruecos':'MAR','Haití':'HAI','Escocia':'SCO',
  'Estados Unidos':'USA','Paraguay':'PAR','Australia':'AUS','Turquía':'TUR',
  'Alemania':'GER','Curazao':'CUW','Costa de Marfil':'CIV','Ecuador':'ECU',
  'Países Bajos':'NED','Japón':'JPN','Suecia':'SUE','Túnez':'TUN',
  'Bélgica':'BEL','Egipto':'EGY','Irán':'IRN','Nueva Zelanda':'NZL',
  'España':'ESP','Cabo Verde':'CPV','Arabia Saudita':'KSA','Uruguay':'URU',
  'Francia':'FRA','Senegal':'SEN','Irak':'IRQ','Noruega':'NOR',
  'Argentina':'ARG','Argelia':'DZA','Austria':'AUT','Jordania':'JOR',
  'Portugal':'POR','RD de Congo':'COD','Uzbekistán':'UZB','Colombia':'COL',
  'Inglaterra':'ENG','Croacia':'CRO','Ghana':'GHA','Panamá':'PAN',
};
const abbr = t => ABBR[t] || t.slice(0,3).toUpperCase();

const FLAG_CODES = {
  'México':'mx','Sudáfrica':'za','Corea del Sur':'kr','República Checa':'cz','Chequia':'cz',
  'Canadá':'ca','Bosnia':'ba','Qatar':'qa','Suiza':'ch',
  'Brasil':'br','Marruecos':'ma','Haití':'ht','Escocia':'gb-sct',
  'Estados Unidos':'us','Paraguay':'py','Australia':'au','Turquía':'tr',
  'Alemania':'de','Curazao':'cw','Costa de Marfil':'ci','Ecuador':'ec',
  'Países Bajos':'nl','Japón':'jp','Suecia':'se','Túnez':'tn',
  'Bélgica':'be','Egipto':'eg','Irán':'ir','Nueva Zelanda':'nz',
  'España':'es','Cabo Verde':'cv','Arabia Saudita':'sa','Uruguay':'uy',
  'Francia':'fr','Senegal':'sn','Irak':'iq','Noruega':'no',
  'Argentina':'ar','Argelia':'dz','Austria':'at','Jordania':'jo',
  'Portugal':'pt','RD de Congo':'cd','Uzbekistán':'uz','Colombia':'co',
  'Inglaterra':'gb-eng','Croacia':'hr','Ghana':'gh','Panamá':'pa',
};
const flag = t => {
  const c = FLAG_CODES[t];
  return c ? `<img src="https://flagcdn.com/24x18/${c}.png" srcset="https://flagcdn.com/48x36/${c}.png 2x" width="24" height="18" alt="${t}" style="border-radius:2px;vertical-align:middle;flex-shrink:0">` : '🏳';
};

const GROUPS = {
  A:{teams:['México','Sudáfrica','Corea del Sur','República Checa']},
  B:{teams:['Canadá','Bosnia','Qatar','Suiza']},
  C:{teams:['Brasil','Marruecos','Haití','Escocia']},
  D:{teams:['Estados Unidos','Paraguay','Australia','Turquía']},
  E:{teams:['Alemania','Curazao','Costa de Marfil','Ecuador']},
  F:{teams:['Países Bajos','Japón','Suecia','Túnez']},
  G:{teams:['Bélgica','Egipto','Irán','Nueva Zelanda']},
  H:{teams:['España','Cabo Verde','Arabia Saudita','Uruguay']},
  I:{teams:['Francia','Senegal','Irak','Noruega']},
  J:{teams:['Argentina','Argelia','Austria','Jordania']},
  K:{teams:['Portugal','RD de Congo','Uzbekistán','Colombia']},
  L:{teams:['Inglaterra','Croacia','Ghana','Panamá']},
};

// Horarios verificados con ESPN — hora Argentina
const MATCHES = [
  // ── JORNADA 1 ──
  {id:'A1', date:'Jue 11 Jun', time:'16:00', group:'A', home:'México',              away:'Sudáfrica',          venue:'Ciudad de México'},
  {id:'A2', date:'Jue 11 Jun', time:'23:00', group:'A', home:'Corea del Sur',       away:'República Checa',    venue:'Guadalajara'},
  {id:'B1', date:'Vie 12 Jun', time:'16:00', group:'B', home:'Canadá',              away:'Bosnia',venue:'Toronto'},
  {id:'D1', date:'Vie 12 Jun', time:'22:00', group:'D', home:'Estados Unidos',      away:'Paraguay',           venue:'Los Ángeles'},
  {id:'B2', date:'Sáb 13 Jun', time:'16:00', group:'B', home:'Qatar',               away:'Suiza',              venue:'San Francisco'},
  {id:'C1', date:'Sáb 13 Jun', time:'19:00', group:'C', home:'Brasil',              away:'Marruecos',          venue:'Nueva Jersey'},
  {id:'C2', date:'Sáb 13 Jun', time:'22:00', group:'C', home:'Haití',               away:'Escocia',            venue:'Boston'},
  {id:'D2', date:'Dom 14 Jun', time:'01:00', group:'D', home:'Australia',           away:'Turquía',            venue:'Vancouver'},
  {id:'E1', date:'Dom 14 Jun', time:'14:00', group:'E', home:'Alemania',            away:'Curazao',            venue:'Houston'},
  {id:'F1', date:'Dom 14 Jun', time:'17:00', group:'F', home:'Países Bajos',        away:'Japón',              venue:'Dallas'},
  {id:'E2', date:'Dom 14 Jun', time:'20:00', group:'E', home:'Costa de Marfil',     away:'Ecuador',            venue:'Philadelphia'},
  {id:'F2', date:'Dom 14 Jun', time:'23:00', group:'F', home:'Suecia',              away:'Túnez',              venue:'Monterrey'},
  {id:'H1', date:'Lun 15 Jun', time:'13:00', group:'H', home:'España',              away:'Cabo Verde',         venue:'Atlanta'},
  {id:'G1', date:'Lun 15 Jun', time:'16:00', group:'G', home:'Bélgica',             away:'Egipto',             venue:'Seattle'},
  {id:'H2', date:'Lun 15 Jun', time:'19:00', group:'H', home:'Arabia Saudita',      away:'Uruguay',            venue:'Miami'},
  {id:'G2', date:'Lun 15 Jun', time:'22:00', group:'G', home:'Irán',                away:'Nueva Zelanda',      venue:'Los Ángeles'},
  {id:'I1', date:'Mar 16 Jun', time:'16:00', group:'I', home:'Francia',             away:'Senegal',            venue:'Nueva Jersey'},
  {id:'I2', date:'Mar 16 Jun', time:'19:00', group:'I', home:'Irak',                away:'Noruega',            venue:'Boston'},
  {id:'J1', date:'Mar 16 Jun', time:'22:00', group:'J', home:'Argentina',           away:'Argelia',            venue:'Kansas City'},
  {id:'J2', date:'Mar 17 Jun', time:'01:00', group:'J', home:'Austria',             away:'Jordania',           venue:'San Francisco'},
  {id:'K1', date:'Mié 17 Jun', time:'14:00', group:'K', home:'Portugal',            away:'RD de Congo',        venue:'Houston'},
  {id:'L1', date:'Mié 17 Jun', time:'17:00', group:'L', home:'Inglaterra',          away:'Croacia',            venue:'Dallas'},
  {id:'L2', date:'Mié 17 Jun', time:'20:00', group:'L', home:'Ghana',               away:'Panamá',             venue:'Toronto'},
  {id:'K2', date:'Mié 17 Jun', time:'23:00', group:'K', home:'Uzbekistán',          away:'Colombia',           venue:'Ciudad de México'},
  // ── JORNADA 2 ──
  {id:'A3', date:'Jue 18 Jun', time:'13:00', group:'A', home:'República Checa',     away:'Sudáfrica',          venue:'Atlanta'},
  {id:'B3', date:'Jue 18 Jun', time:'16:00', group:'B', home:'Suiza',               away:'Bosnia',venue:'Los Ángeles'},
  {id:'B4', date:'Jue 18 Jun', time:'19:00', group:'B', home:'Canadá',              away:'Qatar',              venue:'Vancouver'},
  {id:'A4', date:'Jue 18 Jun', time:'22:00', group:'A', home:'México',              away:'Corea del Sur',      venue:'Guadalajara'},
  {id:'D3', date:'Vie 19 Jun', time:'16:00', group:'D', home:'Estados Unidos',      away:'Australia',          venue:'Seattle'},
  {id:'C3', date:'Vie 19 Jun', time:'19:00', group:'C', home:'Escocia',             away:'Marruecos',          venue:'Boston'},
  {id:'C4', date:'Vie 19 Jun', time:'21:30', group:'C', home:'Brasil',              away:'Haití',              venue:'Philadelphia'},
  {id:'D4', date:'Sáb 20 Jun', time:'00:00', group:'D', home:'Turquía',             away:'Paraguay',           venue:'San Francisco'},
  {id:'F3', date:'Sáb 20 Jun', time:'14:00', group:'F', home:'Países Bajos',        away:'Suecia',             venue:'Houston'},
  {id:'E3', date:'Sáb 20 Jun', time:'17:00', group:'E', home:'Alemania',            away:'Costa de Marfil',    venue:'Toronto'},
  {id:'E4', date:'Sáb 20 Jun', time:'23:00', group:'E', home:'Ecuador',             away:'Curazao',            venue:'Kansas City'},
  {id:'F4', date:'Dom 21 Jun', time:'01:00', group:'F', home:'Túnez',               away:'Japón',              venue:'Monterrey'},
  {id:'H3', date:'Dom 21 Jun', time:'13:00', group:'H', home:'España',              away:'Arabia Saudita',     venue:'Atlanta'},
  {id:'G3', date:'Dom 21 Jun', time:'16:00', group:'G', home:'Bélgica',             away:'Irán',               venue:'Los Ángeles'},
  {id:'H4', date:'Dom 21 Jun', time:'19:00', group:'H', home:'Uruguay',             away:'Cabo Verde',         venue:'Miami'},
  {id:'G4', date:'Dom 21 Jun', time:'22:00', group:'G', home:'Nueva Zelanda',       away:'Egipto',             venue:'Vancouver'},
  {id:'J3', date:'Lun 22 Jun', time:'14:00', group:'J', home:'Argentina',           away:'Austria',            venue:'Dallas'},
  {id:'I3', date:'Lun 22 Jun', time:'18:00', group:'I', home:'Francia',             away:'Irak',               venue:'Philadelphia'},
  {id:'I4', date:'Lun 22 Jun', time:'21:00', group:'I', home:'Noruega',             away:'Senegal',            venue:'Nueva Jersey'},
  {id:'J4', date:'Mar 23 Jun', time:'00:00', group:'J', home:'Jordania',            away:'Argelia',            venue:'San Francisco'},
  {id:'K3', date:'Mar 23 Jun', time:'14:00', group:'K', home:'Portugal',            away:'Uzbekistán',         venue:'Houston'},
  {id:'L3', date:'Mar 23 Jun', time:'17:00', group:'L', home:'Inglaterra',          away:'Ghana',              venue:'Boston'},
  {id:'L4', date:'Mar 23 Jun', time:'20:00', group:'L', home:'Panamá',              away:'Croacia',            venue:'Toronto'},
  {id:'K4', date:'Mar 23 Jun', time:'23:00', group:'K', home:'Colombia',            away:'RD de Congo',        venue:'Guadalajara'},
  // ── JORNADA 3 ──
  {id:'B5', date:'Mié 24 Jun', time:'16:00', group:'B', home:'Suiza',               away:'Canadá',             venue:'Vancouver'},
  {id:'B6', date:'Mié 24 Jun', time:'16:00', group:'B', home:'Bosnia',away:'Qatar',              venue:'Seattle'},
  {id:'C5', date:'Mié 24 Jun', time:'19:00', group:'C', home:'Marruecos',           away:'Haití',              venue:'Atlanta'},
  {id:'C6', date:'Mié 24 Jun', time:'19:00', group:'C', home:'Brasil',              away:'Escocia',            venue:'Miami'},
  {id:'A5', date:'Mié 24 Jun', time:'22:00', group:'A', home:'Sudáfrica',           away:'Corea del Sur',      venue:'Monterrey'},
  {id:'A6', date:'Mié 24 Jun', time:'22:00', group:'A', home:'República Checa',     away:'México',             venue:'Ciudad de México'},
  {id:'E5', date:'Jue 25 Jun', time:'17:00', group:'E', home:'Curazao',             away:'Costa de Marfil',    venue:'Philadelphia'},
  {id:'E6', date:'Jue 25 Jun', time:'17:00', group:'E', home:'Ecuador',             away:'Alemania',           venue:'Nueva Jersey'},
  {id:'F5', date:'Jue 25 Jun', time:'20:00', group:'F', home:'Japón',               away:'Suecia',             venue:'Dallas'},
  {id:'F6', date:'Jue 25 Jun', time:'20:00', group:'F', home:'Túnez',               away:'Países Bajos',       venue:'Kansas City'},
  {id:'D5', date:'Jue 25 Jun', time:'23:00', group:'D', home:'Paraguay',            away:'Australia',          venue:'San Francisco'},
  {id:'D6', date:'Jue 25 Jun', time:'23:00', group:'D', home:'Turquía',             away:'Estados Unidos',     venue:'Los Ángeles'},
  {id:'I5', date:'Vie 26 Jun', time:'16:00', group:'I', home:'Noruega',             away:'Francia',            venue:'Boston'},
  {id:'I6', date:'Vie 26 Jun', time:'16:00', group:'I', home:'Senegal',             away:'Irak',               venue:'Toronto'},
  {id:'H5', date:'Vie 26 Jun', time:'21:00', group:'H', home:'Cabo Verde',          away:'Arabia Saudita',     venue:'Houston'},
  {id:'H6', date:'Vie 26 Jun', time:'21:00', group:'H', home:'Uruguay',             away:'España',             venue:'Guadalajara'},
  {id:'G5', date:'Sáb 27 Jun', time:'00:00', group:'G', home:'Egipto',              away:'Irán',               venue:'Seattle'},
  {id:'G6', date:'Sáb 27 Jun', time:'00:00', group:'G', home:'Nueva Zelanda',       away:'Bélgica',            venue:'Vancouver'},
  {id:'L5', date:'Sáb 27 Jun', time:'18:00', group:'L', home:'Croacia',             away:'Ghana',              venue:'Philadelphia'},
  {id:'L6', date:'Sáb 27 Jun', time:'18:00', group:'L', home:'Panamá',              away:'Inglaterra',         venue:'Nueva Jersey'},
  {id:'K5', date:'Sáb 27 Jun', time:'20:30', group:'K', home:'Colombia',            away:'Portugal',           venue:'Miami'},
  {id:'K6', date:'Sáb 27 Jun', time:'20:30', group:'K', home:'RD de Congo',         away:'Uzbekistán',         venue:'Atlanta'},
  {id:'J5', date:'Sáb 27 Jun', time:'23:00', group:'J', home:'Argelia',             away:'Austria',            venue:'Kansas City'},
  {id:'J6', date:'Sáb 27 Jun', time:'23:00', group:'J', home:'Jordania',            away:'Argentina',          venue:'Dallas'},
];

// ════════════════════════════════════════════════════
//  KNOCKOUT DATA — fechas y horarios oficiales FIFA
// ════════════════════════════════════════════════════
const KO_ROUNDS = [
  {
    id: 'r32', title: '16avos de Final',
    matches: [
      {id:'73',  date:'Dom 28 Jun', time:'16:00', venue:'Los Ángeles',   s1:{type:'group',pos:2,grp:'A'}, s2:{type:'group',pos:2,grp:'B'}},
      {id:'74',  date:'Lun 29 Jun', time:'17:30', venue:'Boston',        s1:{type:'group',pos:1,grp:'E'}, s2:{type:'best3',label:'3° A/B/C/D/F'}},
      {id:'75',  date:'Lun 29 Jun', time:'22:00', venue:'Monterrey',     s1:{type:'group',pos:1,grp:'F'}, s2:{type:'group',pos:2,grp:'C'}},
      {id:'76',  date:'Lun 29 Jun', time:'14:00', venue:'Houston',       s1:{type:'group',pos:1,grp:'E'}, s2:{type:'group',pos:2,grp:'F'}},
      {id:'77',  date:'Mar 30 Jun', time:'18:00', venue:'Nueva Jersey',  s1:{type:'group',pos:1,grp:'I'}, s2:{type:'best3',label:'3° C/D/F/G/H'}},
      {id:'78',  date:'Mar 30 Jun', time:'14:00', venue:'Dallas',        s1:{type:'group',pos:2,grp:'E'}, s2:{type:'group',pos:2,grp:'I'}},
      {id:'79',  date:'Mar 30 Jun', time:'22:00', venue:'Ciudad de México', s1:{type:'group',pos:1,grp:'A'}, s2:{type:'best3',label:'3° C/E/F/H/I'}},
      {id:'80',  date:'Mié 1 Jul',  time:'13:00', venue:'Atlanta',       s1:{type:'group',pos:1,grp:'L'}, s2:{type:'best3',label:'3° E/H/I/J/K'}},
      {id:'81',  date:'Mié 1 Jul',  time:'21:00', venue:'San Francisco', s1:{type:'group',pos:1,grp:'D'}, s2:{type:'best3',label:'3° B/E/F/I/J'}},
      {id:'82',  date:'Mié 1 Jul',  time:'17:00', venue:'Seattle',       s1:{type:'group',pos:1,grp:'G'}, s2:{type:'best3',label:'3° A/E/H/I/J'}},
      {id:'83',  date:'Jue 2 Jul',  time:'20:00', venue:'Toronto',       s1:{type:'group',pos:2,grp:'K'}, s2:{type:'group',pos:2,grp:'L'}},
      {id:'84',  date:'Jue 2 Jul',  time:'16:00', venue:'Los Ángeles',   s1:{type:'group',pos:1,grp:'H'}, s2:{type:'group',pos:2,grp:'J'}},
      {id:'85',  date:'Jue 2 Jul',  time:'00:00', venue:'Vancouver',     s1:{type:'group',pos:1,grp:'B'}, s2:{type:'best3',label:'3° E/F/G/I/J'}},
      {id:'86',  date:'Vie 3 Jul',  time:'19:00', venue:'Miami',         s1:{type:'group',pos:1,grp:'J'}, s2:{type:'group',pos:2,grp:'H'}},
      {id:'87', date:'Vie 3 Jul',  time:'22:30', venue:'Kansas City',   s1:{type:'group',pos:1,grp:'K'}, s2:{type:'best3',label:'3° D/E/I/J/L'}},
      {id:'88', date:'Vie 3 Jul',  time:'15:00', venue:'Dallas',        s1:{type:'group',pos:2,grp:'D'}, s2:{type:'group',pos:2,grp:'G'}},
    ]
  },
  {
    id: 'r16', title: 'Octavos de Final',
    matches: [
      {id:'89', date:'Sáb 4 Jul',  time:'18:00', venue:'Philadelphia',   s1:{type:'winner',ko:'74'},  s2:{type:'winner',ko:'77'}},
      {id:'90', date:'Sáb 4 Jul',  time:'14:00', venue:'Houston',        s1:{type:'winner',ko:'73'},  s2:{type:'winner',ko:'75'}},
      {id:'91', date:'Dom 5 Jul',  time:'17:00', venue:'Nueva Jersey',   s1:{type:'winner',ko:'76'},  s2:{type:'winner',ko:'78'}},
      {id:'92', date:'Dom 5 Jul',  time:'21:00', venue:'Ciudad de México',s1:{type:'winner',ko:'79'},  s2:{type:'winner',ko:'80'}},
      {id:'93', date:'Lun 6 Jul',  time:'16:00', venue:'Dallas',         s1:{type:'winner',ko:'83'}, s2:{type:'winner',ko:'84'}},
      {id:'94', date:'Lun 6 Jul',  time:'21:00', venue:'Seattle',        s1:{type:'winner',ko:'81'},  s2:{type:'winner',ko:'82'}},
      {id:'95', date:'Mar 7 Jul',  time:'13:00', venue:'Atlanta',        s1:{type:'winner',ko:'86'}, s2:{type:'winner',ko:'88'}},
      {id:'96', date:'Mar 7 Jul',  time:'17:00', venue:'Vancouver',      s1:{type:'winner',ko:'85'}, s2:{type:'winner',ko:'87'}},
    ]
  },
  {
    id: 'qf', title: 'Cuartos de Final',
    matches: [
      {id:'97', date:'Jue 9 Jul',  time:'17:00', venue:'Boston',         s1:{type:'winner',ko:'89'}, s2:{type:'winner',ko:'90'}},
      {id:'98', date:'Vie 10 Jul', time:'16:00', venue:'Los Ángeles',    s1:{type:'winner',ko:'93'}, s2:{type:'winner',ko:'94'}},
      {id:'99', date:'Sáb 11 Jul', time:'18:00', venue:'Miami',          s1:{type:'winner',ko:'91'}, s2:{type:'winner',ko:'92'}},
      {id:'100', date:'Sáb 11 Jul', time:'22:00', venue:'Kansas City',    s1:{type:'winner',ko:'95'}, s2:{type:'winner',ko:'96'}},
    ]
  },
  {
    id: 'sf', title: 'Semifinales',
    matches: [
      {id:'101', date:'Mar 14 Jul', time:'16:00', venue:'Dallas',         s1:{type:'winner',ko:'97'}, s2:{type:'winner',ko:'98'}},
      {id:'102', date:'Mié 15 Jul', time:'16:00', venue:'Atlanta',        s1:{type:'winner',ko:'99'}, s2:{type:'winner',ko:'100'}},
    ]
  },
  {
    id: 'tp', title: 'Tercer Puesto',
    matches: [
      {id:'103', date:'Sáb 18 Jul', time:'18:00', venue:'Miami',          s1:{type:'loser',ko:'101'}, s2:{type:'loser',ko:'102'}},
    ]
  },
  {
    id: 'final', title: '🏆 FINAL',
    matches: [
      {id:'104', date:'Dom 19 Jul', time:'16:00', venue:'Nueva Jersey — MetLife', s1:{type:'winner',ko:'101'}, s2:{type:'winner',ko:'102'}},
    ]
  },
];

// ════════════════════════════════════════════════════
//  STATE
// ════════════════════════════════════════════════════
let scores = {};
let currentView = 'mobile';

// ════════════════════════════════════════════════════
//  VIEW MANAGEMENT
// ════════════════════════════════════════════════════
function setView(v) {
  currentView = v;
  try { localStorage.setItem('froporeo_view', v); } catch(e){}
  document.getElementById('view-chooser').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  document.getElementById('app').className = 'view-' + v;
  refreshAll();
}

function toggleView() {
  setView(currentView === 'mobile' ? 'desktop' : 'mobile');
  document.getElementById('view-chooser').style.display = 'none';
  document.getElementById('app').style.display = 'block';
}

// ════════════════════════════════════════════════════
//  SCORES PERSISTENCE
// ════════════════════════════════════════════════════
function saveScores() {
  try { localStorage.setItem('froporeo_scores', JSON.stringify(scores)); } catch(e){}
}
function loadScores() {
  try { const s = localStorage.getItem('froporeo_scores'); if(s) scores = JSON.parse(s); } catch(e){}
}
function getScore(id) { return scores[id] || null; }

// ════════════════════════════════════════════════════
//  AUTO-SYNC — ESPN API + GitHub Pages JSON
// ════════════════════════════════════════════════════

// Mapeo de nombres ESPN (inglés) a nombres del fixture (español)
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

let syncInProgress = false;
let lastSyncOk = null;
let syncTimer = null;

function setSyncBadge(state, msg) {
  const el = document.getElementById('sync-badge');
  if (!el) return;
  el.className = 'sync-badge sync-' + state;
  el.textContent = msg;
}

// Merge un score auto en scores[] sin pisarle encima a overrides manuales
function mergeAutoScore(id, data) {
  const existing = scores[id];
  if (existing && existing.auto === false) return false; // override manual → no tocar
  const changed = !existing
    || existing.home !== data.home
    || existing.away !== data.away
    || existing.status !== data.status;
  if (changed) { scores[id] = { ...data, auto: true }; }
  return changed;
}

// ── 1. Carga el JSON estático generado por GitHub Actions ────────────────────
async function loadRemoteJSON() {
  try {
    const res = await fetch('data/scores.json?v=' + Date.now());
    if (!res.ok) return false;
    const data = await res.json();
    if (!data || !data.scores) return false;
    let changed = false;
    Object.entries(data.scores).forEach(([id, s]) => {
      if (mergeAutoScore(id, s)) changed = true;
    });
    return changed;
  } catch(e) { return false; }
}

// ── 2. Fetch directo a ESPN desde el browser (más tiempo real) ──────────────
function espnUrl(dateStr) {
  return `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard?dates=${dateStr}`;
}

async function fetchESPNDate(dateStr) {
  const res = await fetch(espnUrl(dateStr));
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

function processESPNEvent(event) {
  try {
    const comp = event.competitions[0];
    const statusName = comp.status?.type?.name || '';
    if (statusName === 'STATUS_SCHEDULED') return false;

    const homeCmp = comp.competitors?.find(c => c.homeAway === 'home');
    const awayCmp = comp.competitors?.find(c => c.homeAway === 'away');
    if (!homeCmp || !awayCmp) return false;

    const homeEN = homeCmp.team?.displayName || '';
    const awayEN = awayCmp.team?.displayName || '';
    const homeES = ESPN_TO_SPANISH[homeEN] || homeEN;
    const awayES = ESPN_TO_SPANISH[awayEN] || awayEN;

    // Buscar partido por equipos (en cualquier orden)
    let match = MATCHES.find(m => m.home === homeES && m.away === awayES);
    let flipped = false;
    if (!match) {
      match = MATCHES.find(m => m.home === awayES && m.away === homeES);
      if (match) flipped = true;
    }
    if (!match) return false;

    let h = parseInt(homeCmp.score) || 0;
    let a = parseInt(awayCmp.score) || 0;
    if (flipped) { [h, a] = [a, h]; }

    const liveOnes = ['STATUS_IN_PROGRESS','STATUS_HALFTIME','STATUS_END_OF_PERIOD','STATUS_SHOOTOUT'];
    const status = liveOnes.includes(statusName) ? 'live' : 'finished';

    return mergeAutoScore(match.id, { home: h, away: a, status, auto: true, updatedAt: new Date().toISOString() });
  } catch(e) { return false; }
}

async function fetchFromESPN() {
  const today = new Date();
  const start = new Date('2026-06-11');
  const end   = new Date('2026-07-20');

  // Sólo fetchear fechas pasadas + hoy + mañana
  const dates = [];
  for (let i = 5; i >= -1; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    if (d >= start && d <= end) dates.push(d);
  }

  let changed = false;
  for (const d of dates) {
    const ds = d.toISOString().slice(0,10).replace(/-/g,'');
    try {
      const data = await fetchESPNDate(ds);
      for (const ev of (data.events || [])) {
        if (processESPNEvent(ev)) changed = true;
      }
    } catch(e) { /* silencioso */ }
  }
  return changed;
}

// ── Orquestador principal ────────────────────────────────────────────────────
async function syncScores() {
  if (syncInProgress) return;
  syncInProgress = true;
  setSyncBadge('syncing', '🔄 Sincronizando...');

  let anyChange = false;

  // 1. JSON de GitHub Pages (siempre disponible, max 5 min delay)
  try {
    if (await loadRemoteJSON()) anyChange = true;
  } catch(e) {}

  // 2. ESPN directo (si CORS lo permite, actualización en tiempo real)
  try {
    if (await fetchFromESPN()) anyChange = true;
  } catch(e) {}

  if (anyChange) { saveScores(); refreshAll(); }

  lastSyncOk = new Date();
  const hora = lastSyncOk.toLocaleTimeString('es-AR', {hour:'2-digit',minute:'2-digit'});
  const hasLive = Object.values(scores).some(s => s.status === 'live');
  setSyncBadge('ok', `✅ Sync ${hora}${hasLive?' · 🔴 LIVE':''}`);

  // Si hay partidos en vivo, re-sincronizar cada 90 segundos; si no, cada 3 minutos
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncScores, hasLive ? 90_000 : 180_000);

  syncInProgress = false;
}

// ════════════════════════════════════════════════════
//  STANDINGS HELPER
// ════════════════════════════════════════════════════
function calcStandings(letter) {
  const grp = GROUPS[letter];
  const matches = MATCHES.filter(m => m.group === letter);
  const st = {};
  grp.teams.forEach(t => st[t] = {pts:0,pj:0,pg:0,pe:0,pp:0,gf:0,gc:0});
  matches.forEach(m => {
    const s = getScore(m.id);
    if (!s || s.status === 'delete') return;
    const h = m.home, a = m.away;
    if (!st[h] || !st[a]) return;
    st[h].pj++; st[a].pj++;
    st[h].gf += s.home; st[h].gc += s.away;
    st[a].gf += s.away; st[a].gc += s.home;
    if (s.home > s.away)      { st[h].pts+=3; st[h].pg++; st[a].pp++; }
    else if (s.home < s.away) { st[a].pts+=3; st[a].pg++; st[h].pp++; }
    else                      { st[h].pts++; st[a].pts++; st[h].pe++; st[a].pe++; }
  });
  const sorted = grp.teams.slice().sort((a,b) => {
    if (st[b].pts !== st[a].pts) return st[b].pts - st[a].pts;
    return (st[b].gf - st[b].gc) - (st[a].gf - st[a].gc);
  });
  const played = matches.filter(m => { const s=getScore(m.id); return s && s.status !== 'delete'; }).length;
  return { sorted, st, complete: played >= 6 };
}

// ════════════════════════════════════════════════════
//  KO RESOLVER
// ════════════════════════════════════════════════════
function resolveTeam(source) {
  if (!source) return null;
  if (source.type === 'group') {
    const { sorted, complete } = calcStandings(source.grp);
    if (!complete) return null;
    return sorted[source.pos - 1];
  }
  if (source.type === 'best3') return null;
  if (source.type === 'winner' || source.type === 'loser') {
    const koMatch = findKoMatch(source.ko);
    if (!koMatch) return null;
    const s = getScore(source.ko);
    if (!s || s.status === 'delete') return null;
    const team1 = resolveTeam(koMatch.s1);
    const team2 = resolveTeam(koMatch.s2);
    if (!team1 || !team2) return null;
    if (source.type === 'winner') return s.home > s.away ? team1 : team2;
    if (source.type === 'loser')  return s.home > s.away ? team2 : team1;
  }
  return null;
}

function findKoMatch(id) {
  for (const round of KO_ROUNDS) {
    const m = round.matches.find(m => m.id === id);
    if (m) return m;
  }
  return null;
}

// ════════════════════════════════════════════════════
//  NAV
// ════════════════════════════════════════════════════
function showSection(name, btn) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('sec-' + name).classList.add('active');
  if (btn) btn.classList.add('active');
}

// ════════════════════════════════════════════════════
//  RENDER GROUPS
// ════════════════════════════════════════════════════
function renderGroups() {
  const grid = document.getElementById('groups-grid');
  grid.innerHTML = '';
  Object.entries(GROUPS).forEach(([letter, grp]) => {
    const { sorted, st } = calcStandings(letter);
    const matches = MATCHES.filter(m => m.group === letter);
    let trows = '';
sorted.forEach((team, i) => {
  const s = st[team];
  const dg = s.gf - s.gc;
  
  // Lógica de puntos: i=0 (1ero), i=1 (2do), i=2 (3ero)
  const dot = i===0 ? 'qdot-1' : i===1 ? 'qdot-2' : i===2 ? 'qdot-3' : '';
  
trows += `<tr>
  <td class="col-team">
    <div class="team-cell">
      <span class="pos-num">${i+1}</span>
      ${dot ? `<span class="qdot ${dot}"></span>` : '<span class="qdot-spacer"></span>'}
      ${flag(team)}<span class="t-name text-bold">${team}</span>
    </div>
  </td>
  <td>${s.pj}</td><td>${s.pg}</td><td>${s.pe}</td><td>${s.pp}</td>
  <td class="${dg > 0 ? 'gd-pos' : dg < 0 ? 'gd-neg' : 'gd-nil'}">${dg > 0 ? '+' : ''}${dg}</td>
  <td class="pts">${s.pts}</td>
</tr>`;
});
    let mrows = '';
    matches.forEach(m => {
      const s = getScore(m.id);
      const hasScore = s && s.status !== 'delete';
      const scoreDisp = hasScore
        ? (s.status==='live'?`<span class="m-score live">${s.home}·${s.away}</span>`:`<span class="m-score">${s.home}-${s.away}</span>`)
        : `<span class="m-score pending">${m.time}</span>`;
      const d = m.date.replace(' Jun','').replace(' Jul','').replace('Jue ','J ').replace('Vie ','V ').replace('Sáb ','S ').replace('Dom ','D ').replace('Lun ','L ').replace('Mar ','M ').replace('Mié ','X ');
      mrows += `<div class="match-row" onclick="openModal('${m.id}')">
        <span class="m-date">${d}</span>
        <div class="m-teams">
          ${flag(m.home)}<span class="m-tname">${abbr(m.home)}</span>
          <span class="m-vs">VS</span>
          <span class="m-tname">${abbr(m.away)}</span>${flag(m.away)}
        </div>
        ${scoreDisp}<span class="m-edit">✏️</span>
      </div>`;
    });
const card = document.createElement('div');
card.className = 'group-card';
card.innerHTML = `
  <div class="group-card-header">
    <span class="group-letter">GRUPO ${letter}</span>
    <span class="group-sub">4 equipos · 6 partidos</span>
  </div>
  <table class="tbl">

<thead><tr>
  <th class="col-team">EQUIPO</th>
  <th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>DG</th><th>PTS</th>
</tr></thead>
    <tbody>${trows}</tbody>
  </table>
  <div class="group-matches">${mrows}</div>`;
    grid.appendChild(card);
  });
}

// ════════════════════════════════════════════════════
//  RENDER FIXTURE
// ════════════════════════════════════════════════════
function renderFixture() {
  const container = document.getElementById('fixture-container');
  const byDate = {};
  MATCHES.forEach(m => { if (!byDate[m.date]) byDate[m.date]=[]; byDate[m.date].push(m); });
  let html = '';
  Object.entries(byDate).forEach(([date, matches]) => {
    let cards = '';
    matches.forEach(m => {
      const s = getScore(m.id);
      const hasScore = s && s.status !== 'delete';
      const scoreDisp = hasScore
        ? (s.status==='live'?`<div class="cal-score live">${s.home}·${s.away}</div>`:`<div class="cal-score">${s.home}-${s.away}</div>`)
        : `<div class="cal-score pending">${m.time}</div>`;
      cards += `<div class="cal-card ${s?.status==='live'?'is-live':''}" onclick="openModal('${m.id}')">
        <div class="cal-time">${m.time}</div>
        <div class="cal-divider"></div>
        <div class="cal-body">
          <div class="cal-group-tag">Grupo ${m.group}</div>
          <div class="cal-teams">
            ${flag(m.home)}<span class="cal-tname">${abbr(m.home)}</span>
            <span style="color:rgba(255,255,255,.3);font-size:11px">vs</span>
            <span class="cal-tname">${abbr(m.away)}</span>${flag(m.away)}
          </div>
          <div class="cal-venue">📍 ${m.venue}</div>
        </div>
        ${scoreDisp}
        <span style="font-size:12px;opacity:.25">✏️</span>
      </div>`;
    });
    html += `<div class="cal-day">
      <div class="cal-day-header">
        <span class="cal-day-label">${date}</span>
        <span class="cal-day-count">${matches.length} partido${matches.length>1?'s':''}</span>
      </div>
      <div class="cal-grid">${cards}</div>
    </div>`;
  });
  container.innerHTML = html;
}

// ════════════════════════════════════════════════════
//  RENDER ARGENTINA
// ════════════════════════════════════════════════════
function renderArgentina() {
  const argMatches = MATCHES.filter(m => m.group === 'J');
  let html = '';
  argMatches.forEach(m => {
    const s = getScore(m.id);
    const hasScore = s && s.status !== 'delete';
    const scoreDisp = hasScore
      ? (s.status==='live'?`<div class="cal-score live">${s.home}·${s.away}</div>`:`<div class="cal-score">${s.home}-${s.away}</div>`)
      : `<div class="cal-score pending">${m.time}</div>`;
    html += `<div class="cal-card" style="margin-bottom:10px" onclick="openModal('${m.id}')">
      <div class="cal-time" style="font-size:14px;line-height:1.3;min-width:60px">${m.date}</div>
      <div class="cal-divider"></div>
      <div class="cal-body">
        <div class="cal-teams">
          ${flag(m.home)}<span class="cal-tname">${abbr(m.home)}</span>
          <span style="color:rgba(255,255,255,.3);font-size:11px">vs</span>
          <span class="cal-tname">${abbr(m.away)}</span>${flag(m.away)}
        </div>
        <div class="cal-venue">📍 ${m.venue} · ${m.time} ARG</div>
      </div>
      ${scoreDisp}<span style="font-size:12px;opacity:.25">✏️</span>
    </div>`;
  });
  document.getElementById('arg-matches').innerHTML = html;
  document.getElementById('arg-banner-title').innerHTML = `${flag('Argentina')} GRUPO J — CAMPEÓN DEFENSOR`;
const { sorted, st } = calcStandings('J');
  let trows = '';
  
  sorted.forEach((team, i) => {
    const s = st[team];
    const dg = s.gf - s.gc; // <--- ¡Asegúrate de agregar esto!
    const dot = i===0?'qdot-1':i===1?'qdot-2':i===2?'qdot-3':'';
    
    trows += `<tr>
      <td class="col-team">
        <div class="team-cell">
          <span class="pos-num">${i+1}</span>
          ${dot ? `<span class="qdot ${dot}"></span>` : '<span class="qdot-spacer"></span>'}
          ${flag(team)}<span class="t-name text-bold">${team}</span>
        </div>
      </td>
      <td>${s.pj}</td><td>${s.pg}</td><td>${s.pe}</td><td>${s.pp}</td>
      <td class="${dg > 0 ? 'gd-pos' : dg < 0 ? 'gd-neg' : 'gd-nil'}">${dg > 0 ? '+' : ''}${dg}</td>
      <td class="pts">${s.pts}</td>
    </tr>`;
  });
  document.getElementById('arg-standings').innerHTML = `
    <div class="group-card">
      <div class="group-card-header">
        <span class="group-letter">GRUPO J</span>
        <span class="group-sub">Argentina · Argelia · Austria · Jordania</span>
      </div>
      <table class="tbl">
<thead><tr>
  <th class="col-team">EQUIPO</th>
  <th>PJ</th><th>PG</th><th>PE</th><th>PP</th><th>DG</th><th>PTS</th>
</tr></thead>
        <tbody>${trows}</tbody>
      </table>
    </div>`;
}

// ════════════════════════════════════════════════════
//  RENDER KNOCKOUT
// ════════════════════════════════════════════════════
function renderKnockout() {
  let html = `<div style="font-family:'Barlow Condensed',sans-serif;font-size:12px;letter-spacing:1px;color:rgba(255,255,255,.4);margin-bottom:16px;">
    Los equipos aparecen automáticamente al completar cada fase
  </div>`;
  KO_ROUNDS.forEach(({ title, matches }) => {
    const isFinal = title.includes('FINAL');
    function sourceLabel(s) {
      if (s.type === 'group') return `${s.pos}° Grupo ${s.grp}`;
      if (s.type === 'best3') return s.label || '3° mejor';
      if (s.type === 'winner') return `Gan. ${s.ko}`;
      if (s.type === 'loser')  return `Perd. ${s.ko}`;
      return '?';
    }
    html += `<div class="ko-round-title" style="${isFinal?'color:var(--orange-lite);font-size:28px':''}">${title}</div><div class="ko-grid">`;
    matches.forEach(m => {
      const team1 = resolveTeam(m.s1);
      const team2 = resolveTeam(m.s2);
      const t1html = team1 ? `${flag(team1)} <span class="tname">${team1}</span>` : `<span class="ko-pending">${sourceLabel(m.s1)}</span>`;
      const t2html = team2 ? `${flag(team2)} <span class="tname">${team2}</span>` : `<span class="ko-pending">${sourceLabel(m.s2)}</span>`;
      const s = getScore(m.id);
      const canPlay = team1 && team2;
      let scoreHtml;
      if (s && s.status !== 'delete') {
        scoreHtml = s.status==='live' ? `<div class="ko-score live">${s.home}·${s.away}</div>` : `<div class="ko-score done">${s.home} - ${s.away}</div>`;
      } else {
        scoreHtml = `<div class="ko-score">${m.time !== '--:--' ? m.time+' ARG' : m.date}</div>`;
      }
      const clickable = canPlay ? `onclick="openKoModal('${m.id}')" style="cursor:pointer"` : '';
      html += `<div class="ko-card ${isFinal?'final-card':''} ${!canPlay?'ko-card-pending':''}" ${clickable}>
        <div class="ko-meta">${m.date} · 📍 ${m.venue}</div>
        <div class="ko-match">
          <div class="ko-team">${t1html}</div>
          ${scoreHtml}
          <div class="ko-team right">${t2html}</div>
        </div>
      </div>`;
    });
    html += '</div>';
  });
  document.getElementById('ko-container').innerHTML = html;
}

// ════════════════════════════════════════════════════
//  REFRESH ALL
// ════════════════════════════════════════════════════
function refreshAll() {
  const hasLive = Object.values(scores).some(s => s.status === 'live');
  document.getElementById('live-badge').style.display = hasLive ? 'flex' : 'none';
  document.getElementById('update-time').textContent = new Date().toLocaleTimeString('es-AR', {hour:'2-digit', minute:'2-digit'});
  renderGroups();
  renderFixture();
  renderArgentina();
  renderKnockout();
}

// ════════════════════════════════════════════════════
//  MODALS
// ════════════════════════════════════════════════════
function openModal(matchId) {
  const m = MATCHES.find(x => x.id === matchId);
  if (!m) return;
  const s = getScore(matchId);
  document.getElementById('modal-id').value = matchId;
  document.getElementById('modal-title').innerHTML = `${flag(m.home)} ${m.home} <span style="color:rgba(255,255,255,.3);font-size:14px">vs</span> ${m.away} ${flag(m.away)}`;
  document.getElementById('modal-sub').textContent = `${m.date} · ${m.time} ARG · ${m.venue}`;
  document.getElementById('modal-home-label').textContent = m.home;
  document.getElementById('modal-away-label').textContent = m.away;
  document.getElementById('inp-home').value = s ? s.home : '';
  document.getElementById('inp-away').value = s ? s.away : '';
  document.getElementById('inp-status').value = s ? s.status : 'finished';
  document.getElementById('score-modal').classList.add('open');
  document.getElementById('inp-home').focus();
}

function openKoModal(matchId) {
  const koMatch = findKoMatch(matchId);
  if (!koMatch) return;
  const team1 = resolveTeam(koMatch.s1);
  const team2 = resolveTeam(koMatch.s2);
  if (!team1 || !team2) return;
  const s = getScore(matchId);
  document.getElementById('modal-id').value = matchId;
  document.getElementById('modal-title').innerHTML = `${flag(team1)} ${team1} <span style="color:rgba(255,255,255,.3);font-size:14px">vs</span> ${team2} ${flag(team2)}`;
  document.getElementById('modal-sub').textContent = `${koMatch.date} · ${koMatch.venue}`;
  document.getElementById('modal-home-label').textContent = team1;
  document.getElementById('modal-away-label').textContent = team2;
  document.getElementById('inp-home').value = s ? s.home : '';
  document.getElementById('inp-away').value = s ? s.away : '';
  document.getElementById('inp-status').value = s ? s.status : 'finished';
  document.getElementById('score-modal').classList.add('open');
  document.getElementById('inp-home').focus();
}

function closeModal() { document.getElementById('score-modal').classList.remove('open'); }

function saveScore() {
  const id = document.getElementById('modal-id').value;
  const status = document.getElementById('inp-status').value;
  if (status === 'delete') {
    delete scores[id];
  } else {
    const h = parseInt(document.getElementById('inp-home').value);
    const a = parseInt(document.getElementById('inp-away').value);
    if (isNaN(h) || isNaN(a)) { alert('Ingresá los goles de ambos equipos'); return; }
    // auto: false = override manual; el auto-sync no lo va a pisar
    scores[id] = { home: h, away: a, status, auto: false };
  }
  saveScores(); closeModal(); refreshAll();
}

document.getElementById('score-modal').addEventListener('click', e => { if (e.target.id === 'score-modal') closeModal(); });
window.addEventListener('keydown', e => {
  if (!document.getElementById('score-modal').classList.contains('open')) return;
  if (e.key === 'Enter') saveScore();
  if (e.key === 'Escape') closeModal();
});

// ════════════════════════════════════════════════════
//  PWA
// ════════════════════════════════════════════════════
function setupPWA() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 512;
  const ctx = canvas.getContext('2d');

  const g = ctx.createLinearGradient(0,0,512,512);  
  g.addColorStop(0,'#071F17'); g.addColorStop(1,'#155C45');
  ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(0,0,512,512,80); ctx.fill();

  // Cargamos la pelota personalizada
  const img = new Image();
  img.src = 'img/ball.png';
  img.onload = () => {
    ctx.drawImage(img, 106, 60, 300, 300);
    ctx.font='bold 72px Arial Black'; ctx.fillStyle='#F07823'; 
    ctx.textAlign='center'; ctx.fillText('FROPOREO',256,420);
    ctx.strokeStyle='#F07823'; ctx.lineWidth=10; ctx.beginPath(); ctx.roundRect(5,5,502,502,76); ctx.stroke();
    
    // Actualizamos los íconos con el canvas generado
    const icon = canvas.toDataURL('image/png');
    document.getElementById('apple-icon').href = icon;
    
    // Actualizamos el manifiesto con el nuevo nombre y el ícono
    const manifest = { 
      name:'Fixture-FROPOREO 2026', 
      short_name:'Froporeo 2026', 
      start_url:'./', 
      display:'standalone', 
      background_color:'#071F17', 
      theme_color:'#0C3B2E', 
      lang:'es', 
      icons:[{src: icon, sizes:'512x512', type:'image/png'}] 
    };
    const mBlob = new Blob([JSON.stringify(manifest)],{type:'application/json'});
    document.getElementById('pwa-manifest').href = URL.createObjectURL(mBlob);
  };

  // Registrar el service worker unificado (PWA + OneSignal)
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/OneSignalSDKWorker.js').catch(()=>{});
  
  let deferred = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred=e; document.getElementById('install-banner').style.display='flex'; });
  
  window.installApp = async () => { 
    if(!deferred) return; 
    deferred.prompt();
    const{outcome}=await deferred.userChoice; 
    deferred=null; 
    document.getElementById('install-banner').style.display='none'; 
    if(outcome==='accepted') showToast('✅ ¡App instalada!'); 
  };
  
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  if (isIOS && !window.matchMedia('(display-mode: standalone)').matches) setTimeout(()=>{ document.getElementById('ios-banner').style.display='flex'; }, 2000);
}

function showToast(msg) {
  const t = document.createElement('div');
  t.style.cssText='position:fixed;bottom:32px;left:50%;transform:translateX(-50%);background:var(--green-800);border:1px solid var(--orange);border-radius:8px;padding:12px 20px;color:var(--cream);font-family:Barlow Condensed,sans-serif;font-size:14px;font-weight:600;letter-spacing:1px;z-index:9999;box-shadow:0 8px 32px rgba(0,0,0,.5);white-space:nowrap';
  t.textContent = msg; document.body.appendChild(t); setTimeout(()=>t.remove(), 3500);
}

// ════════════════════════════════════════════════════
//  INIT
// ════════════════════════════════════════════════════
function init() {
  loadScores();
  const headerSub = document.getElementById('header-sub');
  if (headerSub) headerSub.innerHTML = `${flag('Estados Unidos')} USA &nbsp;·&nbsp; ${flag('México')} MÉXICO &nbsp;·&nbsp; ${flag('Canadá')} CANADÁ &nbsp;|&nbsp; 11 JUN – 19 JUL`;
  const view = window.innerWidth >= 900 ? 'desktop' : 'mobile';
  setView(view);
  setupPWA();

  // Lanzar sincronización automática al inicio
  syncScores();
}

init();

