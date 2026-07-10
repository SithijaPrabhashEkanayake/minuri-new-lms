const fs = require('fs');
const path = require('path');

function walk(dir) {
  fs.readdirSync(dir).forEach(f => {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (p.endsWith('.jsx') || p.endsWith('.js')) {
      let c = fs.readFileSync(p, 'utf8');
      if (c.includes('${import.meta.env.VITE_API_BASE_URL || \'http://localhost:5000\'}')) {
        c = c.replace(/\$\{import\.meta\.env\.VITE_API_BASE_URL \|\| 'http:\/\/localhost:5000'\}/g, '');
        fs.writeFileSync(p, c);
        console.log('Fixed', p);
      }
    }
  });
}

walk('minuri-next/src');
