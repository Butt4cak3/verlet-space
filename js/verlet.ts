interface Vector {
	x: number;
	y: number;
}

interface Particle {
	pos: Vector;
	vel: Vector;
	acc: Vector;
	mass: number;
	radius: number;
	color: string;
}

function verletPos(x: number, v: number, a: number, dt: number): number {
	return x + v * dt + 0.5 * a * dt * dt;
}

function verletVel(v: number, a: number, dt: number): number {
	return v + a * dt;
}

function verletParticle(obj: Particle, dt: number): void {
	obj.pos.x = verletPos(obj.pos.x, obj.vel.x, obj.acc.x, dt);
	obj.pos.y = verletPos(obj.pos.y, obj.vel.y, obj.acc.y, dt);

	obj.vel.x = verletVel(obj.vel.x, obj.acc.x, dt);
	obj.vel.y = verletVel(obj.vel.y, obj.acc.y, dt);
}

function initPlanets(planets: Particle[]) {
	const earth = {
		pos: { x: 0, y: 0 },
		vel: { x: 0, y: 0 },
		acc: { x: 0, y: 0 },
		mass: 5.972e24,
		radius: 6371000,
		color: "#5577FF"
	};

	const moon = {
		pos: { x: earth.pos.x + 3.84402e8, y: earth.pos.y },
		vel: { x: 0, y: 1000 },
		acc: { x: 0, y: 0 },
		mass: 7.348e22,
		radius: 1737500,
		color: "#999999"
	};

	planets.push(earth);
	planets.push(moon);
}

function gravitationalForce(a: Particle, b: Particle, G: number = 6.67300e-11): Vector {
	let dx = b.pos.x - a.pos.x,
		dy = b.pos.y - a.pos.y,
		dSquared = dx * dx + dy * dy,
		d = Math.sqrt(dSquared),
		F = (G * a.mass * b.mass) / (dSquared),
		force = { x: F * (dx / d), y: F * (dy / d) };

	return force;
}

function applyForce(obj: Particle, force: Vector): void {
	obj.acc.x += force.x / obj.mass;
	obj.acc.y += force.y / obj.mass;
}

function formatTime(time: number): string {
	let h = Math.floor(time / 3600);
	time = time % 3600;

	let m = Math.floor(time / 60);
	time = time % 60;

	let s = time;

	return fn(h.toString()) + ":" + fn(m.toString()) + ":" + fn(s.toFixed(3), 6);

	function fn(s: string, len: number = 2): string {
		if (s.length < len) {
			return ("0" + s).substr(-len);
		} else {
			return s;
		}
	}
}

function colliding(a: Particle, b: Particle): boolean {
	let dx = b.pos.x - a.pos.x,
		dy = b.pos.y - a.pos.y,
		d = dx * dx + dy * dy,
		r = a.radius + b.radius,
		rs = r * r;

	return d < rs;
}

function scalePos(v: Vector, origin: Vector, scale: number): Vector {
	let res = { x: 0, y: 0 };

	res.x = origin.x + (v.x * scale);
	res.y = origin.y - (v.y * scale);

	return res;
}

document.addEventListener("DOMContentLoaded", () => {
	// Configure the simulation here
	const timescale = 36000,
		framerate = 60,
		precision = 1000;
	// End of configuration area

	const canvas = document.getElementById("canvas") as HTMLCanvasElement,
		ctx = canvas.getContext("2d"),
		stepsPerSimSecond = framerate * Math.ceil(precision / framerate),
		framesPerSimSecond = framerate / timescale,
		stepsPerFrame = Math.floor(stepsPerSimSecond / framesPerSimSecond),
		dt = 1 / stepsPerSimSecond,
		scale = 0.000001,
		planets: Particle[] = [],
		origin = { x: 0, y: 0 };

	let time = 0;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	origin.x = canvas.width / 2;
	origin.y = canvas.height / 2;

	initPlanets(planets);
	window.requestAnimationFrame(frame);

	function frame() {
		for (let s = 0; s < stepsPerFrame; s++) {
			for (let a = 0; a < planets.length; a++) {
				let pA = planets[a];

				pA.acc.x = pA.acc.y = 0;

				for (let b = 0; b < a; b++) {
					let pB = planets[b],
						force = gravitationalForce(pA, pB);

					applyForce(pA, force);
					applyForce(pB, { x: -force.x, y: -force.y });
				}
			}

			for (let planet of planets) {
				verletParticle(planet, dt);
			}

			time += dt;
		}

		ctx.fillStyle = "#000000";
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		for (let planet of planets) {
			let pos = scalePos(planet.pos, origin, scale),
				vel = Math.sqrt(planet.vel.x * planet.vel.x + planet.vel.y * planet.vel.y),
				labelPos = scalePos({ x: planet.pos.x + planet.radius, y: planet.pos.y + planet.radius }, origin, scale);

			ctx.beginPath();
			ctx.fillStyle = planet.color;
			ctx.arc(pos.x, pos.y, planet.radius * scale, 0, Math.PI * 2);
			ctx.fill();
			ctx.fillText(vel.toFixed(3) + " m/s", labelPos.x, labelPos.y);
		}

		ctx.fillStyle = "#FFFFFF";
		ctx.fillText("t = " + formatTime(time), 10, 20);

		window.requestAnimationFrame(frame);
	}
});
