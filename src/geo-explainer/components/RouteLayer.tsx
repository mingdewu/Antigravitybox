import React from 'react';
import { RouteConfig } from '../types';

interface RouteLayerProps {
  route?: RouteConfig;
}

/**
 * 路线层现已完全整合进 MapLibre WebGL 原生 GeoJSON 引擎中，
 * 本组件保留作为扩展装饰层接口。
 */
export const RouteLayer: React.FC<RouteLayerProps> = () => {
  return null;
};
