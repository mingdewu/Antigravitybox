import React from 'react';
import { AbsoluteFill, Audio, staticFile } from 'remotion';
import { linearTiming, TransitionSeries } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { DatabaseRowItem } from './types';
import { DEFAULT_DATABASE_ROWS } from './defaultDatabaseData';
import { DatabaseShotRenderer } from './DatabaseShotRenderer';

interface DatabaseAutoEditorProps {
  rows?: DatabaseRowItem[];
}

export const TRANSITION_FRAMES = 15; // 0.5 秒转场

/**
 * 动态计算总帧数（各镜头帧长之和减去转场重叠帧）
 */
export const calculateDatabaseTotalFrames = (rows: DatabaseRowItem[], fps: number = 30): number => {
  const totalClipsFrames = rows.reduce(
    (acc, row) => acc + Math.round(row.clipDurationSeconds * fps),
    0
  );
  const totalTransitions = (rows.length - 1) * TRANSITION_FRAMES;
  return totalClipsFrames - totalTransitions;
};

export const DatabaseAutoEditor: React.FC<DatabaseAutoEditorProps> = ({
  rows = DEFAULT_DATABASE_ROWS,
}) => {
  const fps = 30;

  return (
    <AbsoluteFill style={{ backgroundColor: '#000000' }}>
      {/* 自动剪辑拼接转场序列 */}
      <TransitionSeries>
        {rows.map((row, index) => {
          const durationInFrames = Math.round(row.clipDurationSeconds * fps);
          const isLast = index === rows.length - 1;

          return (
            <React.Fragment key={row.id}>
              {/* 单分镜镜头 */}
              <TransitionSeries.Sequence durationInFrames={durationInFrames}>
                <DatabaseShotRenderer row={row} />
              </TransitionSeries.Sequence>

              {/* 镜头之间的智能自动平滑转场 */}
              {!isLast && (
                <TransitionSeries.Transition
                  presentation={
                    row.transitionType === 'slide' ? slide() : fade()
                  }
                  timing={linearTiming({ durationInFrames: TRANSITION_FRAMES })}
                />
              )}
            </React.Fragment>
          );
        })}
      </TransitionSeries>

      {/* 背景轻音乐 */}
      <Audio
        src={staticFile('bgm.mp3')}
        volume={(f) => (f < 30 ? f / 30 : 0.4)}
      />
    </AbsoluteFill>
  );
};
