import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';

export interface ShotMetadata {
  /** 镜头唯一编号与对应文件名，如 "shot_01_train_window.mp4" */
  fileName: string;
  /** 所属阶段，如 "Stage 1: 启程" */
  stage: string;
  /** 拍摄地点/位置 */
  location: string;
  /** 拍摄画面内容描述 */
  subject: string;
  /** 景别与角度：如 "特写 / 低角度仰拍 / 第一人称 POV" */
  angle: string;
  /** 运镜动静：如 "固定机位 / 缓慢向前推镜 / 向右摇镜 (Pan)" */
  movement: string;
  /** 台词或旁白文案 */
  voiceover: string;
  /** 是否已经放入真实实拍视频（false 时显示导演预演分镜板，true 时加载真实 mp4） */
  isUploaded?: boolean;
  /** 截取原视频的起始帧 */
  startFrom?: number;
}

export const ShotClip: React.FC<ShotMetadata> = ({
  fileName,
  stage,
  location,
  subject,
  angle,
  movement,
  voiceover,
  isUploaded = false,
  startFrom = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // 字幕弹入动效
  const captionSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const captionY = interpolate(captionSpring, [0, 1], [30, 0]);

  // 模拟运镜效果（在预演模式下直观感受动静）
  const isPushIn = movement.includes('推') || movement.includes('前');
  const isPanRight = movement.includes('右');
  const previewScale = isPushIn
    ? interpolate(frame, [0, durationInFrames], [1, 1.12])
    : 1.04;
  const previewTranslateX = isPanRight
    ? interpolate(frame, [0, durationInFrames], [-20, 20])
    : 0;

  // 当前镜头倒计时进度条
  const progressPercent = interpolate(
    frame,
    [0, durationInFrames],
    [0, 100],
    { extrapolateRight: 'clamp' }
  );

  const durationSec = (durationInFrames / fps).toFixed(1);

  return (
    <AbsoluteFill style={{ backgroundColor: '#090d16', overflow: 'hidden' }}>
      {isUploaded ? (
        /* 实拍模式：直接加载 public/shots/ 下的真实视频 */
        <Video
          src={staticFile(`shots/${fileName}`)}
          startFrom={startFrom}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      ) : (
        /* 导演预演模式（Pre-Viz）：未导入实拍视频时，显示可视化场记板与运镜模拟 */
        <AbsoluteFill
          style={{
            transform: `scale(${previewScale}) translateX(${previewTranslateX}px)`,
            background:
              'radial-gradient(circle at 50% 40%, #1e293b 0%, #090d16 80%)',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px dashed rgba(56, 189, 248, 0.3)',
          }}
        >
          {/* 取景框十字准星与安全框 */}
          <div
            style={{
              position: 'absolute',
              inset: 60,
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 16,
              pointerEvents: 'none',
            }}
          />

          {/* 场记板核心信息卡片 */}
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(56, 189, 248, 0.4)',
              borderRadius: 24,
              padding: '36px 48px',
              maxWidth: 960,
              width: '80%',
              boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                paddingBottom: 16,
              }}
            >
              <span
                style={{
                  background: '#0284c7',
                  color: '#fff',
                  padding: '6px 16px',
                  borderRadius: 8,
                  fontSize: 22,
                  fontWeight: 700,
                }}
              >
                🎬 待实拍素材: public/shots/{fileName}
              </span>
              <span style={{ color: '#94a3b8', fontSize: 22, fontWeight: 600 }}>
                {stage} · 剪辑时长 {durationSec}s ({durationInFrames}帧)
              </span>
            </div>

            <h2
              style={{
                fontSize: 42,
                color: '#f8fafc',
                margin: '0 0 24px 0',
                fontWeight: 800,
              }}
            >
              📷 画面：{subject}
            </h2>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: 16,
              }}
            >
              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '16px 20px',
                  borderRadius: 12,
                }}
              >
                <div style={{ color: '#38bdf8', fontSize: 18, marginBottom: 6 }}>
                  📍 拍摄地点
                </div>
                <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>
                  {location}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '16px 20px',
                  borderRadius: 12,
                }}
              >
                <div style={{ color: '#38bdf8', fontSize: 18, marginBottom: 6 }}>
                  📐 角度与景别
                </div>
                <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>
                  {angle}
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  padding: '16px 20px',
                  borderRadius: 12,
                }}
              >
                <div style={{ color: '#38bdf8', fontSize: 18, marginBottom: 6 }}>
                  🎥 运镜与动静
                </div>
                <div style={{ color: '#fff', fontSize: 24, fontWeight: 700 }}>
                  {movement}
                </div>
              </div>
            </div>
          </div>

          {/* 顶部镜头时长进度条 */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: 6,
              width: `${progressPercent}%`,
              background: '#38bdf8',
            }}
          />
        </AbsoluteFill>
      )}

      {/* 底部 Vlog 字幕层（预演和实拍通用） */}
      {voiceover && (
        <AbsoluteFill
          style={{
            justifyContent: 'flex-end',
            alignItems: 'center',
            paddingBottom: 64,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              transform: `translateY(${captionY}px)`,
              opacity: captionSpring,
              background: 'rgba(0, 0, 0, 0.65)',
              backdropFilter: 'blur(8px)',
              padding: '14px 36px',
              borderRadius: 999,
              color: '#ffffff',
              fontSize: 32,
              fontWeight: 600,
              letterSpacing: 1,
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            “ {voiceover} ”
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
