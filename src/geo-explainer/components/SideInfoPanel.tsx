import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { POIItem, TourConfig } from '../types';

interface SideInfoPanelProps {
  config: TourConfig;
  progress: number;
  coveredKm: number;
  totalKm: number;
  activePoi?: POIItem;
  explanationEmphasis: number; // 0 (移动中半透明) ~ 1 (讲解时放大高亮)
}

export const SideInfoPanel: React.FC<SideInfoPanelProps> = ({
  config,
  progress,
  coveredKm,
  totalKm,
  activePoi,
  explanationEmphasis,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 开场滑入物理动画
  const enterSpring = spring({
    frame,
    fps,
    config: { damping: 14, mass: 0.6, stiffness: 120 },
  });

  const translateX = interpolate(enterSpring, [0, 1], [-380, 0]);
  const baseEnterOpacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // 核心动效：移动中半透明（0.45），讲解景点时变大变亮（1.06放大，0.98高亮）
  const dynamicScale = interpolate(explanationEmphasis, [0, 1], [1.0, 1.06]);
  const dynamicOpacity =
    baseEnterOpacity * interpolate(explanationEmphasis, [0, 1], [0.45, 0.98]);
  const dynamicBlur = interpolate(explanationEmphasis, [0, 1], [8, 20]);
  const dynamicBorderColor = interpolate(
    explanationEmphasis,
    [0, 1],
    [0.1, 0.35]
  );

  const percentage = Math.min(100, Math.round(progress * 100));

  return (
    <div
      style={{
        position: 'absolute',
        top: 48,
        left: 48,
        width: 360,
        transformOrigin: 'top left',
        transform: `translateX(${translateX}px) scale(${dynamicScale})`,
        opacity: dynamicOpacity,
        background: `rgba(15, 23, 42, ${0.55 + explanationEmphasis * 0.35})`,
        backdropFilter: `blur(${dynamicBlur}px)`,
        WebkitBackdropFilter: `blur(${dynamicBlur}px)`,
        border: `1px solid rgba(255, 255, 255, ${dynamicBorderColor})`,
        borderRadius: 20,
        padding: '26px 24px',
        color: '#FFFFFF',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxShadow:
          explanationEmphasis > 0.5
            ? '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 30px rgba(239, 68, 68, 0.25)'
            : '0 15px 30px rgba(0, 0, 0, 0.35)',
        zIndex: 25,
        transition: 'none',
      }}
    >
      {/* 顶部标签 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 10,
        }}
      >
        <span
          style={{
            display: 'inline-block',
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: '#EF4444',
            boxShadow:
              explanationEmphasis > 0.5
                ? '0 0 12px #EF4444'
                : '0 0 4px #EF4444',
          }}
        />
        <span
          style={{
            fontSize: 12,
            letterSpacing: '0.15em',
            fontWeight: 700,
            color: '#94A3B8',
            textTransform: 'uppercase',
          }}
        >
          {config.regionTag}
        </span>
      </div>

      {/* 标题与副标题 */}
      <h1
        style={{
          margin: 0,
          fontSize: 25,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          background: 'linear-gradient(180deg, #FFFFFF 0%, #E2E8F0 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {config.title}
      </h1>
      <p
        style={{
          margin: '4px 0 18px 0',
          fontSize: 13,
          color: '#94A3B8',
          fontWeight: 400,
        }}
      >
        {config.subtitle}
      </p>

      {/* 里程与进度条 */}
      <div
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          borderRadius: 14,
          padding: '14px 16px',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          marginBottom: 18,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 8,
          }}
        >
          <span style={{ fontSize: 13, color: '#94A3B8' }}>已行进里程</span>
          <div>
            <span
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: '#EF4444',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {coveredKm}
            </span>
            <span style={{ fontSize: 13, color: '#64748B', marginLeft: 4 }}>
              / {totalKm} km
            </span>
          </div>
        </div>

        {/* 进度条轨道 */}
        <div
          style={{
            height: 6,
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percentage}%`,
              background: 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)',
              borderRadius: 3,
            }}
          />
        </div>
      </div>

      {/* 途经打卡点进度列表 */}
      <div>
        <div
          style={{
            fontSize: 11,
            color: '#64748B',
            fontWeight: 600,
            letterSpacing: '0.08em',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          ROUTE WAYPOINTS
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {config.pois.map((poi, idx) => {
            const isPassed = frame >= poi.startFrame;
            const isCurrent = activePoi?.id === poi.id;

            return (
              <div
                key={poi.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '6px 8px',
                  borderRadius: 8,
                  background: isCurrent
                    ? 'rgba(239, 68, 68, 0.2)'
                    : 'transparent',
                  border: isCurrent
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid transparent',
                  transition: 'none',
                }}
              >
                <div
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 700,
                    backgroundColor: isPassed
                      ? '#EF4444'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: '#FFFFFF',
                  }}
                >
                  {idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: isCurrent ? 700 : 500,
                      color: isPassed ? '#FFFFFF' : '#64748B',
                    }}
                  >
                    {poi.name}
                  </div>
                </div>
                {isCurrent && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: '#EF4444',
                      background: 'rgba(239, 68, 68, 0.25)',
                      padding: '2px 6px',
                      borderRadius: 4,
                    }}
                  >
                    讲解中
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
