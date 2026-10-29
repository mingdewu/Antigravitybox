import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
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
  const totalFrames = Math.max(1, Math.round(row.clipDurationSeconds * fps));
  const audioSrc = row.audioFileName || `shot_${String(row.id).padStart(2, '0')}.m4a`;

  // 字幕弹簧动效
  const subtitleSpring = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);
  const subtitleTranslateY = interpolate(subtitleSpring, [0, 1], [15, 0]);

  // ==================== 1. 计算当前镜头的地图坐标、行驶进度与活跃 POI ====================
  const type = (row.sceneType || '').toLowerCase();
  const text = (row.dialogue + ' ' + row.sceneTitle).toLowerCase();

  let mapProgress = 0;
  let activePoi: any = null;
  let explanationEmphasis = 0.5;

  if (type.includes('intro') || row.id === 1) {
    // 启程全览：游标从起点微移，宏观俯瞰全岛
    mapProgress = interpolate(frame, [0, totalFrames], [0.0, 0.08], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    activePoi = null;
    explanationEmphasis = 0.4;
  } else if (type.includes('naruto') || text.includes('鸣门') || text.includes('大桥')) {
    // STOP 01 鸣门海峡大漩涡 (起点)
    mapProgress = 0.0;
    activePoi = SHIKOKU_DEMO_TOUR.pois[0];
    explanationEmphasis = 1.0;
  } else if (type.includes('transport') || text.includes('公路') || text.includes('山脉') || text.includes('隧道')) {
    // 跨山公路行进阶段：游标穿行四国中央山地公路 (0.08 -> 0.59)
    mapProgress = interpolate(frame, [0, totalFrames], [0.08, 0.58], {
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    activePoi = null;
    explanationEmphasis = 0.3; // 移动时半透明保持通透
  } else if (type.includes('katsura') || text.includes('桂滨') || text.includes('高知')) {
    // STOP 02 高知桂滨海岸
    mapProgress = 0.597;
    activePoi = SHIKOKU_DEMO_TOUR.pois[1];
    explanationEmphasis = 1.0;
  } else if (type.includes('scenery') || text.includes('沙滩') || text.includes('浪')) {
    // 沿海行进阶段：游标向爱媛松山方向推进 (0.597 -> 0.95)
    mapProgress = interpolate(frame, [0, totalFrames], [0.597, 0.95], {
      easing: Easing.bezier(0.42, 0, 0.58, 1),
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    activePoi = null;
    explanationEmphasis = 0.3;
  } else if (type.includes('dogo') || text.includes('道后') || text.includes('温泉') || text.includes('松山')) {
    // STOP 03 松山道后温泉本馆
    mapProgress = 1.0;
    activePoi = SHIKOKU_DEMO_TOUR.pois[2];
    explanationEmphasis = 1.0;
  } else {
    // 收尾与全景回顾：100% 达成
    mapProgress = 1.0;
    activePoi = null;
    explanationEmphasis = 0.8;
  }

  const coveredKm = Number((317.7 * mapProgress).toFixed(1));

  // ==================== 2. 渲染核心底层：真实卫星地图、行驶路线与信息栏 ====================
  return (
    <AbsoluteFill style={{ backgroundColor: '#070D18', overflow: 'hidden' }}>
      {/* 核心底图：高清全球卫星图 + 原生 GeoJSON 路线游标 */}
      <MapBackground2D
        initialView={SHIKOKU_DEMO_TOUR.mapInitialView}
        route={SHIKOKU_DEMO_TOUR.route}
        progress={mapProgress}
        pois={SHIKOKU_DEMO_TOUR.pois}
      />

      {/* 左侧动态信息看板 (移动时半透明，到达驻留点时放大聚焦) */}
      <SideInfoPanel
        config={SHIKOKU_DEMO_TOUR}
        progress={mapProgress}
        coveredKm={coveredKm}
        totalKm={317.7}
        activePoi={activePoi}
        explanationEmphasis={explanationEmphasis}
      />

      {/* 地图标注卡片 (当定位到具体景点时弹出图文卡) */}
      {activePoi && (
        <PhotoCard poi={{ ...activePoi, startFrame: 0, endFrame: 9999 }} />
      )}

      {/* ==================== 模式 A：若用户勾选了上传实拍图片，呈现 16:9 画幅 ==================== */}
      {row.isPhotoUploaded && (
        <AbsoluteFill style={{ zIndex: 30, overflow: 'hidden' }}>
          {/* 背景模糊层防漏边 */}
          <div
            style={{
              position: 'absolute',
              inset: -20,
              backgroundImage: `url(${staticFile(`photos/${row.photoFileName}`)})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'blur(35px) brightness(0.35)',
              transform: 'scale(1.1)',
            }}
          />

          {/* 核心 16:9 实拍图片 + Ken Burns 微动效 */}
          {(() => {
            let scale = 1.0;
            let translateX = 0;
            if (row.photoEffect === 'zoom-in') {
              scale = interpolate(frame, [0, totalFrames], [1.0, 1.08], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
            } else if (row.photoEffect === 'zoom-out') {
              scale = interpolate(frame, [0, totalFrames], [1.08, 1.0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
            } else if (row.photoEffect === 'pan-right') {
              scale = 1.05;
              translateX = interpolate(frame, [0, totalFrames], [-20, 20], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
            } else {
              scale = interpolate(
                Math.sin((frame / totalFrames) * Math.PI),
                [0, 1],
                [1.02, 1.06]
              );
            }

            return (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  overflow: 'hidden',
                }}
              >
                <Img
                  src={staticFile(`photos/${row.photoFileName}`)}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transform: `scale(${scale}) translateX(${translateX}px)`,
                    transformOrigin: 'center center',
                  }}
                />
              </div>
            );
          })()}

          {/* 电影四周暗角 */}
          <AbsoluteFill
            style={{
              boxShadow: 'inset 0 0 140px rgba(0, 0, 0, 0.7)',
              pointerEvents: 'none',
            }}
          />

          {/* 画面右上角 GPS 地图标注徽章 */}
          <div
            style={{
              position: 'absolute',
              top: 40,
              right: 48,
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(56, 189, 248, 0.3)',
              borderRadius: 12,
              padding: '8px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              color: '#38BDF8',
              fontSize: 13,
              fontWeight: 700,
              boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ fontSize: 16 }}>📍</span>
            <span>里程: {coveredKm} km · {row.sceneTitle}</span>
          </div>
        </AbsoluteFill>
      )}

      {/* 左上角分镜标识牌 */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 48,
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: 10,
          padding: '8px 16px',
          color: '#38BDF8',
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: '0.08em',
          zIndex: 40,
          boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        }}
      >
        {row.badge} · {row.sceneTitle} {row.isPhotoUploaded ? '(16:9 实拍图)' : '(卫星地图漫游)'}
      </div>

      {/* 底部高清居中台词字幕 */}
      <div
        style={{
          position: 'absolute',
          bottom: 50,
          left: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          opacity: subtitleOpacity,
          transform: `translateY(${subtitleTranslateY}px)`,
          zIndex: 50,
        }}
      >
        <div
          style={{
            background: 'rgba(15, 23, 42, 0.92)',
            backdropFilter: 'blur(20px)',
            padding: '14px 38px',
            borderRadius: 32,
            border: '1px solid rgba(255, 255, 255, 0.18)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.6)',
            maxWidth: 960,
            textAlign: 'center',
            color: '#FFFFFF',
            fontSize: 23,
            fontWeight: 600,
            letterSpacing: '0.04em',
            textShadow: '0 2px 8px rgba(0,0,0,0.8)',
          }}
        >
          {row.dialogue}
        </div>
      </div>

      {/* 真实配音旁白音频 */}
      <Audio src={staticFile(`audio/${audioSrc}`)} volume={1.0} />
    </AbsoluteFill>
  );
};
