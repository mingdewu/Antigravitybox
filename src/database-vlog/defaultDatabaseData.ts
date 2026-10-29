import { DatabaseRowItem } from './types';

/**
 * 数据库分镜配置表 (第一阶段：图片上传与 16:9 自动剪辑适配)
 * 无论上传的是手机 4:3、竖屏 9:16 还是单反 3:2 照片，引擎均会自动裁剪为标准的 16:9 电影画幅并施加缓慢推镜头！
 */
export const DEFAULT_DATABASE_ROWS: DatabaseRowItem[] = [
  {
    id: 1,
    badge: 'SHOT #01',
    dialogue: '逃离城市的最快方式，就是只带一台相机出发。',
    sceneTitle: '启程启航 · 四国全岛全景',
    sceneType: 'map-intro',
    sceneDescription: '卫星地图宏观俯瞰，红色导航路线与信息栏展开，游标就位。',
    isPhotoUploaded: false,
    photoFileName: 'shot_01_camera.jpg',
    photoEffect: 'zoom-in',
    clipDurationSeconds: 4.0, // 120 帧
    transitionType: 'fade',
  },
  {
    id: 2,
    badge: 'SHOT #02',
    dialogue: '第一站来到鸣门海峡，俯瞰奔腾澎湃的大漩涡。',
    sceneTitle: 'STOP 01 · 鸣门海峡大漩涡',
    sceneType: 'map-poi-naruto',
    sceneDescription: '地图游标定格德岛鸣门，弹出鸣门漩涡图文卡片，信息栏高亮。',
    isPhotoUploaded: false,
    photoFileName: 'shot_02_naruto.jpg',
    photoEffect: 'subtle-float',
    clipDurationSeconds: 5.0, // 150 帧
    transitionType: 'slide',
  },
  {
    id: 3,
    badge: 'SHOT #03',
    dialogue: '穿过险峻峡谷的山野公路，窗外的大山逐渐变成了太平洋。',
    sceneTitle: '跨山公路 · 蜿蜒盘山公路实拍图',
    sceneType: 'photo-transport',
    sceneDescription: '四国中央山地公路穿越，航拍弯道或车窗抓拍照片。',
    isPhotoUploaded: true, // 开启 16:9 实拍图片剪辑演示
    photoFileName: 'shot_03_highway.jpg',
    photoEffect: 'zoom-out',
    clipDurationSeconds: 4.5, // 135 帧
    transitionType: 'fade',
  },
  {
    id: 4,
    badge: 'SHOT #04',
    dialogue: '面朝浩瀚太平洋，桂滨的海风卷起五色石的呢喃。',
    sceneTitle: 'STOP 02 · 高知桂滨海岸',
    sceneType: 'map-poi-katsura',
    sceneDescription: '地图游标定格高知桂滨，弹出太平洋海滩与坂本龙马像卡片。',
    isPhotoUploaded: false,
    photoFileName: 'shot_04_katsurahama.jpg',
    photoEffect: 'zoom-in',
    clipDurationSeconds: 5.0, // 150 帧
    transitionType: 'slide',
  },
  {
    id: 5,
    badge: 'SHOT #05',
    dialogue: '不用赶时间，没有打卡清单，只是顺着海浪的声音往前走。',
    sceneTitle: '海滨漫步 · 蔚蓝浪花与沙滩特写',
    sceneType: 'photo-scenery',
    sceneDescription: '太平洋岸边沙滩漫步或落日浪花实拍照片。',
    isPhotoUploaded: false,
    photoFileName: 'shot_05_beach_walk.jpg',
    photoEffect: 'pan-right',
    clipDurationSeconds: 4.0, // 120 帧
    transitionType: 'fade',
  },
  {
    id: 6,
    badge: 'SHOT #06',
    dialogue: '终点抵达松山道后，在三千年古汤木造楼阁前卸下风尘。',
    sceneTitle: 'STOP 03 · 松山道后温泉本馆',
    sceneType: 'map-poi-dogo',
    sceneDescription: '地图游标定格爱媛松山，弹出千年木造温泉楼阁，行程进度达 100%。',
    isPhotoUploaded: false,
    photoFileName: 'shot_06_dogo_onsen.jpg',
    photoEffect: 'zoom-in',
    clipDurationSeconds: 5.0, // 150 帧
    transitionType: 'slide',
  },
  {
    id: 7,
    badge: 'SHOT #07',
    dialogue: '旅行的意义不是去了哪里，而是找回感知世界的能力。下期见。',
    sceneTitle: '旅途总结 · 落日终章与全岛全览',
    sceneType: 'photo-outro',
    sceneDescription: '四国全岛全景收束定镜，伴随金色落日余晖与版权署名淡出。',
    isPhotoUploaded: false,
    photoFileName: 'shot_07_sunset.jpg',
    photoEffect: 'subtle-float',
    clipDurationSeconds: 4.5, // 135 帧
    transitionType: 'fade',
  },
];
