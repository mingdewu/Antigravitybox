/**
 * 通用真实路网导航轨迹抓取与优化脚本
 *
 * 用法:
 *   node scripts/fetch-real-route.mjs
 *
 * 说明:
 *   基于开放地理路网 (OSRM / OpenStreetMap)，将多个经纬度途径点自动规划为真实的行车公路轨迹。
 *   完全开源、免费、免 API Key，可平替商业 Google Maps Directions API。
 */

import fs from 'fs';
import * as turf from '@turf/turf';

// 示例途径点：[经度, 纬度] (支持传入任意地点的连续经纬度)
const WAYPOINTS = [
  [134.6467, 34.2389], // 鸣门海峡
  [133.5739, 33.4975], // 高知桂滨
  [132.7865, 33.8520], // 松山道后温泉
];

async function fetchRealRoute(points) {
  const coordString = points.map((p) => `${p[0]},${p[1]}`).join(';');
  const url = `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`;

  console.log(`正在请求真实公路导航路网: ${url}`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'RemotionGeoExplainer/1.0',
    },
  });

  if (!res.ok) {
    throw new Error(`导航服务响应错误: ${res.status}`);
  }

  const data = await res.json();
  if (!data.routes || !data.routes[0]) {
    throw new Error('未找到可用公路路线');
  }

  const rawCoords = data.routes[0].geometry.coordinates;
  const distanceKm = Number((data.routes[0].distance / 1000).toFixed(1));

  // 使用道格拉斯-普克算法进行轻度保真抽稀，保留所有真实的急转弯与盘山公路形态
  const line = turf.lineString(rawCoords);
  const simplified = turf.simplify(line, { tolerance: 0.001, highQuality: true });
  const finalCoords = simplified.geometry.coordinates;

  console.log(`✓ 原始路网节点数: ${rawCoords.length}`);
  console.log(`✓ 优化后真实公路关键点数: ${finalCoords.length}`);
  console.log(`✓ 真实总公路里程: ${distanceKm} km`);

  return { finalCoords, distanceKm };
}

fetchRealRoute(WAYPOINTS)
  .then(({ finalCoords, distanceKm }) => {
    console.log('真实路网抓取成功！');
  })
  .catch((err) => {
    console.error('抓取失败:', err);
  });
