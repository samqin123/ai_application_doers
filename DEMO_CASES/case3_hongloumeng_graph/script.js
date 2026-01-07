// ============ 红楼梦人物关系图谱 3D 互动网页 v3.0 ============

const CONFIG = {
    camera: {
        fov: 75,
        near: 0.1,
        far: 10000,
    },
    node: {
        minSize: 6,
        maxSize: 25,
    },
    force: {
        repulsion: 8000,  // 增加斥力使节点更分散
        attraction: 0.3,  // 极小的吸引力，保持节点分散
        centerAttraction: 0.08,  // 中心吸引力，保持在页面中间
        damping: 0.995,   // 更高的阻尼，快速稳定
        maxVelocity: 0.15, // 降低最大速度，缓慢移动
    },
};

// ============ 全局状态 ============
const state = {
    cameraActive: false,
    gestureActive: false,
    selectedNode: null,
    fps: 0,
    fpsCounter: 0,
    lastFpsTime: Date.now(),
    rotation: { x: 0, y: 0, z: 0 },
    zoom: 1.0,
    targetZoom: 1.0,
    nodes: [],
    edges: [],
    nodeMeshes: {},
    searchQuery: '',
    highlightedNodes: new Set(),
    simulationTime: 0,      // 模拟时间
    simulationFrozen: false, // 是否冻结模拟
    isDragging: false,      // 是否在拖拽
    dragStart: { x: 0, y: 0 }, // 拖拽起始位置
    touchPoints: [],        // 触摸点数组
    lastTouchDistance: 0,   // 上次两指距离（用于缩放）
};

let scene, camera, renderer;
let nodeGroup, edgeGroup;
let particlesMesh;
let raycaster, mouse;

// ============ 初始化 Three.js ============
async function initThreeScene() {
    const canvas = document.getElementById('canvas');
    
    // 场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0015);
    scene.fog = new THREE.Fog(0x0a0015, 1200, 2500);

    // 摄像头
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera = new THREE.PerspectiveCamera(CONFIG.camera.fov, width / height, CONFIG.camera.near, CONFIG.camera.far);
    camera.position.z = 750;

    // 渲染器
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;

    // 初始化射线检测
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // 光源
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xc77dff, 1.8, 800);
    pointLight1.position.set(300, 300, 300);
    scene.add(pointLight1);
    
    const pointLight2 = new THREE.PointLight(0xff6b9d, 1.2, 600);
    pointLight2.position.set(-300, -300, 300);
    scene.add(pointLight2);
    
    const pointLight3 = new THREE.PointLight(0x9d4edd, 0.8, 400);
    pointLight3.position.set(0, 0, 300);
    scene.add(pointLight3);

    // 星空背景
    createParticleBackground();

    // 加载数据
    await loadData();

    // 创建节点和边
    nodeGroup = new THREE.Group();
    edgeGroup = new THREE.Group();
    scene.add(nodeGroup);
    scene.add(edgeGroup);

    createNodes();
    createEdges();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onCanvasClick);
    window.addEventListener('wheel', onMouseWheel, false);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    
    // 触摸手势支持
    window.addEventListener('touchstart', onTouchStart, false);
    window.addEventListener('touchmove', onTouchMove, false);
    window.addEventListener('touchend', onTouchEnd, false);
    window.addEventListener('touchcancel', onTouchEnd, false);

    animate();
}

function createParticleBackground() {
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 3000;
        positions[i + 1] = (Math.random() - 0.5) * 3000;
        positions[i + 2] = (Math.random() - 0.5) * 3000;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        color: 0xc77dff,
        size: 2,
        sizeAttenuation: true,
        opacity: 0.6,
        transparent: true,
    });

    particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);
}

async function loadData() {
    // 加载 data.js 中的数据
    state.nodes = HONGLOUMENG_DATA.characters;
    state.edges = HONGLOUMENG_DATA.relations || HONGLOUMENG_DATA.relationships;

    // 初始化节点位置和速度（大范围圆周分布，避免重叠）
    state.nodes.forEach((node, index) => {
        const angle = (index / state.nodes.length) * Math.PI * 2;
        const radius = 250 + Math.random() * 150;  // 更大的初始半径
        const height = (Math.random() - 0.5) * 300;
        
        node.position = new THREE.Vector3(
            Math.cos(angle) * radius,
            height,
            Math.sin(angle) * radius
        );
        node.velocity = new THREE.Vector3(0, 0, 0);
        node.force = new THREE.Vector3(0, 0, 0);
    });

    console.log(`✅ 加载完成: ${state.nodes.length} 个人物，${state.edges.length} 条关系`);
}

function createNodes() {
    state.nodes.forEach((node, index) => {
        // 计算节点大小（根据 importance）
        const size = CONFIG.node.minSize + (node.importance / 10) * (CONFIG.node.maxSize - CONFIG.node.minSize);

        // 创建球体
        const geometry = new THREE.SphereGeometry(size, 32, 32);
        const hex = node.color.replace('#', '0x');
        const baseColor = new THREE.Color(parseInt(hex, 16));

        const material = new THREE.MeshStandardMaterial({
            color: baseColor,
            emissive: baseColor,
            emissiveIntensity: 0.6,
            metalness: 0.2,
            roughness: 0.5,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(node.position);
        mesh.userData = { nodeId: node.id, index };

        // 在球体中心添加文本标签（Billboard效果）
        const canvas = createTextCanvas(node.name, size);
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        
        const planeGeometry = new THREE.PlaneGeometry(size * 1.8, size * 1.8);
        const planeMaterial = new THREE.MeshBasicMaterial({ 
            map: texture, 
            transparent: true,
            emissive: 0xffffff,
            emissiveIntensity: 0.3,
            depthWrite: false,
        });
        const textMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        textMesh.userData.isBillboard = true;  // 标记为需要Billboard处理
        mesh.add(textMesh);
        mesh.userData.textMesh = textMesh;

        nodeGroup.add(mesh);
        state.nodeMeshes[node.id] = mesh;
    });
}

function createTextCanvas(text, size) {
    // 根据文本长度动态调整Canvas大小
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    ctx.fillRect(0, 0, 512, 512);
    
    // 计算合适的字体大小（根据文字长度）
    let fontSize = 80;
    const maxWidth = 450;
    ctx.font = `bold ${fontSize}px 'Noto Sans SC'`;
    
    while (ctx.measureText(text).width > maxWidth && fontSize > 30) {
        fontSize -= 5;
        ctx.font = `bold ${fontSize}px 'Noto Sans SC'`;
    }
    
    // 绘制文字（居中）
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 添加黑色描边以提高可读性
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 6;
    ctx.strokeText(text, 256, 256);
    
    // 绘制白色文字
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, 256, 256);
    
    return canvas;
}

function createEdges() {
    state.edges.forEach(edge => {
        const sourceNode = state.nodes.find(n => n.id === edge.from);
        const targetNode = state.nodes.find(n => n.id === edge.to);

        if (!sourceNode || !targetNode) return;

        // 根据关系类型选择颜色
        let edgeColor = '#7209b7'; // 默认深紫色
        
        if (edge.type === 'love') {
            edgeColor = '#ff6b9d'; // 爱情 - 粉红
        } else if (edge.type === 'conflict') {
            edgeColor = '#ff6b6b'; // 冲突 - 红色
        } else if (edge.type === 'family') {
            edgeColor = '#c77dff'; // 家族 - 浅紫
        } else if (edge.type === 'neutral') {
            edgeColor = '#9d4edd'; // 中立 - 紫色
        }

        const hex = edgeColor.replace('#', '0x');
        const color = new THREE.Color(parseInt(hex, 16));

        // 计算边的权重
        const weight = Math.max(0.3, Math.min(edge.weight / 10, 1));
        const tubeRadius = weight * 0.4;
        
        // 创建线条几何体
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array([
            sourceNode.position.x, sourceNode.position.y, sourceNode.position.z,
            targetNode.position.x, targetNode.position.y, targetNode.position.z,
        ]);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        // 使用 LineBasicMaterial - 确保透明度和颜色可见
        const material = new THREE.LineBasicMaterial({
            color: color,
            opacity: 0.95,
            transparent: false,
            fog: false,
            linewidth: 1,
            toneMapped: false,
        });

        const line = new THREE.Line(geometry, material);
        line.userData = { sourceId: edge.from, targetId: edge.to, edge };

        edgeGroup.add(line);
        edge.lineObject = line; // 保存引用以便更新
    });

    console.log(`✅ 创建 ${state.edges.length} 条边`);
    }

    // ============ 创建旋转轴可视化 ============
    function createRotationAxes() {
    const axisLength = 350;
    
    // X轴 - 红色（左右）
    const xGeometry = new THREE.BufferGeometry();
    xGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([
            -axisLength, 0, 0,
            axisLength, 0, 0
        ]), 3
    ));
    const xMaterial = new THREE.LineBasicMaterial({ color: 0xff6b6b, linewidth: 2, fog: false });
    const xAxis = new THREE.Line(xGeometry, xMaterial);
    scene.add(xAxis);
    
    // Y轴 - 青色（上下）
    const yGeometry = new THREE.BufferGeometry();
    yGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([
            0, -axisLength, 0,
            0, axisLength, 0
        ]), 3
    ));
    const yMaterial = new THREE.LineBasicMaterial({ color: 0x7dd3fc, linewidth: 2, fog: false });
    const yAxis = new THREE.Line(yGeometry, yMaterial);
    scene.add(yAxis);
    
    // Z轴 - 紫色（前后）
    const zGeometry = new THREE.BufferGeometry();
    zGeometry.setAttribute('position', new THREE.BufferAttribute(
        new Float32Array([
            0, 0, -axisLength,
            0, 0, axisLength
        ]), 3
    ));
    const zMaterial = new THREE.LineBasicMaterial({ color: 0xc77dff, linewidth: 2, fog: false });
    const zAxis = new THREE.Line(zGeometry, zMaterial);
    scene.add(zAxis);
    
    // 添加轴端点标记（小球）
    const radius = 8;
    
    // X轴端点
    const xEndGeometry = new THREE.SphereGeometry(radius, 16, 16);
    const xEndMaterial = new THREE.MeshBasicMaterial({ color: 0xff6b6b });
    const xEnd = new THREE.Mesh(xEndGeometry, xEndMaterial);
    xEnd.position.set(axisLength, 0, 0);
    scene.add(xEnd);
    
    // Y轴端点
    const yEndGeometry = new THREE.SphereGeometry(radius, 16, 16);
    const yEndMaterial = new THREE.MeshBasicMaterial({ color: 0x7dd3fc });
    const yEnd = new THREE.Mesh(yEndGeometry, yEndMaterial);
    yEnd.position.set(0, axisLength, 0);
    scene.add(yEnd);
    
    // Z轴端点
    const zEndGeometry = new THREE.SphereGeometry(radius, 16, 16);
    const zEndMaterial = new THREE.MeshBasicMaterial({ color: 0xc77dff });
    const zEnd = new THREE.Mesh(zEndGeometry, zEndMaterial);
    zEnd.position.set(0, 0, axisLength);
    scene.add(zEnd);
    
    console.log('✅ 旋转轴已创建 (X-红 Y-青 Z-紫)');
    }

    // ============ 力导向算法 ============
function updateForceDirectedLayout() {
    state.simulationTime += 1/60;  // 假设60FPS
    
    // 8秒后冻结模拟，保持当前状态
    if (state.simulationTime > 8 && !state.simulationFrozen) {
        state.simulationFrozen = true;
        console.log('✅ 模拟稳定，已冻结节点位置');
    }
    
    // 如果已冻结，只更新速度衰减，不更新位置
    if (state.simulationFrozen) {
        state.nodes.forEach(node => {
            node.velocity.multiplyScalar(0.98);  // 缓慢停止任何剩余运动
        });
        return;
    }
    
    const K_REPULSION = CONFIG.force.repulsion;
    const K_ATTRACTION = CONFIG.force.attraction;
    const DAMPING = CONFIG.force.damping;
    const MIN_DISTANCE = 10;  // 最小距离，防止节点完全重叠

    // 重置力
    state.nodes.forEach(node => {
        node.force.set(0, 0, 0);
    });

    // 斥力计算
    for (let i = 0; i < state.nodes.length; i++) {
        for (let j = i + 1; j < state.nodes.length; j++) {
            const delta = new THREE.Vector3().subVectors(state.nodes[i].position, state.nodes[j].position);
            let distance = delta.length();
            
            // 如果距离太近，强制分开
            if (distance < MIN_DISTANCE) {
                distance = MIN_DISTANCE;
            }
            
            const force = K_REPULSION / (distance * distance);

            delta.normalize().multiplyScalar(force);

            state.nodes[i].force.add(delta);
            state.nodes[j].force.sub(delta);
        }
    }

    // 吸引力计算
    state.edges.forEach(edge => {
        const sourceNode = state.nodes.find(n => n.id === edge.from);
        const targetNode = state.nodes.find(n => n.id === edge.to);

        if (!sourceNode || !targetNode) return;

        const delta = new THREE.Vector3().subVectors(targetNode.position, sourceNode.position);
        const distance = delta.length();
        const force = K_ATTRACTION * distance * (edge.weight / 10);

        delta.normalize().multiplyScalar(force);

        sourceNode.force.add(delta);
        targetNode.force.sub(delta);
    });
    
    // 中心吸引力，保持图形在页面中间
    state.nodes.forEach(node => {
        const toCenter = new THREE.Vector3().copy(node.position).multiplyScalar(-1);
        const distance = toCenter.length();
        if (distance > 0) {
            const force = CONFIG.force.centerAttraction * distance;
            toCenter.normalize().multiplyScalar(force);
            node.force.add(toCenter);
        }
    });

    // 更新位置
    state.nodes.forEach(node => {
        node.velocity.add(node.force);
        node.velocity.multiplyScalar(DAMPING);

        if (node.velocity.length() > CONFIG.force.maxVelocity) {
            node.velocity.normalize().multiplyScalar(CONFIG.force.maxVelocity);
        }

        node.position.add(node.velocity);

        // 更新网格位置和文字位置
        if (state.nodeMeshes[node.id]) {
            const mesh = state.nodeMeshes[node.id];
            mesh.position.copy(node.position);
            if (mesh.userData.textMesh) {
                mesh.userData.textMesh.position.copy(node.position);
            }
        }
    });

    // 更新边的位置
    state.edges.forEach(edge => {
        const sourceNode = state.nodes.find(n => n.id === edge.from);
        const targetNode = state.nodes.find(n => n.id === edge.to);

        if (!sourceNode || !targetNode || !edge.lineObject) return;

        const positions = edge.lineObject.geometry.attributes.position.array;
        positions[0] = sourceNode.position.x;
        positions[1] = sourceNode.position.y;
        positions[2] = sourceNode.position.z;
        positions[3] = targetNode.position.x;
        positions[4] = targetNode.position.y;
        positions[5] = targetNode.position.z;

        edge.lineObject.geometry.attributes.position.needsUpdate = true;
    });
}

// ============ UI 交互 ============
function onCanvasClick(event) {
    // 只响应左键点击
    if (event.button !== 0) return;

    const rect = renderer.domElement.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    mouse.set(x, y);
    raycaster.setFromCamera(mouse, camera);

    const objects = Object.values(state.nodeMeshes);
    const intersects = raycaster.intersectObjects(objects, true); // 检查包括子对象

    // 过滤出实际的节点球体（排除文本网格）
    let selectedMesh = null;
    for (let i = 0; i < intersects.length; i++) {
        const obj = intersects[i].object;
        if (obj.userData.nodeId) {
            selectedMesh = obj;
            break;
        }
        // 检查父对象是否是节点球体
        if (obj.parent && obj.parent.userData.nodeId) {
            selectedMesh = obj.parent;
            break;
        }
    }

    if (selectedMesh) {
        const nodeId = selectedMesh.userData.nodeId;
        const node = state.nodes.find(n => n.id === nodeId);
        if (node) {
            openInfoPanel(node);
            // 视觉反馈：短暂放大
            selectedMesh.scale.set(1.2, 1.2, 1.2);
            setTimeout(() => {
                selectedMesh.scale.set(1, 1, 1);
            }, 200);
        }
    }
}

function openInfoPanel(node) {
    state.selectedNode = node;
    const panel = document.getElementById('info-panel');
    const content = document.getElementById('info-content');

    // 获取相关的关系
    const relations = state.edges.filter(e => e.from === node.id || e.to === node.id);

    let html = `
        <div class="info-panel-title">${node.name}</div>
        <div class="info-panel-alias">${node.alias.join(' / ')}</div>
        
        <div class="info-section">
            <div class="info-section-title">身份</div>
            <div class="info-section-content">${node.family}</div>
        </div>

        <div class="info-section">
            <div class="info-section-title">重要度</div>
            <div class="info-section-content">
                <div class="importance-bar">
                    <div class="importance-fill" style="width: ${(node.importance / 10) * 100}%"></div>
                </div>
                ${node.importance}/10
            </div>
        </div>

        <div class="info-section">
            <div class="info-section-title">介绍</div>
            <div class="info-section-content">${node.introduction}</div>
        </div>

        <div class="info-section">
            <div class="info-section-title">人物关系 (${relations.length})</div>
            <div class="info-section-content">
                ${relations.map(r => {
                    const relatedId = r.from === node.id ? r.to : r.from;
                    const relatedNode = state.nodes.find(n => n.id === relatedId);
                    if (!relatedNode) return '';
                    return `<div style="margin-bottom: 8px; padding: 8px; background: rgba(157, 78, 221, 0.1); border-radius: 4px;">
                        <span style="color: #c77dff; cursor: pointer;" onclick="selectNode('${relatedNode.id}')">${relatedNode.name}</span><br>
                        <span style="font-size: 11px; color: #a0aec0;">${r.type === 'love' ? '❤️' : r.type === 'conflict' ? '⚔️' : '👥'} ${r.description}</span>
                    </div>`;
                }).join('')}
            </div>
        </div>
    `;

    content.innerHTML = html;
    panel.classList.add('open');
}

function closeInfoPanel() {
    document.getElementById('info-panel').classList.remove('open');
    state.selectedNode = null;
}

function selectNode(nodeId) {
    const node = state.nodes.find(n => n.id === nodeId);
    if (node) {
        openInfoPanel(node);
    }
}

function resetView() {
    state.rotation = { x: 0, y: 0 };
    state.zoom = 1.0;
    state.nodes.forEach(node => {
        node.velocity.set(0, 0, 0);
    });
}

function searchCharacter(query) {
    state.searchQuery = query.toLowerCase();
    state.highlightedNodes.clear();

    if (query.length > 0) {
        state.nodes.forEach(node => {
            if (node.name.toLowerCase().includes(query) || 
                node.alias.some(a => a.toLowerCase().includes(query))) {
                state.highlightedNodes.add(node.id);
            }
        });
    }

    updateNodeHighlight();
}

function updateNodeHighlight() {
    state.nodes.forEach(node => {
        const mesh = state.nodeMeshes[node.id];
        if (!mesh) return;

        if (state.highlightedNodes.has(node.id)) {
            mesh.material.emissiveIntensity = 1.0;
            mesh.scale.set(1.4, 1.4, 1.4);
        } else {
            mesh.material.emissiveIntensity = 0.6;
            mesh.scale.set(1, 1, 1);
        }
    });
}

function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// ============ 鼠标交互 ============
function onMouseWheel(event) {
    event.preventDefault();
    
    // 鼠标滚轮缩放，使用平滑动画
    const zoomSpeed = 0.08;
    if (event.deltaY < 0) {
        state.targetZoom *= (1 + zoomSpeed);  // 放大
    } else {
        state.targetZoom /= (1 + zoomSpeed);  // 缩小
    }
    
    // 限制缩放范围
    state.targetZoom = Math.max(0.3, Math.min(state.targetZoom, 4));
}

function onMouseDown(event) {
    // 左键、右键或中键拖拽旋转
    if (event.button === 0 || event.button === 2 || event.button === 1) {
        // 检查是否点击了节点
        const rect = renderer.domElement.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        mouse.set(x, y);
        raycaster.setFromCamera(mouse, camera);
        const objects = Object.values(state.nodeMeshes);
        const intersects = raycaster.intersectObjects(objects, true);
        
        // 如果点击到节点，不启动旋转（将由click事件处理）
        if (intersects.length > 0 && event.button === 0) {
            return;
        }
        
        state.isDragging = true;
        state.dragStart.x = event.clientX;
        state.dragStart.y = event.clientY;
    }
}

function onMouseMove(event) {
    if (state.isDragging) {
        const deltaX = event.clientX - state.dragStart.x;
        const deltaY = event.clientY - state.dragStart.y;
        
        // 平滑的旋转（降低敏感度以提高精度）
        if (event.shiftKey) {
            // Shift+拖拽: Z轴旋转（翻滚）
            state.rotation.z += deltaX * 0.003;
        } else {
            // 常规拖拽: X轴和Y轴旋转
            state.rotation.y += deltaX * 0.003;
            state.rotation.x += deltaY * 0.003;
            
            // 限制X轴旋转（-90° 到 90°）
            state.rotation.x = Math.max(-Math.PI / 2.2, Math.min(state.rotation.x, Math.PI / 2.2));
        }
        
        // 更新拖拽起点
        state.dragStart.x = event.clientX;
        state.dragStart.y = event.clientY;
    }
}

function onMouseUp(event) {
    state.isDragging = false;
}

// ============ 触摸手势交互 ============
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

function getTouchCenter(touches) {
    let x = 0, y = 0;
    for (let i = 0; i < touches.length; i++) {
        x += touches[i].clientX;
        y += touches[i].clientY;
    }
    return { x: x / touches.length, y: y / touches.length };
}

function onTouchStart(event) {
    state.touchPoints = Array.from(event.touches);
    
    // 两指触摸：记录初始距离用于缩放
    if (state.touchPoints.length === 2) {
        state.lastTouchDistance = getDistance(state.touchPoints[0], state.touchPoints[1]);
    }
    // 单指触摸：准备旋转或检查点击
    else if (state.touchPoints.length === 1) {
        state.dragStart.x = state.touchPoints[0].clientX;
        state.dragStart.y = state.touchPoints[0].clientY;
    }
}

function onTouchMove(event) {
    if (state.touchPoints.length === 0) return;
    
    event.preventDefault(); // 防止页面滚动
    
    const currentTouches = Array.from(event.touches);
    
    // 两指缩放
    if (currentTouches.length === 2) {
        const currentDistance = getDistance(currentTouches[0], currentTouches[1]);
        if (state.lastTouchDistance > 0) {
            // 计算缩放比例
            const scaleFactor = currentDistance / state.lastTouchDistance;
            
            // 根据两指靠近或分离调整缩放
            if (scaleFactor > 1.02) {  // 分离，放大
                state.targetZoom *= 1.04;
            } else if (scaleFactor < 0.98) {  // 靠近，缩小
                state.targetZoom /= 1.04;
            }
            
            // 限制缩放范围
            state.targetZoom = Math.max(0.3, Math.min(state.targetZoom, 4));
        }
        state.lastTouchDistance = currentDistance;
    }
    // 单指旋转
    else if (currentTouches.length === 1) {
        const deltaX = currentTouches[0].clientX - state.dragStart.x;
        const deltaY = currentTouches[0].clientY - state.dragStart.y;
        
        // 平滑的旋转
        state.rotation.y += deltaX * 0.004;
        state.rotation.x += deltaY * 0.004;
        
        // 限制X轴旋转
        state.rotation.x = Math.max(-Math.PI / 2.2, Math.min(state.rotation.x, Math.PI / 2.2));
        
        // 更新拖拽起点
        state.dragStart.x = currentTouches[0].clientX;
        state.dragStart.y = currentTouches[0].clientY;
    }
}

function onTouchEnd(event) {
    state.touchPoints = Array.from(event.touches);
    state.lastTouchDistance = 0;
    
    // 单指点击检测：快速点击（无移动）
    if (state.touchPoints.length === 0) {
        const now = Date.now();
        // 可用于检测点击动作
    }
}

// ============ FPS 计数 ============
function updateFPS() {
    state.fpsCounter++;
    const now = Date.now();
    
    if (now - state.lastFpsTime >= 1000) {
        state.fps = state.fpsCounter;
        state.fpsCounter = 0;
        state.lastFpsTime = now;
        
        const fps = document.getElementById('fps-text');
        if (fps) fps.textContent = `FPS: ${state.fps}`;
    }
}

// ============ Billboard效果 ============
function updateBillboard() {
    // 让所有文本始终面向摄像机
    state.nodes.forEach(node => {
        const mesh = state.nodeMeshes[node.id];
        if (mesh && mesh.userData.textMesh) {
            const textMesh = mesh.userData.textMesh;
            // 计算从文本网格到摄像机的向量
            const worldPos = new THREE.Vector3();
            textMesh.getWorldPosition(worldPos);
            const cameraDir = camera.position.clone().sub(worldPos).normalize();
            
            // 让平面面向摄像机
            textMesh.lookAt(camera.position);
        }
    });
}

// ============ 渲染循环 ============
function animate() {
    requestAnimationFrame(animate);

    // 更新力导向布局
    updateForceDirectedLayout();

    // 应用旋转和缩放（平滑缩放过渡）
    state.rotation.y += 0.0005; // 自动旋转
    
    // 使用线性插值实现平滑缩放
    const zoomLerpSpeed = 0.08;
    state.zoom += (state.targetZoom - state.zoom) * zoomLerpSpeed;

    // 应用三轴旋转（使用欧拉角顺序：YXZ避免万向锁）
    const euler = new THREE.Euler(state.rotation.x, state.rotation.y, state.rotation.z, 'YXZ');
    nodeGroup.quaternion.setFromEuler(euler);
    nodeGroup.scale.set(state.zoom, state.zoom, state.zoom);

    edgeGroup.quaternion.setFromEuler(euler);
    edgeGroup.scale.set(state.zoom, state.zoom, state.zoom);

    if (particlesMesh) {
        particlesMesh.rotation.y += 0.00003;
    }

    // 更新Billboard效果（文字始终面向摄像机）
    updateBillboard();

    renderer.render(scene, camera);
    updateFPS();
}

// ============ 事件初始化 ============
window.addEventListener('load', async () => {
    await initThreeScene();

    // 搜索功能
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchCharacter(e.target.value);
        });
    }

    // 控制按钮
    const resetBtn = document.getElementById('reset-view');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetView);
    }

    // 关闭信息面板
    const closeBtn = document.getElementById('close-info-panel');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeInfoPanel);
    }

    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeInfoPanel();
        if (e.key === 'r' || e.key === 'R') resetView();
    });
});
