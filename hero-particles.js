(function () {
  const HERO_SELECTOR = ".hero";
  const DPR_CAP = 1.5;

  const idle = (callback) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 1800 });
      return;
    }
    window.setTimeout(callback, 450);
  };

  const shouldSkip = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    const verySmall = window.innerWidth < 420;
    return reducedMotion || saveData || verySmall;
  };

  const start = () => {
    if (shouldSkip()) return;

    const hero = document.querySelector(HERO_SELECTOR);
    if (!hero) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-particles-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = true;
    let frame = 0;
    let pointerActive = false;
    let pointerX = -9999;
    let pointerY = -9999;
    let particles = [];

    const makeParticles = () => {
      const mobile = window.innerWidth < 760;
      const cores = navigator.hardwareConcurrency || 4;
      const memory = navigator.deviceMemory || 4;
      const lowEnd = cores <= 2 || memory <= 2;
      const count = lowEnd ? 24 : mobile ? 38 : 72;

      particles = Array.from({ length: count }, (_, index) => {
        const x = Math.random() * width;
        const y = Math.random() * height;
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: 0,
          vy: 0,
          radius: index % 8 === 0 ? 2.1 : 1.25 + Math.random() * 1.4,
          warm: index % 7 === 0,
          drift: Math.random() * Math.PI * 2,
        };
      });
    };

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };

    const updatePointer = (clientX, clientY) => {
      const rect = hero.getBoundingClientRect();
      pointerX = clientX - rect.left;
      pointerY = clientY - rect.top;
      pointerActive = pointerX >= 0 && pointerX <= rect.width && pointerY >= 0 && pointerY <= rect.height;
    };

    const paint = () => {
      if (!running) {
        frame = window.requestAnimationFrame(paint);
        return;
      }

      ctx.clearRect(0, 0, width, height);
      const glow = ctx.createRadialGradient(width * 0.72, height * 0.3, 0, width * 0.72, height * 0.3, width * 0.7);
      glow.addColorStop(0, "rgba(255,255,255,0.08)");
      glow.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);

      for (const particle of particles) {
        const dx = particle.x - pointerX;
        const dy = particle.y - pointerY;
        const distSq = dx * dx + dy * dy;

        if (pointerActive && distSq < 15000) {
          const dist = Math.sqrt(distSq) || 1;
          const force = (1 - dist / 122) * 1.9;
          particle.vx += (dx / dist) * force;
          particle.vy += (dy / dist) * force;
        }

        particle.drift += 0.006;
        particle.vx += (particle.ox - particle.x) * 0.012 + Math.cos(particle.drift) * 0.004;
        particle.vy += (particle.oy - particle.y) * 0.012 + Math.sin(particle.drift) * 0.004;
        particle.vx *= 0.9;
        particle.vy *= 0.9;
        particle.x += particle.vx;
        particle.y += particle.vy;

        const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.radius * 4.2);
        gradient.addColorStop(0, particle.warm ? "rgba(234,141,54,0.85)" : "rgba(245,243,239,0.92)");
        gradient.addColorStop(1, "rgba(245,243,239,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius * 4.2, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = window.requestAnimationFrame(paint);
    };

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    }, { threshold: 0.02 });

    resize();
    observer.observe(hero);
    window.addEventListener("resize", resize, { passive: true });
    hero.addEventListener("pointermove", (event) => updatePointer(event.clientX, event.clientY), { passive: true });
    hero.addEventListener("pointerleave", () => { pointerActive = false; }, { passive: true });
    frame = window.requestAnimationFrame(paint);

    window.addEventListener("pagehide", () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    }, { once: true });
  };

  window.addEventListener("load", () => idle(start), { once: true });
})();
