// ╔══════════════════════════════════════════════════════════════╗
// ║  config.js — ALL PLACEHOLDER VALUES LIVE HERE               ║
// ║  Edit this file to personalise the experience.              ║
// ╚══════════════════════════════════════════════════════════════╝

// ── STAGE 1 ────────────────────────────────────────────────────
// PLACEHOLDER: the dog's name — matched case-insensitively
const DOG_NAME = 'Lulu';

// ── STAGE 2 MAP ────────────────────────────────────────────────
// PLACEHOLDER: center of the walk route [lat, lng]
const MAP_CENTER = [52.334713, 5.539037];
const MAP_ZOOM   = 16;

// PLACEHOLDER: 8 markers along the walk — fill in real lat/lng and names.
// Names must match BINGO_LEFT order exactly.
const MARKERS = [
  { name: 'Tree',         lat: 52.334620, lng:  5.541623 },
  { name: 'Green Bench',  lat: 52.335632, lng: 5.541133 },
  { name: 'Silver Bench', lat: 52.335578, lng: -0.1280 },
  { name: 'GATE',    lat: 51.5070, lng: -0.1300 },
  { name: 'FOUNTAIN',lat: 51.5065, lng: -0.1260 },
  { name: 'BRIDGE',  lat: 51.5095, lng: -0.1265 },
  { name: 'STATUE',  lat: 51.5060, lng: -0.1285 },
  { name: 'SIGN',    lat: 51.5075, lng: -0.1310 },
];

// ── STAGE 2 BINGO ──────────────────────────────────────────────
// Left column = object names (must stay in sync with MARKERS array above)
const BINGO_LEFT  = ['BARS','SCHOOL','BENCH','GATE','FOUNTAIN','BRIDGE','STATUE','SIGN'];
// Right column = associated words (mix of correct answers and decoys)
const BINGO_RIGHT = ['ESCAPE','ACADEMY','ROUTE','MISSION','PORTAL','CODE','KEY','CIPHER'];

// The hidden correct direction — do NOT reveal to the user
const CORRECT_DIR = 'W';

// Which left-column index maps to which right-column index when answered correctly.
// BARS (0) → ESCAPE (0), SCHOOL (1) → ACADEMY (1)
const VALID_PAIRS = { 0: 0, 1: 1 };

// ── STAGE 3 TRAIL ──────────────────────────────────────────────
const STOPS = [
  {
    name:   'Rituals',
    desc:   'A haven of calm in the middle of the city.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.google.com/?q=Rituals+Amersfoort+centrum',
    story:  'And then they walked into Rituals, and Ellie spent __0__ minutes smelling everything while Sam pretended not to enjoy it.',
    blanks: ['...how many minutes?'],
    photo:  false,
    fact:   null,
  },
  {
    name:   'Tara Buddha Store',
    desc:   'Serenity, crystals, and things that make the soul feel lighter.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.google.com/?q=Tara+Buddha+Amersfoort',
    story:  'Inside, everything smelled like __0__ and looked like it had a story.',
    blanks: ['...what did it smell like?'],
    photo:  false,
    fact:   null,
  },
  {
    name:   'The Candy Shop',
    desc:   'The unknown snack challenge.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.google.com/?q=candy+shop+Amersfoort',
    story:  'Sam picked __0__ for Ellie and Ellie picked __1__ for Sam, and honestly __2__ was the worst decision.',
    blanks: ["Sam's pick for Ellie", "Ellie's pick for Sam", "...which one was the worst?"],
    photo:  false,
    fact:   null,
  },
  {
    name:   'Koppelpoort',
    desc:   '',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.google.com/?q=Koppelpoort+Amersfoort',
    story:  null,
    blanks: [],
    photo:  true,
    // PLACEHOLDER: swap for a different fun fact if desired
    fact:   'The Koppelpoort was built around 1425 and is one of the best-preserved medieval water gates in the Netherlands — it served as both a city gate and a working water mill.',
  },
  {
    name:   'Stadscafé Amersfoort',
    desc:   'The end of the trail. Time to sit.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.google.com/?q=Stadscafe+Amersfoort',
    story:  'They sat down. Ellie ordered her famous __0__ and Sam ordered __1__. The city hummed around them.',
    blanks: ['Ellie ordered...', 'Sam ordered...'],
    photo:  false,
    fact:   null,
  },
];

// ── STAGE 4 DINNER ─────────────────────────────────────────────
// PLACEHOLDER: fill in CLUE_1 and CLUE_2 for each country
const COUNTRIES = [
  { name:'India',     flag:'🇮🇳', c1:'CLUE_1_INDIA',     c2:'CLUE_2_INDIA'     },
  { name:'Italy',     flag:'🇮🇹', c1:'CLUE_1_ITALY',     c2:'CLUE_2_ITALY'     },
  { name:'Japan',     flag:'🇯🇵', c1:'CLUE_1_JAPAN',     c2:'CLUE_2_JAPAN'     },
  { name:'Spain',     flag:'🇪🇸', c1:'CLUE_1_SPAIN',     c2:'CLUE_2_SPAIN'     },
  { name:'France',    flag:'🇫🇷', c1:'CLUE_1_FRANCE',    c2:'CLUE_2_FRANCE'    },
  { name:'Indonesia', flag:'🇮🇩', c1:'CLUE_1_INDONESIA', c2:'CLUE_2_INDONESIA' },
  { name:'Turkey',    flag:'🇹🇷', c1:'CLUE_1_TURKEY',    c2:'CLUE_2_TURKEY'    },
  { name:'USA',       flag:'🇺🇸', c1:'CLUE_1_USA',       c2:'CLUE_2_USA'       },
  { name:'Greece',    flag:'🇬🇷', c1:'CLUE_1_GREECE',    c2:'CLUE_2_GREECE'    },
  { name:'Thailand',  flag:'🇹🇭', c1:'CLUE_1_THAILAND',  c2:'CLUE_2_THAILAND'  },
];

// PLACEHOLDER: restaurant address shown in the Stage 4 reveal
const RESTAURANT_NAME    = 'Diwali Palace';
const RESTAURANT_ADDRESS = 'PLACEHOLDER_ADDRESS';
// PLACEHOLDER: Google Maps URL for the restaurant
const RESTAURANT_MAP_URL = 'PLACEHOLDER_MAPS_URL';

// ── STAGE 5 MESSAGE ────────────────────────────────────────────
// PLACEHOLDER: write your personal message here — HTML is allowed
const S5_MESSAGE = `<p>[PLACEHOLDER: Write your personal closing message here.]</p>`;
