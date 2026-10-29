import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';
import { FujiShotItem, FujiStageConfig } from './types';
import { FUJI_STAGES_DATA, getStageFrames } from './stagesData';

/**
 * 将长段旁白文案按句号/感叹号拆分为分句数组，用于底部电影字幕按时间轴逐句轮播
 */
const splitVoiceoverIntoSentences = (text: string): string[] => {
  if (!text) return [];
  return text
    .split(/(?<=[。！？；])/)
    .map((s) => s.trim())
    .filter(Boolean);
};

// ============================================================================
// 单个镜头组件：支持【导演预演场记板 (Pre-Viz)】与【实拍高清视频】无缝切换
// ============================================================================
export const FujiShotClip: React.FC<{
  shot: FujiShotItem;
  stageTitle: string;
}> = ({ shot, stageTitle }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 首尾平滑淡入淡出过渡
  const fadeOpacity = interpolate(
    frame,
    [0, 12, durationInFrames - 12, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // 将当前镜头的饱满叙事文案拆分为逐句字幕
  const sentences = splitVoiceoverIntoSentences(shot.voiceover);
  const sentenceCount = Math.max(1, sentences.length);
  const framesPerSentence = durationInFrames / sentenceCount;
  const currentSentenceIndex = Math.min(
    sentenceCount - 1,
    Math.floor(frame / framesPerSentence)
  );
  const currentSentence = sentences[currentSentenceIndex] || '';
  const sentenceLocalFrame = frame - currentSentenceIndex * framesPerSentence;

  // 每句字幕切换时的轻盈弹入动画
  const captionSpring = spring({
    frame: sentenceLocalFrame,
    fps,
    config: { damping: 16, stiffness: 120 },
  });
  const captionY = interpolate(captionSpring, [0, 1], [18, 0]);

  // 根据运镜描述模拟预演画面的动态推拉摇移
  const isPushIn =
    shot.movement.includes('推') ||
    shot.movement.includes('前') ||
    shot.movement.includes('进');
  const isPanRight = shot.movement.includes('右');
  const isPanLeft = shot.movement.includes('左');

  const simScale = isPushIn
    ? interpolate(frame, [0, durationInFrames], [1.0, 1.1])
    : 1.03;
  const simX = isPanRight
    ? interpolate(frame, [0, durationInFrames], [-18, 18])
    : isPanLeft
      ? interpolate(frame, [0, durationInFrames], [18, -18])
      : 0;

  // 镜头顶部进度条
  const progressPct = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050811',
        opacity: fadeOpacity,
        overflow: 'hidden',
      }}
    >
      {shot.isUploaded ? (
        /* 实拍模式：直接加载 public/fuji/ 目录下的真实视频文件 */
        <Video
          src={staticFile(`fuji/${shot.fileName}`)}
          startFrom={shot.startFrom || 0}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        /* 导演预演模式（Pre-Viz）：可视化取景器与实拍通告参数 */
        <AbsoluteFill
          style={{
            transform: `scale(${simScale}) translateX(${simX}px)`,
            background:
              'radial-gradient(circle at 50% 35%, #172554 0%, #090d16 75%)',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: 60,
          }}
        >
          {/* 相机取景器安全框 */}
          <div
            style={{
              position: 'absolute',
              inset: 48,
              border: '1px solid rgba(148, 163, 184, 0.16)',
              borderRadius: 12,
              pointerEvents: 'none',
            }}
          />

          {/* 场记板主信息面板 */}
          <div
            style={{
              width: '84%',
              maxWidth: 1240,
              background: 'rgba(15, 23, 42, 0.9)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              borderRadius: 24,
              padding: '30px 44px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.65)',
            }}
          >
            {/* 顶部标签栏：镜头号 + 文件名 + 时间窗口 */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 14,
                marginBottom: 18,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span
                  style={{
                    background: '#38bdf8',
                    color: '#020617',
                    fontWeight: 900,
                    fontSize: 20,
                    padding: '5px 14px',
                    borderRadius: 8,
                  }}
                >
                  镜头 {shot.id}
                </span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: '#e2e8f0',
                    fontSize: 18,
                    padding: '5px 12px',
                    borderRadius: 8,
                    fontFamily: 'monospace',
                  }}
                >
                  📁 public/fuji/{shot.fileName}
                </span>
              </div>

              <div style={{ color: '#7dd3fc', fontSize: 19, fontWeight: 600 }}>
                🕒 {shot.timeWindow} ｜ {stageTitle}
              </div>
            </div>

            {/* 核心拍摄画面内容 */}
            <h2
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 18px 0',
                lineHeight: 1.35,
              }}
            >
              🎬 拍摄内容：{shot.subject}
            </h2>

            {/* 模块1：该镜头完整配音台本预览框 */}
            <div
              style={{
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.25)',
                borderRadius: 14,
                padding: '14px 20px',
                marginBottom: 18,
              }}
            >
              <div
                style={{
                  color: '#38bdf8',
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                📜 【模块1 · 完整配音文案】（共 {sentences.length} 句，底部字幕正播放第{' '}
                {currentSentenceIndex + 1}/{sentences.length} 句）
              </div>
              <div
                style={{
                  color: '#e2e8f0',
                  fontSize: 19,
                  lineHeight: 1.55,
                }}
              >
                {shot.voiceover}
              </div>
            </div>

            {/* 五维实拍参数网格 */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.1fr 1.1fr 1.3fr',
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 18px',
                  borderRadius: 12,
                  borderLeft: '4px solid #38bdf8',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: 15, marginBottom: 4 }}>
                  📍 拍摄位置地点
                </div>
                <div style={{ color: '#f8fafc', fontSize: 19, fontWeight: 700 }}>
                  {shot.location}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 18px',
                  borderRadius: 12,
                  borderLeft: '4px solid #818cf8',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: 15, marginBottom: 4 }}>
                  📷 器材与焦段
                </div>
                <div style={{ color: '#f8fafc', fontSize: 19, fontWeight: 700 }}>
                  {shot.gear}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 18px',
                  borderRadius: 12,
                  borderLeft: '4px solid #34d399',
                }}
              >
                <div style={{ color: '#94a3b8', fontSize: 15, marginBottom: 4 }}>
                  ⏱️ 时长要求（含转场余量）
                </div>
                <div style={{ color: '#34d399', fontSize: 19, fontWeight: 800 }}>
                  剪辑用 {shot.durationSec}s ／ 建议实拍 {shot.recommendedShootSec}s
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 14,
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 18px',
                  borderRadius: 12,
                }}
              >
                <div style={{ color: '#38bdf8', fontSize: 15, marginBottom: 4 }}>
                  📐 手法与角度 (Angle & Framing)
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600 }}>
                  {shot.angle}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  padding: '12px 18px',
                  borderRadius: 12,
                }}
              >
                <div style={{ color: '#38bdf8', fontSize: 15, marginBottom: 4 }}>
                  🎥 动静与运镜 (Camera Movement)
                </div>
                <div style={{ color: '#f1f5f9', fontSize: 18, fontWeight: 600 }}>
                  {shot.movement}
                </div>
              </div>
            </div>
          </div>

          {/* 顶部镜头实时进度条 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 6,
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
            }}
          />
        </AbsoluteFill>
      )}

      {/* 底部电影感逐句轮播旁白字幕层 */}
      {currentSentence && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 46,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              transform: `translateY(${captionY}px)`,
              opacity: captionSpring,
              background: 'rgba(2, 6, 23, 0.85)',
              backdropFilter: 'blur(12px)',
              padding: '14px 38px',
              borderRadius: 999,
              border: '1px solid rgba(56, 189, 248, 0.3)',
              color: '#f8fafc',
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: 1.2,
              maxWidth: '82%',
              textAlign: 'center',
              boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
            }}
          >
            {currentSentence}
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

// ============================================================================
// 章节开场标题浮层（每个 Stage 前 4 秒 / 120 帧自动浮现）
// ============================================================================
const StageChapterBanner: React.FC<{ stage: FujiStageConfig }> = ({ stage }) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(frame, [0, 20, 95, 120], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: '64px 76px',
        opacity,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(12px)',
          borderLeft: '5px solid #38bdf8',
          padding: '16px 28px',
          borderRadius: '0 16px 16px 0',
        }}
      >
        <div
          style={{
            color: '#38bdf8',
            fontSize: 17,
            fontWeight: 800,
            letterSpacing: 4,
          }}
        >
          {stage.stageNumber} · {stage.timeRange}
        </div>
        <div
          style={{
            color: '#ffffff',
            fontSize: 34,
            fontWeight: 900,
            marginTop: 4,
          }}
        >
          {stage.titleCn}
        </div>
        <div style={{ color: '#94a3b8', fontSize: 15, marginTop: 4 }}>
          🎵 {stage.bgmMood}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ============================================================================
// 单个 Stage 独立渲染组件（支持分章节单独预览与导出）
// ============================================================================
export const FujiStagePlayer: React.FC<{ stage: FujiStageConfig }> = ({
  stage,
}) => {
  const { fps } = useVideoConfig();
  let accumulatedFrames = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050811' }}>
      {stage.shots.map((shot) => {
        const shotFrames = Math.round(shot.durationSec * fps);
        const fromFrame = accumulatedFrames;
        accumulatedFrames += shotFrames;

        return (
          <Sequence
            key={shot.id}
            from={fromFrame}
            durationInFrames={shotFrames}
            name={`${shot.id}: ${shot.location}`}
          >
            <FujiShotClip shot={shot} stageTitle={stage.titleCn} />
          </Sequence>
        );
      })}

      {/* 章节左上角电影感铭牌 */}
      <Sequence from={0} durationInFrames={120} name="Chapter Title Banner">
        <StageChapterBanner stage={stage} />
      </Sequence>
    </AbsoluteFill>
  );
};

// ============================================================================
// 20 分钟（36,000 帧）全片总合成引擎
// ============================================================================
export const FujiTour20Min: React.FC = () => {
  const { fps } = useVideoConfig();
  let stageStartFrame = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#050811' }}>
      {FUJI_STAGES_DATA.map((stage) => {
        const stageDuration = getStageFrames(stage, fps);
        const from = stageStartFrame;
        stageStartFrame += stageDuration;

        return (
          <Sequence
            key={stage.stageId}
            from={from}
            durationInFrames={stageDuration}
            name={`${stage.stageNumber} - ${stage.titleCn}`}
          >
            <FujiStagePlayer stage={stage} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
