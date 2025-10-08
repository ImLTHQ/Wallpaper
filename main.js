const canvas = document.querySelector("canvas"),
      ctx = canvas.getContext("2d"),
      resize = () => {
          canvas.width = innerWidth;
          canvas.height = innerHeight;
      };
resize();
window.addEventListener('resize', resize);

(function animate() {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "rgb(255, 100, 180)");
    gradient.addColorStop(0.5, "rgb(200, 150, 255)");
    gradient.addColorStop(1, "rgb(0, 255, 255)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    requestAnimationFrame(animate);
})();