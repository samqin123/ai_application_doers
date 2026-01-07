# 红楼梦人物关系图谱 3D 互动网页 - 开发设计文档

## 1. 项目概述

开发一个互动网页，主题是红楼梦小说中的人物图谱关系，具有 3D 可视化效果、紫色科幻感设计、手势控制交互。

**核心特性**：
- 3D 人物关系图谱可视化
- 手势识别控制（旋转、缩放、选择）
- 摄像头实时输入处理
- 响应式设计，支持桌面和移动端

---

## 2. 技术栈

### 前端框架
- **核心框架**: React 18+ （推荐） + TypeScript
- **3D 引擎**: Three.js （物理引擎可选：Cannon.js）
- **手势识别**: MediaPipe Hands （实时性强、准确度高）或 TensorFlow.js HandPose
- **样式**: Tailwind CSS + CSS-in-JS（styled-components 或 CSS Modules）

### 构建工具
- Vite 或 Create React App
- 确保 Three.js 模块化导入优化性能

### 浏览器需求
- 需要 WebRTC 权限（访问摄像头）
- GPU 加速支持（WebGL 2.0）
- Chrome/Edge/Firefox 最新版本

---

## 3. 前端开发指导（使用 frontend-design 技能）

### 3.1 设计理念
根据 frontend-design 技能，设计应遵循以下原则：

#### 美学方向：**紫色赛博朋克 × 优雅极简**
- **配色**：深紫色背景（#1a0033）+ 霓虹紫蓝（#9d4edd）+ 亮紫（#c77dff）+ 白色文字（#f0f0f0）
- **字体选择**：
  - 显示字体（标题）：使用几何感 sans-serif，如 `Space Mono`, `IBM Plex Mono`
  - 正文字体：`Inter`, `Roboto` 等现代无衬线
  - **特色字体**：考虑中文特色字体，如霞鹜文楷 或 思源黑体
- **视觉层次**：节点采用玻璃态效果（glassmorphism）、背景粒子动画、霓虹边光

#### 品牌形象
- 紫色渐变背景 + 星空粒子效果
- 节点采用发光球体设计，点击时产生脉冲波纹
- UI 控制面板采用毛玻璃风格（backdrop-filter）

### 3.2 关键 UI 组件设计

#### 摄像头授权面板
```
┌─────────────────────────────────┐
│  摄像头权限请求                  │
│                                 │
│  需要访问您的摄像头以识别手势   │
│  [允许] [拒绝] [不再提示]        │
│                                 │
│  隐私提示：手势数据仅在本地处理  │
└─────────────────────────────────┘
```

#### 实时手势识别状态指示
- 顶部状态栏：摄像头连接状态 / 手势识别帧率 / 置信度
- 摄像头预览窗口（可隐藏）：显示手部轮廓骨骼

#### 人物信息卡片
- 半透明卡片，显示人物名字、身份、主要关系
- 关闭按钮 + 信息展开/折叠

### 3.3 交互设计

| 交互 | 手势 | 对应动作 |
|------|------|--------|
| 旋转 | 单手左右移动 | 3D 场景绕 Y 轴旋转 |
| 缩放 | 双手指开合 | 沿 Z 轴缩放（距离为 10-500px） |
| 选择 | 手掌晃动 | 获取当前鼠标位置附近的节点（射线检测） |
| 重置 | 两只手相近（<50px） | 重置视图到默认位置 |

---

## 4. 数据结构设计

### 4.1 人物节点数据
```typescript
interface CharacterNode {
  id: string;                    // 唯一标识
  name: string;                  // 人物名字
  alias: string[];               // 别名 (如：林妹妹、颦儿)
  role: 'major' | 'minor';      // 重要性：主角/配角
  family: string;                // 家族
  personality: string[];         // 性格标签
  introduction: string;          // 人物介绍
  firstAppearance: number;       // 首次出场章节
  deathChapter?: number;         // 死亡章节（如有）
  imageUrl?: string;             // 人物画像 URL
  position: THREE.Vector3;       // 3D 空间位置（自动计算）
  color: string;                 // 节点颜色（按身份）
}
```

### 4.2 关系边数据
```typescript
interface Relationship {
  source: string;                // 源人物 ID
  target: string;                // 目标人物 ID
  type: 'family' | 'love' | 'conflict' | 'neutral'; // 关系类型
  description: string;           // 关系描述
  strength: number;              // 关系强度 (0-1)
  chapters: number[];            // 涉及章节
}
```

### 4.3 图谱全局配置
```typescript
interface GraphConfig {
  nodeCount: number;             // 总节点数
  relationshipCount: number;     // 总关系数
  layout: 'force-directed' | 'circular'; // 布局算法
  forcesConfig: {
    repulsion: number;           // 斥力强度
    attraction: number;          // 吸引力强度
    damping: number;             // 阻尼系数
  };
}
```

---

## 5. 核心功能模块

### 5.1 摄像头管理模块

#### 权限申请与管理
```
初始化 → 检查浏览器支持 → 请求权限 → 启动摄像头 → 设置分辨率
  ↓                                            ↓
[不支持] → 显示降级方案              错误处理 → 显示错误提示
```

**关键实现点**：
- ✅ 检查 `navigator.mediaDevices.getUserMedia()` 支持性
- ✅ 处理权限拒绝、超时、设备不可用等异常
- ✅ 支持权限已取消后的重新请求
- ✅ 摄像头资源释放（组件卸载时）
- ✅ 设置适当的分辨率（推荐 640x480，平衡性能和准确度）

#### 摄像头状态追踪
```typescript
enum CameraStatus {
  IDLE = 'idle',                 // 未初始化
  REQUESTING_PERMISSION = 'requesting',
  PERMISSION_GRANTED = 'granted',
  PERMISSION_DENIED = 'denied',
  STREAM_ACTIVE = 'active',
  ERROR = 'error'
}
```

#### 用户交互流程
1. 页面加载 → 询问是否启用手势控制
2. 用户点击"启用摄像头" → 浏览器权限提示
3. 用户允许 → 启动摄像头，显示实时预览（可选）
4. 手势识别开始 → 输出识别信息到日志
5. 用户点击"关闭摄像头" → 停止摄像头，释放资源

### 5.2 手势识别模块

#### MediaPipe Hands 集成
```
摄像头输入 → MediaPipe 检测手部关键点 → 手势分类 → 事件触发
     ↓
  21个手部关键点 (手腕、指尖、指根等)
```

**手势有效性验证**：
- ✅ **置信度检查**：MediaPipe 返回每个关键点的置信度（0-1），需 > 0.7
- ✅ **帧连续性**：检查相邻帧的关键点位移是否平滑（防止抖动）
- ✅ **手部完整性**：所有 21 个关键点必须被检测到
- ✅ **动作稳定性**：同一手势需持续 >= 3 帧才触发事件

#### 手势定义与验证

| 手势 | 判定条件 | 灵敏度 | 实现状态 |
|------|--------|------|--------|
| 单手左右移动 | 单手检测到，手心X轴移动 | 0.002倍数 | ✅ 已实现 |
| 单手上下移动 | 单手检测到，手心Y轴移动 | 0.002倍数 | ✅ 已实现 |
| 双手分离（放大） | scaleFactor > 1.02 或距离增加>15px | 1.08x缩放倍数 | ✅ 已优化 |
| 双手靠近（缩小） | scaleFactor < 0.98 或距离减少>15px | 1.08x缩放倍数 | ✅ 已优化 |
| 两指距离监测 | 实时显示两指间距和变化量 | 实时反馈 | ✅ 已优化 |

**伪代码示例**：
```javascript
validateGesture(landmarks, prevLandmarks) {
  // 1. 检查置信度
  if (landmarks.confidence < 0.7) return false;
  
  // 2. 检查手部完整性
  if (landmarks.length !== 21) return false;
  
  // 3. 检查帧连续性（防止跳跃）
  const displacement = calculateDisplacement(landmarks, prevLandmarks);
  if (displacement > THRESHOLD_MAX) return false; // 超过最大位移，视为异常
  
  // 4. 检查手势稳定性（帧缓存）
  gestureBuffer.push(landmarks);
  if (gestureBuffer.length < 3) return false;
  
  return true;
}
```

### 5.3 3D 可视化引擎

#### 力导向图布局（Force-Directed Layout）
```
优势：自然展现关系网络拓扑，相关的人物自动靠近
```

**算法流程**：
1. **初始化**：随机分配节点位置
2. **迭代计算**：
   - 斥力：节点间相互推开（库伦定律）
   - 吸引力：相连节点相互吸引（胡克定律）
   - 阻尼：减少振荡
3. **收敛判定**：速度 < 阈值时停止迭代

**性能优化**：
- 使用 Barnes-Hut 算法降低复杂度（O(n²) → O(n log n)）
- 增量更新（不每帧全量计算）
- GPU 加速（如使用 compute shaders）

#### 节点与边渲染

**节点（Sphere Geometry）**：
- 根据人物重要性调整大小：major (40) vs minor (25)
- 应用发光材质（emissive material）
- 颜色编码：
  - 贾府家族：#9d4edd (紫)
  - 林家：#c77dff (亮紫)
  - 宁府：#7209b7 (深紫)
  - 其他：#a0aec0 (灰)

**边（Line Segments）**：
- 根据关系强度调整线宽和颜色透明度
- 支持边标签（关系类型）悬停显示

#### 摄像头视图与手势映射

```
设备坐标系          → 归一化坐标 (0-1)  → 3D 场景坐标
(0,0) 左上角        → (0.5, 0.5) 中心    → 以 camera 为参考

手部位置 (x_hand, y_hand, confidence)
  ↓
旋转：Δx_hand → rotationY += Δx_hand * sensitivity
缩放：distance_hands → zoomFactor = 1 + (distance - initial_distance) * 0.001
```

### 5.4 人物信息面板

**显示内容**：
- 人物头像（如有）
- 姓名、别名、身份
- 简介（展开/折叠）
- 关键关系列表（点击可快速导航到相关人物）
- 章节信息（首出、死亡等）

**交互**：
- 点击节点弹出面板（射线检测 raycasting）
- 关闭按钮
- 面板可拖动（可选）
- 高亮显示相关连接

---

## 6. 摄像头授权与生命周期管理

### 6.1 权限状态流转图

```
┌─────────┐
│  IDLE   │ (初始状态)
└────┬────┘
     │ 用户点击"启用摄像头"
     ↓
┌─────────────────────┐
│ REQUESTING_PERMISSION│
└────┬────────────────┘
     │
     ├─ 用户允许 ──→ ┌────────────────────┐
     │               │ PERMISSION_GRANTED │
     │               └────┬───────────────┘
     │                    │ 启动摄像头流
     │                    ↓
     │               ┌────────────────┐
     │               │ STREAM_ACTIVE  │ ← → 手势识别运行
     │               └────┬───────────┘
     │                    │ 用户关闭
     │                    ↓
     │               ┌────────────────┐
     │               │ STREAM_CLOSED  │
     │               └────────────────┘
     │
     ├─ 用户拒绝 ──→ ┌─────────────────┐
     │               │ PERMISSION_DENIED│ → 显示降级方案
     │               └──────────────────┘
     │
     └─ 浏览器不支持 → ┌──────────┐
                      │  ERROR   │ → 显示错误信息
                      └──────────┘
```

### 6.2 资源清理检查表

| 操作 | 需要清理的资源 | 检查方式 |
|------|-----------|--------|
| 组件卸载 | mediaStream, 摄像头轨道 | 调用 `track.stop()` |
| 切换选项卡 | 暂停视频流 | `video.pause()` |
| 权限变更 | 重新初始化 | 监听 `permission-status` 事件 |
| 浏览器关闭 | 自动释放 | 浏览器原生处理 |

---

## 7. 手势识别有效性验证

### 7.1 多层次验证机制

#### 层级 1：原始数据验证
```javascript
function isValidFrame(landmarks) {
  // 检查是否检测到手部
  if (!landmarks) return false;
  
  // 检查关键点数量
  if (landmarks.length !== 21) return false;
  
  // 检查置信度
  return landmarks.every(point => point.confidence > 0.7);
}
```

#### 层级 2：稳定性验证（时间窗口）
```javascript
const GESTURE_BUFFER_SIZE = 5; // 帧缓冲区
const STABILITY_THRESHOLD = 0.1; // 位置变化阈值

function isGestureStable(buffer) {
  if (buffer.length < GESTURE_BUFFER_SIZE) return false;
  
  // 计算相邻帧的均方误差
  let mse = 0;
  for (let i = 1; i < buffer.length; i++) {
    const diff = calculatePointwiseDifference(buffer[i], buffer[i-1]);
    mse += diff * diff;
  }
  mse /= buffer.length;
  
  return mse < STABILITY_THRESHOLD;
}
```

#### 层级 3：动作意图识别
```javascript
function classifyGesture(landmarkDelta, gestureHistory) {
  // 基于关键点变化判断用户意图
  const palmMovementX = landmarkDelta.wrist.x;
  const fingerSpreadingDistance = calculateFingerSpread();
  const palmVelocity = calculateVelocity();
  
  if (Math.abs(palmMovementX) > 50 && gestureHistory.length >= 3) {
    return 'ROTATE'; // 旋转
  } else if (fingerSpreadingDistance > 30 && twoHandsDetected) {
    return 'SCALE'; // 缩放
  } else if (palmVelocity > 200 && palmVelocity.duration < 1000) {
    return 'SWING'; // 挥动/选择
  }
  
  return 'IDLE';
}
```

### 7.2 反馈机制

**可视化反馈**：
1. **置信度指示**：顶部状态栏显示当前识别置信度（颜色编码：绿≥0.8, 黄0.7-0.8, 红<0.7）
2. **手部骨骼渲染**：在摄像头预览中显示 21 个关键点和连接线
3. **动作识别反馈**：识别到有效动作时，UI 给出视觉反馈（高亮、动画）
4. **错误日志**：控制台输出识别失败原因（用于调试）

---

## 8. 交互过程中的信息完整性

### 8.1 关键数据流

```
用户手势
  ↓ [识别]
手势事件 { type, confidence, landmarks, timestamp }
  ↓ [验证]
有效性检查 { isValid, reason, suggestion }
  ↓ [映射]
3D 变换事件 { rotation, scale, selectTarget }
  ↓ [应用]
场景更新 → 渲染
  ↓ [反馈]
UI 更新 + 声音/动画反馈
```

### 8.2 事件日志系统

为了保证交互过程的可追踪性，实现事件日志：

```typescript
interface GestureEvent {
  timestamp: number;           // 事件发生时间戳
  type: 'ROTATE' | 'SCALE' | 'SELECT' | 'RESET'; // 手势类型
  confidence: number;          // 置信度 (0-1)
  metadata: {
    palmPosition: [x, y];
    handedness: 'left' | 'right' | 'both';
    frameDuration: number;     // 帧持续时间 (ms)
    validationStatus: 'valid' | 'invalid' | 'filtered';
    invalidReason?: string;    // 无效原因
  };
  result: {
    appliedAction: string;
    targetNode?: string;       // 如果是 SELECT，记录目标节点
    sceneState: {
      rotationY: number;
      zoomFactor: number;
    };
  };
}
```

### 8.3 UI 状态同步

```typescript
interface InteractionState {
  isHandDetected: boolean;     // 是否检测到手部
  detectedHandCount: number;   // 检测到的手数量
  activeGesture: string;       // 当前识别的手势
  selectedNode: CharacterNode | null;
  panelVisible: boolean;
  cameraActive: boolean;
  fps: number;                 // 实时帧率
  latency: number;             // 识别延迟 (ms)
}
```

### 8.4 错误恢复机制

| 异常情况 | 处理方案 | 用户提示 |
|---------|--------|--------|
| 摄像头断连 | 自动重连（最多 3 次） | "摄像头已断开，正在重连..." |
| 识别帧率下降 | 降低处理分辨率，保持实时性 | "识别速率：12 FPS（低）" |
| 置信度过低持续 | 提示用户调整光线或手势清晰度 | "请确保手部清晰可见" |
| 手势误识别 | 记录到本地，便于调试；提供手动纠正 | "长按可取消选择" |

---

## 9. 测试方案

### 9.1 单元测试（Unit Tests）

#### 手势识别模块
```
√ 手势有效性验证
  - 置信度检查：置信度 < 0.7 时返回 false
  - 帧连续性检查：位移过大时标记为异常
  - 手部完整性检查：缺失关键点时返回 false
  
√ 手势分类
  - 旋转：单手 X 轴移动 > 50px 时触发
  - 缩放：双手距离变化 > 30px 时触发
  - 挥动：Y 轴快速移动（0.3-1s）时触发
  
√ 稳定性计算
  - 缓冲区大小 >= 3 时开始计算
  - MSE < 0.1 时认为稳定
```

#### 数据结构模块
```
√ CharacterNode 初始化
  - 所有必填字段存在
  - 位置向量有效
  
√ Relationship 关系验证
  - source 和 target 存在
  - strength 在 0-1 范围内
  
√ 图谱构建
  - 节点数 = 预期数量
  - 边数 = 预期数量
  - 无重复关系
```

### 9.2 集成测试（Integration Tests）

#### 摄像头权限流程
```
测试用例 1：正常授权流程
  1. 页面加载 → 显示权限请求面板 ✓
  2. 用户点击"允许" → 摄像头启动 ✓
  3. 显示实时预览 + 手势识别状态 ✓
  4. 点击"关闭摄像头" → 资源释放 ✓

测试用例 2：权限拒绝
  1. 用户点击"拒绝" → 显示降级方案（键盘控制）✓
  2. 关闭提示后，图谱可用（不支持手势） ✓

测试用例 3：权限撤销
  1. 系统设置中撤销权限 → 自动检测失败 ✓
  2. 显示"需要重新授权"提示 ✓
  3. 用户可重新授权 ✓
```

#### 手势与 3D 场景交互
```
测试用例 1：旋转交互
  1. 单手左移 → 场景逆时针旋转 ✓
  2. 单手右移 → 场景顺时针旋转 ✓
  3. 旋转速度 = Δx * 灵敏度 ✓

测试用例 2：缩放交互
  1. 双手展开 → 场景放大 ✓
  2. 双手收拢 → 场景缩小 ✓
  3. 缩放范围限制在 0.5x - 3x ✓

测试用例 3：节点选择
  1. 识别到有效的手掌挥动 → 射线检测 ✓
  2. 击中节点 → 弹出信息面板 ✓
  3. 未击中 → 无反应 ✓

测试用例 4：双手复位
  1. 两只手靠近（距离 < 50px，持续 > 0.5s） → 视图复位 ✓
  2. 旋转、缩放归零，节点回到初始位置 ✓
```

#### 信息面板交互
```
测试用例 1：面板打开与关闭
  1. 点击节点 → 面板在右侧打开 ✓
  2. 面板显示完整信息（名字、身份、关系等）✓
  3. 点击关闭按钮 → 面板关闭，节点高亮解除 ✓

测试用例 2：关系导航
  1. 在面板中点击关联人物 → 快速导航到该节点 ✓
  2. 新节点面板打开，旧面板关闭 ✓

测试用例 3：信息完整性
  1. 验证所有人物节点信息完整（无缺失字段）✓
  2. 关系描述清晰、准确 ✓
```

### 9.3 性能测试（Performance Tests）

```
测试项                      目标                  验收标准
────────────────────────────────────────────────────────
手势识别帧率                30 FPS                >= 25 FPS
3D 场景渲染帧率             60 FPS                >= 50 FPS
摄像头延迟                  < 100ms               <= 150ms
识别到动作响应时间          < 200ms               <= 300ms
节点数 100+ 时性能          不明显掉帧            FPS > 40
内存占用                    < 200MB               <= 250MB
```

### 9.4 用户验收测试（UAT）

#### 场景 1：首次用户
```
1. 打开网页 → 清晰看到权限请求提示 ✓
2. 根据提示步骤操作 → 成功启用摄像头 ✓
3. 对摄像头做出手势 → 实时反馈（可视化指示）✓
4. 完成 3 个基本操作（旋转、缩放、选择）✓
```

#### 场景 2：高级用户
```
1. 快速切换不同节点 → 面板响应迅速，无卡顿 ✓
2. 长时间使用（>10 分钟）→ 无明显性能下降 ✓
3. 各类手势组合 → 系统稳定，无误识别 ✓
```

#### 场景 3：异常恢复
```
1. 摄像头被意外断开 → 自动重连，用户收到提示 ✓
2. 光线不足导致识别率下降 → 显示友好提示 ✓
3. 中途关闭权限 → 系统优雅降级 ✓
```

### 9.5 兼容性测试

| 浏览器 | 版本 | WebGL | MediaPipe | 测试状态 |
|--------|------|-------|-----------|---------|
| Chrome | 120+ | ✓ | ✓ | 优先支持 |
| Edge | 120+ | ✓ | ✓ | 支持 |
| Firefox | 121+ | ✓ | ✓ | 支持 |
| Safari | 17+ | ✓ | ✓ | 部分支持* |

*Safari 的 MediaPipe Hands 支持有限，可考虑 TensorFlow.js 方案

### 9.6 测试工具与环境

```
单元测试：Jest + React Testing Library
集成测试：Cypress / Playwright
性能测试：Chrome DevTools, Lighthouse
手势测试：物理手部 + 模拟工具（MediaPipe Holistic MP4 录像回放）
```

---

## 10. 开发流程建议

### 10.1 分阶段实现

**第 1 阶段：基础框架**
- [ ] React 项目初始化 + Three.js 集成
- [ ] 静态 3D 场景搭建（紫色背景、粒子效果、节点渲染）
- [ ] 基础交互（鼠标控制旋转、缩放）

**第 2 阶段：摄像头与手势**
- [ ] 摄像头权限管理 + 状态跟踪
- [ ] MediaPipe Hands 集成
- [ ] 手势识别与有效性验证

**第 3 阶段：高级交互**
- [ ] 手势映射到 3D 变换
- [ ] 节点选择 + 信息面板
- [ ] 关系导航

**第 4 阶段：优化与测试**
- [ ] 性能优化（LOD、缓存）
- [ ] 测试覆盖（单元 + 集成）
- [ ] 用户体验打磨

### 10.2 代码组织结构

```
src/
├── components/
│   ├── Canvas3D.tsx          // 3D 场景容器
│   ├── GestureOverlay.tsx    // 手势识别 UI
│   ├── InfoPanel.tsx         // 人物信息面板
│   ├── CameraPermission.tsx  // 摄像头授权对话框
│   └── StatusBar.tsx         // 实时状态栏
├── hooks/
│   ├── useCamera.ts          // 摄像头管理
│   ├── useGesture.ts         // 手势识别 Hook
│   └── useThreeScene.ts      // 3D 场景管理
├── services/
│   ├── mediaService.ts       // 摄像头、视频处理
│   ├── gestureService.ts     // 手势识别逻辑
│   └── graphService.ts       // 图谱数据 + 布局
├── utils/
│   ├── validation.ts         // 验证函数
│   ├── logger.ts             // 事件日志
│   └── constants.ts          // 常量定义
├── data/
│   ├── characters.json       // 人物数据
│   └── relationships.json    // 关系数据
└── styles/
    └── globals.css           // Tailwind + 全局样式
```

---

## 11. 已知风险与对策

| 风险 | 影响 | 对策 |
|------|------|------|
| 摄像头访问被拒 | 无法使用手势 | 提供键盘快捷键备选方案 |
| 手势误识别率高 | 交互体验差 | 增加验证阈值，添加用户反馈机制 |
| 3D 性能瓶颈 | 低端设备卡顿 | 实现 LOD，支持节点数量动态调整 |
| 浏览器兼容性 | 功能缺失 | 功能降级（失败时回到静态 2D 或鼠标控制） |

---

## 12. 总结检查清单

- [ ] 摄像头权限管理完整（申请、拒绝、撤销、重连）
- [ ] 手势有效性验证多层次（置信度、稳定性、意图识别）
- [ ] 交互信息完整（事件日志、状态追踪、错误恢复）
- [ ] 测试方案覆盖完全（单元、集成、性能、UAT、兼容性）
- [ ] 前端设计指导遵循 frontend-design 技能（紫色赛博朋克美学）
- [ ] 代码结构清晰、可维护性高
- [ ] 性能指标明确、可测量

---

---

## 13. 实现总结 - v3.0 版本

### 13.1 已完成的核心功能

#### ✅ 3D 图谱可视化
- **力导向布局**：节点自动分散，8秒后冻结位置以保持稳定性
- **丰富的视觉效果**：
  - 发光球体节点（MeshStandardMaterial）
  - 渐变背景与星空粒子动画
  - 三层点光源提供立体感
  - 雾效果增强深度感

#### ✅ 交互控制系统
- **鼠标控制**：
  - 拖拽旋转（Y-X轴）
  - Shift+拖拽旋转Z轴（翻滚）
  - 滚轮缩放（平滑过渡）
  - 左键点击选中节点

- **触摸控制**：
  - 单指拖拽：旋转
  - 两指捏合：缩放

- **手势识别控制**（摄像头）：
  - 单手移动：旋转X/Y轴
  - 双手开合：缩放

#### ✅ 人物节点显示
- **文本在球体中心**：使用Billboard效果，始终面向摄像机
- **动态字体大小**：根据文本长度自动调整
- **高对比度设计**：白色文字 + 黑色描边，确保清晰可读
- **根据重要度调整节点大小**

#### ✅ 右侧信息面板
- **完整展示信息**：人物名字、别名、身份、介绍、关系
- **点击节点触发**：快速定位和查看详情
- **关系导航**：点击相关人物快速跳转

#### ✅ 摄像头手势识别
- **MediaPipe Hands集成**：实时双手检测（最多2只手）
- **视觉反馈**：右上角摄像头预览 + 手势识别状态显示
- **启用/禁用切换**：左下角控制面板中的按钮控制
- **自动重连机制**：摄像头断开时重新连接

#### ✅ 用户界面
- **顶部搜索栏**：实时搜索人物名字和别名
- **右上角状态栏**：FPS显示
- **左下角控制面板**：重置视图 + 手势控制按钮（并排布局）
- **右下角统计信息**：人物数和关系数
- **底部交互提示**：清晰的操作说明（鼠标、键盘、触摸）
- **响应式设计**：适配桌面和移动设备

### 13.2 技术实现细节

#### 工作文件
| 文件 | 功能 |
|-----|------|
| `script.js` | 核心3D引擎 + 交互逻辑（约890行） |
| `gesture.js` | 摄像头 + 手势识别模块（约240行） |
| `data.js` | 红楼梦人物数据（自动生成） |
| `index.html` | UI布局 + 样式 |

#### 关键算法
- **力导向布局**：斥力 8000 + 极小吸引力 0.3 + 中心吸引 0.08
- **平滑缩放**：线性插值（lerp）速度 0.08
- **碰撞检测**：Three.js Raycaster 用于点击选择
- **Billboard效果**：文本网格使用 lookAt 始终面向摄像机

### 13.3 已验证的功能

- ✅ 3D图谱可缩放至0.3x-4x
- ✅ 三轴旋转完整支持（X/Y/Z轴）
- ✅ 文字在球体中央清晰显示
- ✅ 点击节点触发右侧信息面板
- ✅ 搜索功能高亮相关节点
- ✅ 摄像头手势识别可启用/禁用
- ✅ 触摸屏双指缩放支持
- ✅ 自动旋转功能（Y轴）

### 13.4 性能优化

#### 物理模拟优化
- **阻尼系数 0.995**：快速稳定图谱
- **速度限制 0.15**：缓慢平滑的运动
- **8秒后冻结**：节点位置保持不变
- **斥力 8000 + 吸引力 0.3**：保持节点分散

#### 渲染优化
- **Billboard动态更新**：每帧调整文字朝向
- **平滑缩放（Lerp）**：速度0.08，避免突变
- **欧拉角YXZ顺序**：避免万向锁

#### 手势识别优化
- **双手缩放阈值**：
  - 比例法：scaleFactor 1.02/0.98（降低3%→2%）
  - 绝对法：距离变化>15px额外触发
  - 缩放倍数：1.08x（提高灵敏度）
- **实时反馈**：显示两指距离和变化量

### 13.5 已知限制与改进空间

| 项目 | 当前状态 | 改进方向 |
|-----|--------|--------|
| 手势识别 | ✅ 旋转/缩放/实时反馈完整 | 可添加握拳、单指点击等高级手势 |
| 性能 | ✅ 29人物+35关系流畅运行 | 可优化至100+个节点 |
| 信息面板 | ✅ 基础信息 + 关系导航 | 可添加时间轴、出场章节等 |
| 缩放按钮 | ✅ 手势识别支持 | 可添加键盘快捷键（+/-） |
| 导出功能 | 暂无 | 可添加截图、数据导出功能 |

### 13.6 最新改进日志

#### v3.1 - 手势识别优化
- **双手缩放灵敏度提升**：
  - 阈值从 1.03/0.97 降低至 1.02/0.98
  - 添加绝对距离变化检测（>15px）
  - 缩放倍数从 1.05x → 1.08x
  - 添加详细实时反馈显示

- **状态反馈增强**：
  - 显示缩放比例（scaleFactor）
  - 显示两指距离（px）
  - 显示距离变化量（Δpx）
  - 区分"分离"（📈）和"靠近"（📉）

#### 已验证效果
- ✅ 两指分离快速响应
- ✅ 两指靠近立即缩放
- ✅ 实时距离反馈精准

---

**文档版本**：v3.1（手势优化版）  
**最后更新**：2026-01-07  
**实现状态**：核心功能完成，手势识别优化，生产级别质量
