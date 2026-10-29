/**
 * 全自动流水线总控脚本 (One-Click Auto Pipeline - 动态分镜版)
 *
 * 彻底释放双手，实现从文字到成片的全链路自动化：
 * 1. 🎙️ 自动语音合成 (macOS 本地真人女声 Tingting，0 费用、0 外部依赖，动态适配 N 个分镜)
 * 2. ⏱️ 自动时长探测与毫秒级时间轴对齐 (由声音真实长度自动决定画面帧数，音画严丝合缝)
 * 3. 🖼️ 照片目录智能发现 (自动按时间匹配 public/photos/ 内的照片，支持 HEIC 自动转 JPG)
 * 4. 📝 自动回填数据库配置并刷新 Remotion
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('=====================================================');
console.log('🚀 启动 Remotion 全自动智能剪辑流水线 (Auto Pipeline)');
console.log('=====================================================\n');

// 1. 执行自动配音与精准时长探测
console.log('【步骤 1/2】🎙️ 动态检测台词并自动生成真人语音配音与精准时间轴测量...');
try {
  execSync('node scripts/auto-voiceover.mjs', { stdio: 'inherit' });
} catch (e) {
  console.error('语音合成步骤执行警告:', e.message);
}

// 2. 执行实拍照片目录智能扫描与装配
console.log('\n【步骤 2/2】🖼️ 自动扫描并匹配 public/photos/ 目录照片...');
try {
  execSync('node scripts/auto-match-photos.mjs', { stdio: 'inherit' });
} catch (e) {
  console.error('照片扫描步骤执行警告:', e.message);
}

// 3. 统计并展示当前工程状态
const dbPath = path.resolve('src/database-vlog/database_rows.json');
if (fs.existsSync(dbPath)) {
  const rows = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  const totalDuration = rows.reduce((acc, r) => acc + (r.clipDurationSeconds || 5.0), 0);
  const uploadedPhotosCount = rows.filter((r) => r.isPhotoUploaded).length;

  console.log('\n-----------------------------------------------------');
  console.log(`📊 当前工程统计:`);
  console.log(`   - 分镜总数: ${rows.length} 个镜头 (无限制，支持自由增删)`);
  console.log(`   - 已装配 16:9 实拍照片: ${uploadedPhotosCount} / ${rows.length}`);
  console.log(`   - 视频总时长: 约 ${totalDuration.toFixed(1)} 秒 (${Math.round(totalDuration * 30)} 帧)`);
  console.log('-----------------------------------------------------');
}

console.log('\n=====================================================');
console.log('🎉 全自动流水线执行完毕！');
console.log('👉 本地实时预览: http://localhost:3000/DatabaseAutoEditor');
console.log('👉 一键导出 16:9 高清长视频: npx remotion render DatabaseAutoEditor out/auto-vlog.mp4');
console.log('=====================================================');
