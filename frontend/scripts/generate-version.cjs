const fs = require('fs');
const path = require('path');

const version = String(Date.now());
const out = { version, builtAt: new Date().toISOString() };
const dest = path.join(__dirname, '../public/version.json');

fs.writeFileSync(dest, JSON.stringify(out));
console.log('[version] Generated:', version, '→', dest);
