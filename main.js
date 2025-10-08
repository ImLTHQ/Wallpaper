// 获取Canvas元素和上下文
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// 粒子配置
const PARTICLE_SPEED = 0.25; // 粒子固定速度
const CONNECTION_THRESHOLD = 100; // 粒子连接阈值
const MAX_CONNECTIONS = 4; // 每个粒子最大连接数
const TRIANGLE_OPACITY = 0.1; // 三角形基础透明度
const LINE_OPACITY = 0.2; // 连线基础透明度
const MAX_TRIANGLES = 10; // 最多同时渲染的三角形数量
const PARTICLE_SIZE_MIN = 3; // 粒子最小大小
const PARTICLE_SIZE_MAX = 5; // 粒子最大大小
const LINE_WIDTH = 1; // 连线粗细
const PARTICLE_DENSITY = 10000; // 每多少平方像素一个粒子
const MIN_LIFESPAN = 5000; // 最小生命周期(毫秒)
const MAX_LIFESPAN = 20000; // 最大生命周期(毫秒)

// 粒子数组
let particles = [];

// 设置Canvas尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createInitialParticles(); // 初始粒子也从屏幕外进入
}

// 创建初始粒子（从屏幕外进入）
function createInitialParticles() {
    particles = [];
    const particleCount = Math.floor((canvas.width * canvas.height) / PARTICLE_DENSITY);
    
    // 初始粒子也从屏幕外生成
    for (let i = 0; i < particleCount; i++) {
        particles.push(createOutsideParticle());
    }
}

// 创建从窗口外进入的新粒子
function createOutsideParticle() {
    const edge = Math.floor(Math.random() * 4); // 0:上, 1:右, 2:下, 3:左
    let x, y, angle;
    const offset = 50; // 粒子生成在窗口外的距离
    
    // 根据边缘确定粒子初始位置和进入角度，确保粒子向窗口内移动
    switch (edge) {
        case 0: // 上边
            x = Math.random() * canvas.width;
            y = -offset;
            angle = Math.random() * Math.PI - Math.PI/2; // 角度范围: -90°到90°，确保向下移动
            break;
        case 1: // 右边
            x = canvas.width + offset;
            y = Math.random() * canvas.height;
            angle = Math.random() * Math.PI + Math.PI/2; // 角度范围: 90°到270°，确保向左移动
            break;
        case 2: // 下边
            x = Math.random() * canvas.width;
            y = canvas.height + offset;
            angle = Math.random() * Math.PI + Math.PI/2; // 角度范围: 90°到270°，确保向上移动
            break;
        case 3: // 左边
            x = -offset;
            y = Math.random() * canvas.height;
            angle = Math.random() * Math.PI - Math.PI/2; // 角度范围: -90°到90°，确保向右移动
            break;
    }
    
    const lifespan = MIN_LIFESPAN + Math.random() * (MAX_LIFESPAN - MIN_LIFESPAN);
    
    return {
        x,
        y,
        radius: PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN),
        dx: Math.cos(angle) * PARTICLE_SPEED,
        dy: Math.sin(angle) * PARTICLE_SPEED,
        connections: 0,
        lifespan,
        birthTime: Date.now(),
        hasEntered: false // 初始状态为未进入窗口
    };
}

function getLifetimeProgress(particle) {
    const age = Date.now() - particle.birthTime;
    return Math.min(age / particle.lifespan, 1);
}

function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function getDistance(p1, p2) {
    const dx = p1.x - p2.x;
    const dy = p1.y - p2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function isTriangle(p1, p2, p3) {
    const d1 = getDistance(p1, p2);
    const d2 = getDistance(p2, p3);
    const d3 = getDistance(p3, p1);
    
    return d1 < CONNECTION_THRESHOLD && 
           d2 < CONNECTION_THRESHOLD && 
           d3 < CONNECTION_THRESHOLD &&
           p1.connections >= 3 &&
           p2.connections >= 3 &&
           p3.connections >= 3;
}

function updateParticles() {
    const now = Date.now();
    const maxDistance = Math.max(canvas.width, canvas.height) * 1.5; // 最大距离阈值
    
    // 过滤掉生命周期结束或无法进入窗口的粒子
    particles = particles.filter(p => {
        // 保留已经进入窗口的粒子，直到它们生命周期结束
        if (p.hasEntered) {
            return now - p.birthTime < p.lifespan;
        }
        
        // 计算粒子到窗口中心的距离
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const distance = getDistance(p, {x: centerX, y: centerY});
        
        // 移除距离过远且尚未进入窗口的粒子
        return distance < maxDistance;
    });
    
    particles.forEach(particle => {
        particle.connections = 0;
        
        particle.x += particle.dx;
        particle.y += particle.dy;
        
        // 检查粒子是否已进入窗口
        if (!particle.hasEntered) {
            if (particle.x >= 0 && particle.x <= canvas.width && 
                particle.y >= 0 && particle.y <= canvas.height) {
                particle.hasEntered = true;
            }
        } else {
            // 对于已进入窗口的粒子，处理边界循环
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;
        }
    });
    
    // 补充新粒子以维持总数
    const targetCount = Math.floor((canvas.width * canvas.height) / PARTICLE_DENSITY);
    while (particles.length < targetCount) {
        particles.push(createOutsideParticle());
    }
}

function drawParticles() {
    particles.forEach(particle => {
        // 窗口外的粒子保持完全不透明，不衰减
        if (!particle.hasEntered) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, 1)`; // 完全不透明
            ctx.fill();
        } else {
            // 进入窗口后的粒子随生命周期逐渐衰减
            const progress = getLifetimeProgress(particle);
            const opacity = 1 - progress; // 随时间推移透明度降低
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius * (1 - progress * 0.5), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
            ctx.fill();
        }
    });
}

function drawConnections() {
    particles.forEach(p => p.connections = 0);
    
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.connections >= MAX_CONNECTIONS || !p1.hasEntered) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p1.connections < MAX_CONNECTIONS && p2.connections < MAX_CONNECTIONS && p2.hasEntered) {
                const distance = getDistance(p1, p2);
                
                if (distance < CONNECTION_THRESHOLD) {
                    // 取两个粒子中较低的透明度
                    const progress1 = getLifetimeProgress(p1);
                    const progress2 = getLifetimeProgress(p2);
                    const opacity = LINE_OPACITY * (1 - Math.max(progress1, progress2));
                    
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.lineWidth = LINE_WIDTH * (1 - Math.max(progress1, progress2) * 0.5);
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                    
                    p1.connections++;
                    p2.connections++;
                }
            }
        }
    }
}

function drawTriangles() {
    let triangleCount = 0;
    for (let i = 0; i < particles.length && triangleCount < MAX_TRIANGLES; i++) {
        if (particles[i].connections < 3 || !particles[i].hasEntered) continue;
        
        for (let j = i + 1; j < particles.length && triangleCount < MAX_TRIANGLES; j++) {
            if (particles[j].connections < 3 || !particles[j].hasEntered) continue;
            
            for (let k = j + 1; k < particles.length && triangleCount < MAX_TRIANGLES; k++) {
                if (particles[k].connections < 3 || !particles[k].hasEntered) continue;
                
                const p1 = particles[i];
                const p2 = particles[j];
                const p3 = particles[k];
                
                if (isTriangle(p1, p2, p3)) {
                    // 取三个粒子中最低的透明度
                    const progress1 = getLifetimeProgress(p1);
                    const progress2 = getLifetimeProgress(p2);
                    const progress3 = getLifetimeProgress(p3);
                    const opacity = TRIANGLE_OPACITY * (1 - Math.max(progress1, progress2, progress3));
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                    ctx.fill();
                    
                    triangleCount++;
                    if (triangleCount >= MAX_TRIANGLES) break;
                }
            }
        }
    }
}

function animate() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgb(255, 100, 180)");
    gradient.addColorStop(0.5, "rgb(200, 150, 255)");
    gradient.addColorStop(1, "rgb(0, 255, 255)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    updateParticles();
    drawConnections();
    drawTriangles();
    drawParticles();

    const currentTime = formatTime(new Date());
    const fontSize = Math.min(canvas.width, canvas.height) * 0.15;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = 'rgba(255, 255, 255, 0.75)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'white';
    ctx.fillText(currentTime, canvas.width / 2, canvas.height / 2);
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
}

// 初始化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);
animate();