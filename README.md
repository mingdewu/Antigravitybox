# Remotion 地图行程漫游讲解视频引擎 (GeoExplainer)

基于 **Remotion 4.0 + React 19 + MapLibre GL JS + Turf.js** 构建的高度模块化、影视级地理漫游视频生成模板。

适用于旅游 Vlog、地理科普、自驾路线解析、户外探险纪录片等场景。

---

## 🌟 核心特性

- **高精卫星底图与矢量底板**：集成全球高清晰度真实卫星影像（ESRI World Imagery）与离线矢量海岸线、经纬网。
- **100% 真实公路导航轨迹**：告别生硬直线，路线紧贴真实高速公路、盘山山路与沿海大道蜿蜒延伸。
- **MapLibre 原生 WebGL 渲染**：路线与游标直接由 MapLibre 内部相机矩阵在 GPU 中以微米级精度咬合底图，杜绝任何像素级偏移。
- **纪录片级动态叙事节奏**：
  - **行进阶段**：红线平滑穿山越水，左上角信息栏自动变为半透明通透态，右上角卡片收缩，全屏视野留给震撼卫星地貌；
  - **讲解阶段**：游标自动定格暂停，左上角信息栏放大高亮，右上角照片卡片以弹簧物理动效（Spring）弹出，便于图文聚焦解说。
- **完全解耦与可插拔设计**：只需修改或传入 `TourConfig` 配置文件，即可一键切换为任意国家、城市或自驾路线（如新疆独库公路、川西 318、冰岛一号公路等）。
- **零商业依赖、零费用**：核心地图、路网、计算库全部基于开源与公开规范，无需申请付费 API Key。

---

## 📁 核心架构

```text
src/geo-explainer/
├── types.ts                    # 核心数据契约 (TourConfig, RouteConfig, POIItem)
├── GeoExplainer.tsx            # 顶层主装 Composition (时间线分段控制与动效插值)
├── config/
│   ├── demoTourData.ts         # 演示数据集 (四国经典 30 秒漫游样例)
│   └── shikokuRealRoute.ts     # 真实道路经纬度序列 (317km 真实公路路网)
├── components/
│   ├── MapBackground2D.tsx     # MapLibre WebGL 卫星底图与原生 GeoJSON 路线引擎
│   ├── VectorMapPlate.tsx      # 离线矢量经纬网与海陆边界发光底板
│   ├── SideInfoPanel.tsx       # 左上角磨砂玻璃动态信息面板 (里程/打卡联动)
│   ├── PhotoCard.tsx           # 右上角实拍照片解释卡片 (弹簧进退场)
│   ├── SubtitleOverlay.tsx     # 底部对齐字幕层
│   └── AttributionBadge.tsx    # 地图数据来源合规标注
└── utils/
    └── geoUtils.ts             # Turf.js 测地线计算、路径切片与游标提取
```

---

## 🚀 快速上手

### 1. 安装依赖

```bash
npm install
```

### 2. 启动实时交互预览 (Remotion Studio)

```bash
npm run dev
# 或
npx remotion studio
```

在打开的浏览器界面中选择左侧的 **`GeoTour30s`** 即可拖动时间轴实时检视！

### 3. 一键导出渲染 MP4 视频

```bash
npx remotion render GeoTour30s out/geo-tour.mp4
```

---

## 🛠️ 更换自驾路线

我们在 `scripts/fetch-real-route.mjs` 中提供了通用路网抓取工具。只需传入任意地点的经纬度列表，即可基于开源路网引擎自动生成真实公路轨迹：

```bash
node scripts/fetch-real-route.mjs
```

---

## 📜 许可证

本项目基于 [MIT License](LICENSE) 开源。
