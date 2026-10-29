import React from 'react';
import { Img, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { POIItem } from '../types';

interface PhotoCardProps {
  poi: POIItem;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({ poi }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 若当前帧完全不在该 POI 的活跃区间（前后各留 10 帧做丝滑过渡），则不渲染
  if (frame < poi.startFrame - 10 || frame > poi.endFrame + 10) {
    return null;
  }

  const duration = poi.endFrame - poi.startFrame;
  const localFrame = frame - poi.startFrame;

  // 1. 弹簧进入动效 (Spring)
  const enterSpring = spring({
    frame: localFrame,
    fps,
    config: { damping: 13, mass: 0.5, stiffness: 120 },
  });

  // 讲解时放大突出：基准 scale 1.08，退场时平滑缩小
  const enterScale = interpolate(enterSpring, [0, 1], [0.85, 1.08]);
  const enterTranslateX = interpolate(enterSpring, [0, 1], [80, 0]);
  const enterOpacity = interpolate(enterSpring, [0, 1], [0, 0.98]);

  // 2. 结束讲解前 15 帧开始收小并半透明淡出，交棒给游标行进
  const exitProgress = interpolate(
    localFrame,
    [duration - 16, duration],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const exitTranslateX = interpolate(exitProgress, [0, 1], [0, 40]);
  const exitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const exitScale = interpolate(exitProgress, [0, 1], [1, 0.92]);

  const finalScale = enterScale * exitScale;
  const finalTranslateX = enterTranslateX + exitTranslateX;
  const finalOpacity = enterOpacity * exitOpacity;

  return (
    <div
      style={{
        position: 'absolute',
        top: 56,
        right: 56,
        width: 450,
        transformOrigin: 'top right',
        transform: `translateX(${finalTranslateX}px) scale(${finalScale})`,
        opacity: finalOpacity,
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        borderRadius: 24,
        overflow: 'hidden',
        boxShadow:
          '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(239, 68, 68, 0.2)',
        zIndex: 30,
        color: '#FFFFFF',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* 照片区 / 规范占位卡片 */}
      <div
        style={{
          width: '100%',
          height: 255,
          position: 'relative',
          backgroundColor: '#1E293B',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {poi.photoUrl && !poi.isPlaceholder ? (
          <Img
            src={poi.photoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          /* 占位提示层 */
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px 24px',
              textAlign: 'center',
              background:
                'repeating-linear-gradient(45deg, #1E293B, #1E293B 15px, #0F172A 15px, #0F172A 30px)',
              borderBottom: '1px dashed rgba(239, 68, 68, 0.4)',
            }}
          >
            <div style={{ fontSize: 30, marginBottom: 8 }}>📷</div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#F87171',
                backgroundColor: 'rgba(239, 68, 68, 0.18)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                padding: '4px 10px',
                borderRadius: 6,
                marginBottom: 8,
              }}
            >
              VISUAL ASSET PLACEHOLDER
            </div>
            <div
              style={{
                fontSize: 12,
                color: '#CBD5E1',
                lineHeight: 1.5,
              }}
            >
              {poi.placeholderNotice || '【视觉占位】待提供真实合法授权实拍照片'}
            </div>
          </div>
        )}

        {/* 顶部标签 */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            left: 14,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(8px)',
            padding: '5px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.05em',
            color: '#F87171',
            border: '1px solid rgba(255, 255, 255, 0.15)',
          }}
        >
          {poi.badge}
        </div>
      </div>

      {/* 文本内容区（放大后排版更加舒展通透） */}
      <div style={{ padding: '22px 26px' }}>
        <h2
          style={{
            margin: '0 0 10px 0',
            fontSize: 24,
            fontWeight: 800,
            color: '#FFFFFF',
            letterSpacing: '-0.01em',
          }}
        >
          {poi.name}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: 1.65,
            color: '#CBD5E1',
          }}
        >
          {poi.description}
        </p>
      </div>
    </div>
  );
};
