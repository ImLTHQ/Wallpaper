"use strict";
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const mouse = {
	x: canvas.width / 2,
	y: canvas.height / 2,
	getXY: function (ev) {
		this.x = ev.clientX;
		this.y = ev.clientY;
	}
};

const config = {
	particle_color: "#fff",
	particle_size: 1,
	particle_num: 2000,
	gravity: 1,
	click_gravity: -5,
	edge_mode: '0',
	damping: .99
};

window.wallpaperPropertyListener = {
	applyUserProperties: function (properties) {
		if (properties.pcolor) {
			let c = properties.pcolor.value.split(' ');
			config.particle_color = `rgb(${c[0] * 255},${c[1] * 255},${c[2] * 255})`;
			ctx.strokeStyle = config.particle_color;
		}
		if (properties.psize) {
			config.particle_size = properties.psize.value;
			ctx.lineWidth = config.particle_size;
		}
		if (properties.g) config.gravity = properties.g.value;
		if (properties.cg) config.click_gravity = properties.cg.value;
		if (properties.edge) config.edge_mode = properties.edge.value;
		if (properties.d) config.damping = properties.d.value;
	}
};

class Particle {
	constructor() {
		this.x = mouse.x;
		this.y = mouse.y;
		let v = Math.sqrt(Math.random()) * 32;
		let va = Math.random() * Math.PI * 2;
		this.vx = Math.cos(va) * v;
		this.vy = Math.sin(va) * v;
	}
	update(g = 0) {
		ctx.beginPath();
		ctx.moveTo(this.x, this.y);
		switch (config.edge_mode) {
			case '0': this.void(); break;
			case '1': this.solid(); break;
			default: break;
		}
		ctx.lineTo(this.x, this.y);
		ctx.stroke();
		this.vx *= config.damping;
		this.vy *= config.damping;
		let a = Math.atan2(mouse.y - this.y, mouse.x - this.x);
		this.vx += Math.cos(a) * g;
		this.vy += Math.sin(a) * g;
	}
	void() {
		this.x += this.vx;
		this.y += this.vy;
	}
	solid() {
		let nx = this.x + this.vx;
		if (nx < 0) {
			ctx.lineTo(0, this.y - this.vy * this.x / this.vx);
			this.vx *= -1;
			nx *= -1;
		} else if (nx > canvas.width) {
			ctx.lineTo(canvas.width, this.y + this.vy * (canvas.width - this.x) / this.vx);
			this.vx *= -1;
			nx = canvas.width * 2 - nx;
		}
		let ny = this.y + this.vy;
		if (ny < 0) {
			ctx.lineTo(this.x - this.vx * this.y / this.vy, 0);
			this.vy *= -1;
			ny *= -1;
		} else if (ny > canvas.height) {
			ctx.lineTo(this.x + this.vx * (canvas.height - this.y) / this.vy, canvas.height);
			this.vy *= -1;
			ny = canvas.height * 2 - ny;
		}
		this.x = nx;
		this.y = ny;
	}
}

const particles = [];
for (let i = 0; i < config.particle_num; i++) {
	particles.push(new Particle());
}

addEventListener("mousemove", ev => {
	mouse.getXY(ev);
});

addEventListener("click", () => {
	config.gravity *= config.click_gravity;
	setTimeout(() => { config.gravity /= config.click_gravity }, 50);
});

(function animate() {
	ctx.globalAlpha = 1;
	const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
	gradient.addColorStop(0, 'rgb(255, 100, 180)');
	gradient.addColorStop(0.5, 'rgb(200, 160, 255)');
	gradient.addColorStop(1, 'rgb(0, 255, 255)');
	ctx.fillStyle = gradient;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.globalAlpha = 1;
	for (let i = 0; i < config.particle_num; i++) {
		particles[i].update(config.gravity);
	}
	requestAnimationFrame(animate);
})();