export type SceneCategory =
  | 'map-intro'       // 场景：地图宏观航拍巡航
  | 'map-poi-naruto'  // 场景：地图鸣门海峡特写
  | 'photo-transport' // 场景：交通行进图片展示
  | 'map-poi-katsura' // 场景：地图高知桂滨特写
  | 'photo-scenery'   // 场景：自然风光图片展示
  | 'map-poi-dogo'    // 场景：地图道后温泉特写
  | 'photo-outro';    // 场景：旅途收尾图片展示

export type PhotoKenBurnsEffect = 'zoom-in' | 'zoom-out' | 'pan-right' | 'subtle-float';

export interface DatabaseRowItem {
  /** 1. 编号：1 到 7 */
  id: number;
  badge: string;

  /** 2. 台词 / 旁白解说文案 */
  dialogue: string;

  /** 3. 对应场景描述与类型 */
  sceneTitle: string;
  sceneType: SceneCategory;
  sceneDescription: string;

  /** 4. 右侧是否上传图片与 16:9 自动剪辑适配 */
  isPhotoUploaded: boolean;
  photoFileName: string;          // 对应 public/photos/ 下的文件名 (如 shot_01.jpg)
  photoEffect: PhotoKenBurnsEffect; // 16:9 电影微推镜动效
  clipDurationSeconds: number;    // 该图片展示时长（秒）
  transitionType: 'fade' | 'slide' | 'wipe';
}

export interface DatabaseVideoConfig {
  projectName: string;
  fps: number;
  rows: DatabaseRowItem[];
}
