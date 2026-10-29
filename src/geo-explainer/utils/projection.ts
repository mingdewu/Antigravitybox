import { GeoCoordinate } from '../types';

/**
 * 标准 Web Mercator 经纬度投影至 1920x1080 屏幕像素坐标
 * 与 MapLibre / OpenStreetMap 的瓦片投影完全一致
 */
export const projectToScreen = (
  coord: GeoCoordinate,
  center: GeoCoordinate,
  zoom: number,
  screenWidth: number = 1920,
  screenHeight: number = 1080
): [number, number] => {
  const [lng, lat] = coord;
  const [cLng, cLat] = center;

  const latRad = (lat * Math.PI) / 180;
  const cLatRad = (cLat * Math.PI) / 180;

  const worldSize = 256 * Math.pow(2, zoom);

  const x = ((lng + 180) / 360) * worldSize;
  const y =
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    worldSize;

  const cX = ((cLng + 180) / 360) * worldSize;
  const cY =
    ((1 - Math.log(Math.tan(cLatRad) + 1 / Math.cos(cLatRad)) / Math.PI) / 2) *
    worldSize;

  const screenX = x - cX + screenWidth / 2;
  const screenY = y - cY + screenHeight / 2;

  return [screenX, screenY];
};
