const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'frontend', 'src');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walk(directoryPath);
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let originalContent = content;

    // Remove the backslash before the dollar sign
    content = content.replace(/\\\${import\.meta\.env\.VITE_API_BASE_URL/g, "${import.meta.env.VITE_API_BASE_URL");

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Fixed: ${file}`);
    }
});

console.log(`\nFinished! Fixed ${changedFiles} files.`);
