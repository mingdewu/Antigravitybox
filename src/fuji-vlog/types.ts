export type GearType =
  | '微单 + 24-70mm 标准变焦'
  | '微单 + 70-200mm 长焦'
  | '微单 + 大光圈定焦'
  | '微单 + 三脚架固定'
  | '手机 + 手持稳定器'
  | '手机 + 车载支架 POV';

export interface FujiShotItem {
  /** 镜头编号，如 "S1-01" */
  id: string;
  /** 所属阶段 ID，如 "stage1" */
  stageId: string;
  /** 保存的视频文件名（位于 public/fuji/ 目录下） */
  fileName: string;
  /** 拍摄时间窗口（配合一日自驾光线） */
  timeWindow: string;
  /** 拍摄地点 */
  location: string;
  /** 拍摄画面内容与动作设计 */
  subject: string;
  /** 器材与焦段建议 */
  gear: GearType;
  /** 景别与拍摄角度 */
  angle: string;
  /** 运镜方式与动静 */
  movement: string;
  /** 成片剪辑时长（秒） */
  durationSec: number;
  /** 建议现场实拍时长（秒，含首尾余量 Handles） */
  recommendedShootSec: number;
  /** 电影感旁白文案（留空则为纯环境音 ASMR 空镜） */
  voiceover: string;
  /** 镜头间转场类型 */
  transitionAfter?: 'fade' | 'slide' | 'none';
  /** 实拍完成后设为 true 即可自动加载 public/fuji/ 下的真实视频 */
  isUploaded?: boolean;
  /** 原视频截取起点（帧） */
  startFrom?: number;
}

export interface FujiStageConfig {
  stageId: string;
  stageNumber: string;
  titleCn: string;
  titleEn: string;
  timeRange: string;
  routeSummary: string;
  bgmMood: string;
  shots: FujiShotItem[];
}
