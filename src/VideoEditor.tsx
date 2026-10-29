import React from 'react';
import {
  AbsoluteFill,
  Audio,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
  Video,
} from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { slide } from '@remotion/transitions/slide';
import { fade } from '@remotion/transitions/fade';

// 总帧数：9 秒 * 30 FPS = 270 帧
export const TOTAL_FRAMES = 270;

// ==================== 片段 1：实拍展示 + 标题弹入 (90 帧) ====================
const SceneIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 标题弹入物理效果
  const titleSpring = spring({
    frame: frame - 5,
    fps,
    config: { damping: 12, mass: 0.6, stiffness: 120 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0.6, 1]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      {/* 视频：从第 0 帧开始截取 */}
      <Video
        src={staticFile('intro.mp4')}
        startFrom={0}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* 半透明暗黑渐变遮罩 */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(circle at center, rgba(3,7,18,0.4) 0%, rgba(3,7,18,0.85) 100%)',
        }}
      />

      {/* 标题弹入浮层 */}
      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          transform: `scale(${titleScale})`,
          opacity: titleOpacity,
        }}
      >
        <span
          style={{
            fontSize: 26,
            color: '#38bdf8',
            letterSpacing: 4,
            fontWeight: 700,
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Product Showcase
        </span>
        <h1
          style={{
            fontSize: 84,
            fontWeight: 900,
            color: '#ffffff',
            margin: 0,
            textShadow: '0 0 40px rgba(56,189,248,0.6)',
          }}
        >
          全新旗舰 · 重磅登场
        </h1>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ==================== 片段 2：使用场景 + 打字机字幕 (120 帧) ====================
const SceneProduct: React.FC = () => {
  const frame = useCurrentFrame();

  const fullText = '真实业务场景覆盖 · 效率提升 300%';
  // 第 10~55 帧逐字显示（打字机效果）
  const charCount = Math.floor(
    interpolate(frame, [10, 55], [0, fullText.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })
  );
  const currentText = fullText.slice(0, charCount);

  // 闪烁光标（每 8 帧闪一次）
  const cursorBlink = Math.floor(frame / 8) % 2 === 0;

  return (
    <AbsoluteFill>
      <Video
        src={staticFile('product.mp4')}
        startFrom={0}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />

      {/* 底部微暗遮罩，衬托字幕 */}
      <AbsoluteFill
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)',
        }}
      />

      {/* 右下角打字机字幕卡片 */}
      <div
        style={{
          position: 'absolute',
          right: 60,
          bottom: 60,
          padding: '18px 32px',
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(12px)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          color: '#ffffff',
          fontSize: 28,
          fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <span>{currentText}</span>
        <span
          style={{
            color: '#38bdf8',
            opacity: cursorBlink ? 1 : 0,
            marginLeft: 4,
          }}
        >
          |
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ==================== 片段 3：画面收缩卡片 + 倒计时 + CTA (90 帧) ====================
const SceneOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. 视频卡片收缩动画（第 0~25 帧由 100% 缩至 45% 卡片大小）
  const shrinkSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const cardScale = interpolate(shrinkSpring, [0, 1], [1, 0.45]);
  const cardTranslateY = interpolate(shrinkSpring, [0, 1], [0, -140]);
  const cardBorderRadius = interpolate(shrinkSpring, [0, 1], [0, 32]);

  // 2. 倒计时（0~45 帧，每 15 帧一跳：3、2、1）
  const isCountdown = frame < 45;
  const countdownStep = Math.min(2, Math.floor(frame / 15));
  const countNumber = 3 - countdownStep;
  const stepFrame = frame % 15;

  const numSpring = spring({
    frame: stepFrame,
    fps,
    config: { damping: 10, mass: 0.4 },
  });
  const numScale = interpolate(numSpring, [0, 1], [0.4, 1.2]);
  const numOpacity = interpolate(stepFrame, [0, 3, 11, 14], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  // 3. 最终 CTA 按钮（第 45 帧后炸裂弹出）
  const ctaSpring = spring({
    frame: frame - 45,
    fps,
    config: { damping: 11, stiffness: 120 },
  });

  return (
    <AbsoluteFill style={{ backgroundColor: '#020617' }}>
      {/* 模糊背景：复用原视频加高斯模糊 */}
      <Video
        src={staticFile('product.mp4')}
        startFrom={60}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'blur(35px) brightness(0.35)',
        }}
      />

      {/* 浮动收缩的视频小卡片 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transform: `translateY(${cardTranslateY}px) scale(${cardScale})`,
            borderRadius: cardBorderRadius,
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8)',
            border: '2px solid rgba(255,255,255,0.2)',
          }}
        >
          <Video
            src={staticFile('product.mp4')}
            startFrom={60}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* 底部交互区：倒计时 或 购买按钮 */}
      <AbsoluteFill
        style={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          paddingBottom: 110,
        }}
      >
        {isCountdown ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: 24,
                color: '#38bdf8',
                letterSpacing: 4,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              特惠抢购倒计时
            </span>
            <span
              style={{
                fontSize: 88,
                fontWeight: 900,
                color: '#ffffff',
                transform: `scale(${numScale})`,
                opacity: numOpacity,
                textShadow: '0 0 35px rgba(56,189,248,0.8)',
              }}
            >
              {countNumber}
            </span>
          </div>
        ) : (
          <div
            style={{
              transform: `scale(${ctaSpring})`,
              opacity: ctaSpring,
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-block',
                padding: '24px 72px',
                fontSize: 36,
                fontWeight: 800,
                color: '#020617',
                background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
                borderRadius: 999,
                boxShadow: '0 0 50px rgba(56, 189, 248, 0.6)',
                cursor: 'pointer',
              }}
            >
              🛒 立即购买 · 限时 5 折
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ==================== 主合成器入口 ====================
export const VideoEditor: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* 背景音乐：与视频长度严格对齐，末尾 15 帧平滑淡出 */}
      <Audio
        src={staticFile('bgm.mp3')}
        volume={(f) =>
          interpolate(f, [TOTAL_FRAMES - 15, TOTAL_FRAMES], [1, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          })
        }
      />

      {/* 视频轨道序列与转场拼接 */}
      <TransitionSeries>
        {/* 片段 1: 实拍 + 标题 (90 帧) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <SceneIntro />
        </TransitionSeries.Sequence>

        {/* 转场 1: 右滑转场 (15 帧) */}
        <TransitionSeries.Transition
          presentation={slide({ direction: 'from-right' })}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* 片段 2: 场景 + 打字机字幕 (120 帧) */}
        <TransitionSeries.Sequence durationInFrames={120}>
          <SceneProduct />
        </TransitionSeries.Sequence>

        {/* 转场 2: 平滑淡入 (15 帧) */}
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: 15 })}
        />

        {/* 片段 3: 卡片收缩 + 倒计时 + CTA (90 帧) */}
        <TransitionSeries.Sequence durationInFrames={90}>
          <SceneOutro />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
