// Metro per Gradie (dec. 194).
// Su Windows, col progetto grande, Metro apriva migliaia di file della cache insieme
// e si fermava con "EMFILE: too many open files": Expo Go diceva "Could not connect
// to development server". Qui la cache su disco apre al massimo pochi file alla volta
// e, se il sistema risponde comunque EMFILE, riprova poco dopo invece di fallire.
const { getDefaultConfig } = require('expo/metro-config');

const MAX_OPEN = 64;
let open = 0;
const queue = [];

async function limited(fn) {
  if (open >= MAX_OPEN) await new Promise((resolve) => queue.push(resolve));
  open++;
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        return await fn();
      } catch (err) {
        if (err && err.code === 'EMFILE' && attempt < 10) {
          await new Promise((r) => setTimeout(r, 50 * (attempt + 1)));
          continue;
        }
        throw err;
      }
    }
  } finally {
    open--;
    const next = queue.shift();
    if (next) next();
  }
}

// Avvolge le cache di Expo (stesso formato e cartella), limitando solo quanti file aprono.
const limitStore = (store) => ({
  get: (key) => limited(() => store.get(key)),
  set: (key, value) => limited(() => store.set(key, value)),
  clear: () => store.clear(),
});

const config = getDefaultConfig(__dirname);
config.cacheStores = config.cacheStores.map(limitStore);

module.exports = config;
