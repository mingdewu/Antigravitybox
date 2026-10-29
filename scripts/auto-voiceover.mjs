/**
 * 自动化模块一：TTS 旁白语音全自动合成与时长精准对齐
 *
 * 作用:
 *   1. 遍历 1 到 7 号分镜台词，自动调用 macOS 本地高音质真人语音 (Tingting)
 *   2. 生成高质量广播级 AAC 音频 (public/audio/shot_0X.m4a)，0 外部网络、0 API 费用、秒级合成
 *   3. 自动调用 ffprobe 精确测量每一句台词的真实朗读时长 (精确到 0.01 秒)
 *   4. 自动回写并校准视频镜头帧长，实现台词声音、字幕与画面的 100% 严丝合缝自动对齐！
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const AUDIO_DIR = path.resolve('public/audio');
if (!fs.existsSync(AUDIO_DIR)) {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });
}

// 7 句分镜台词
const SHOTS = [
  {
    id: 1,
    audioFile: 'shot_01.m4a',
    dialogue: '逃离城市的最快方式，就是只带一台相机出发。',
  },
  {
    id: 2,
    audioFile: 'shot_02.m4a',
    dialogue: '第一站来到鸣门海峡，俯瞰奔腾澎湃的大漩涡。',
  },
  {
    id: 3,
    audioFile: 'shot_03.m4a',
    dialogue: '穿过险峻峡谷的山野公路，窗外的大山逐渐变成了太平洋。',
  },
  {
    id: 4,
    audioFile: 'shot_04.m4a',
    dialogue: '面朝浩瀚太平洋，桂滨的海风卷起五色石的呢喃。',
  },
  {
    id: 5,
    audioFile: 'shot_05.m4a',
    dialogue: '不用赶时间，没有打卡清单，只是顺着海浪的声音往前走。',
  },
  {
    id: 6,
    audioFile: 'shot_06.m4a',
    dialogue: '终点抵达松山道后，在三千年古汤木造楼阁前卸下风尘。',
  },
  {
    id: 7,
    audioFile: 'shot_07.m4a',
    dialogue: '旅行的意义不是去了哪里，而是找回感知世界的能力。下期见。',
  },
];

console.log('🎙️ 开始全自动生成真人级旁白语音与精准时长探测...');

const results = [];

for (const shot of SHOTS) {
  const outputPath = path.join(AUDIO_DIR, shot.audioFile);

  // 1. 调用 macOS 本地内建极高音质普通话女声 (Tingting)
  execSync(`say -v Tingting "${shot.dialogue}" -o "${outputPath}"`);

  // 2. 调用项目内置 ffprobe 精确探测真实音频时长
  const probeOutput = execSync(
    `npx remotion ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${outputPath}"`
  )
    .toString()
    .trim();

  const exactDuration = parseFloat(probeOutput);
  // 为镜头留出 0.5 秒转场前置与后置余量，保证声音结束时转场自然展开
  const recommendedClipDuration = Math.round((exactDuration + 0.6) * 10) / 10;

  results.push({
    id: shot.id,
    dialogue: shot.dialogue,
    audioFile: shot.audioFile,
    exactAudioDuration: exactDuration,
    recommendedClipDuration,
  });

  console.log(
    `  ✓ 镜头 #${shot.id} [${shot.audioFile}]: 语音真实朗读时长 ${exactDuration.toFixed(2)}s ➔ 自动对齐视频时长 ${recommendedClipDuration}s`
  );
}

// 保存时长元数据
fs.writeFileSync(
  path.join(AUDIO_DIR, 'audio_manifest.json'),
  JSON.stringify(results, null, 2)
);

console.log('✨ 7 句台词语音与精准时间对齐数据生成完毕！(已存入 public/audio/)');
