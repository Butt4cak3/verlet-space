function verletPos(x, v, a, dt) {
    return x + v * dt + 0.5 * a * dt * dt;
}
function verletVel(v, a, dt) {
    return v + a * dt;
}
function verletParticle(obj, dt) {
    obj.pos.x = verletPos(obj.pos.x, obj.vel.x, obj.acc.x, dt);
    obj.pos.y = verletPos(obj.pos.y, obj.vel.y, obj.acc.y, dt);
    obj.vel.x = verletVel(obj.vel.x, obj.acc.x, dt);
    obj.vel.y = verletVel(obj.vel.y, obj.acc.y, dt);
}
function initPlanets(planets) {
    var earth = {
        pos: { x: 0, y: 0 },
        vel: { x: 0, y: 0 },
        acc: { x: 0, y: 0 },
        mass: 5.972e24,
        radius: 6371000,
        color: "#5577FF"
    };
    var moon = {
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
function gravitationalForce(a, b, G) {
    if (G === void 0) { G = 6.67300e-11; }
    var dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y, dSquared = dx * dx + dy * dy, d = Math.sqrt(dSquared), F = (G * a.mass * b.mass) / (dSquared), force = { x: F * (dx / d), y: F * (dy / d) };
    return force;
}
function applyForce(obj, force) {
    obj.acc.x += force.x / obj.mass;
    obj.acc.y += force.y / obj.mass;
}
function formatTime(time) {
    var h = Math.floor(time / 3600);
    time = time % 3600;
    var m = Math.floor(time / 60);
    time = time % 60;
    var s = time;
    return fn(h.toString()) + ":" + fn(m.toString()) + ":" + fn(s.toFixed(3), 6);
    function fn(s, len) {
        if (len === void 0) { len = 2; }
        if (s.length < len) {
            return ("0" + s).substr(-len);
        }
        else {
            return s;
        }
    }
}
function colliding(a, b) {
    var dx = b.pos.x - a.pos.x, dy = b.pos.y - a.pos.y, d = dx * dx + dy * dy, r = a.radius + b.radius, rs = r * r;
    return d < rs;
}
function scalePos(v, origin, scale) {
    var res = { x: 0, y: 0 };
    res.x = origin.x + (v.x * scale);
    res.y = origin.y - (v.y * scale);
    return res;
}
document.addEventListener("DOMContentLoaded", function () {
    // Configure the simulation here
    var timescale = 36000, framerate = 60, precision = 1000;
    // End of configuration area
    var canvas = document.getElementById("canvas"), ctx = canvas.getContext("2d"), stepsPerSimSecond = framerate * Math.ceil(precision / framerate), framesPerSimSecond = framerate / timescale, stepsPerFrame = Math.floor(stepsPerSimSecond / framesPerSimSecond), dt = 1 / stepsPerSimSecond, scale = 0.000001, planets = [], origin = { x: 0, y: 0 };
    var time = 0;
    canvas.width = document.body.offsetWidth;
    canvas.height = document.body.offsetHeight;
    origin.x = canvas.width / 2;
    origin.y = canvas.height / 2;
    initPlanets(planets);
    window.requestAnimationFrame(frame);
    function frame() {
        for (var s = 0; s < stepsPerFrame; s++) {
            for (var a = 0; a < planets.length; a++) {
                var pA = planets[a];
                pA.acc.x = pA.acc.y = 0;
                for (var b = 0; b < a; b++) {
                    var pB = planets[b], force = gravitationalForce(pA, pB);
                    applyForce(pA, force);
                    applyForce(pB, { x: -force.x, y: -force.y });
                }
            }
            for (var _i = 0, planets_1 = planets; _i < planets_1.length; _i++) {
                var planet = planets_1[_i];
                verletParticle(planet, dt);
            }
            time += dt;
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (var _a = 0, planets_2 = planets; _a < planets_2.length; _a++) {
            var planet = planets_2[_a];
            var pos = scalePos(planet.pos, origin, scale), vel = Math.sqrt(planet.vel.x * planet.vel.x + planet.vel.y * planet.vel.y), labelPos = scalePos({ x: planet.pos.x + planet.radius, y: planet.pos.y + planet.radius }, origin, scale);
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
