/**
 * 自动化模块二：照片目录智能扫描与按需装配 (Auto Photo Ingestion)
 *
 * 作用:
 *   用户拍摄照片后，拖进 public/photos/ 目录。
 *   脚本会自动：
 *   1. 扫描所有图片文件 (jpg, png, heic, webp)
 *   2. 自动转换 HEIC 为通用 JPG
 *   3. 优先匹配标记为实拍照片展示的分镜 (sceneType: photo-*)，保护地图巡航分镜不被无故覆盖！
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const PHOTOS_DIR = path.resolve('public/photos');
if (!fs.existsSync(PHOTOS_DIR)) {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

const DB_PATH = path.resolve('src/database-vlog/database_rows.json');
const PUBLIC_DB_PATH = path.resolve('public/database_rows.json');

console.log('🔍 开始智能扫描 public/photos/ 目录中的实拍照片...');

const files = fs.readdirSync(PHOTOS_DIR);
const validImages = [];

for (const file of files) {
  if (file.startsWith('.') || file.endsWith('.json')) continue;

  const fullPath = path.join(PHOTOS_DIR, file);
  const ext = path.extname(file).toLowerCase();

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

validImages.sort((a, b) => a.mtime - b.mtime);
console.log(`✓ 扫描完成，发现 ${validImages.length} 张可用实拍照片`);

if (fs.existsSync(DB_PATH) && validImages.length > 0) {
  const rows = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

  // 筛选出属于实拍类型的分镜行（例如 photo-transport, photo-scenery），避免污染地图主巡礼
  const photoTargetRows = rows.filter((r) => r.sceneType && r.sceneType.startsWith('photo-'));
  const matchManifest = [];

  validImages.forEach((img, idx) => {
    if (idx < photoTargetRows.length) {
      photoTargetRows[idx].isPhotoUploaded = true;
      photoTargetRows[idx].photoFileName = img.fileName;
      matchManifest.push({
        targetShotId: photoTargetRows[idx].id,
        badge: photoTargetRows[idx].badge,
        assignedPhotoFile: img.fileName,
      });
      console.log(`  📸 智能装配至实拍分镜: #${photoTargetRows[idx].id} (${photoTargetRows[idx].sceneTitle}) ➔ ${img.fileName}`);
    }
  });

  fs.writeFileSync(
    path.join(PHOTOS_DIR, 'photos_manifest.json'),
    JSON.stringify(matchManifest, null, 2)
  );

  fs.writeFileSync(DB_PATH, JSON.stringify(rows, null, 2));
  if (fs.existsSync(PUBLIC_DB_PATH)) {
    fs.writeFileSync(PUBLIC_DB_PATH, JSON.stringify(rows, null, 2));
  }
  console.log(`✨ 成功将实拍照片按需装配到指定实拍分镜中！`);
} else {
  console.log('ℹ️ 未检测到新照片或数据库，跳过装配。');
}
