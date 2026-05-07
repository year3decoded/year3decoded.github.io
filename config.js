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

// PLACEHOLDER: 8 markers along the walk — fill in real lat/lng, names, and dir.
// dir = the correct compass direction the object faces: 'N' | 'E' | 'S' | 'W'
// Names must match BINGO_LEFT order exactly.
const MARKERS = [
  { name: 'Tree',             lat: 52.334620, lng: 5.541623,  dir: 'E' }, // PLACEHOLDER
  { name: 'Green Bench',      lat: 52.335632, lng: 5.541133,  dir: 'S' }, // PLACEHOLDER
  { name: 'Bridge',           lat: 52.335578, lng: 5.540539,  dir: 'S' }, // PLACEHOLDER
  { name: 'Stone Fence',      lat: 52.335988, lng: 5.537169,  dir: 'N' }, // PLACEHOLDER
  { name: 'PostNL letterbox', lat: 52.335569, lng: 5.535894,  dir: 'S' }, // PLACEHOLDER
  { name: 'Red Dome',         lat: 52.334416, lng: 5.534418,  dir: 'W' }, // PLACEHOLDER
  { name: 'Silver Bench',     lat: 52.334124, lng: 5.536303,  dir: 'N' }, // PLACEHOLDER
  { name: 'School',           lat: 52.333265, lng: 5.536561,  dir: 'W' }, // PLACEHOLDER
];

// ── STAGE 2 BINGO ──────────────────────────────────────────────
// Left column = object names (must stay in sync with MARKERS array above)
const BINGO_LEFT  = ['Tree', 'Green Bench', 'Bridge', 'Stone Fence', 'PostNL letterbox', 'Red Dome', 'Silver Bench', 'School'];
// Right column = associated word for each left item at the same index
const BINGO_RIGHT = ['ROOTS', 'REST', 'ARCH', 'BORDER', 'LETTER', 'ESCAPE', 'SILVER', 'ACADEMY'];

// The hidden correct direction — do NOT reveal to the user
const CORRECT_DIR = 'W';

// ── STAGE 3 TRAIL ──────────────────────────────────────────────
const STOPS = [
  {
    name:   'Rituals',
    desc:   'A perfect smell in the middle of the city.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.app.goo.gl/3kw3UcRFg4jpYktu9',
    story:  'We walked into Rituals, and Ellie spent __0__ minutes smelling everything, while Sam pretended not to enjoy it.',
    blanks: ['...how many minutes?'],
    photo:  false,
    fact:   null,
  },
  {
    name:   'Tara Buddha Store',
    desc:   'Smells, crystals, and things that make the soul feel lighter.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.app.goo.gl/6Weyimf42LXkAMGg9',
    story:  'Inside, everything smelled like __0__ and looked like it had a story.',
    blanks: ['...what did it smell like?'],
    photo:  false,
    fact:   null,
  },
  {
    name:   'The Candy Shop',
    desc:   'The unknown snack challenge.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.app.goo.gl/yGeqwSNCz5eLe9Dq7',
    story:  'Sam picked __0__ for Ellie and Ellie picked __1__ for Sam, and honestly __2__ was better than expected.',
    blanks: ["Sam's pick for Ellie", "Ellie's pick for Sam", "...which one was better?"],
    photo:  false,
    fact:   null,
  },
  {
    name:   'Koppelpoort',
    desc:   '',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.app.goo.gl/1YJdzDshD5vvDBVK7',
    story:  null,
    blanks: [],
    photo:  true,
    // PLACEHOLDER: swap for a different fun fact if desired
    fact:   'The Koppelpoort was built around 1425 and is one of the best-preserved medieval water gates in the Netherlands, it served as both a city gate and a working water mill.',
  },
  {
    name:   'Stadscafé Amersfoort',
    desc:   'The end of the trail. Time to sit and drink.',
    // PLACEHOLDER: real Google Maps link
    maps:   'https://maps.app.goo.gl/BFDVULF4EjyqNq9b7',
    story:  'We sat down. Ellie ordered __0__ and Sam ordered __1__.',
    blanks: ['Ellie ordered...', 'Sam ordered...'],
    photo:  false,
    fact:   null,
  },
];

// ── STAGE 4 DINNER ─────────────────────────────────────────────
// Rules shown all at once. applies[] = the countries each rule correctly hits.
const RULES = [
  { id: 1, text: 'Country is located in Europe',       applies: ['Italy', 'France', 'Greece']                                   },
  { id: 2, text: 'Country name has 6 or more letters', applies: ['Mexico', 'France', "Turkey", 'Morocco', 'Greece', 'Thailand'] },
  { id: 3, text: 'Country is known for spicy food',    applies: ['India', 'Mexico', 'Morocco', 'Thailand']                      },
  { id: 4, text: 'Country name ends in the letter Y',  applies: ['Italy', 'Turkey']                                             },
];

const COUNTRIES = [
  { name: 'India',    flag: '🇮🇳' },
  { name: 'Italy',    flag: '🇮🇹' },
  { name: 'Mexico',   flag: '🇲🇽' },
  { name: 'France',   flag: '🇫🇷' },
  { name: 'Turkey',   flag: '🇹🇷' },
  { name: 'Morocco',  flag: '🇲🇦' },
  { name: 'Greece',   flag: '🇬🇷' },
  { name: 'Thailand', flag: '🇹🇭' },
];

// PLACEHOLDER: restaurant address shown in the Stage 4 reveal
const RESTAURANT_NAME    = 'Diwali Palace';
const RESTAURANT_ADDRESS = 'Piet Mondriaanplein 189-193, 3812 GZ Amersfoort';

const RESTAURANT_MAP_URL = 'https://maps.app.goo.gl/cFo5U85xVe9pcEuX8';

// ── STAGE 5 MESSAGE ────────────────────────────────────────────

const S5_MESSAGE = `<p>[I hope you enjoyed today <3.]</p>`;
