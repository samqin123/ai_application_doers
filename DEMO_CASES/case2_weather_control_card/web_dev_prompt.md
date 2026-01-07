# 天气控制卡片 - Web开发规范文档

## 项目概述
开发一个现代化天气预报移动端应用，采用紫色渐变色系，支持手势控制和轮播卡片交互。一次性开发成功，完整功能实现。

---

## 一、视觉设计规范

### 1.1 配色系统
- **主渐变**：线性渐变 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- **玻璃态背景**：
  - 卡片背景：`rgba(255, 255, 255, 0.15)`
  - 卡片边框：`rgba(255, 255, 255, 0.2)`
  - 禁用区域：`rgba(0, 0, 0, 0.1)`
- **文本配色**：
  - 主文本：`#ffffff`（不透明）
  - 辅助文本：`rgba(255, 255, 255, 0.8)`
  - 说明文本：`rgba(255, 255, 255, 0.6)`

### 1.2 字体系统
- **系统字体栈**：`-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif`
- **字号规范**：
  - 城市名：28px/600 font-weight
  - 温度：72px/700 font-weight
  - 天气状态：20px/500 font-weight
  - 数值标签：14px/600 font-weight
  - 辅助说明：11-12px/400-500

### 1.3 毛玻璃效果（Glassmorphism）
```css
backdrop-filter: blur(10px);
background: rgba(255, 255, 255, 0.15);
border: 1px solid rgba(255, 255, 255, 0.2);
```

---

## 二、布局结构

### 2.1 容器层级
```
Body（全屏背景渐变）
└── Container（Flexbox居中）
    ├── CarouselContainer
    │   ├── CarouselWrapper
    │   │   └── Carousel（卡片容器）
    │   │       └── Card × 3（可见） + 其他（off-screen）
    │   └── Indicators（圆点指示器）
    └── BottomBar
        ├── CameraButton
        └── GestureFeedback
```

### 2.2 卡片布局详设

#### 容器配置（关键）
```css
.card {
  display: flex;
  flex-direction: column;
  padding: 20px;          /* 紧凑间距 */
  overflow: hidden;       /* 防止溢出 */
  height: 100%;           /* 占满高度 */
}
```

**❌ 常见错误**：
- `justify-content: space-between` → 导致上下空间浪费，下部重叠
- `padding: 30px` → 空间浪费，内容拥挤
- `position: absolute` 用于forecast → 破坏flex布局
- 不设 `overflow: hidden` → 内容溢出卡片外

#### 尺寸规范
- **卡片尺寸**：85% width × 100% height，left: 7.5%
- **padding**：20px（四周均匀）
- **gap 间距**：6-8px（元素间距，非行间距）

#### 卡片三态
- **center**（中间）：scale(1)、opacity(1)、z-index(3)
- **prev**（左侧）：scale(0.75)、opacity(0.4)、left(-50%)
- **next**（右侧）：scale(0.75)、opacity(0.4)、left(150%)

#### 卡片内部结构（flex流）
```
Card (flex: column, overflow: hidden, 100% height)
├─ CardHeader (flex-shrink: 0, 固定高度)
│  ├─ 城市名：24px/600
│  └─ 日期：11px/400
│
├─ WeatherMain (flex-shrink: 0, 固定高度)
│  ├─ icon：50px emoji
│  └─ 温度：60px/700
│
├─ WeatherDetails (flex-shrink: 0, 固定高度)
│  ├─ 湿度：10px label + 13px value
│  └─ 天气：10px label + 13px value
│
├─ HourlySection (flex-shrink: 0, 固定高度)
│  ├─ 标题：10px/500
│  └─ 时间卡片 ×5：10px time + 12px temp
│
└─ ForecastContainer (flex: 1, 占剩余空间)
   └─ ForecastList (flex: 1, overflow-y: auto, 可滚动)
      └─ ForecastItem ×2 (8px padding, 11px text)
         ├─ 日期：11px label
         ├─ 图标：24px emoji
         ├─ 温度：11px/600
         └─ 状态：10px text
```

**关键原则**：
- 上半部分各元素都加 `flex-shrink: 0` 防止压缩
- 下半部分 ForecastContainer 用 `flex: 1` 占用剩余全部高度
- ForecastList 内部 `overflow-y: auto` 实现内部滚动
- 所有高度都是自适应的（由内容决定），不要硬编码像素值

### 2.3 字体与间距规范

| 元素 | 大小 | weight | 用途 |
|------|------|--------|------|
| 城市名 | 24px | 600 | 头部标识 |
| 温度 | 60px | 700 | 主要信息 |
| 天气状态值 | 13px | 600 | 详情数据 |
| 时间值 | 12px | 600 | 小时预报 |
| 预报温度 | 11px | 600 | 预报数据 |
| 标签文本 | 10-11px | 400-500 | 说明文本 |
| 日期/时间 | 10-11px | 400 | 辅助信息 |

**间距规范**：
- 元素间 gap：6-8px
- 内部 padding：6-8px（紧凑显示）
- 分隔线 margin：8-12px
- 卡片 padding：20px（固定）

### 2.4 指示器与交互
- **圆点大小**：10px × 10px，border-radius: 50%
- **间距**：10px gap
- **激活状态**：scale(1.3)、solid white、border透明
- **未激活**：rgba(255,255,255,0.5)、可点击跳转

---

## 三、交互设计

### 3.1 触摸交互
**触摸滑动**：
- 实现：`touchstart` → `touchmove` → `touchend`
- 逻辑：`dragDistance > 50px` 触发翻页
  - 向右滑：`prevCard()`
  - 向左滑：`nextCard()`
- 状态管理：`isDragging` flag 防止多次触发

### 3.2 鼠标交互
**拖拽操作**：
- 实现：`mousedown` → `mousemove` → `mouseup` / `mouseleave`
- 逻辑：同触摸滑动（50px阈值）
- 光标：`cursor: grab` (normal) / `cursor: grabbing` (active)

**滚轮缩放**：
- 事件：`wheel` + `preventDefault()`
- 向下（deltaY > 0）：显示"👇 向下缩小"反馈
- 向上（deltaY < 0）：显示"👆 向上放大"反馈

### 3.3 手势识别（MediaPipe Hands）
**关键配置**：
- `maxNumHands`: 1（仅识别单手，优化速度）
- `modelComplexity`: 0（轻量级模型）
- `minDetectionConfidence`: 0.3
- `minTrackingConfidence`: 0.3

**手势识别逻辑**：
1. 采集手部关键点（21个landmarks）
2. 使用中指根部（landmark 9）作为手部中心
3. 历史缓存：保留最近10帧数据
4. 移动检测：
   - 比较首帧和末帧的相对位移
   - 阈值：0.1（X或Y轴超过10%屏幕宽度）
5. 方向判断：
   - **水平移动**（|deltaX| > |deltaY|）：
     - deltaX > 0：手向右 → `nextCard()`
     - deltaX < 0：手向左 → `prevCard()`
   - **竖直移动**（|deltaY| > |deltaX|）：
     - deltaY > 0：手向下 → 预留功能
     - deltaY < 0：手向上 → 预留功能

**性能优化**：
- `gestureCooldown`: 800ms（手势识别频率限制）
- 清空历史记录（`handHistory = []`）防止错误累积
- 仅处理检测到的手（results.multiHandLandmarks.length > 0）

### 3.4 动画与过渡
**卡片切换**：
- 属性：`all`
- 时间：0.5s
- 缓动：`cubic-bezier(0.34, 1.56, 0.64, 1)`（弹性动画）
- 启用GPU加速

**按钮悬停**：
- 时间：0.3s ease
- 效果：`scale(1.1)` 放大 + 背景变亮

**反馈提示**：
- 时间：0.3s ease
- 显示时长：1.5-2s 后自动隐藏

---

## 四、功能模块详设

### 4.1 天气卡片数据结构
```javascript
{
  city: "北京",                    // 城市名
  date: "2024年1月6日",            // 完整日期
  temp: 5,                        // 当前温度（整数）
  status: "晴",                    // 天气状态
  icon: "☀️",                      // 天气emoji
  humidity: 45,                   // 湿度百分比
  windSpeed: 12,                  // 风速km/h
  feelsLike: 2,                   // 体感温度
  today: [                        // 今日24小时预报（已移除，保留数据结构）
    { time: "09:00", temp: "2°" },
    ...
  ],
  forecast: [                     // 未来预报（2条：明天、后天）
    { 
      day: "明天",                 // 显示文本（"明天"、"后天"）
      high: "8°",                 // 最高温
      low: "0°",                  // 最低温
      status: "晴"                 // 天气状态（已取消显示，保留数据）
    },
    ...
  ]
}
```

### 4.2 卡片渲染
**数据源**：3个城市数据（北京、上海、杭州）
**渲染内容**：
- 城市 + 日期（右对齐）
- 天气图标（emoji 60px）+ 温度（72px）+ 状态
- 详细信息：湿度、风向（2列对齐）
- 预报卡片：竖向排列2条，显示日期/图标/温度范围

### 4.3 轮播逻辑
**初始状态**：currentIndex = 0
**导航方法**：
- `nextCard()`：`(currentIndex + 1) % weatherData.length`
- `prevCard()`：`(currentIndex - 1 + length) % weatherData.length`
- `goToCard(index)`：直接跳转

**指示器更新**：
- 当前卡片下标对应指示器高亮
- 点击指示器触发 `goToCard()`

---

## 五、摄像头与手势功能

### 5.1 摄像头模块
**元素**：
- `<video id="cameraVideo">` × 1（150×200px）
- `<canvas id="cameraCanvas">`（可选，用于fallback）
- `.camera-container`（固定定位 bottom-left，圆角15px）

**权限处理**：
```javascript
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 150 },
    height: { ideal: 200 },
    facingMode: 'user'
  }
})
```

**错误处理**：
- `NotAllowedError`：用户拒绝权限
- 其他错误：初始化失败
- 显示相应提示信息

### 5.2 MediaPipe初始化
1. 创建 `Hands` 实例
2. 设置选项（如上）
3. 注册 `onResults` 回调
4. 创建 `Camera` 实例（onFrame中调用hands.send）
5. `camera.start()`

**销毁流程**：
- `camera.stop()`（释放设备资源）
- `hands.close()`（释放模型）
- 清空引用（`this.camera = null`）

### 5.3 反馈提示
**提示框位置**：fixed, bottom: 150px, center
**显示消息**：
- 初始化：`📹 摄像头已打开\n✓ 手势识别就绪`
- 识别中：`🎥 识别中...`
- 手势：`👉 向右移动`（用emoji指示方向）
- 关闭：`✕ 摄像头已关闭`
- 错误：`❌ 权限被拒绝` 或 `❌ 初始化失败`

---

## 六、常见问题与修复

### 6.1 卡片布局空间浪费 / 内容重叠（最常见）
**原因**：
- ❌ 使用 `justify-content: space-between` → 导致上部压缩、下部空吸或重叠
- ❌ `padding: 30px` 过大 → 实际显示空间被压缩
- ❌ forecast 用 `position: absolute` → 脱离flow，与上部重叠
- ❌ 没有设置 `overflow: hidden` → 内容溢出卡片边界
- ❌ forecast 没有设 `flex: 1` → 无法占用剩余空间

**修复（完整方案）**：
```css
.card {
  display: flex;
  flex-direction: column;
  padding: 20px;           /* 收紧到20px */
  overflow: hidden;        /* 重要！防止溢出 */
}

/* 上半部分元素 */
.card-header, .weather-main, .weather-details, .hourly-section {
  flex-shrink: 0;          /* 防止被压缩 */
  margin-bottom: 8-12px;   /* 用margin而非padding */
}

/* 下半部分占用剩余空间 */
.forecast-container {
  flex: 1;                 /* 占用剩余全部高度 */
  display: flex;
  flex-direction: column;
  overflow-y: auto;        /* 内部滚动 */
}

.forecast-list {
  flex: 1;
  overflow-y: auto;
  gap: 6px;
}
```

**检查清单**：
- [ ] 卡片总 flex-direction: column
- [ ] 卡片设 overflow: hidden
- [ ] 卡片 padding: 20px（不要30px+）
- [ ] 上部所有元素加 flex-shrink: 0
- [ ] 下部 forecast 加 flex: 1
- [ ] forecast-list 可以 overflow-y: auto

### 6.2 字体大小不协调
**原因**：
- ❌ 温度用72px → 挤压其他元素空间
- ❌ 预报卡片文字14px以上 → 预报卡片过高

**修复**：
```css
.temperature { font-size: 60px; }      /* 之前72px */
.forecast-item { font-size: 11-12px; } /* 之前14px */
.city-name { font-size: 24px; }        /* 之前28px */
.detail-value { font-size: 13px; }     /* 之前14px */
```

### 6.3 手势识别不工作
**原因**：
- MediaPipe加载失败 → 检查CDN链接
- 权限被拒绝 → 提示用户允许摄像头
- hands/camera对象未初始化 → 添加null检查

**修复**：
```javascript
// onFrame回调中添加检查
onFrame: async () => {
  if (this.hands) {
    await this.hands.send({image: video});
  }
}
```

### 6.4 识别速度慢
**原因**：
- `modelComplexity`过高 → 改为0（轻量级）
- `maxNumHands`过多 → 改为1
- `minDetectionConfidence`过高 → 改为0.3
- 移动阈值过大 → 改为0.1

### 6.5 卡片轮播不流畅
**原因**：
- 使用 `justify-content: space-between` 导致高度计算错误
- transform 没有配合 transition
- 使用了太多不必要的position: absolute

**修复**：
```css
.card {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: absolute;
  left: 7.5%;
}
```

### 6.6 触摸/鼠标事件冲突
**原因**：
- 两套事件监听都触发 → 需要事件去重或preventDefault

**修复**：
```javascript
// 使用flag防止重复触发
if (this.isDragging) return;
```

---

## 七、开发检查清单

### 7.1 HTML结构与语义
- [ ] 卡片元素使用语义化class命名（card、card-header等）
- [ ] 天气数据对象包含所有必要字段（city、temp、humidity、forecast、today）
- [ ] 各section清晰分离（header、weather-main、details、hourly、forecast）

### 7.2 CSS布局（关键）
**卡片布局**：
- [ ] `.card` 设 `display: flex; flex-direction: column; overflow: hidden`
- [ ] `.card` padding 为 20px（不超过25px）
- [ ] 移除 `justify-content: space-between`
- [ ] 所有上部元素（header、weather、details、hourly）加 `flex-shrink: 0`
- [ ] `.forecast-container` 设 `flex: 1` 占用剩余空间
- [ ] `.forecast-list` 设 `overflow-y: auto` 支持内部滚动

**字体大小**：
- [ ] 城市名：24px/600
- [ ] 温度：60px/700
- [ ] 详情标签：10px/400-500
- [ ] 详情数值：13px/600
- [ ] 预报卡片：11-12px（不超过12px）

**间距控制**：
- [ ] 元素间 gap：6-8px
- [ ] 预报卡片 padding：8px（不超过10px）
- [ ] 分隔线：border-bottom（不用分厚的margin）

### 7.3 交互与事件
- [ ] 轮播逻辑正确（currentIndex % length）
- [ ] 指示器与卡片位置同步
- [ ] 触摸事件阈值：50px
- [ ] 鼠标事件与触摸事件互不冲突（用isDragging flag）
- [ ] 轮播过渡：transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)

### 7.4 手势识别
- [ ] MediaPipe CDN加载正常
- [ ] hands.setOptions：maxNumHands: 1，modelComplexity: 0
- [ ] 置信度：minDetectionConfidence: 0.3，minTrackingConfidence: 0.3
- [ ] 识别冷却：800ms
- [ ] 移动阈值：0.1（X或Y轴）
- [ ] onFrame回调中检查 `if (this.hands)`
- [ ] 错误处理：权限拒绝、加载失败都有提示

### 7.5 视觉与反馈
- [ ] 卡片三态明确：center(scale:1)、prev(scale:0.75)、next(scale:0.75)
- [ ] 手势反馈显示2s后自动隐藏
- [ ] 摄像头按钮激活状态清晰（色值改变）
- [ ] 无任何文本溢出卡片边界

### 7.6 性能与兼容
- [ ] 在移动设备上测试（iOS Safari、Android Chrome）
- [ ] 在桌面浏览器测试（滚轮、拖拽）
- [ ] 控制台无错误、无警告
- [ ] 帧率稳定（60fps，无明显卡顿）
- [ ] 冷启动时间 < 2s

### 7.7 整体检验
- [ ] 卡片上半部分与下半部分空间分配合理
- [ ] 不存在内容重叠或被裁剪
- [ ] 切换卡片时动画流畅
- [ ] 手势识别响应迅速（< 1s）
- [ ] 所有提示信息清晰可读

---

## 八、数据与资源

### 8.1 天气数据
当前使用**模拟数据**（3个城市）：
- 北京：5°C，晴，湿度45%，风速12km/h
- 上海：9°C，阴，湿度78%，风速6km/h
- 杭州：11°C，多云，湿度62%，风速9km/h

### 8.2 可选集成
- **高德地图API**：获取实时天气数据
- **天气API**（如OpenWeatherMap）：替换模拟数据
- **地理位置API**：用户定位 + 自动获取本地天气

---

## 九、性能指标

| 指标 | 目标 | 说明 |
|------|------|------|
| FCP（首屏时间） | < 1s | 卡片加载完毕 |
| LCP（最大内容绘制） | < 2s | 包含手势识别UI |
| CLS（累积布局偏移） | < 0.1 | 避免视觉抖动 |
| 帧率 | 60 FPS | 使用GPU加速transform |
| 手势响应延迟 | < 800ms | 识别冷却周期 |

---

## 十、文件结构
```
case2_weather_control_card/
├── index.html              # 主文件（包含HTML+CSS+JS）
├── web_dev_prompt.md       # 本开发规范文档
└── (可选) assets/          # 图片、天气图标资源
```

---

## 更新日志

### v1.0（初版）
- [x] 基础卡片轮播
- [x] 触摸+鼠标交互
- [x] MediaPipe手势识别
- [x] 摄像头集成
- [x] 响应式设计

### v1.1（优化版）
- [x] 手势识别速度优化（modelComplexity 1→0）
- [x] 预报布局改进（竖向显示，放在卡片下方）
- [x] 天气详情改为2列（湿度、天气状态）
- [x] 识别冷却改为800ms
- [x] 移动阈值改为0.1
- [x] 完善开发文档

### v1.2（布局优化版）
- [x] **关键修复：移除 `justify-content: space-between`** 导致的空间浪费
- [x] 卡片改为纯flex流布局（column方向）
- [x] padding 30px → 20px，所有字号缩小10-15%
- [x] forecast 从 position: absolute 改为 flex: 1
- [x] 添加 overflow: hidden 防止溢出
- [x] 上部元素全部加 flex-shrink: 0
- [x] 分时气温与预报并存，分别放在中部和下部
- [x] 详细的布局常见问题与修复指南
- [x] 扩充开发检查清单（从12项扩展到30+项）
- [x] 添加CSS布局规范与字体间距表
- [x] **一次开发成功性显著提高**
