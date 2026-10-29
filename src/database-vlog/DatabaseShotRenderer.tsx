import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { DatabaseRowItem } from './types';
import { MapBackground2D } from '../geo-explainer/components/MapBackground2D';
import { PhotoCard } from '../geo-explainer/components/PhotoCard';
import { SideInfoPanel } from '../geo-explainer/components/SideInfoPanel';
import { SHIKOKU_DEMO_TOUR } from '../geo-explainer/config/demoTourData';

interface DatabaseShotRendererProps {
  row: DatabaseRowItem;
}

export const DatabaseShotRenderer: React.FC<DatabaseShotRendererProps> = ({ row }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = Math.round(row.clipDurationSeconds * fps);

  // 台词字幕弹簧弹入动效 (Spring)
  const subtitleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);
  const subtitleTranslateY = interpolate(subtitleSpring, [0, 1], [15, 0]);

  // ==================== 模式 A：已上传图片 ➔ 16:9 智能剪裁与电影推镜 ====================
  if (row.isPhotoUploaded) {
    // 根据所选效果计算平缓流畅的 Ken Burns 电影级微动效 (16:9 动态视差)
    let scale = 1.0;
    let translateX = 0;
    let translateY = 0;

    if (row.photoEffect === 'zoom-in') {
      // 缓慢推镜放大 (1.0 -> 1.08)
      scale = interpolate(frame, [0, totalFrames], [1.0, 1.08], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (row.photoEffect === 'zoom-out') {
      // 缓慢拉镜缩小 (1.08 -> 1.0)
      scale = interpolate(frame, [0, totalFrames], [1.08, 1.0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else if (row.photoEffect === 'pan-right') {
      // 缓慢向右横移
      scale = 1.06;
      translateX = interpolate(frame, [0, totalFrames], [-20, 20], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
    } else {
      // 微弱呼吸浮动
      scale = interpolate(
        Math.sin((frame / totalFrames) * Math.PI),
        [0, 1],
        [1.02, 1.06]
      );
    }

    return (
      <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
        {/* 底层模糊防黑边（防异形构图照片漏边） */}
        <div
          style={{
            position: 'absolute',
            inset: -20,
            backgroundImage: `url(${staticFile(`photos/${row.photoFileName}`)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(30px) brightness(0.4)',
            transform: 'scale(1.1)',
          }}
        />

        {/* 核心层：16:9 等比智能填充裁剪 (Cover) + Ken Burns 微动效 */}
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Img
            src={staticFile(`photos/${row.photoFileName}`)}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
              transformOrigin: 'center center',
            }}
          />
        </div>

        {/* 电影级四周通透渐变暗角 */}
        <AbsoluteFill
          style={{
            boxShadow: 'inset 0 0 120px rgba(0, 0, 0, 0.65)',
            pointerEvents: 'none',
          }}
        />

        {/* 左上角分镜徽标 */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            left: 48,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#38BDF8',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.1em',
          }}
        >
          {row.badge} · {row.sceneTitle} (16:9 实拍图)
        </div>

        {/* 底部对齐台词字幕 */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY}px)`,
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px)',
              padding: '14px 36px',
              borderRadius: 30,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              maxWidth: 900,
              textAlign: 'center',
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textShadow: '0 2px 6px rgba(0,0,0,0.8)',
            }}
          >
            {row.dialogue}
          </div>
        </div>

        {/* 自动真人语音旁白 */}
        <Audio src={staticFile(`audio/shot_0${row.id}.m4a`)} volume={1.0} />
      </AbsoluteFill>
    );
  }

  // ==================== 模式 B：未上传图片 ➔ 智能地图或 16:9 骨架屏预演 ====================
  const isMapScene = row.sceneType.startsWith('map-');

  if (isMapScene) {
    let activePoiIndex = 0;
    let progress = 0;
    if (row.sceneType === 'map-poi-naruto') {
      activePoiIndex = 0;
      progress = 0.0;
    } else if (row.sceneType === 'map-poi-katsura') {
      activePoiIndex = 1;
      progress = 0.597;
    } else if (row.sceneType === 'map-poi-dogo') {
      activePoiIndex = 2;
      progress = 1.0;
    }

    const currentPoi = SHIKOKU_DEMO_TOUR.pois[activePoiIndex];

    return (
      <AbsoluteFill style={{ backgroundColor: '#070D18', overflow: 'hidden' }}>
        <MapBackground2D
          initialView={SHIKOKU_DEMO_TOUR.mapInitialView}
          route={SHIKOKU_DEMO_TOUR.route}
          progress={progress}
          pois={SHIKOKU_DEMO_TOUR.pois}
        />

        <SideInfoPanel
          config={SHIKOKU_DEMO_TOUR}
          progress={progress}
          coveredKm={Number((317.7 * progress).toFixed(1))}
          totalKm={317.7}
          activePoi={currentPoi}
          explanationEmphasis={1.0}
        />

        {currentPoi && <PhotoCard poi={{ ...currentPoi, startFrame: 0, endFrame: 9999 }} />}

        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            opacity: subtitleOpacity,
            transform: `translateY(${subtitleTranslateY}px)`,
            zIndex: 40,
          }}
        >
          <div
            style={{
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(16px)',
              padding: '14px 36px',
              borderRadius: 30,
              border: '1px solid rgba(255, 255, 255, 0.15)',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
              maxWidth: 900,
              textAlign: 'center',
              color: '#FFFFFF',
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: '0.04em',
            }}
          >
            {row.dialogue}
          </div>
        </div>

        {/* 自动真人语音旁白 */}
        <Audio src={staticFile(`audio/shot_0${row.id}.m4a`)} volume={1.0} />
      </AbsoluteFill>
    );
  }

  // 待上传实拍照片的 16:9 导演监视器预览
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#0F172A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#FFFFFF',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* 16:9 电影监视器网格 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* 16:9 画幅四角安全框 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          width: 30,
          height: 30,
          borderTop: '2px solid rgba(56, 189, 248, 0.6)',
          borderLeft: '2px solid rgba(56, 189, 248, 0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 60,
          width: 30,
          height: 30,
          borderTop: '2px solid rgba(56, 189, 248, 0.6)',
          borderRight: '2px solid rgba(56, 189, 248, 0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 60,
          width: 30,
          height: 30,
          borderBottom: '2px solid rgba(56, 189, 248, 0.6)',
          borderLeft: '2px solid rgba(56, 189, 248, 0.6)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 60,
          width: 30,
          height: 30,
          borderBottom: '2px solid rgba(56, 189, 248, 0.6)',
          borderRight: '2px solid rgba(56, 189, 248, 0.6)',
        }}
      />

      {/* 中心拍摄指引面板 */}
      <div
        style={{
          zIndex: 10,
          textAlign: 'center',
          maxWidth: 720,
          padding: '30px 40px',
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          borderRadius: 24,
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            backgroundColor: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.4)',
            color: '#38BDF8',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}
        >
          {row.badge} · 待上传实拍图片 (16:9 长视频)
        </div>

        <h2 style={{ margin: '0 0 10px 0', fontSize: 28, fontWeight: 800 }}>
          {row.sceneTitle}
        </h2>
        <p style={{ margin: '0 0 20px 0', fontSize: 15, color: '#94A3B8' }}>
          {row.sceneDescription}
        </p>

        <div
          style={{
            background: 'rgba(255, 255, 255, 0.04)',
            borderRadius: 12,
            padding: '12px 18px',
            fontSize: 13,
            color: '#CBD5E1',
            display: 'inline-block',
            textAlign: 'left',
          }}
        >
          <div>🖼️ 放入照片：<code>public/photos/{row.photoFileName}</code></div>
          <div style={{ marginTop: 4 }}>
            ✂️ 剪辑机制：自动等比居中裁成 <b>16:9 横屏</b>，并施加电影微动效
          </div>
        </div>
      </div>

      {/* 底部台词字幕 */}
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleTranslateY}px)`,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.88)',
            backdropFilter: 'blur(16px)',
            padding: '14px 36px',
            borderRadius: 30,
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
            maxWidth: 900,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '0.04em',
          }}
        >
          {row.dialogue}
        </div>
      </div>

      {/* 自动真人语音旁白 */}
      <Audio src={staticFile(`audio/shot_0${row.id}.m4a`)} volume={1.0} />
    </AbsoluteFill>
  );
};
