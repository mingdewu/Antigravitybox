/**
 * 自动化模块一：TTS 旁白语音全自动合成与时长精准对齐 (支持任意动态 N 个分镜)
 *
 * 作用:
 *   1. 动态读取数据库分镜表 (database_rows.json)，支持任意数量的分镜行 (1, 2, ... N)
 *   2. 自动调用 macOS 本地高音质真人语音 (Tingting) 合成每句台词
 *   3. 生成高质量广播级 AAC 音频 (public/audio/shot_XX.m4a)，0 外部网络、0 API 费用、秒级合成
 *   4. 自动调用 ffprobe 精确测量每一句台词的真实朗读时长 (精确到 0.01 秒)
 *   5. 自动回写并校准视频镜头帧长，实现台词声音、字幕与画面的 100% 严丝合缝自动对齐！
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AUDIO_DIR = path.resolve('public/audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// 动态读取分镜数据库配置 (解除任何硬编码限制)
const DB_PATH = path.resolve('src/database-vlog/database_rows.json');
const PUBLIC_DB_PATH = path.resolve('public/database_rows.json');

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ 未找到分镜配置文件: ${DB_PATH}`);
  process.exit(1);
}

const rows = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
console.log(`🎙️ 开始全自动生成真人级旁白语音与精准时长探测 (共 ${rows.length} 个分镜)...`);

const results = [];

for (const shot of rows) {
  const audioFile = shot.audioFileName || `shot_${String(shot.id).padStart(2, '0')}.m4a`;
  const outputPath = path.join(AUDIO_DIR, audioFile);

  if (!shot.dialogue || shot.dialogue.trim() === '') {
    console.log(`  ⏩ 分镜 #${shot.id} 没有台词，跳过语音合成`);
    continue;
  }

  // 1. 调用 macOS 本地内建普通话真人女声 (Tingting)
  try {
    // 过滤掉可能导致 shell 逃逸的特殊引号
    const safeDialogue = shot.dialogue.replace(/"/g, '\\"');
    execSync(`say -v Tingting "${safeDialogue}" -o "${outputPath}"`);
  } catch (err) {
    console.warn(`  ⚠️ 分镜 #${shot.id} 语音合成警告: ${err.message}`);
  }

  // 2. 调用项目内置 ffprobe 精确探测真实音频时长
  let exactDuration = shot.clipDurationSeconds || 5.0;
  if (fs.existsSync(outputPath)) {
    try {
      const probeOutput = execSync(
        `npx remotion ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`
      )
        .toString()
        .trim();
      const parsed = parseFloat(probeOutput);
      if (!isNaN(parsed) && parsed > 0) {
        exactDuration = parsed;
      }
    } catch {
      // 保持原有估计
    }
  }

  // 为镜头留出 0.6 秒转场前置与后置余量，保证声音结束时转场自然展开
  const recommendedClipDuration = Math.round((exactDuration + 0.6) * 10) / 10;
  shot.clipDurationSeconds = recommendedClipDuration;

  results.push({
    id: shot.id,
    dialogue: shot.dialogue,
    audioFile,
    exactAudioDuration: exactDuration,
    recommendedClipDuration,
  });

  console.log(
    `  ✓ 分镜 #${shot.id} [${audioFile}]: 语音真实朗读时长 ${exactDuration.toFixed(2)}s ➔ 自动对齐视频时长 ${recommendedClipDuration}s`
  );
}

// 保存时长元数据
fs.writeFileSync(
  path.join(AUDIO_DIR, 'audio_manifest.json'),
  JSON.stringify(results, null, 2)
);

// 回写更新 database_rows.json
fs.writeFileSync(DB_PATH, JSON.stringify(rows, null, 2));
if (fs.existsSync(PUBLIC_DB_PATH)) {
  fs.writeFileSync(PUBLIC_DB_PATH, JSON.stringify(rows, null, 2));
}

console.log(`✨ 全部 ${rows.length} 个分镜的语音与精准时间对齐数据生成完毕！(已同步至 database_rows.json)`);
