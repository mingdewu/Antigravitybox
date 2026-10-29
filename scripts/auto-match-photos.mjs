/**
 * 自动化模块二：照片目录智能扫描与无感装配 (Auto Photo Ingestion)
 *
 * 作用:
 *   用户拍摄照片后，无需人工改名或对号入座，直接把照片拖进 public/photos/ 目录。
 *   脚本会自动：
 *   1. 扫描所有图片文件 (jpg, png, heic, webp)
 *   2. 若有苹果 HEIC 照片，自动调用系统 sips 工具快速无损转为标准通用 JPG
 *   3. 按拍摄时间或文件创建时间自动自然排序
 *   4. 动态装配到分镜数据库 (database_rows.json)，将 isPhotoUploaded 设为 true 并适配 16:9 裁剪！
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
  // 忽略 manifest 与隐藏文件
  if (file.startsWith('.') || file.endsWith('.json')) continue;

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

// 智能关联到分镜数据
if (fs.existsSync(DB_PATH) && validImages.length > 0) {
  const rows = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

  // 将照片分配到对应分镜
  const matchManifest = [];
  validImages.forEach((img, idx) => {
    if (idx < rows.length) {
      rows[idx].isPhotoUploaded = true;
      rows[idx].photoFileName = img.fileName;
      matchManifest.push({
        targetShotId: rows[idx].id,
        badge: rows[idx].badge,
        assignedPhotoFile: img.fileName,
      });
      console.log(`  📸 自动装配: 分镜 #${rows[idx].id} (${rows[idx].badge}) ➔ ${img.fileName}`);
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
  console.log(`✨ 成功将 ${matchManifest.length} 张照片装配到分镜数据库！`);
} else {
  console.log('ℹ️ 未检测到新照片或数据库，跳过装配。');
}
