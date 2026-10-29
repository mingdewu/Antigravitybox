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

  // 字幕弹入动效 (Spring)
  const subtitleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);
  const subtitleTranslateY = interpolate(subtitleSpring, [0, 1], [15, 0]);

  // ==================== 情况 A：已上传真实视频，执行自动剪辑 ====================
  if (row.isUploaded) {
    const startFromFrame = Math.round(row.autoTrimStartSeconds * fps);

    return (
      <AbsoluteFill style={{ backgroundColor: '#000000', overflow: 'hidden' }}>
        {/* 自动剪辑裁切后的实拍视频 */}
        <Video
          src={staticFile(`shots/${row.videoFileName}`)}
          startFrom={startFromFrame}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* 电影级微弱暗角 */}
        <AbsoluteFill
          style={{
            boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.65)',
            pointerEvents: 'none',
          }}
        />

        {/* 左上角分镜徽章 */}
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
          {row.badge} · {row.sceneTitle}
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
      </AbsoluteFill>
    );
  }

  // ==================== 情况 B：未上传视频，渲染智能对应场景（地图或实拍占位） ====================
  // 如果是地图相关场景：
  const isMapScene = row.sceneType.startsWith('map-');

  if (isMapScene) {
    // 根据具体 POI 映射对应景点
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
        {/* 真实卫星地图引擎 */}
        <MapBackground2D
          initialView={SHIKOKU_DEMO_TOUR.mapInitialView}
          route={SHIKOKU_DEMO_TOUR.route}
          progress={progress}
          pois={SHIKOKU_DEMO_TOUR.pois}
        />

        {/* 左上角信息栏 */}
        <SideInfoPanel
          config={SHIKOKU_DEMO_TOUR}
          progress={progress}
          coveredKm={Number((317.7 * progress).toFixed(1))}
          totalKm={317.7}
          activePoi={currentPoi}
          explanationEmphasis={1.0}
        />

        {/* 右上角解释卡片 */}
        {currentPoi && <PhotoCard poi={{ ...currentPoi, startFrame: 0, endFrame: 9999 }} />}

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
      </AbsoluteFill>
    );
  }

  // 非地图实拍镜头（如车窗实拍、海滨漫步）但尚未上传视频：展示专业的导演分镜占位监视器
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
      {/* 网格电影监视器背景 */}
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

      {/* 监视器四角裁切线 */}
      <div
        style={{
          position: 'absolute',
          top: 60,
          left: 60,
          width: 30,
          height: 30,
          borderTop: '2px solid rgba(255,255,255,0.4)',
          borderLeft: '2px solid rgba(255,255,255,0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 60,
          right: 60,
          width: 30,
          height: 30,
          borderTop: '2px solid rgba(255,255,255,0.4)',
          borderRight: '2px solid rgba(255,255,255,0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          left: 60,
          width: 30,
          height: 30,
          borderBottom: '2px solid rgba(255,255,255,0.4)',
          borderLeft: '2px solid rgba(255,255,255,0.4)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 60,
          right: 60,
          width: 30,
          height: 30,
          borderBottom: '2px solid rgba(255,255,255,0.4)',
          borderRight: '2px solid rgba(255,255,255,0.4)',
        }}
      />

      {/* 中央拍摄指导与自动剪辑提示 */}
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
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#F87171',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}
        >
          {row.badge} · 待上传实拍素材
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
          <div>📁 目标路径：<code>public/shots/{row.videoFileName}</code></div>
          <div style={{ marginTop: 4 }}>
            ✂️ 自动剪辑：从第 <b>{row.autoTrimStartSeconds}s</b> 开始自动截取 <b>{row.clipDurationSeconds}s</b> 成片
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
    </AbsoluteFill>
  );
};
