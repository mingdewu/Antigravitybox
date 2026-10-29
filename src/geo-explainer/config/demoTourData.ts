import { TourConfig } from '../types';
import { SHIKOKU_REAL_ROAD_ROUTE } from './shikokuRealRoute';

/**
 * 演示用测试数据集：四国漫游巡礼 30 秒样例
 * 采用“行进 -> 驻留讲解 -> 再行进 -> 再驻留讲解”的纪录片级时间节奏
 * 路线：贴合真实道路、高速与山川公路的 100% 真实导航轨迹
 */
export const SHIKOKU_DEMO_TOUR: TourConfig = {
  id: 'shikoku-30s-sample',
  title: '四国环岛 · 秘境巡礼',
  subtitle: '30秒经典地理漫游样片',
  regionTag: 'JAPAN · SHIKOKU',
  fps: 30,
  durationInFrames: 900, // 30s * 30fps
  mapInitialView: {
    center: [133.7, 33.65],
    zoom: 8.7,
  },
  route: {
    // 真实公路导航路线（经由德岛高速、四国山地盘山、高知海滨大道、松山高速）
    coordinates: SHIKOKU_REAL_ROAD_ROUTE,
    lineColor: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    lineWidth: 5.5,
  },
  pois: [
    {
      id: 'poi-1',
      name: '鸣门海峡',
      badge: 'STOP 01 · 德岛',
      coordinates: [134.6467, 34.2389],
      photoUrl: '',
      isPlaceholder: true,
      placeholderNotice: '【视觉占位】待提供鸣门漩涡真实授权照片',
      description: '大鸣门桥下奔涌的世界级巨型漩涡景观，潮速最高可达20公里/小时。',
      startFrame: 60,   // 2.0s: 到达起点，游标暂停，框体放大讲解
      endFrame: 240,   // 8.0s: 讲解结束，准备启程
    },
    {
      id: 'poi-2',
      name: '桂滨海岸',
      badge: 'STOP 02 · 高知',
      coordinates: [133.5739, 33.4975],
      photoUrl: '',
      isPlaceholder: true,
      placeholderNotice: '【视觉占位】待提供桂滨坂本龙马像与白砂青松照片',
      description: '太平洋波涛拍击的五色石海滩，高知最富盛名的明月与碧海观览地。',
      startFrame: 380,  // 12.7s: 游标抵达高知，暂停行进，放大详细讲解
      endFrame: 560,   // 18.7s: 讲解结束
    },
    {
      id: 'poi-3',
      name: '道后温泉本馆',
      badge: 'STOP 03 · 爱媛',
      coordinates: [132.7865, 33.8520],
      photoUrl: '',
      isPlaceholder: true,
      placeholderNotice: '【视觉占位】待提供道后温泉本馆木造三层楼阁照片',
      description: '拥有三千年历史的日本古老温泉，古雅木造建筑与灵汤相得益彰。',
      startFrame: 700,  // 23.3s: 游标抵达道后，暂停行进，放大总结讲解
      endFrame: 860,   // 28.7s: 讲解结束进入尾声
    },
  ],
  captions: [
    {
      id: 'cap-intro',
      startFrame: 10,
      endFrame: 55,
      text: '从濑户内海向太平洋启程，展开四国环岛地理探索之旅。',
    },
    {
      id: 'cap-1',
      startFrame: 60,
      endFrame: 235,
      text: '【驻留讲解 · 鸣门海峡】俯瞰大鸣门桥下奔腾澎湃的世界级天然大漩涡。',
    },
    {
      id: 'cap-travel-1',
      startFrame: 245,
      endFrame: 370,
      text: '【游标行进中】路线穿过德岛，越过中央构造线险峻的山峦峡谷，一路向南。',
    },
    {
      id: 'cap-2',
      startFrame: 380,
      endFrame: 555,
      text: '【驻留讲解 · 桂滨海岸】面朝浩瀚太平洋，浪击五色石沙滩，仰望坂本龙马铜像。',
    },
    {
      id: 'cap-travel-2',
      startFrame: 565,
      endFrame: 690,
      text: '【游标行进中】沿着仁淀川清流折向西北，翻越四国山地，驶向爱媛平原。',
    },
    {
      id: 'cap-3',
      startFrame: 700,
      endFrame: 855,
      text: '【驻留讲解 · 道后温泉】终点抵达松山道后，在三千年古汤木造楼阁前画下圆满句点。',
    },
    {
      id: 'cap-outro',
      startFrame: 860,
      endFrame: 895,
      text: '四国环岛路线全程巡礼完毕，全景收拢。',
    },
  ],
  attributionText: 'Imagery © Esri | MapLibre GL JS | Turf.js',
};
