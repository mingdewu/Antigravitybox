import React, { useEffect, useRef, useState } from 'react';
import { staticFile, useCurrentFrame, useDelayRender, useVideoConfig } from 'remotion';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapViewport, POIItem, RouteConfig } from '../types';
import {
  getFullRouteFeature,
  getPartialRouteFeature,
  getCursorPointFeature,
  getPoisFeatureCollection,
} from '../utils/geoUtils';

interface MapBackground2DProps {
  initialView: MapViewport;
  route: RouteConfig;
  progress: number;
  pois: POIItem[];
}

export const MapBackground2D: React.FC<MapBackground2DProps> = ({
  initialView,
  route,
  progress,
  pois,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<maplibregl.Map | null>(null);
  const { width, height } = useVideoConfig();
  const frame = useCurrentFrame();

  const { delayRender, continueRender } = useDelayRender();
  const [initHandle] = useState(() => delayRender('Initializing MapLibre Engine'));

  // 1. 初始化 MapLibre 并挂载真实卫星地图与原生 GeoJSON 图层
  useEffect(() => {
    if (!containerRef.current) return;

    let isCompleted = false;
    const finishInit = () => {
      if (!isCompleted) {
        isCompleted = true;
        continueRender(initHandle);
      }
    };

    const safetyTimeout = setTimeout(() => {
      finishInit();
    }, 4000);

    // 注入离线 Worker
    try {
      maplibregl.setWorkerUrl(staticFile('maplibre-gl-worker.mjs'));
    } catch {
      // ignore
    }

    // 高清全球真实卫星底图源
    const satelliteStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          ],
          tileSize: 256,
          attribution: 'Tiles © Esri',
          maxzoom: 19,
        },
      },
      layers: [
        {
          id: 'esri-satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 19,
          paint: {
            'raster-brightness-max': 0.88,
            'raster-contrast': 0.15,
          },
        },
      ],
    };

    try {
      const mapInstance = new maplibregl.Map({
        container: containerRef.current,
        style: satelliteStyle,
        center: initialView.center,
        zoom: initialView.zoom,
        pitch: initialView.pitch ?? 0,
        bearing: initialView.bearing ?? 0,
        interactive: false,
        attributionControl: false,
        fadeDuration: 0,
        canvasContextAttributes: {
          preserveDrawingBuffer: true,
        },
      });

      mapInstance.once('load', () => {
        // ========== 1. 添加未走过的全程规划虚线图层 ==========
        mapInstance.addSource('full-route', {
          type: 'geojson',
          data: getFullRouteFeature(route.coordinates),
        });
        mapInstance.addLayer({
          id: 'full-route-line',
          type: 'line',
          source: 'full-route',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#FFFFFF',
            'line-opacity': 0.35,
            'line-width': 4,
            'line-dasharray': [2, 3],
          },
        });

        // ========== 2. 添加动态生长的红色行进轨迹 (底层发光辉光) ==========
        mapInstance.addSource('trace-glow', {
          type: 'geojson',
          data: getPartialRouteFeature(route.coordinates, 0),
        });
        mapInstance.addLayer({
          id: 'trace-glow-layer',
          type: 'line',
          source: 'trace-glow',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': '#EF4444',
            'line-opacity': 0.5,
            'line-width': 14,
            'line-blur': 4,
          },
        });

        // ========== 3. 添加动态生长的红色行进轨迹 (核心高亮主干) ==========
        mapInstance.addSource('trace', {
          type: 'geojson',
          data: getPartialRouteFeature(route.coordinates, 0),
        });
        mapInstance.addLayer({
          id: 'trace-line',
          type: 'line',
          source: 'trace',
          layout: {
            'line-cap': 'round',
            'line-join': 'round',
          },
          paint: {
            'line-color': route.lineColor || '#EF4444',
            'line-width': route.lineWidth || 5,
          },
        });

        // ========== 4. 添加途经打卡点图钉 (POI Markers) ==========
        mapInstance.addSource('poi-markers', {
          type: 'geojson',
          data: getPoisFeatureCollection(pois),
        });
        // 途经点外圈发光
        mapInstance.addLayer({
          id: 'poi-halo',
          type: 'circle',
          source: 'poi-markers',
          paint: {
            'circle-color': '#EF4444',
            'circle-radius': 12,
            'circle-opacity': 0.35,
          },
        });
        // 途经点实心圆核
        mapInstance.addLayer({
          id: 'poi-dots',
          type: 'circle',
          source: 'poi-markers',
          paint: {
            'circle-color': '#EF4444',
            'circle-radius': 6,
            'circle-stroke-color': '#FFFFFF',
            'circle-stroke-width': 2.5,
          },
        });

        // ========== 5. 添加车头行进游标光标 (Cursor) ==========
        mapInstance.addSource('cursor-point', {
          type: 'geojson',
          data: getCursorPointFeature(route.coordinates, 0),
        });
        // 游标大光晕
        mapInstance.addLayer({
          id: 'cursor-halo',
          type: 'circle',
          source: 'cursor-point',
          paint: {
            'circle-color': '#EF4444',
            'circle-radius': 18,
            'circle-opacity': 0.45,
          },
        });
        // 游标中心高亮白核
        mapInstance.addLayer({
          id: 'cursor-core',
          type: 'circle',
          source: 'cursor-point',
          paint: {
            'circle-color': '#FFFFFF',
            'circle-radius': 6.5,
            'circle-stroke-color': '#EF4444',
            'circle-stroke-width': 3,
          },
        });

        mapInstance.resize();
        mapInstance.once('idle', () => {
          setMap(mapInstance);
          clearTimeout(safetyTimeout);
          finishInit();
        });
      });

      mapInstance.once('error', () => {
        clearTimeout(safetyTimeout);
        finishInit();
      });
    } catch {
      clearTimeout(safetyTimeout);
      finishInit();
    }
  }, [continueRender, initHandle, initialView, pois, route.coordinates, route.lineColor, route.lineWidth]);

  // 2. 核心：每帧更新 GeoJSON 轨迹与游标，绝对 100% 严丝合缝紧贴卫星地图
  useEffect(() => {
    if (!map) return;

    const frameHandle = delayRender('Updating Map Frame');

    const partialRoute = getPartialRouteFeature(route.coordinates, progress);
    const cursorPoint = getCursorPointFeature(route.coordinates, progress);

    const traceSource = map.getSource('trace') as maplibregl.GeoJSONSource | undefined;
    const traceGlowSource = map.getSource('trace-glow') as maplibregl.GeoJSONSource | undefined;
    const cursorSource = map.getSource('cursor-point') as maplibregl.GeoJSONSource | undefined;

    traceSource?.setData(partialRoute);
    traceGlowSource?.setData(partialRoute);
    cursorSource?.setData(cursorPoint);

    map.once('idle', () => {
      continueRender(frameHandle);
    });

    // 触发重绘确保每帧精准刷新
    map.triggerRepaint();
  }, [continueRender, delayRender, frame, map, progress, route.coordinates]);

  // 3. 计算各个 POI 在当前屏幕上的绝对精准像素位置，渲染地名浮动标签
  const poiLabels = pois.map((poi) => {
    if (!map) return null;
    const isReached = frame >= poi.startFrame;
    const pixelPos = map.project(poi.coordinates);

    return (
      <div
        key={poi.id}
        style={{
          position: 'absolute',
          left: pixelPos.x + 14,
          top: pixelPos.y - 12,
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          color: isReached ? '#FFFFFF' : 'rgba(255, 255, 255, 0.65)',
          fontSize: isReached ? 14 : 12,
          fontWeight: isReached ? 700 : 500,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 2px #000',
          transition: 'none',
        }}
      >
        {poi.name}
      </div>
    );
  });

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width,
        height,
        backgroundColor: '#070D18',
        overflow: 'hidden',
      }}
    >
      {/* 真实高清晰度 MapLibre 卫星影像 + 原生 GeoJSON 绝对精确路线渲染 */}
      <div
        ref={containerRef}
        style={{
          width,
          height,
          position: 'absolute',
          top: 0,
          left: 0,
        }}
      />

      {/* 由 MapLibre 官方 project() 坐标变换驱动的高清地名标签浮层 */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width,
          height,
          pointerEvents: 'none',
        }}
      >
        {poiLabels}
      </div>

      {/* 电影级四周微弱通透暗角，增强对比度 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.7)',
        }}
      />
    </div>
  );
};
