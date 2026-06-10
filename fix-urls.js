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

    // Replace single quotes 'http://localhost:5000...' with backticks
    content = content.replace(/'http:\/\/localhost:5000([^']*)'/g, "`\\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}$1`");
    
    // Replace double quotes "http://localhost:5000..." with backticks
    content = content.replace(/"http:\/\/localhost:5000([^"]*)"/g, "`\\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}$1`");

    // Replace occurrences that are already inside backticks `http://localhost:5000...`
    // We just replace the http://localhost:5000 part with the variable expression
    content = content.replace(/`http:\/\/localhost:5000/g, "`\\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}");

    if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        changedFiles++;
        console.log(`Updated: ${file}`);
    }
});

console.log(`\nFinished! Updated ${changedFiles} files.`);
