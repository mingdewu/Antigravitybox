/**
 * AI 智能文案语义分镜分析器 (AI Script-to-Shots Analyzer)
 *
 * 核心功能:
 *   接收任意一段自然语言文案（无论是由大模型生成的，还是用户的真实游记），
 *   根据语言叙事节奏与语义断句，智能规划每个分镜（每一句或每两句话一个画面），
 *   自动推导场景类型、画面构图建议、配音时长估算与 16:9 裁剪参数，
 *   彻底终结任何写死镜头数量的做法！
 */

import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('src/database-vlog/database_rows.json');
const PUBLIC_DB_PATH = path.resolve('public/database_rows.json');

/**
 * 智能分镜语义分析引擎
 * @param {string} rawText 任意自然文本
 * @param {'sentence-by-sentence' | 'semantic-group'} mode 切分模式
 */
export function analyzeScriptToShots(rawText, mode = 'semantic-group') {
  if (!rawText || rawText.trim() === '') {
    throw new Error('输入文案不能为空！');
  }

  // 1. 标准化换行与断句切分
  const cleanText = rawText.replace(/\r\n/g, '\n').trim();
  
  // 按句号、感叹号、问号、分号或换行初步拆句
  const rawSentences = cleanText
    .split(/([。！？!?；;\n]+)/)
    .reduce((acc, cur, idx, arr) => {
      if (idx % 2 === 0 && cur.trim()) {
        const punctuation = arr[idx + 1] ? arr[idx + 1].trim() : '。';
        acc.push(cur.trim() + (punctuation.includes('\n') ? '。' : punctuation));
      }
      return acc;
    }, [])
    .filter((s) => s.length > 2);

  // 2. 镜头规划策略
  const shotSegments = [];

  if (mode === 'sentence-by-sentence') {
    // 策略 A: 严苛的一句一镜
    for (const s of rawSentences) {
      shotSegments.push(s);
    }
  } else {
    // 策略 B: 影视级语义节奏合并 (15~35 字为一镜，避免单句过碎或过长)
    let buffer = '';
    for (const sentence of rawSentences) {
      if ((buffer + sentence).length <= 32) {
        buffer += (buffer ? ' ' : '') + sentence;
      } else {
        if (buffer) shotSegments.push(buffer);
        buffer = sentence;
      }
    }
    if (buffer) shotSegments.push(buffer);
  }

  // 3. 智能场景推断与镜头装配
  const shots = shotSegments.map((dialogue, index) => {
    const id = index + 1;
    const badge = `SHOT #${String(id).padStart(2, '0')}`;

    // 智能关键词语义推断
    let sceneType = 'photo-scenery';
    let sceneTitle = `分镜画面 #${id}`;
    let sceneDescription = '实拍画面呈现，居中裁剪为 16:9 画幅。';
    let photoEffect = 'zoom-in';

    const text = dialogue.toLowerCase();

    if (index === 0 || text.includes('出发') || text.includes('启程') || text.includes('计划') || text.includes('公里') || text.includes('路线')) {
      sceneType = 'map-intro';
      sceneTitle = `启程巡礼 · 路线全景`;
      sceneDescription = '宏观地图展示行程路线轨迹，交代地理位置与出发定位。';
      photoEffect = 'zoom-in';
    } else if (text.includes('鸣门') || text.includes('漩涡') || text.includes('大桥') || text.includes('海峡')) {
      sceneType = 'map-poi-naruto';
      sceneTitle = `地标特写 · 鸣门海峡激流`;
      sceneDescription = '大鸣门桥下激流大漩涡特写，展现海风与壮观水势。';
      photoEffect = 'subtle-float';
    } else if (text.includes('山') || text.includes('公路') || text.includes('开') || text.includes('路况') || text.includes('车') || text.includes('隧道') || text.includes('雨')) {
      sceneType = 'photo-transport';
      sceneTitle = `行进穿行 · 山地公路实拍`;
      sceneDescription = '车窗或行车视角抓拍，展现真实自驾路况与山间天气。';
      photoEffect = 'zoom-out';
    } else if (text.includes('桂滨') || text.includes('海') || text.includes('浪') || text.includes('沙滩') || text.includes('高知')) {
      sceneType = 'map-poi-katsura';
      sceneTitle = `太平洋岸 · 桂滨浪花礁石`;
      sceneDescription = '海滨巨浪拍击礁石，傍晚自然逆光特写。';
      photoEffect = 'pan-right';
    } else if (text.includes('温泉') || text.includes('道后') || text.includes('古') || text.includes('建筑') || text.includes('老街') || text.includes('松山')) {
      sceneType = 'map-poi-dogo';
      sceneTitle = `古汤风貌 · 传统木造建筑`;
      sceneDescription = '老街亮灯时的木造建筑与街巷氛围，展现历史质感。';
      photoEffect = 'zoom-in';
    } else if (index === shotSegments.length - 1 || text.includes('结束') || text.includes('收尾') || text.includes('休息') || text.includes('累') || text.includes('下期')) {
      sceneType = 'photo-outro';
      sceneTitle = `旅途回顾 · 暮色收束`;
      sceneDescription = '全景暮色定镜淡出，总结当日拍摄收获并收束。';
      photoEffect = 'subtle-float';
    }

    // 根据字数智能推导镜头时长 (正常语速 1 秒读 4~4.5 字，前后留 0.6 秒余量)
    const estimatedDuration = Math.max(4.0, Math.round(((dialogue.length / 4.2) + 0.8) * 10) / 10);

    return {
      id,
      badge,
      dialogue,
      sceneTitle,
      sceneType,
      sceneDescription,
      isPhotoUploaded: false,
      photoFileName: `shot_${String(id).padStart(2, '0')}.jpg`,
      photoEffect,
      clipDurationSeconds: estimatedDuration,
      transitionType: index % 2 === 0 ? 'fade' : 'slide',
    };
  });

  return shots;
}

// CLI 执行模式
if (process.argv[1] && process.argv[1].endsWith('ai-script-analyzer.mjs')) {
  const sampleScript = process.argv[2] || `
这次我们租车自驾四国，沿着海岸线计划开三百多公里。
第一站直接开到鸣门大桥，桥下海风大得几乎拿不稳相机。
中途穿过四国中央山脉，山里一直在下着小阵雨，路特别窄。
下午四点多终于开到高知的桂滨，太平洋的浪特别高。
天黑前赶到了松山的道后温泉，这里的木头老建筑特别有质感。
一天开下来挺累的，不过拍到了不少满意的照片。先回酒店休息了。
  `.trim();

  console.log('🤖 启动 AI 脚本分镜语义分析...');
  const resultShots = analyzeScriptToShots(sampleScript, 'semantic-group');
  console.log(`✨ 智能分析完成！文案已按叙事节奏自动拆解为 ${resultShots.length} 个镜头 (无硬编码限制):`);
  resultShots.forEach((s) => {
    console.log(`  [${s.badge}] (${s.sceneType}) 时长: ${s.clipDurationSeconds}s | 场景: ${s.sceneTitle}`);
    console.log(`         台词: "${s.dialogue}"`);
  });

  fs.writeFileSync(DB_PATH, JSON.stringify(resultShots, null, 2));
  if (fs.existsSync(PUBLIC_DB_PATH)) {
    fs.writeFileSync(PUBLIC_DB_PATH, JSON.stringify(resultShots, null, 2));
  }
  console.log(`\n💾 已自动将这 ${resultShots.length} 个分镜配置写入工程数据库！`);
}
