// server.js (version OEM / aftermarket + compat large)
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * MOCK CATALOG étendu
 * Chaque part a:
 * - partId, name
 * - originTypes: ['OEM','AFTERMARKET'] possible types
 * - compatibles: array { brand, model, years: [..] }
 * - offers: array { seller, price, url, origin: 'OEM'|'AFTERMARKET', stock? }
 *
 * Remplace ce mock plus tard par des providers (APIs / scrapers).
 */
const mockCatalog = [
  {
    partId: 'oil-filter-hf204',
    name: 'Filtre à huile HF204',
    originTypes: ['OEM','AFTERMARKET'],
    compatibles: [
      { brand: 'Yamaha', model: 'MT-07', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
      { brand: 'Yamaha', model: 'MT-09', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024] },
      { brand: 'Yamaha', model: 'Tracer 7', years: [2021,2022,2023,2024] },
      { brand: 'Yamaha', model: 'Tracer 9', years: [2021,2022,2023,2024] }
    ],
    offers: [
      { seller: 'Yamaha Store', price: 24.9, url: 'https://yamaha.example/oil-hf204', origin: 'OEM' },
      { seller: 'Parts4You', price: 12.5, url: 'https://parts.example/hf204', origin: 'AFTERMARKET' }
    ]
  },
  {
    partId: 'brake-pad-xyz',
    name: 'Plaquettes de frein XYZ',
    originTypes: ['AFTERMARKET'],
    compatibles: [
      { brand: 'Kawasaki', model: 'Z900', years: [2017,2018,2019,2020,2021] },
      { brand: 'Yamaha', model: 'MT-07', years: [2014,2015,2016,2017,2018,2019] },
      { brand: 'Honda', model: 'CRF450R', years: [2016,2017,2018,2019,2020] } // motocross
    ],
    offers: [
      { seller: 'MotoParts', price: 29.9, url: 'https://moto.example/brake-xyz', origin: 'AFTERMARKET' },
      { seller: 'DiscountBrakes', price: 25.0, url: 'https://disc.example/brake-xyz', origin: 'AFTERMARKET' }
    ]
  },
  {
    partId: 'air-filter-oem-123',
    name: 'Filtre à air OEM 123',
    originTypes: ['OEM'],
    compatibles: [
      { brand: 'Yamaha', model: 'Ténéré 700', years: [2019,2020,2021,2022] },
      { brand: 'Yamaha', model: 'Ténéré 700', years: [2019,2020,2021] } // duplicate volontaire
    ],
    offers: [
      { seller: 'Yamaha Official', price: 39.9, url: 'https://yamaha.example/air-123', origin: 'OEM' }
    ]
  },
  {
    partId: 'chain-520x1',
    name: 'Chaîne 520 x 1',
    originTypes: ['AFTERMARKET','OEM'],
    compatibles: [
      { brand: 'KTM', model: 'SX 350', years: [2016,2017,2018,2019] }, // motocross
      { brand: 'Honda', model: 'CRF450R', years: [2016,2017,2018] }
    ],
    offers: [
      { seller: 'KTM Shop', price: 89.9, url: 'https://ktm.example/chain-520', origin: 'OEM' },
      { seller: 'ChainWorld', price: 49.0, url: 'https://chain.example/520', origin: 'AFTERMARKET' }
    ]
  }
];

// helper: normalisation / matching tolerant (insensible à la casse, sous-strings acceptés)
function matchesBrandModel(entryBrand, entryModel, brandQ, modelQ) {
  if (!entryBrand || !entryModel || !brandQ || !modelQ) return false;
  const eb = entryBrand.toLowerCase();
  const em = entryModel.toLowerCase();
  const bq = brandQ.toLowerCase();
  const mq = modelQ.toLowerCase();
  // direct equality OR model contains OR model normalized (ex: tracer 9 vs tracer9)
  const normalize = s => s.replace(/\s+/g, '').replace(/[^a-z0-9]/g,'');
  return (eb === bq) &&
         (em === mq || em.includes(mq) || normalize(em) === normalize(mq) || normalize(em).includes(normalize(mq)));
}

function compatibleWith(part, brand, model, year) {
  // check for any compatible entry matching brand/model/year
  year = Number(year);
  return part.compatibles.some(c => {
    if (!matchesBrandModel(c.brand, c.model, brand, model)) return false;
    if (!c.years || c.years.length === 0) return true; // if years unspecified assume compatible
    return c.years.includes(year);
  });
}

// returns offers grouped by origin preference + overall best
app.post('/api/search', (req, res) => {
  const { brand, model, year, originPreference } = req.body || {};
  if (!brand || !model || !year) {
    return res.status(400).json({ error: 'brand, model and year are required' });
  }

  // filter compatible parts
  const compatibleParts = mockCatalog.filter(p => compatibleWith(p, brand, model, year));

  // build response
  const results = compatibleParts.map(p => {
    // partition offers by origin
    const offersOEM = p.offers.filter(o => o.origin === 'OEM').slice().sort((a,b) => a.price - b.price);
    const offersAfter = p.offers.filter(o => o.origin === 'AFTERMARKET').slice().sort((a,b) => a.price - b.price);
    const bestOEM = offersOEM[0] || null;
    const bestAfter = offersAfter[0] || null;
    // overall best (regardless origin)
    const allOffers = p.offers.slice().sort((a,b) => a.price - b.price);
    const bestOverall = allOffers[0] || null;

    // if user requested originPreference, mark the chosen best accordingly
    let chosenBest = null;
    if (originPreference === 'OEM') chosenBest = bestOEM || bestOverall;
    else if (originPreference === 'AFTERMARKET') chosenBest = bestAfter || bestOverall;
    else chosenBest = bestOverall;

    return {
      partId: p.partId,
      name: p.name,
      bestOEM,
      bestAftermarket: bestAfter,
      bestOverall,
      chosenBest,
      offers: p.offers
    };
  });

  // sort results by chosenBest.price asc
  results.sort((a,b) => (a.chosenBest?.price || Infinity) - (b.chosenBest?.price || Infinity));

  res.json({ meta: { brand, model, year, originPreference: originPreference || 'ANY', ts: Date.now() }, results });
});

app.get('/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Partify mock API (OEM/Aftermarket) running on ${PORT}`));
