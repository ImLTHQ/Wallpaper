// 获取Canvas元素和上下文
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

// 设置Canvas尺寸为窗口大小
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 初始化尺寸并监听窗口大小变化
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 格式化时间为HH:MM格式
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
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

    // 获取当前时间
    const currentTime = formatTime(new Date());
    
    // 设置字体样式 - 响应式大小
    const fontSize = Math.min(canvas.width, canvas.height) * 0.15;
    ctx.font = `bold ${fontSize}px Arial, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 设置发光效果
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 绘制白色文字
    ctx.fillStyle = 'white';
    ctx.fillText(currentTime, canvas.width / 2, canvas.height / 2);

    // 重置阴影设置
    ctx.shadowBlur = 0;

    requestAnimationFrame(animate);
}

// 启动动画
animate();