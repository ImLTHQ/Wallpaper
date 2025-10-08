// 获取Canvas元素和上下文
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// 粒子配置
const PARTICLE_SPEED = 0.25; // 粒子固定速度
const CONNECTION_THRESHOLD = 100; // 粒子连接阈值
const MAX_CONNECTIONS = 4; // 每个粒子最大连接数
const TRIANGLE_OPACITY = 0.1; // 三角形透明度
const LINE_OPACITY = 0.2; // 连线透明度
const MAX_TRIANGLES = 10; // 最多同时渲染的三角形数量
const PARTICLE_SIZE_MIN = 3; // 粒子最小大小
const PARTICLE_SIZE_MAX = 5; // 粒子最大大小
const LINE_WIDTH = 1; // 连线粗细
const PARTICLE_DENSITY = 20000; // 每多少平方像素一个粒子

// 粒子数组
let particles = [];

// 设置Canvas尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createParticles();
}

function createParticles() {
    particles = [];
    // 使用常量计算粒子数量
    const particleCount = Math.floor((canvas.width * canvas.height) / PARTICLE_DENSITY);
    
    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            radius: PARTICLE_SIZE_MIN + Math.random() * (PARTICLE_SIZE_MAX - PARTICLE_SIZE_MIN),
            dx: Math.cos(angle) * PARTICLE_SPEED,
            dy: Math.sin(angle) * PARTICLE_SPEED,
            connections: 0 // 跟踪当前连接数
        });
    }
}

// 其他函数保持不变...
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
    particles.forEach(particle => {
        particle.connections = 0;
        
        particle.x += particle.dx;
        particle.y += particle.dy;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
    });
}

function drawParticles() {
    particles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
    });
}

function drawConnections() {
    particles.forEach(p => p.connections = 0);
    
    for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        if (p1.connections >= MAX_CONNECTIONS) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
            const p2 = particles[j];
            if (p1.connections < MAX_CONNECTIONS && p2.connections < MAX_CONNECTIONS) {
                const distance = getDistance(p1, p2);
                
                if (distance < CONNECTION_THRESHOLD) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${LINE_OPACITY})`;
                    ctx.lineWidth = LINE_WIDTH;
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
        if (particles[i].connections < 3) continue;
        
        for (let j = i + 1; j < particles.length && triangleCount < MAX_TRIANGLES; j++) {
            if (particles[j].connections < 3) continue;
            
            for (let k = j + 1; k < particles.length && triangleCount < MAX_TRIANGLES; k++) {
                if (particles[k].connections < 3) continue;
                
                const p1 = particles[i];
                const p2 = particles[j];
                const p3 = particles[k];
                
                if (isTriangle(p1, p2, p3)) {
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.lineTo(p3.x, p3.y);
                    ctx.closePath();
                    ctx.fillStyle = `rgba(255, 255, 255, ${TRIANGLE_OPACITY})`;
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