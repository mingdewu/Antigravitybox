import { DatabaseRowItem } from './types';
import databaseRows from './database_rows.json';

/**
 * 数据库分镜配置表 (支持任意 N 个分镜的动态扩展、增删与自由调整)
 * 无论上传的是手机 4:3、竖屏 9:16 还是单反 3:2 照片，引擎均会自动裁剪为标准的 16:9 电影画幅并施加缓慢推镜头！
 */
export const DEFAULT_DATABASE_ROWS: DatabaseRowItem[] = databaseRows as DatabaseRowItem[];
