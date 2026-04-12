const fs = require('fs');
const path = require('path');

const src = path.join(__dirname, '..', 'codes');
const dest = path.join(__dirname, 'codes');

function copyRecursiveSync(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        if (fs.statSync(srcPath).isDirectory()) {
            copyRecursiveSync(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// Clean old directory if it exists
if (fs.existsSync(dest)) {
    fs.rmSync ? fs.rmSync(dest, { recursive: true, force: true }) : fs.rmdirSync(dest, { recursive: true });
}

console.log('🔄 Syncing /codes from root to paimon-npm for packaging...');
copyRecursiveSync(src, dest);
console.log('✅ Codes synced successfully!');