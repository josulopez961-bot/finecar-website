(function () {
  const HERO_SELECTOR = ".hero";
  const IMAGE_SELECTOR = ".hero > img";
  const DPR_CAP = 1.5;

  const idle = (callback) => {
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(callback, { timeout: 2200 });
      return;
    }
    window.setTimeout(callback, 650);
  };

  const shouldSkip = () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const saveData = navigator.connection && navigator.connection.saveData;
    const memory = navigator.deviceMemory || 4;
    const cores = navigator.hardwareConcurrency || 4;
    return reducedMotion || saveData || window.innerWidth < 760 || memory <= 2 || cores <= 2;
  };

  const compile = (gl, type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  };

  const start = () => {
    if (shouldSkip()) return;

    const hero = document.querySelector(HERO_SELECTOR);
    const image = document.querySelector(IMAGE_SELECTOR);
    if (!hero || !image || !image.currentSrc) return;

    const canvas = document.createElement("canvas");
    canvas.className = "hero-distort-canvas";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, image.nextSibling);

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      depth: false,
      preserveDrawingBuffer: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vertexSource = `
      attribute vec2 a_position;
      varying vec2 v_uv;
      void main() {
        v_uv = a_position * 0.5 + 0.5;
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform sampler2D u_image;
      uniform vec2 u_resolution;
      uniform vec2 u_pointer;
      uniform float u_time;
      uniform float u_strength;
      varying vec2 v_uv;

      vec2 coverUv(vec2 uv, vec2 resolution, vec2 imageSize) {
        float screenRatio = resolution.x / resolution.y;
        float imageRatio = imageSize.x / imageSize.y;
        vec2 scale = vec2(1.0);
        if (screenRatio > imageRatio) {
          scale.y = imageRatio / screenRatio;
        } else {
          scale.x = screenRatio / imageRatio;
        }
        return (uv - 0.5) * scale + 0.5;
      }

      void main() {
        vec2 imageSize = vec2(1600.0, 1067.0);
        vec2 uv = coverUv(v_uv, u_resolution, imageSize);
        vec2 pointer = u_pointer / u_resolution;
        pointer.y = 1.0 - pointer.y;

        float d = distance(v_uv, pointer);
        float ripple = sin(d * 46.0 - u_time * 4.0) * smoothstep(0.32, 0.0, d) * u_strength;
        float idleWave = sin((v_uv.x + v_uv.y) * 9.0 + u_time * 0.65) * 0.0018;
        vec2 offset = normalize(v_uv - pointer + 0.0001) * ripple + vec2(idleWave, idleWave * 0.45);

        gl_FragColor = texture2D(u_image, uv + offset);
      }
    `;

    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertex || !fragment) return;

    const program = gl.createProgram();
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const position = gl.getAttribLocation(program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointer = gl.getUniformLocation(program, "u_pointer");
    const time = gl.getUniformLocation(program, "u_time");
    const strength = gl.getUniformLocation(program, "u_strength");

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    let width = 0;
    let height = 0;
    let dpr = 1;
    let running = true;
    let frame = 0;
    let pointerX = -9999;
    let pointerY = -9999;
    let targetStrength = 0;
    let currentStrength = 0;

    const resize = () => {
      const rect = hero.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(DPR_CAP, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    const draw = (now) => {
      if (running) {
        currentStrength += (targetStrength - currentStrength) * 0.06;
        targetStrength *= 0.985;

        gl.useProgram(program);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(position);
        gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
        gl.uniform2f(resolution, width, height);
        gl.uniform2f(pointer, pointerX, pointerY);
        gl.uniform1f(time, now * 0.001);
        gl.uniform1f(strength, Math.min(0.018, currentStrength));
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
      frame = window.requestAnimationFrame(draw);
    };

    const webglImage = new Image();
    webglImage.decoding = "async";
    webglImage.src = image.currentSrc;
    webglImage.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webglImage);
      resize();
      hero.classList.add("hero-distort-ready");
      frame = window.requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(([entry]) => {
      running = entry.isIntersecting;
    }, { threshold: 0.02 });

    observer.observe(hero);
    window.addEventListener("resize", resize, { passive: true });
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      pointerX = event.clientX - rect.left;
      pointerY = event.clientY - rect.top;
      targetStrength = 0.016;
    }, { passive: true });
    hero.addEventListener("pointerleave", () => {
      targetStrength = 0;
    }, { passive: true });
    window.addEventListener("pagehide", () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    }, { once: true });
  };

  window.addEventListener("load", () => idle(start), { once: true });
})();
