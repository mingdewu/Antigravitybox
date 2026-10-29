import React from 'react';
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
  Sequence,
} from 'remotion';

// 场景 1：标题弹入
const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 11, mass: 0.5, stiffness: 140 },
  });

  const scale = interpolate(enterSpring, [0, 1], [0.4, 1]);
  const opacity = interpolate(frame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });

  const exitOpacity = interpolate(frame, [48, 58], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const exitScale = interpolate(frame, [48, 58], [1, 1.15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
        opacity: exitOpacity,
        transform: `scale(${exitScale})`,
      }}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          opacity,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            color: '#38bdf8',
            letterSpacing: 4,
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          Introducing
        </div>
        <h1
          style={{
            fontSize: 96,
            fontWeight: 900,
            margin: 0,
            background: 'linear-gradient(135deg, #ffffff 40%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: -2,
            textShadow: '0 0 50px rgba(6,182,212,0.4)',
          }}
        >
          NovaFlow
        </h1>
        <p
          style={{
            fontSize: 32,
            color: '#94a3b8',
            marginTop: 18,
            fontWeight: 500,
          }}
        >
          下一代轻量化视频工作流
        </p>
      </div>
    </AbsoluteFill>
  );
};

// 场景 2：3-2-1 倒计时与 Launch
const CountdownAndLaunchScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isCountingDown = frame < 60;
  const stepIndex = Math.min(2, Math.floor(frame / 20));
  const currentNumber = 3 - stepIndex;
  const stepFrame = frame % 20;

  const numSpring = spring({
    frame: stepFrame,
    fps,
    config: { damping: 9, mass: 0.4, stiffness: 160 },
  });
  const numScale = interpolate(numSpring, [0, 1], [0.3, 1.25]);
  const numOpacity = interpolate(stepFrame, [0, 4, 15, 19], [0, 1, 1, 0], {
    extrapolateRight: 'clamp',
  });

  const circleOffset = interpolate(frame, [0, 60], [565, 0], {
    extrapolateRight: 'clamp',
  });

  const ctaSpring = spring({
    frame: frame - 60,
    fps,
    config: { damping: 10, mass: 0.6, stiffness: 120 },
  });
  const ctaScale = interpolate(ctaSpring, [0, 1], [0.5, 1]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isCountingDown ? (
        <div
          style={{
            position: 'relative',
            width: 240,
            height: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              width: 180,
              height: 180,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)',
            }}
          />

          <svg
            width="240"
            height="240"
            style={{ position: 'absolute', transform: 'rotate(-90deg)' }}
          >
            <circle
              cx="120"
              cy="120"
              r="90"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="12"
              fill="none"
            />
            <circle
              cx="120"
              cy="120"
              r="90"
              stroke="#0ea5e9"
              strokeWidth="12"
              fill="none"
              strokeDasharray="565"
              strokeDashoffset={circleOffset}
              strokeLinecap="round"
            />
          </svg>

          <span
            style={{
              fontSize: 110,
              fontWeight: 900,
              color: '#ffffff',
              transform: `scale(${numScale})`,
              opacity: numOpacity,
              textShadow: '0 0 40px rgba(56,189,248,0.8)',
            }}
          >
            {currentNumber}
          </span>
        </div>
      ) : (
        <div
          style={{
            transform: `scale(${ctaScale})`,
            opacity: ctaSpring,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: '#f8fafc',
              marginBottom: 24,
              letterSpacing: -1,
            }}
          >
            🚀 正式发布 · 即刻可用
          </div>
          <div
            style={{
              display: 'inline-block',
              padding: '20px 60px',
              fontSize: 34,
              fontWeight: 800,
              color: '#020617',
              background: 'linear-gradient(90deg, #38bdf8, #818cf8)',
              borderRadius: 999,
              boxShadow: '0 0 60px rgba(56, 189, 248, 0.6)',
            }}
          >
            立即探索 novaflow.dev
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const ProductIntro5s: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#050814',
        color: '#ffffff',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <Sequence from={0} durationInFrames={60}>
        <TitleScene />
      </Sequence>

      <Sequence from={60} durationInFrames={90}>
        <CountdownAndLaunchScene />
      </Sequence>
    </AbsoluteFill>
  );
};