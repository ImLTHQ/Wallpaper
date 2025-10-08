// 获取Canvas元素和上下文
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// 粒子配置
const PARTICLE_SPEED = 0.25; // 粒子固定速度
const CONNECTION_THRESHOLD = 100; // 粒子连接阈值
const MAX_CONNECTIONS = 4; // 每个粒子最大连接数
const TRIANGLE_OPACITY = 0.1; // 三角形透明度
const LINE_OPACITY = 0.2; // 连线透明度

// 粒子数组
let particles = [];

// 设置Canvas尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // 重新生成粒子以匹配窗口大小
    createParticles();
}

// 创建粒子 - 数量由窗口大小决定
function createParticles() {
    particles = [];
    // 每100x100像素区域大约1个粒子
    const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
    
    for (let i = 0; i < particleCount; i++) {
        // 随机方向（角度）
        const angle = Math.random() * Math.PI * 2;
        
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: 2 + Math.random() * 2,
            dx: Math.cos(angle) * PARTICLE_SPEED,
            dy: Math.sin(angle) * PARTICLE_SPEED,
            connections: 0 // 跟踪当前连接数
        });
    }
}

// 格式化时间为HH:MM格式
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 检查两点之间的距离
function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// 检查三个点是否能组成三角形（距离都小于阈值且每个粒子都有足够连接）
function isTriangle(p1, p2, p3) {
    const d1 = getDistance(p1, p2);
    const d2 = getDistance(p2, p3);
    const d3 = getDistance(p3, p1);
    
    // 三个粒子之间的距离都必须小于连接阈值
    // 且每个粒子都必须有2个或更多连接
    return d1 < CONNECTION_THRESHOLD && 
           d2 < CONNECTION_THRESHOLD && 
           d3 < CONNECTION_THRESHOLD &&
           p1.connections >= 2 &&
           p2.connections >= 2 &&
           p3.connections >= 2;
}

// 更新粒子位置
function updateParticles() {
    particles.forEach(particle => {
        // 重置连接计数
        particle.connections = 0;
        
        // 更新位置
        particle.x += particle.dx;
        particle.y += particle.dy;
        
        // 边界检测 - 超出画布后从另一边出现
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
    });
}

// 绘制粒子
function drawParticles() {
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    });
}

// 绘制粒子间的连线
function drawConnections() {
    // 先重置所有连接计数
    particles.forEach(p => p.connections = 0);
    
    // 检查所有粒子对
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        // 只在未达到最大连接数时检查新连接
        if (p1.connections >= MAX_CONNECTIONS) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            // 两个粒子都未达到最大连接数时才建立连接
            if (p1.connections < MAX_CONNECTIONS && p2.connections < MAX_CONNECTIONS) {
                const distance = getDistance(p1, p2);
                
                if (distance < CONNECTION_THRESHOLD) {
                    // 绘制连线
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${LINE_OPACITY})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    
                    // 增加连接计数
                    p1.connections++;
                    p2.connections++;
                }
            }
        }
    }
}

// 绘制符合条件的三角形
function drawTriangles() {
    // 先确保连接已经计算完成
    // 检查所有可能的三角形组合
    for (let i = 0; i < particles.length; i++) {
        // 跳过连接数不足的粒子
        if (particles[i].connections < 2) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
            // 跳过连接数不足的粒子
            if (particles[j].connections < 2) continue;
            
            for (let k = j + 1; k < particles.length; k++) {
                // 跳过连接数不足的粒子
                if (particles[k].connections < 2) continue;
                
                const p1 = particles[i];
                const p2 = particles[j];
                const p3 = particles[k];
                
                // 检查是否能组成三角形
                if (isTriangle(p1, p2, p3)) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(255, 255, 255, ${TRIANGLE_OPACITY})`;
                    ctx.fill();
                }
            }
        }
    }
}

// 动画循环
function animate() {
    // 绘制渐变背景
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgb(255, 100, 180)");
    gradient.addColorStop(0.5, "rgb(200, 150, 255)");
    gradient.addColorStop(1, "rgb(0, 255, 255)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 更新并绘制粒子
    updateParticles();
    drawConnections(); // 先计算连接
    drawTriangles();   // 再根据连接情况绘制三角形
    drawParticles();   // 最后绘制粒子，让粒子显示在最上层

    // 获取当前时间
    const currentTime = formatTime(new Date());
    
    // 设置字体样式 - 响应式大小
    const fontSize = Math.min(canvas.width, canvas.height) * 0.15;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 设置发光效果
    ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制白色文字
    ctx.fillStyle = 'white';
    ctx.fillText(currentTime, canvas.width / 2, canvas.height / 2);

    // 重置阴影设置
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
}

// 初始化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
animate();