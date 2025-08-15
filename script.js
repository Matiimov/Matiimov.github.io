// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Theme switcher
const root = document.documentElement;
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);
themeToggle?.addEventListener("click", () => {
  const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
});

// Mobile navigation
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
navToggle?.addEventListener("click", () => {
  const showing = navLinks.classList.toggle("show");
  navToggle.setAttribute("aria-expanded", showing ? "true" : "false");
});
navLinks?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => navLinks.classList.remove("show"));
});

// Smooth scroll with header offset
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    if (id.length > 1) {
      const el = document.querySelector(id);
      if (el) {
        e.preventDefault();
        const y = el.getBoundingClientRect().top + window.pageYOffset - 70;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    }
  });
});

// Particle background
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d", { alpha: true });

let W, H, DPR;
function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  W = canvas.clientWidth;
  H = canvas.clientHeight;
  canvas.width = Math.floor(W * DPR);
  canvas.height = Math.floor(H * DPR);
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}
resize();
window.addEventListener("resize", resize);

// Config
const COUNT = 120;
const SPEED = 0.35;
const LINK_DIST = 140;
const P_SIZE = 2.0;
const MOUSE_PULL = 0.06;
const RETURN_FORCE = 0.002;

const points = [];
const mouse = { x: 0, y: 0, active: false };

// Initialize particles
function init() {
  points.length = 0;
  for (let i = 0; i < COUNT; i++) {
    points.push({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * SPEED,
      vy: (Math.random() - 0.5) * SPEED,
    });
  }
}
init();

// Mouse interaction
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  mouse.x = e.clientX - rect.left;
  mouse.y = e.clientY - rect.top;
  mouse.active = true;
});
canvas.addEventListener("mouseleave", () => (mouse.active = false));

// Flow field
function flowField(x, y, t) {
  const nx = (x / W) * 2 * Math.PI + t * 0.0006;
  const ny = (y / H) * 2 * Math.PI + t * 0.0008;
  const fx = Math.cos(nx) * 0.5 + Math.sin(ny) * 0.5;
  const fy = Math.sin(nx) * 0.5 - Math.cos(ny) * 0.5;
  return { fx, fy };
}

// Animation loop
function loop(t) {
  ctx.clearRect(0, 0, W, H);

  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  const dot = isDark ? "#9fb3c8" : "#475569";
  const line = isDark
    ? "rgba(160, 190, 220, 0.35)"
    : "rgba(71, 85, 105, 0.35)";

  for (let i = 0; i < COUNT; i++) {
    const p = points[i];

    const { fx, fy } = flowField(p.x, p.y, t);
    p.vx += fx * RETURN_FORCE;
    p.vy += fy * RETURN_FORCE;

    if (mouse.active) {
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const d2 = Math.max(dx * dx + dy * dy, 1);
      const pull = MOUSE_PULL / d2;
      p.vx += dx * pull;
      p.vy += dy * pull;
    }

    p.x += p.vx;
    p.y += p.vy;

    if (p.x < -20) p.x = W + 20;
    if (p.x > W + 20) p.x = -20;
    if (p.y < -20) p.y = H + 20;
    if (p.y > H + 20) p.y = -20;

    ctx.beginPath();
    ctx.arc(p.x, p.y, P_SIZE, 0, Math.PI * 2);
    ctx.fillStyle = dot;
    ctx.fill();
  }

  for (let i = 0; i < COUNT; i++) {
    for (let j = i + 1; j < COUNT; j++) {
      const a = points[i], b = points[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.hypot(dx, dy);
      if (d < LINK_DIST) {
        const alpha = 1 - d / LINK_DIST;
        ctx.strokeStyle = line.replace(
          /0\.35\)$/,
          `${(0.2 + 0.6 * alpha).toFixed(2)})`
        );
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

