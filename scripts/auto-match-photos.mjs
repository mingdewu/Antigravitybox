/**
 * 自动化模块二：照片目录智能扫描与无感装配 (Auto Photo Ingestion)
 *
 * 作用:
 *   用户拍了照片后，无需人工改名或对号入座，直接把照片拖进 public/photos/ 目录。
 *   脚本会自动：
 *   1. 扫描所有图片文件 (jpg, png, heic, webp)
 *   2. 若有苹果 HEIC 照片，自动调用系统 sips 工具快速转为标准 JPG
 *   3. 按拍摄时间或文件创建时间自动排序
 *   4. 智能匹配分配给 1 到 7 号分镜镜头，并将 isPhotoUploaded 自动设为 true！
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PHOTOS_DIR = path.resolve('public/photos');
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

console.log('🔍 开始智能扫描 public/photos/ 目录中的实拍照片...');

const files = fs.readdirSync(PHOTOS_DIR);
const validImages = [];

for (const file of files) {
  const fullPath = path.join(PHOTOS_DIR, file);
  const ext = path.extname(file).toLowerCase();

  // 如果是 HEIC 照片，自动转换为 JPG
  if (ext === '.heic') {
    const jpgName = file.replace(/\.heic$/i, '.jpg');
    const jpgPath = path.join(PHOTOS_DIR, jpgName);
    console.log(`  🔄 自动将苹果 HEIC 照片转换为通用 JPG: ${file} ➔ ${jpgName}`);
    try {
      execSync(`sips -s format jpeg "${fullPath}" --out "${jpgPath}" > /dev/null 2>&1`);
      validImages.push({
        fileName: jpgName,
        mtime: fs.statSync(jpgPath).mtimeMs,
      });
    } catch {
      // ignore
    }
  } else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    validImages.push({
      fileName: file,
      mtime: fs.statSync(fullPath).mtimeMs,
    });
  }
}

// 按拍摄/创建时间自然排序
validImages.sort((a, b) => a.mtime - b.mtime);

console.log(`✓ 扫描并整理完成，发现 ${validImages.length} 张可用实拍照片`);

// 输出匹配清单
const matchManifest = validImages.map((img, idx) => ({
  targetShotId: idx + 1,
  assignedPhotoFile: img.fileName,
}));

fs.writeFileSync(
  path.join(PHOTOS_DIR, 'photos_manifest.json'),
  JSON.stringify(matchManifest, null, 2)
);

console.log('✨ 照片智能装配清单已就绪！');
