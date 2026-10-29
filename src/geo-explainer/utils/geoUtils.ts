import * as turf from '@turf/turf';
import { GeoCoordinate, POIItem } from '../types';

/**
 * 将经纬度点列表转为 Turf 的 Feature<LineString>
 */
export const coordinatesToLineString = (coords: GeoCoordinate[]) => {
  return turf.lineString(coords);
};

/**
 * 计算整条路线的真实地理总里程（千米）
 */
export const calculateTotalDistanceKm = (coords: GeoCoordinate[]): number => {
  if (coords.length < 2) return 0;
  const line = coordinatesToLineString(coords);
  return Number(turf.length(line, { units: 'kilometers' }).toFixed(1));
};

/**
 * 获取完整的路线 Feature
 */
export const getFullRouteFeature = (coords: GeoCoordinate[]) => {
  return coordinatesToLineString(coords);
};

/**
 * 根据 0 ~ 1 的进度，截取走过的路径 Feature<LineString>
 * 严格使用 Turf 测地线切片，完全适配 MapLibre GeoJSON 数据源
 */
export const getPartialRouteFeature = (
  coords: GeoCoordinate[],
  progress: number
) => {
  if (coords.length < 2) {
    return coordinatesToLineString(coords);
  }

  const fullLine = coordinatesToLineString(coords);
  const totalLength = turf.length(fullLine, { units: 'kilometers' });

  // 保证至少切片极小距离（0.001km），防止 Turf 在长度为 0 时抛错
  const clampedProgress = Math.max(0.0001, Math.min(1, progress));
  const currentDistance = Math.max(0.001, totalLength * clampedProgress);

  const sliced = turf.lineSliceAlong(fullLine, 0, currentDistance, {
    units: 'kilometers',
  });

  return sliced;
};

/**
 * 获取当前车头游标所在点的 Feature<Point>
 */
export const getCursorPointFeature = (
  coords: GeoCoordinate[],
  progress: number
) => {
  if (coords.length < 2) {
    return turf.point(coords[0] || [0, 0]);
  }

  const fullLine = coordinatesToLineString(coords);
  const totalLength = turf.length(fullLine, { units: 'kilometers' });
  const clampedProgress = Math.max(0.0001, Math.min(1, progress));
  const currentDistance = Math.max(0.001, totalLength * clampedProgress);

  return turf.along(fullLine, currentDistance, { units: 'kilometers' });
};

/**
 * 将所有 POI 景点转为 MapLibre FeatureCollection
 */
export const getPoisFeatureCollection = (pois: POIItem[]) => {
  return turf.featureCollection(
    pois.map((poi) =>
      turf.point(poi.coordinates, {
        id: poi.id,
        name: poi.name,
        badge: poi.badge,
        startFrame: poi.startFrame,
      })
    )
  );
};
