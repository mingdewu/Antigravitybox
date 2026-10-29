import React from 'react';
import { AbsoluteFill } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { ShotClip, ShotMetadata } from './ShotClip';

export interface VlogShotItem extends ShotMetadata {
  id: string;
  durationInFrames: number;
  recommendedShootSec: number;
  transitionAfter?: 'fade' | 'slide' | 'none';
}

// ============================================================================
// 第一步 & 第二步：AI 根据文案分 Stage 定义的镜头剪辑剧本与元数据
// 拍完视频后，只需把文件丢进 public/shots/ 并将 isUploaded 改为 true 即可直接出片！
// ============================================================================
export const VLOG_SHOTS_DATA: VlogShotItem[] = [
  // -------------------- Stage 1: 清晨启程 (Departure) --------------------
  {
    id: 'S1-01',
    stage: 'Stage 1: 清晨启程',
    fileName: 'shot_01_packing.mp4',
    location: '家中卧室 / 书桌前',
    subject: '将相机和护照放进背包，拉上拉链的声音与动作',
    angle: '俯拍特写 (Top-down 90°)',
    movement: '固定机位 (Static)，靠手部动作带出节奏',
    voiceover: '逃离城市的最好方式，就是只带一台相机出发。',
    durationInFrames: 75, // 2.5s
    recommendedShootSec: 5,
    transitionAfter: 'none',
    isUploaded: false,
  },
  {
    id: 'S1-02',
    stage: 'Stage 1: 清晨启程',
    fileName: 'shot_02_train_window.mp4',
    location: '江之电 / 电车靠窗座位',
    subject: '透过车窗看飞速略过的街景与远处的海面反光',
    angle: '第一人称主观视角 (POV 平视)',
    movement: '固定手持（依靠列车行进产生自然的横向位移感）',
    voiceover: '坐上清晨第一班电车，窗外的高楼渐渐变成了海岸线。',
    durationInFrames: 105, // 3.5s
    recommendedShootSec: 8,
    transitionAfter: 'fade',
    isUploaded: false,
  },

  // -------------------- Stage 2: 抵达与漫步 (Exploration) --------------------
  {
    id: 'S2-01',
    stage: 'Stage 2: 海岸漫步',
    fileName: 'shot_03_crossing_sea.mp4',
    location: '镰仓高校前 / 海边平交道口',
    subject: '绿色电车驶过瞬间，露出背后的蔚蓝大海',
    angle: '中景微仰拍 (Low-angle Medium Shot)',
    movement: '缓慢向前推镜 (Slow Push-in)',
    voiceover: '当电车驶过的那一刻，海风迎面扑来。',
    durationInFrames: 120, // 4.0s
    recommendedShootSec: 10,
    transitionAfter: 'slide',
    isUploaded: false,
  },
  {
    id: 'S2-02',
    stage: 'Stage 2: 海岸漫步',
    fileName: 'shot_04_walking_feet.mp4',
    location: '七里滨沙滩步道',
    subject: '人物走在海边堤坝上的背影或脚步，阳光洒在海面上',
    angle: '低机位跟拍 (Low-angle Tracking)',
    movement: '跟随人物匀速前移 (Gimbal Follow)',
    voiceover: '不用赶时间，没有打卡清单，只是顺着海浪的声音往前走。',
    durationInFrames: 105, // 3.5s
    recommendedShootSec: 7,
    transitionAfter: 'fade',
    isUploaded: false,
  },

  // -------------------- Stage 3: 街角休憩与日落 (Sunset & Outro) --------------------
  {
    id: 'S3-01',
    stage: 'Stage 3: 街角与日落',
    fileName: 'shot_05_coffee_pour.mp4',
    location: '海景街角独立咖啡馆',
    subject: '冰拿铁牛奶融合成渐变纹理，窗外是柔和的夕阳色温',
    angle: '微距特写 (Macro Close-up, 侧面平视)',
    movement: '固定机位 + 轻微向右平移 (Slow Slider Right)',
    voiceover: '在街角找一家安静的店，把整个下午浪费在日落里。',
    durationInFrames: 90, // 3.0s
    recommendedShootSec: 6,
    transitionAfter: 'fade',
    isUploaded: false,
  },
  {
    id: 'S3-02',
    stage: 'Stage 3: 街角与日落',
    fileName: 'shot_06_sunset_horizon.mp4',
    location: '海边木栈道尽头',
    subject: '金色夕阳沉入海平面，天空呈现粉紫晚霞渐变',
    angle: '大远景全景 (Wide Establishing Shot)',
    movement: '三脚架固定机位 (Tripod Static)',
    voiceover: '旅行的意义不是去了哪里，而是找回感知生活的能力。下期见。',
    durationInFrames: 120, // 4.0s
    recommendedShootSec: 10,
    transitionAfter: 'none',
    isUploaded: false,
  },
];

// 计算扣除转场重叠后的精确总帧数
export const VLOG_TOTAL_FRAMES = VLOG_SHOTS_DATA.reduce((acc, item, idx) => {
  const isLast = idx === VLOG_SHOTS_DATA.length - 1;
  const hasTransition =
    !isLast && item.transitionAfter && item.transitionAfter !== 'none';
  return acc + item.durationInFrames - (hasTransition ? 15 : 0);
}, 0);

// ============================================================================
// 主合成组件：按 Stage 串联渲染所有分镜与转场
// ============================================================================
export const TravelVlog: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#050811' }}>
      <TransitionSeries>
        {VLOG_SHOTS_DATA.map((shot, index) => {
          const isLast = index === VLOG_SHOTS_DATA.length - 1;
          const transitionType = shot.transitionAfter;

          return (
            <React.Fragment key={shot.id}>
              <TransitionSeries.Sequence durationInFrames={shot.durationInFrames}>
                <ShotClip {...shot} />
              </TransitionSeries.Sequence>

              {!isLast && transitionType === 'fade' && (
                <TransitionSeries.Transition
                  presentation={fade()}
                  timing={linearTiming({ durationInFrames: 15 })}
                />
              )}

              {!isLast && transitionType === 'slide' && (
                <TransitionSeries.Transition
                  presentation={slide({ direction: 'from-right' })}
                  timing={linearTiming({ durationInFrames: 15 })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>
    </AbsoluteFill>
  );
};
