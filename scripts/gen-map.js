// scripts/gen-map.js
const fs = require('fs');
const path = require('path');

// === 路径配置修改 ===
// public 在根目录
const publicDir = path.join(process.cwd(), 'public');
// data 也在根目录 (去掉了 src)
const dataDir = path.join(process.cwd(), 'data');
const outputFile = path.join(dataDir, 'imageMap.json');

const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
const map = {};

console.log('📷 [Auto-Scan] Scanning public directory...');

// 1. 确保 data 目录存在
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 2. 扫描逻辑
try {
  if (fs.existsSync(publicDir)) {
    const items = fs.readdirSync(publicDir);
    items.forEach(item => {
      const itemPath = path.join(publicDir, item);
      // 必须是文件夹，且不以点开头
      if (fs.statSync(itemPath).isDirectory() && !item.startsWith('.')) {
        const key = item.toLowerCase();
        
        const files = fs.readdirSync(itemPath).filter(file => {
          return allowedExts.includes(path.extname(file).toLowerCase());
        });

        if (files.length > 0) {
          map[key] = {
            folder: item,
            files: files
          };
          console.log(`   ✅ /${key} -> ${files.length} images`);
        }
      }
    });
  }

  fs.writeFileSync(outputFile, JSON.stringify(map, null, 2));
  console.log(`🎉 Index generated at: data/imageMap.json`);
} catch (e) {
  console.error('Error scanning files:', e);
}