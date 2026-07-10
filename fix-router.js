const fs = require('fs');
const path = require('path');

const filesToFix = [
  'minuri-next/src/views/Home.jsx',
  'minuri-next/src/views/Gateway.jsx',
  'minuri-next/src/views/AuthCallback.jsx',
  'minuri-next/src/layouts/TeacherLayout.jsx',
  'minuri-next/src/layouts/DashboardLayout.jsx',
  'minuri-next/src/layouts/AdminLayout.jsx',
  'minuri-next/src/components/Navigation.jsx',
  'minuri-next/src/components/Footer.jsx'
];

filesToFix.forEach(relPath => {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace useNavigate
  content = content.replace(/import \{ useNavigate \} from 'react-router-dom';/g, "import { useRouter } from 'next/navigation';");
  content = content.replace(/useNavigate\(\)/g, "useRouter()");
  
  // Replace Link
  content = content.replace(/import \{ Link \} from 'react-router-dom';/g, "import Link from 'next/link';");
  content = content.replace(/<Link(.*?)to=/g, "<Link$1href=");
  
  // Replace NavLink and Link
  if (content.includes('NavLink')) {
     content = content.replace(/import \{ NavLink, Link \} from 'react-router-dom';/g, "import Link from 'next/link';\nimport { usePathname } from 'next/navigation';");
     content = content.replace(/import \{ NavLink, Outlet, useNavigate \} from 'react-router-dom';/g, "import Link from 'next/link';\nimport { useRouter, usePathname } from 'next/navigation';");
     
     // Quick NavLink to Link shim for layouts
     content = content.replace(/<NavLink(.*?)to=/g, "<Link$1href=");
  }
  
  // AuthCallback useSearchParams
  if (relPath.includes('AuthCallback')) {
    content = content.replace(/import \{ useNavigate, useSearchParams \} from 'react-router-dom';/g, "import { useRouter, useSearchParams } from 'next/navigation';");
  }
  
  // Remove Outlet and replace with children
  if (relPath.includes('Layout')) {
    content = content.replace(/<Outlet \/>/g, "{children}");
    // Add children to props
    content = content.replace(/export function (\w+Layout)\(\) \{/g, "export function $1({ children }) {");
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed ${relPath}`);
});
