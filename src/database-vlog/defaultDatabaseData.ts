import { DatabaseRowItem } from './types';

/**
 * 像数据库一样的数据驱动模板配置表 (1 到 7 号分镜)
 * 用户只需修改本表格中的台词、场景和上传开关，Remotion 将全自动完成视频调度与剪辑！
 */
export const DEFAULT_DATABASE_ROWS: DatabaseRowItem[] = [
  {
    id: 1,
    badge: 'SHOT #01',
    dialogue: '逃离城市的最快方式，就是只带一台相机出发。',
    sceneTitle: '启程启航 · 四国全岛全景',
    sceneType: 'map-intro',
    sceneDescription: '卫星地图宏观俯瞰，红色导航路线与信息栏展开，游标就位。',
    isUploaded: false,
    videoFileName: 'shot_01_packing.mp4',
    autoTrimStartSeconds: 1.0,
    clipDurationSeconds: 4.0, // 120 帧
    transitionType: 'fade',
  },
  {
    id: 2,
    badge: 'SHOT #02',
    dialogue: '第一站来到鸣门海峡，俯瞰奔腾澎湃的大漩涡。',
    sceneTitle: 'STOP 01 · 鸣门海峡大漩涡',
    sceneType: 'map-poi-naruto',
    sceneDescription: '地图游标暂停在德岛鸣门，弹出鸣门漩涡图文卡片，信息栏高亮。',
    isUploaded: false,
    videoFileName: 'shot_02_naruto_whirlpool.mp4',
    autoTrimStartSeconds: 0.5,
    clipDurationSeconds: 5.0, // 150 帧
    transitionType: 'slide',
  },
  {
    id: 3,
    badge: 'SHOT #03',
    dialogue: '穿过险峻峡谷的山野公路，窗外的大山逐渐变成了太平洋。',
    sceneTitle: '跨山公路 · 真实路网行进',
    sceneType: 'video-transport',
    sceneDescription: '车窗外穿山越岭实拍视角，或地图沿真实高速公路动态生长。',
    isUploaded: false,
    videoFileName: 'shot_03_mountain_highway.mp4',
    autoTrimStartSeconds: 2.0,
    clipDurationSeconds: 4.5, // 135 帧
    transitionType: 'fade',
  },
  {
    id: 4,
    badge: 'SHOT #04',
    dialogue: '面朝浩瀚太平洋，桂滨的海风卷起五色石的呢喃。',
    sceneTitle: 'STOP 02 · 高知桂滨海岸',
    sceneType: 'map-poi-katsura',
    sceneDescription: '地图游标定格在高知桂滨海湾，弹出太平洋海滩与坂本龙马像卡片。',
    isUploaded: false,
    videoFileName: 'shot_04_katsurahama_beach.mp4',
    autoTrimStartSeconds: 1.2,
    clipDurationSeconds: 5.0, // 150 帧
    transitionType: 'slide',
  },
  {
    id: 5,
    badge: 'SHOT #05',
    dialogue: '不用赶时间，没有打卡清单，只是顺着海浪的声音往前走。',
    sceneTitle: '海滨漫步 · 特写慢动作',
    sceneType: 'video-scenery',
    sceneDescription: '海边堤坝人物背影漫步，夕阳洒在蔚蓝海面上。',
    isUploaded: false,
    videoFileName: 'shot_05_walking_ocean.mp4',
    autoTrimStartSeconds: 0.0,
    clipDurationSeconds: 4.0, // 120 帧
    transitionType: 'fade',
  },
  {
    id: 6,
    badge: 'SHOT #06',
    dialogue: '终点抵达松山道后，在三千年古汤木造楼阁前卸下风尘。',
    sceneTitle: 'STOP 03 · 松山道后温泉本馆',
    sceneType: 'map-poi-dogo',
    sceneDescription: '地图游标定格在爱媛松山，弹出千年木造温泉楼阁，行程进度达 100%。',
    isUploaded: false,
    videoFileName: 'shot_06_dogo_onsen.mp4',
    autoTrimStartSeconds: 1.5,
    clipDurationSeconds: 5.0, // 150 帧
    transitionType: 'slide',
  },
  {
    id: 7,
    badge: 'SHOT #07',
    dialogue: '旅行的意义不是去了哪里，而是找回感知世界的能力。下期见。',
    sceneTitle: '旅途总结 · 落日终章与全览',
    sceneType: 'video-outro',
    sceneDescription: '四国全岛全景收束定镜，伴随金色落日余晖与版权署名淡出。',
    isUploaded: false,
    videoFileName: 'shot_07_sunset_outro.mp4',
    autoTrimStartSeconds: 0.8,
    clipDurationSeconds: 4.5, // 135 帧
    transitionType: 'fade',
  },
];
