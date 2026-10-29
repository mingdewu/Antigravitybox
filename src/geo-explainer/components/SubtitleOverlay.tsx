import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { CaptionItem } from '../types';

interface SubtitleOverlayProps {
  captions: CaptionItem[];
}

export const SubtitleOverlay: React.FC<SubtitleOverlayProps> = ({ captions }) => {
  const frame = useCurrentFrame();

  const currentCaption = captions.find(
    (c) => frame >= c.startFrame && frame <= c.endFrame
  );

  if (!currentCaption) return null;

  const localFrame = frame - currentCaption.startFrame;
  const duration = currentCaption.endFrame - currentCaption.startFrame;

  // 进退场淡入淡出（前 10 帧进，后 10 帧退）
  const enterOpacity = interpolate(localFrame, [0, 10], [0, 1], {
    extrapolateRight: 'clamp',
  });
  const exitOpacity = interpolate(
    localFrame,
    [duration - 10, duration],
    [1, 0],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );
  const opacity = enterOpacity * exitOpacity;
  const translateY = interpolate(localFrame, [0, 10], [15, 0], {
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 54,
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 40,
        transform: `translateY(${translateY}px)`,
        opacity,
      }}
    >
      <div
        style={{
          background: 'rgba(15, 23, 42, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '14px 32px',
          borderRadius: 30,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
          maxWidth: 900,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: '0.04em',
            color: '#F8FAFC',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.6)',
          }}
        >
          {currentCaption.text}
        </span>
      </div>
    </div>
  );
};
