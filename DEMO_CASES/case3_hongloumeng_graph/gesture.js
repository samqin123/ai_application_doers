// ============ 手势识别模块 ============

const gestureState = {
    enabled: false,
    hands: null,
    camera: null,
    canvasElement: null,
    videoElement: null,
    handLandmarks: [],
    lastLeftHandPos: null,
    lastRightHandPos: null,
    lastHandDistance: 0,
    gestureDebounce: 0,
};

// 初始化MediaPipe Hands
async function initGestureRecognition() {
    const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
    });

    hands.onResults(onHandsResults);

    const videoElement = document.getElementById('gesture-camera');
    const canvasElement = document.createElement('canvas');
    canvasElement.width = videoElement.videoWidth || 1280;
    canvasElement.height = videoElement.videoHeight || 720;

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            if (gestureState.enabled) {
                await hands.send({ image: videoElement });
            }
        },
        width: 1280,
        height: 720,
    });

    gestureState.hands = hands;
    gestureState.camera = camera;
    gestureState.videoElement = videoElement;
    gestureState.canvasElement = canvasElement;

    console.log('✅ 手势识别已初始化');
}

// 处理识别到的手部
function onHandsResults(results) {
    if (!gestureState.enabled) return;

    gestureState.handLandmarks = results.multiHandLandmarks || [];
    const handedness = results.multiHandedness || [];

    if (gestureState.handLandmarks.length === 0) {
        gestureState.lastLeftHandPos = null;
        gestureState.lastRightHandPos = null;
        updateGestureStatus('未检测到手部');
        return;
    }

    // 区分左右手
    let leftHand = null,
        rightHand = null;

    for (let i = 0; i < handedness.length; i++) {
        const label = handedness[i].label;
        const landmarks = gestureState.handLandmarks[i];

        if (label === 'Left') {
            leftHand = landmarks;
        } else if (label === 'Right') {
            rightHand = landmarks;
        }
    }

    // 处理两只手的情况（缩放）
    if (leftHand && rightHand) {
        handleTwoHandGesture(leftHand, rightHand);
    }
    // 处理单只手的情况（旋转）
    else if (leftHand) {
        handleOneHandGesture(leftHand, 'left');
    } else if (rightHand) {
        handleOneHandGesture(rightHand, 'right');
    }
}

// 处理单手手势（旋转）
function handleOneHandGesture(landmarks, hand) {
    // 获取手心位置（9号关键点）
    const palmPos = landmarks[9];
    const screenX = palmPos.x * window.innerWidth;
    const screenY = palmPos.y * window.innerHeight;

    const currentPos = { x: screenX, y: screenY };

    if (hand === 'left') {
        if (gestureState.lastLeftHandPos) {
            const deltaX = currentPos.x - gestureState.lastLeftHandPos.x;
            const deltaY = currentPos.y - gestureState.lastLeftHandPos.y;

            // 手势灵敏度调整
            state.rotation.y += deltaX * 0.002;
            state.rotation.x += deltaY * 0.002;

            // 限制X轴旋转
            state.rotation.x = Math.max(-Math.PI / 2.2, Math.min(state.rotation.x, Math.PI / 2.2));

            updateGestureStatus(`左手 ⬌ 旋转`);
        }
        gestureState.lastLeftHandPos = currentPos;
    } else {
        if (gestureState.lastRightHandPos) {
            const deltaX = currentPos.x - gestureState.lastRightHandPos.x;
            const deltaY = currentPos.y - gestureState.lastRightHandPos.y;

            state.rotation.y += deltaX * 0.002;
            state.rotation.x += deltaY * 0.002;

            state.rotation.x = Math.max(-Math.PI / 2.2, Math.min(state.rotation.x, Math.PI / 2.2));

            updateGestureStatus(`右手 ⬌ 旋转`);
        }
        gestureState.lastRightHandPos = currentPos;
    }
}

// 处理双手手势（缩放）
function handleTwoHandGesture(leftHand, rightHand) {
    // 获取两只手的手心位置
    const leftPalm = leftHand[9];
    const rightPalm = rightHand[9];

    const leftScreenX = leftPalm.x * window.innerWidth;
    const leftScreenY = leftPalm.y * window.innerHeight;
    const rightScreenX = rightPalm.x * window.innerWidth;
    const rightScreenY = rightPalm.y * window.innerHeight;

    // 计算两手距离
    const dx = rightScreenX - leftScreenX;
    const dy = rightScreenY - leftScreenY;
    const currentDistance = Math.sqrt(dx * dx + dy * dy);

    if (gestureState.lastHandDistance > 0) {
        const scaleFactor = currentDistance / gestureState.lastHandDistance;
        const distanceDelta = Math.abs(currentDistance - gestureState.lastHandDistance);

        // 两手分离→放大，靠近→缩小（降低阈值以提高敏感度）
        if (scaleFactor > 1.02) {
            state.targetZoom *= 1.08;
            updateGestureStatus(`✌️ 两指分离 📈 放大 (${scaleFactor.toFixed(2)}x)`);
        } else if (scaleFactor < 0.98) {
            state.targetZoom /= 1.08;
            updateGestureStatus(`✌️ 两指靠近 📉 缩小 (${scaleFactor.toFixed(2)}x)`);
        } else if (distanceDelta > 15) {
            // 绝对距离变化检测
            if (currentDistance > gestureState.lastHandDistance) {
                state.targetZoom *= 1.04;
                updateGestureStatus(`✌️ 两指分离 📈 放大 (+${Math.round(distanceDelta)}px)`);
            } else {
                state.targetZoom /= 1.04;
                updateGestureStatus(`✌️ 两指靠近 📉 缩小 (-${Math.round(distanceDelta)}px)`);
            }
        } else {
            // 显示两指位置信息
            updateGestureStatus(`✌️ 两指距离: ${Math.round(currentDistance)}px (Δ${Math.round(distanceDelta)}px)`);
        }

        // 限制缩放范围
        state.targetZoom = Math.max(0.3, Math.min(state.targetZoom, 4));
    } else {
        // 初次检测时显示距离
        updateGestureStatus(`✌️ 两指已检测 距离: ${Math.round(currentDistance)}px`);
    }

    gestureState.lastHandDistance = currentDistance;
}

// 更新UI显示
function updateGestureStatus(message) {
    const statusDiv = document.getElementById('gesture-info');
    if (statusDiv) {
        statusDiv.textContent = message;
    }
}

// 切换手势识别
async function toggleGestureControl() {
    const btn = document.getElementById('gesture-toggle-btn');
    const camera = document.getElementById('gesture-camera');
    const status = document.getElementById('gesture-status');

    if (gestureState.enabled) {
        // 关闭手势识别
        gestureState.enabled = false;
        if (gestureState.camera) {
            await gestureState.camera.stop();
        }
        btn.style.background = 'rgba(157, 78, 221, 0.2)';
        btn.style.borderColor = 'rgba(157, 78, 221, 0.4)';
        btn.style.color = 'var(--primary)';
        camera.classList.remove('active');
        status.classList.remove('active');
        updateGestureStatus('已禁用');
        console.log('❌ 手势识别已关闭');
    } else {
        // 启用手势识别
        try {
            if (!gestureState.hands) {
                await initGestureRecognition();
            }
            gestureState.enabled = true;
            await gestureState.camera.start();
            btn.style.background = 'rgba(199, 125, 255, 0.3)';
            btn.style.borderColor = 'rgba(199, 125, 255, 0.8)';
            btn.style.color = '#c77dff';
            camera.classList.add('active');
            status.classList.add('active');
            updateGestureStatus('已启用');
            console.log('✅ 手势识别已启用');
        } catch (error) {
            console.error('摄像头访问错误:', error);
            updateGestureStatus('摄像头访问失败');
            alert('无法访问摄像头。请检查权限设置。');
        }
    }
}

// 初始化按钮事件监听（DOM就绪时）
function initializeGestureUI() {
    const btn = document.getElementById('gesture-toggle-btn');
    if (btn) {
        btn.addEventListener('click', toggleGestureControl);
        console.log('✅ 手势按钮已绑定');
    } else {
        console.warn('❌ 未找到手势按钮');
    }

    // 禁用右键菜单（防止长按时出现菜单）
    document.addEventListener('contextmenu', (e) => {
        if (gestureState.enabled) {
            e.preventDefault();
        }
    });
}

// 使用DOMContentLoaded确保DOM已准备好
document.addEventListener('DOMContentLoaded', () => {
    console.log('📋 DOM已加载');
    initializeGestureUI();
});

// 页面加载完成后初始化手势识别引擎
window.addEventListener('load', async () => {
    console.log('🚀 页面加载完成，初始化手势识别...');
    // 预加载MediaPipe Hands模型
    try {
        await initGestureRecognition();
    } catch (error) {
        console.warn('⚠️ 手势识别初始化失败:', error);
    }
});
