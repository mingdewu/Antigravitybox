export type SceneCategory =
  | 'map-intro'       // 场景：地图宏观航拍巡航
  | 'map-poi-naruto'  // 场景：地图鸣门海峡特写
  | 'video-transport' // 场景：交通行进实拍
  | 'map-poi-katsura' // 场景：地图高知桂滨特写
  | 'video-scenery'   // 场景：自然风光实拍
  | 'map-poi-dogo'    // 场景：地图道后温泉特写
  | 'video-outro';    // 场景：旅途收尾实拍

export interface DatabaseRowItem {
  /** 1. 编号：1 到 7 */
  id: number;
  /** 编号显示徽标 */
  badge: string;
  /** 2. 台词 / 旁白解说文案 */
  dialogue: string;
  /** 3. 对应场景描述与类型 */
  sceneTitle: string;
  sceneType: SceneCategory;
  sceneDescription: string;
  /** 4. 视频上传与自动剪辑 */
  isUploaded: boolean;
  videoFileName: string;       // 对应 public/shots/ 下的文件名
  autoTrimStartSeconds: number; // 自动剪辑裁切起始秒数
  clipDurationSeconds: number;  // 剪辑片段时长（秒）
  transitionType: 'fade' | 'slide' | 'wipe';
}

export interface DatabaseVideoConfig {
  projectName: string;
  fps: number;
  rows: DatabaseRowItem[];
}
