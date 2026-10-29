import React, { useMemo } from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { TourConfig } from './types';
import { SHIKOKU_DEMO_TOUR } from './config/demoTourData';
import { MapBackground2D } from './components/MapBackground2D';
import { SideInfoPanel } from './components/SideInfoPanel';
import { PhotoCard } from './components/PhotoCard';
import { SubtitleOverlay } from './components/SubtitleOverlay';
import { AttributionBadge } from './components/AttributionBadge';
import { calculateTotalDistanceKm } from './utils/geoUtils';

interface GeoExplainerProps {
  config?: TourConfig;
}

export const GeoExplainer: React.FC<GeoExplainerProps> = ({
  config = SHIKOKU_DEMO_TOUR,
}) => {
  const frame = useCurrentFrame();

  // 核心时间线逻辑：“移动时半透明，到达景点时游标暂停且框体变大讲解”
  const { routeProgress, explanationEmphasis } = useMemo(() => {
    let progress = 0;
    let emphasis = 0;

    if (frame < 60) {
      // 0 ~ 2.0s: 开场定镜
      progress = 0;
      emphasis = 0;
    } else if (frame >= 60 && frame <= 240) {
      // 2.0s ~ 8.0s: STOP 01 鸣门海峡 驻留讲解 (游标暂停在起点 0.0)
      progress = 0;
      const enter = interpolate(frame, [60, 75], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const exit = interpolate(frame, [225, 240], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      emphasis = enter * exit;
    } else if (frame > 240 && frame < 380) {
      // 8.0s ~ 12.7s: 游标行进阶段 1 (鸣门 -> 高知桂滨)，真实公路平滑延伸，框体保持半透明
      progress = interpolate(frame, [240, 380], [0, 0.597], {
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      emphasis = 0;
    } else if (frame >= 380 && frame <= 560) {
      // 12.7s ~ 18.7s: STOP 02 桂滨海岸 驻留讲解 (游标暂停在桂滨 0.597，框体放大高亮)
      progress = 0.597;
      const enter = interpolate(frame, [380, 395], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const exit = interpolate(frame, [545, 560], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      emphasis = enter * exit;
    } else if (frame > 560 && frame < 700) {
      // 18.7s ~ 23.3s: 游标行进阶段 2 (高知桂滨 -> 松山道后)，真实公路平滑延伸，框体保持半透明
      progress = interpolate(frame, [560, 700], [0.597, 1.0], {
        easing: Easing.bezier(0.42, 0, 0.58, 1),
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      emphasis = 0;
    } else if (frame >= 700 && frame <= 860) {
      // 23.3s ~ 28.7s: STOP 03 道后温泉 驻留讲解 (游标暂停在终点 1.0，框体放大总结)
      progress = 1.0;
      const enter = interpolate(frame, [700, 715], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      const exit = interpolate(frame, [845, 860], [1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      });
      emphasis = enter * exit;
    } else {
      // 28.7s ~ 30.0s: 片尾定镜全景
      progress = 1.0;
      emphasis = 0;
    }

    return { routeProgress: progress, explanationEmphasis: emphasis };
  }, [frame]);

  // 基于真实地理计算总里程与当前里程
  const totalKm = useMemo(() => {
    return calculateTotalDistanceKm(config.route.coordinates);
  }, [config.route.coordinates]);

  const coveredDistanceKm = useMemo(() => {
    return Number((totalKm * routeProgress).toFixed(1));
  }, [totalKm, routeProgress]);

  // 当前激活的 POI 景点
  const activePoi = config.pois.find(
    (poi) => frame >= poi.startFrame && frame <= poi.endFrame
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#070D18',
        overflow: 'hidden',
      }}
    >
      {/* 1. 地图引擎层 (MapLibre 官方原生 WebGL 路线与游标，100% 紧贴卫星瓦片) */}
      <MapBackground2D
        initialView={config.mapInitialView}
        route={config.route}
        progress={routeProgress}
        pois={config.pois}
      />

      {/* 2. 左上角动态信息面板 (移动时半透明 0.45，讲解时适量放大 1.06 且透明度 0.98) */}
      <SideInfoPanel
        config={config}
        progress={routeProgress}
        coveredKm={coveredDistanceKm}
        totalKm={totalKm}
        activePoi={activePoi}
        explanationEmphasis={explanationEmphasis}
      />

      {/* 3. 右上角实拍照片解释框 (讲解时弹簧弹出并适量放大 1.08，移动时淡出收缩) */}
      {config.pois.map((poi) => (
        <PhotoCard key={poi.id} poi={poi} />
      ))}

      {/* 4. 底部对齐字幕层 */}
      <SubtitleOverlay captions={config.captions} />

      {/* 5. 右下角地图合规数据署名 */}
      <AttributionBadge attributionText={config.attributionText} />
    </AbsoluteFill>
  );
};
