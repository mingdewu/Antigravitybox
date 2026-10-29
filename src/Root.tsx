import React from 'react';
import { Composition, Folder } from 'remotion';
import { VideoEditor, TOTAL_FRAMES } from './VideoEditor';
import { ProductIntro5s } from './ProductIntro5s';
import { TravelVlog, VLOG_TOTAL_FRAMES } from './vlog/TravelVlog';
import { FujiTour20Min, FujiStagePlayer } from './fuji-vlog/FujiVlogEngine';
import {
  FUJI_STAGES_DATA,
  FUJI_TOTAL_FRAMES,
  getStageFrames,
} from './fuji-vlog/stagesData';
import { GeoExplainer } from './geo-explainer/GeoExplainer';
import { SHIKOKU_DEMO_TOUR } from './geo-explainer/config/demoTourData';
import {
  DatabaseAutoEditor,
  calculateDatabaseTotalFrames,
} from './database-vlog/DatabaseAutoEditor';
import { DEFAULT_DATABASE_ROWS } from './database-vlog/defaultDatabaseData';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* ==================== 数据库驱动的智能自动剪辑与地图模板 (动态多镜头全自动流) ==================== */}
      <Composition
        id="DatabaseAutoEditor"
        component={DatabaseAutoEditor}
        durationInFrames={calculateDatabaseTotalFrames(DEFAULT_DATABASE_ROWS, 30)}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          rows: DEFAULT_DATABASE_ROWS,
        }}
      />

      {/* ==================== 地理行程漫游讲解模板 (30秒 / 900帧) ==================== */}
      <Composition
        id="GeoTour30s"
        component={GeoExplainer}
        durationInFrames={SHIKOKU_DEMO_TOUR.durationInFrames}
        fps={SHIKOKU_DEMO_TOUR.fps}
        width={1920}
        height={1080}
        defaultProps={{
          config: SHIKOKU_DEMO_TOUR,
        }}
      />

      {/* ==================== 富士山周游 20 分钟完整长片 (36,000 帧) ==================== */}
      <Composition
        id="FujiTour20Min"
        component={FujiTour20Min}
        durationInFrames={FUJI_TOTAL_FRAMES} // 36,000 帧 (20分00秒 @ 30fps)
        fps={30}
        width={1920}
        height={1080}
      />

      {/* ==================== 富士山 6 大章节独立预览与分段导出 ==================== */}
      <Folder name="Fuji-Chapters">
        {FUJI_STAGES_DATA.map((stage, index) => (
          <Composition
            key={stage.stageId}
            id={`FujiStage${index + 1}-${stage.stageId}`}
            component={() => <FujiStagePlayer stage={stage} />}
            durationInFrames={getStageFrames(stage, 30)}
            fps={30}
            width={1920}
            height={1080}
          />
        ))}
      </Folder>

      {/* ==================== 其他示例项目 ==================== */}
      <Folder name="Other-Demos">
        <Composition
          id="TravelVlog"
          component={TravelVlog}
          durationInFrames={VLOG_TOTAL_FRAMES}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="VideoEditor"
          component={VideoEditor}
          durationInFrames={TOTAL_FRAMES}
          fps={30}
          width={1920}
          height={1080}
        />
        <Composition
          id="ProductIntro5s"
          component={ProductIntro5s}
          durationInFrames={150}
          fps={30}
          width={1920}
          height={1080}
        />
      </Folder>
    </>
  );
};