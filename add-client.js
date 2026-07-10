const fs = require('fs');
const path = require('path');

const files = [
  'src/components/Navigation.jsx',
  'src/components/Footer.jsx',
  'src/layouts/AdminLayout.jsx',
  'src/layouts/DashboardLayout.jsx',
  'src/layouts/TeacherLayout.jsx'
];

files.forEach(f => {
  let p = path.join('minuri-next', f);
  if (!fs.existsSync(p)) return;
  let c = fs.readFileSync(p, 'utf8');
  if (!c.startsWith('"use client"')) {
    fs.writeFileSync(p, '"use client";\n' + c);
  }
});
console.log('Added use client directives.');
