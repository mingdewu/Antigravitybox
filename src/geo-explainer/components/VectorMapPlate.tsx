import React from 'react';
import { useVideoConfig } from 'remotion';
import { MapViewport } from '../types';
import { ALL_LAND_FEATURES } from '../assets/japanLandGeoJSON';
import { projectToScreen } from '../utils/projection';

interface VectorMapPlateProps {
  initialView: MapViewport;
}

export const VectorMapPlate: React.FC<VectorMapPlateProps> = ({ initialView }) => {
  const { width, height } = useVideoConfig();

  // 经纬度网格线定义
  const longitudes = [132, 133, 134, 135, 136];
  const latitudes = [32.5, 33.0, 33.5, 34.0, 34.5, 35.0];

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: '#070D18', // 深邃海蓝色
        overflow: 'hidden',
      }}
    >
      <svg
        style={{ width: '100%', height: '100%', display: 'block' }}
        viewBox={`0 0 ${width} ${height}`}
      >
        <defs>
          {/* 海岸线荧光滤镜 */}
          <filter id="coastGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 陆地微弱质感斜纹 */}
          <pattern
            id="topoPattern"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 0,20 l 20,-20 M -5,5 l 10,-10 M 15,25 l 10,-10"
              stroke="rgba(255, 255, 255, 0.03)"
              strokeWidth="1"
            />
          </pattern>
        </defs>

        {/* 1. 经纬度参考经线与纬线 (Graticule Grid) */}
        <g stroke="rgba(56, 189, 248, 0.08)" strokeDasharray="4,6">
          {longitudes.map((lng) => {
            const pTop = projectToScreen(
              [lng, 35.5],
              initialView.center,
              initialView.zoom,
              width,
              height
            );
            const pBottom = projectToScreen(
              [lng, 32.0],
              initialView.center,
              initialView.zoom,
              width,
              height
            );
            return (
              <g key={`lng-${lng}`}>
                <line
                  x1={pTop[0]}
                  y1={pTop[1]}
                  x2={pBottom[0]}
                  y2={pBottom[1]}
                  strokeWidth="1"
                />
                <text
                  x={pBottom[0] + 4}
                  y={height - 24}
                  fill="rgba(56, 189, 248, 0.3)"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {lng}°E
                </text>
              </g>
            );
          })}

          {latitudes.map((lat) => {
            const pLeft = projectToScreen(
              [131.0, lat],
              initialView.center,
              initialView.zoom,
              width,
              height
            );
            const pRight = projectToScreen(
              [136.5, lat],
              initialView.center,
              initialView.zoom,
              width,
              height
            );
            return (
              <g key={`lat-${lat}`}>
                <line
                  x1={pLeft[0]}
                  y1={pLeft[1]}
                  x2={pRight[0]}
                  y2={pRight[1]}
                  strokeWidth="1"
                />
                <text
                  x={width - 50}
                  y={pRight[1] - 4}
                  fill="rgba(56, 189, 248, 0.3)"
                  fontSize="11"
                  fontFamily="monospace"
                >
                  {lat}°N
                </text>
              </g>
            );
          })}
        </g>

        {/* 2. 海域名称注记 */}
        <text
          x={width * 0.65}
          y={height * 0.88}
          fill="rgba(255, 255, 255, 0.12)"
          fontSize="24"
          fontWeight="800"
          letterSpacing="0.3em"
          fontFamily="system-ui, sans-serif"
        >
          PACIFIC OCEAN (太平洋)
        </text>
        <text
          x={width * 0.52}
          y={height * 0.30}
          fill="rgba(56, 189, 248, 0.16)"
          fontSize="15"
          fontWeight="700"
          letterSpacing="0.25em"
          fontFamily="system-ui, sans-serif"
        >
          SETO INLAND SEA (濑户内海)
        </text>

        {/* 3. 真实陆地板块多边形与海岸线 */}
        {ALL_LAND_FEATURES.map((land) => {
          const points = land.polygon.map((c) =>
            projectToScreen(
              c,
              initialView.center,
              initialView.zoom,
              width,
              height
            )
          );
          const pathD = points.reduce(
            (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`,
            ''
          ) + ' Z';

          return (
            <g key={land.name}>
              {/* 陆地基底填充（高对比度石墨青） */}
              <path
                d={pathD}
                fill="#162235"
                stroke="#1E2E48"
                strokeWidth="2"
              />
              {/* 陆地纹理叠层 */}
              <path d={pathD} fill="url(#topoPattern)" />

              {/* 高亮海岸线发光层（0.8px 细线 + 柔和辉光） */}
              <path
                d={pathD}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="1.6"
                strokeLinejoin="round"
                filter="url(#coastGlow)"
                opacity="0.85"
              />

              {/* 陆地名称注记 */}
              {land.name === '四国岛' && (
                <text
                  x={projectToScreen([133.5, 33.7], initialView.center, initialView.zoom, width, height)[0]}
                  y={projectToScreen([133.5, 33.7], initialView.center, initialView.zoom, width, height)[1]}
                  fill="rgba(255, 255, 255, 0.22)"
                  fontSize="28"
                  fontWeight="900"
                  letterSpacing="0.4em"
                  textAnchor="middle"
                  fontFamily="system-ui, sans-serif"
                >
                  SHIKOKU · 四国
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
