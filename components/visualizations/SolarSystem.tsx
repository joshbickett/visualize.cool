'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';

type Ring = {
  inner: number;
  outer: number;
  tilt_deg: number;
};

type Body = {
  name: string;
  type: 'star' | 'planet';
  color: string;
  color2: string;
  sma_au: number;
  radius_km: number;
  period_days: number;
  ring: Ring | null;
  eccentricity: number;
  perihelion_deg: number;
};

type Point = { x: number; y: number };

type CameraAnim = {
  start: { x: number; y: number; zoom: number };
  end: { x: number; y: number; zoom: number };
  t0: number;
  dur: number;
};

type TrailMap = Record<string, Point[]>;

type SolarSystemProps = {
  height?: React.CSSProperties['height'];
  initialZoom?: number;
  initialSpeed?: number;
  className?: string;
  style?: React.CSSProperties;
};

const AU_KM = 149_597_870.7;
const TAU = Math.PI * 2;
const ZOOM_MIN = 0.02;
const ZOOM_MAX = 200_000;
const ZOOM_SLIDER_EXP = 3.4;
const SPEED_MIN = 0;
const SPEED_MAX = 20_000;

/**
 * SolarSystem
 * High-fidelity solar system scale visualization focused on physical accuracy.
 *
 * Props:
 *  - height: CSS height for the component container (default: '100vh')
 *  - initialZoom: number (0.02..200000, default 1)
 *  - initialSpeed: number (days/second, default 250)
 *  - className: optional wrapper class
 *  - style: optional wrapper style
 */
export default function SolarSystem({
  height = '100vh',
  initialZoom = 1,
  initialSpeed = 250,
  className,
  style
}: SolarSystemProps) {
  const BODIES = useMemo<Body[]>(
    () => [
      {
        name: 'Sun',
        type: 'star',
        color: '#ffde8a',
        color2: '#ff9f3b',
        sma_au: 0,
        radius_km: 695_700,
        period_days: Number.POSITIVE_INFINITY,
        ring: null,
        eccentricity: 0,
        perihelion_deg: 0
      },
      {
        name: 'Mercury',
        type: 'planet',
        color: '#c0b7b1',
        color2: '#8e8a86',
        sma_au: 0.387098,
        radius_km: 2439.7,
        period_days: 87.969,
        ring: null,
        eccentricity: 0.20563,
        perihelion_deg: 77.4578
      },
      {
        name: 'Venus',
        type: 'planet',
        color: '#e6d7a3',
        color2: '#cdb788',
        sma_au: 0.723332,
        radius_km: 6051.8,
        period_days: 224.701,
        ring: null,
        eccentricity: 0.006772,
        perihelion_deg: 131.6025
      },
      {
        name: 'Earth',
        type: 'planet',
        color: '#6bb6ff',
        color2: '#2f84ff',
        sma_au: 1,
        radius_km: 6371,
        period_days: 365.256,
        ring: null,
        eccentricity: 0.016710,
        perihelion_deg: 102.9377
      },
      {
        name: 'Mars',
        type: 'planet',
        color: '#e6733e',
        color2: '#c14b1c',
        sma_au: 1.523679,
        radius_km: 3389.5,
        period_days: 686.98,
        ring: null,
        eccentricity: 0.093394,
        perihelion_deg: 336.0408
      },
      {
        name: 'Jupiter',
        type: 'planet',
        color: '#d2b48c',
        color2: '#c08c57',
        sma_au: 5.2044,
        radius_km: 69_911,
        period_days: 4332.589,
        ring: null,
        eccentricity: 0.048386,
        perihelion_deg: 14.7539
      },
      {
        name: 'Saturn',
        type: 'planet',
        color: '#ecdcb2',
        color2: '#d0b98a',
        sma_au: 9.5826,
        radius_km: 58_232,
        period_days: 10_759.22,
        ring: { inner: 1.15, outer: 2.41, tilt_deg: 26.7 },
        eccentricity: 0.053862,
        perihelion_deg: 92.4319
      },
      {
        name: 'Uranus',
        type: 'planet',
        color: '#7ad7f0',
        color2: '#6dbdd8',
        sma_au: 19.2184,
        radius_km: 25_362,
        period_days: 30_685.4,
        ring: { inner: 1.6, outer: 2, tilt_deg: 97.8 },
        eccentricity: 0.047257,
        perihelion_deg: 170.9642
      },
      {
        name: 'Neptune',
        type: 'planet',
        color: '#4c77ff',
        color2: '#3158d6',
        sma_au: 30.11,
        radius_km: 24_622,
        period_days: 60_190,
        ring: null,
        eccentricity: 0.008590,
        perihelion_deg: 44.9714
      }
    ],
    []
  );

  const MAX_AU = useMemo(
    () => Math.max(...BODIES.map((body) => body.sma_au * (1 + body.eccentricity))),
    [BODIES]
  );

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const rafRef = useRef(0);
  const draggingRef = useRef({ active: false, lastX: 0, lastY: 0 });
  const cameraAnimRef = useRef<CameraAnim | null>(null);
  const starsRef = useRef<Array<{ x: number; y: number; r: number; a: number }>>([]);
  const trailRef = useRef<TrailMap>({});

  const stateRef = useRef({
    paused: false,
    showOrbits: true,
    showLabels: true,
    showTrails: false,
    zoom: initialZoom,
    baseScale: 18,
    speed: initialSpeed,
    timeDays: 0,
    camera: { x: 0, y: 0 },
    focus: 'Sun',
    lastFrameMs: 0
  });

  const [zoom, setZoom] = useState(initialZoom);
  const [speed, setSpeed] = useState(initialSpeed);
  const [focus, setFocus] = useState('Sun');
  const [paused, setPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);

  const toScreen = useCallback((x: number, y: number) => {
    const { w, h } = sizeRef.current;
    const state = stateRef.current;
    const scale = state.baseScale * state.zoom;
    return { x: (x - state.camera.x) * scale + w / 2, y: (y - state.camera.y) * scale + h / 2 };
  }, []);

  const toWorld = useCallback((px: number, py: number) => {
    const { w, h } = sizeRef.current;
    const state = stateRef.current;
    const scale = state.baseScale * state.zoom;
    return { x: (px - w / 2) / scale + state.camera.x, y: (py - h / 2) / scale + state.camera.y };
  }, []);

  const bodyByName = useCallback(
    (name: string) => BODIES.find((b) => b.name === name),
    [BODIES]
  );

  const bodyPositionAUprime = useCallback((body: Body | undefined, tDays: number) => {
    if (!body || body.name === 'Sun') return { x: 0, y: 0 };
    const a = body.sma_au;
    const e = body.eccentricity;
    if (e === 0) {
      const angle = TAU * ((tDays % body.period_days) / body.period_days);
      return { x: a * Math.cos(angle), y: a * Math.sin(angle) };
    }

    const meanMotion = TAU / body.period_days;
    const meanAnomaly = normalizeAngle(meanMotion * tDays);
    const eccentricAnomaly = solveKepler(meanAnomaly, e);
    const cosE = Math.cos(eccentricAnomaly);
    const sinE = Math.sin(eccentricAnomaly);
    const xPrime = a * (cosE - e);
    const yPrime = a * Math.sqrt(1 - e * e) * sinE;
    const omega = toRadians(body.perihelion_deg);
    const cosO = Math.cos(omega);
    const sinO = Math.sin(omega);
    return {
      x: xPrime * cosO - yPrime * sinO,
      y: xPrime * sinO + yPrime * cosO
    };
  }, []);

  const planetPixelRadius = useCallback((body: Body) => {
    const { baseScale, zoom } = stateRef.current;
    const pixelsPerAU = baseScale * zoom;
    return (body.radius_km / AU_KM) * pixelsPerAU;
  }, []);

  const fitAll = useCallback(() => {
    const { w, h } = sizeRef.current;
    const maxR = MAX_AU;
    const pad = 0.1;
    const usable = Math.min(w, h) * (1 - pad * 2);
    const scale = usable / (2 * maxR);
    stateRef.current.baseScale = Math.max(6, scale);
  }, [MAX_AU]);

  const focusBody = useCallback(
    (name: string, animate = true) => {
      const state = stateRef.current;
      const target = bodyByName(name) ?? BODIES[0];
      state.focus = target.name;
      setFocus(target.name);

      const pos = bodyPositionAUprime(target, state.timeDays);
      const { w, h } = sizeRef.current;
      const viewportMin = Math.max(320, Math.min(w, h));
      const radiusAU = target.radius_km / AU_KM;
      const bodyScale = Math.max(radiusAU * state.baseScale, 1e-9);
      const preferredPx = target.name === 'Sun'
        ? Math.max(viewportMin * 0.28, 220)
        : Math.max(24, Math.min(viewportMin * 0.22, 120));
      let desiredZoom = clamp(preferredPx / bodyScale, ZOOM_MIN, ZOOM_MAX);

      if (animate) {
        cameraAnimRef.current = {
          start: { x: state.camera.x, y: state.camera.y, zoom: state.zoom },
          end: { x: pos.x, y: pos.y, zoom: desiredZoom },
          t0: performance.now(),
          dur: 500
        };
      } else {
        state.camera.x = pos.x;
        state.camera.y = pos.y;
        state.zoom = desiredZoom;
        setZoom(desiredZoom);
      }
    },
    [BODIES, bodyByName, bodyPositionAUprime]
  );

  const drawStarfield = useCallback((ctx: CanvasRenderingContext2D) => {
    const { w, h } = sizeRef.current;
    const state = stateRef.current;
    const par = 0.08;
    ctx.save();
    ctx.translate(
      w / 2 - state.camera.x * state.baseScale * state.zoom * par,
      h / 2 - state.camera.y * state.baseScale * state.zoom * par
    );
    ctx.scale(state.baseScale * 0.02, state.baseScale * 0.02);
    for (const star of starsRef.current) {
      ctx.globalAlpha = star.a;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(star.x, star.y, star.r, star.r);
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }, []);

  const drawSunGlow = useCallback((ctx: CanvasRenderingContext2D, px: number, py: number, radius: number) => {
    const glowRadius = Math.max(radius * 60, 140);
    const gradient = ctx.createRadialGradient(px, py, 0, px, py, glowRadius);
    gradient.addColorStop(0, 'rgba(255,220,120,0.35)');
    gradient.addColorStop(1, 'rgba(255,165,60,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(px, py, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawOrbit = useCallback(
    (ctx: CanvasRenderingContext2D, body: Body) => {
      if (body.name === 'Sun' || !stateRef.current.showOrbits) return;
      const e = body.eccentricity;
      const omega = toRadians(body.perihelion_deg);
      const cosO = Math.cos(omega);
      const sinO = Math.sin(omega);
      const scale = stateRef.current.baseScale * stateRef.current.zoom;
      const segments = 256;

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const M = (TAU * i) / segments;
        const E = e === 0 ? M : solveKepler(M, e);
        const cosE = Math.cos(E);
        const sinE = Math.sin(E);
        const xPrime = body.sma_au * (cosE - e);
        const yPrime = body.sma_au * Math.sqrt(1 - e * e) * sinE;
        const x = xPrime * cosO - yPrime * sinO;
        const y = xPrime * sinO + yPrime * cosO;
        const screen = toScreen(x, y);
        if (i === 0) ctx.moveTo(screen.x, screen.y);
        else ctx.lineTo(screen.x, screen.y);
      }
      ctx.stroke();
    },
    [toScreen]
  );

  const drawRing = useCallback(
    (ctx: CanvasRenderingContext2D, body: Body, px: number, py: number, pr: number) => {
      if (!body.ring) return;
      const inner = pr * body.ring.inner;
      const outer = pr * body.ring.outer;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(-Math.PI / 7);
      const ry = Math.cos((body.ring.tilt_deg * Math.PI) / 180);
      ctx.scale(1, ry);

      ctx.beginPath();
      ctx.ellipse(0, 0, outer, outer, 0, 0, Math.PI * 2);
      ctx.clip();

      const gradient = ctx.createRadialGradient(0, 0, inner * 0.8, 0, 0, outer);
      gradient.addColorStop(0, 'rgba(255,255,255,0)');
      gradient.addColorStop(0.4, 'rgba(255,255,255,0.20)');
      gradient.addColorStop(0.9, 'rgba(255,255,255,0.03)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = gradient;
      ctx.lineWidth = Math.max(1, outer - inner);
      ctx.beginPath();
      ctx.ellipse(0, 0, (inner + outer) / 2, (inner + outer) / 2, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    },
    []
  );

  const drawBody = useCallback(
    (ctx: CanvasRenderingContext2D, body: Body) => {
      const state = stateRef.current;
      const planetPos = bodyPositionAUprime(body, state.timeDays);
      const point = toScreen(planetPos.x, planetPos.y);
      const radius = planetPixelRadius(body);

      if (body.name === 'Sun') drawSunGlow(ctx, point.x, point.y, radius);

      const gradient = ctx.createRadialGradient(
        point.x - radius * 0.3,
        point.y - radius * 0.3,
        radius * 0.1,
        point.x,
        point.y,
        radius * 1.2
      );
      gradient.addColorStop(0, body.color);
      gradient.addColorStop(0.5, body.color2);
      gradient.addColorStop(1, 'rgba(0,0,0,0.6)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = Math.max(1, radius * 0.05);
      ctx.beginPath();
      ctx.arc(point.x, point.y, radius, 0.15 * Math.PI, 0.85 * Math.PI);
      ctx.stroke();

      if (body.ring) drawRing(ctx, body, point.x, point.y, radius);

      if (state.showLabels) {
        ctx.font = '12px system-ui, -apple-system, Segoe UI, Roboto';
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.textAlign = 'center';
        ctx.fillText(body.name, point.x, point.y - radius - 6);
      }

      if (state.showTrails && body.name !== 'Sun') {
        const key = body.name;
        if (!trailRef.current[key]) trailRef.current[key] = [];
        const arr = trailRef.current[key];
        arr.push({ x: point.x, y: point.y });
        if (arr.length > 80) arr.shift();
        ctx.strokeStyle = 'rgba(170,200,255,0.18)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        arr.forEach((pos, idx) => {
          if (idx === 0) ctx.moveTo(pos.x, pos.y);
          else ctx.lineTo(pos.x, pos.y);
        });
        ctx.stroke();
      }

      return { screen: point, radius, posAU: planetPos };
    },
    [bodyPositionAUprime, drawRing, drawSunGlow, planetPixelRadius, toScreen]
  );

  const drawHUDCrosshair = useCallback((ctx: CanvasRenderingContext2D) => {
    const center = toScreen(0, 0);
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(center.x - 8, center.y);
    ctx.lineTo(center.x + 8, center.y);
    ctx.moveTo(center.x, center.y - 8);
    ctx.lineTo(center.x, center.y + 8);
    ctx.stroke();
  }, [toScreen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapRef.current;
    if (!canvas || !wrapper) return;
    const context = canvas.getContext('2d');
    if (!context) return;
    ctxRef.current = context;

    const STAR_COUNT = 800;
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      x: rand(-200, 200),
      y: rand(-200, 200),
      r: Math.random() < 0.9 ? rand(0.15, 0.6) : rand(0.6, 1.3),
      a: rand(0.2, 0.85)
    }));
    starsRef.current = stars;

    const resize = () => {
      const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const rect = wrapper.getBoundingClientRect();
      sizeRef.current = { w: Math.floor(rect.width), h: Math.floor(rect.height), dpr };
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      fitAll();
    };

    resize();
    window.addEventListener('resize', resize);

    const tick = (now: number) => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      const anim = cameraAnimRef.current;
      if (anim) {
        const t = Math.min(1, (now - anim.t0) / anim.dur);
        const eased = (1 - Math.cos(t * Math.PI)) * 0.5;
        const state = stateRef.current;
        state.camera.x = lerp(anim.start.x, anim.end.x, eased);
        state.camera.y = lerp(anim.start.y, anim.end.y, eased);
        state.zoom = lerp(anim.start.zoom, anim.end.zoom, eased);
        setZoom(state.zoom);
        if (t >= 1) cameraAnimRef.current = null;
      }

      const state = stateRef.current;
      if (!state.lastFrameMs) {
        state.lastFrameMs = now;
      }
      const dt = Math.min(100, now - state.lastFrameMs);
      state.lastFrameMs = now;
      if (!state.paused) state.timeDays += (dt / 1000) * state.speed;

      const { w, h } = sizeRef.current;
      ctx.clearRect(0, 0, w, h);
      drawStarfield(ctx);
      if (state.showOrbits) {
        BODIES.forEach((body) => drawOrbit(ctx, body));
      }

      const positions: Record<string, { screen: Point; radius: number }> = {};
      BODIES.forEach((body) => {
        positions[body.name] = drawBody(ctx, body);
      });

      drawHUDCrosshair(ctx);

      const focusedBody = bodyByName(state.focus) ?? BODIES[0];
      const info = positions[focusedBody.name];
      if (info) {
        ctx.strokeStyle = 'rgba(106,227,255,0.45)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(info.screen.x, info.screen.y, info.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const onPointerDown = (event: PointerEvent) => {
      draggingRef.current = { active: true, lastX: event.clientX, lastY: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    };

    const onPointerMove = (event: PointerEvent) => {
      const dragState = draggingRef.current;
      if (!dragState.active) return;
      const state = stateRef.current;
      const scale = state.baseScale * state.zoom;
      state.camera.x -= (event.clientX - dragState.lastX) / scale;
      state.camera.y -= (event.clientY - dragState.lastY) / scale;
      dragState.lastX = event.clientX;
      dragState.lastY = event.clientY;
    };

    const onPointerUp = () => {
      draggingRef.current.active = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const state = stateRef.current;
      const { zoom: zoomPrev } = state;
      const delta = Math.sign(event.deltaY) * -0.08;
      const zoomNext = clamp(zoomPrev * (1 + delta), ZOOM_MIN, ZOOM_MAX);
      if (zoomNext === zoomPrev) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const worldBefore = toWorld(mouseX, mouseY);
      state.zoom = zoomNext;
      setZoom(zoomNext);
      const worldAfter = toWorld(mouseX, mouseY);
      state.camera.x += worldBefore.x - worldAfter.x;
      state.camera.y += worldBefore.y - worldAfter.y;
    };

    const onClick = (event: MouseEvent) => {
      const state = stateRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = event.clientX - rect.left;
      const my = event.clientY - rect.top;
      let best: Body | undefined;
      let bestDistance = Number.POSITIVE_INFINITY;

      BODIES.forEach((body) => {
        const pos = bodyPositionAUprime(body, state.timeDays);
        const point = toScreen(pos.x, pos.y);
        const radius = planetPixelRadius(body);
        const distance = Math.hypot(mx - point.x, my - point.y);
        if (distance < Math.max(10, radius + 6) && distance < bestDistance) {
          best = body;
          bestDistance = distance;
        }
      });

      if (best !== undefined) {
        focusBody(best.name, true);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.code === 'Space') {
        event.preventDefault();
        togglePause();
        return;
      }
      const index = '123456789'.indexOf(event.key);
      if (index >= 0 && index < BODIES.length) {
        focusBody(BODIES[index].name, true);
      } else if (event.key === 'f' || event.key === 'F') {
        fitAll();
      }
    };

    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('wheel', onWheel, { passive: false });
    canvas.addEventListener('click', onClick);
    window.addEventListener('keydown', onKey);

    fitAll();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('click', onClick);
    };
  }, [
    BODIES,
    bodyByName,
    bodyPositionAUprime,
    drawBody,
    drawHUDCrosshair,
    drawOrbit,
    drawStarfield,
    fitAll,
    focusBody,
    planetPixelRadius,
    toScreen,
    toWorld
  ]);

  useEffect(() => {
    const update = () => {
      const wrap = wrapRef.current;
      const active = wrap ? getFullscreenElement() === wrap : false;
      setIsFullscreen(active);
      window.setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 60);
    };

    document.addEventListener('fullscreenchange', update);
    document.addEventListener('webkitfullscreenchange' as any, update);
    update();

    return () => {
      document.removeEventListener('fullscreenchange', update);
      document.removeEventListener('webkitfullscreenchange' as any, update);
    };
  }, []);

  const setZoomBoth = (value: number | string) => {
    const next = clamp(Number(value), ZOOM_MIN, ZOOM_MAX);
    setZoom(next);
    stateRef.current.zoom = next;
  };

  const handleZoomSlider = (value: number | string) => {
    const slider = Number(value);
    const actual = sliderToZoom(slider);
    setZoomBoth(actual);
  };

  const setSpeedBoth = (value: number | string) => {
    const next = clamp(Number(value), SPEED_MIN, SPEED_MAX);
    setSpeed(next);
    stateRef.current.speed = next;
  };

  const handleSpeedSlider = (value: number | string) => {
    const slider = Number(value);
    const actual = sliderToSpeed(slider);
    setSpeedBoth(actual);
  };

  const togglePause = () => {
    setPaused((prev) => {
      stateRef.current.paused = !prev;
      return !prev;
    });
  };

  const centerSun = () => {
    stateRef.current.camera.x = 0;
    stateRef.current.camera.y = 0;
  };

  const resetAll = () => {
    const state = stateRef.current;
    state.zoom = 1;
    state.speed = initialSpeed;
    state.camera.x = 0;
    state.camera.y = 0;
    state.focus = 'Sun';
    state.paused = false;
    state.lastFrameMs = 0;
    setZoom(1);
    setSpeed(initialSpeed);
    setFocus('Sun');
    setPaused(false);
    fitAll();
  };

  const toggleFullscreen = () => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const active = getFullscreenElement() === wrap;
    if (!active) {
      void requestElementFullscreen(wrap);
    } else {
      void exitFullscreen();
    }
  };

  const info = useMemo(() => {
    const body = bodyByName(focus) ?? BODIES[0];
    return {
      title: body.name,
      isStar: body.type === 'star',
      radius: body.radius_km,
      sma: body.sma_au,
      periodYears: body.period_days === Number.POSITIVE_INFINITY ? null : body.period_days / 365.25
    };
  }, [BODIES, bodyByName, focus]);

  const zoomDescriptor = useMemo(() => formatZoom(zoom), [zoom]);
  const speedDescriptor = useMemo(() => formatSpeed(speed), [speed]);

  return (
    <div
      ref={wrapRef}
      className={`ss-root ${className ?? ''}`}
      style={{ ...rootStyle, height, ...style }}
    >
      <canvas
        ref={canvasRef}
        className="ss-canvas"
        role="img"
        aria-label="Solar system visualization"
      />

      <div className="ss-hud">
        <div className={`ss-panel${controlsCollapsed ? ' ss-panel--collapsed' : ''}`}>
          <div className="ss-brand">
            <div className="ss-brand-left">
              <div className="ss-dot" />
              <div>
                <h1 className="ss-h1">Solar System Scale</h1>
                <div className="ss-sub">
                  Pan (drag), Zoom (scroll), Select a planet or press <span className="ss-kbd">Space</span>{' '}
                  to pause.
                </div>
              </div>
            </div>
            <button
              type="button"
              className="ss-collapse"
              onClick={() => setControlsCollapsed((prev) => !prev)}
              aria-expanded={!controlsCollapsed}
              aria-controls="ss-controls"
            >
              {controlsCollapsed ? 'Show controls' : 'Hide controls'}
            </button>
          </div>

          {!controlsCollapsed && (
            <>
              <div className="ss-controls" id="ss-controls">
                <label htmlFor="ss-zoom">Zoom</label>
                <div className="ss-sliderwrap">
                  <input
                    id="ss-zoom"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={zoomToSlider(zoom)}
                    onChange={(event) => handleZoomSlider(event.target.value)}
                  />
                  <div className="ss-meta" aria-live="polite">
                    {zoomDescriptor}
                  </div>
                </div>

                <label htmlFor="ss-speed">Orbital speed</label>
                <div className="ss-sliderwrap">
                  <input
                    id="ss-speed"
                    type="range"
                    min="0"
                    max="100"
                    step="1"
                    value={speedToSlider(speed)}
                    onChange={(event) => handleSpeedSlider(event.target.value)}
                  />
                  <div className="ss-meta" aria-live="polite">
                    {speedDescriptor}
                  </div>
                </div>
              </div>

              <div className="ss-chiplist">
                {BODIES.map((body) => (
                  <button
                    key={body.name}
                    className="ss-chip"
                    aria-current={focus === body.name}
                    onClick={() => focusBody(body.name, true)}
                    type="button"
                  >
                    {body.name}
                  </button>
                ))}
              </div>

              <div className="ss-legend">
                Scale is fixed to real radii and orbital distances, with orbits following true
                eccentricities and perihelion angles. Use the deep zoom range and adaptive speed to
                inspect inner planets without distorting proportions. Press <span className="ss-kbd">F</span>
                to fit everything.
              </div>
            </>
          )}
          {controlsCollapsed && (
            <div className="ss-collapsed-hint">
              Controls hidden · show them to adjust zoom depth and orbital speed.
            </div>
          )}
        </div>

        <div className="ss-panel ss-right">
          <div className="ss-info">
            <div>
              <b>{info.title}</b> {info.isStar ? '• Star' : '• Planet'}
            </div>
            {info.isStar ? (
              <div>
                Mean radius: <b>{formatKM(info.radius)}</b>
              </div>
            ) : (
              <>
                <div>
                  Mean distance: <b>{info.sma.toFixed(3)} AU</b>
                </div>
                <div>
                  Mean radius: <b>{formatKM(info.radius)}</b>
                </div>
                <div>
                  Orbital period: <b>{info.periodYears?.toFixed(2)} years</b>
                </div>
              </>
            )}
            <div className="ss-tip">
              Tip: <span className="ss-kbd">1</span>…<span className="ss-kbd">9</span> to jump;{' '}
              <span className="ss-kbd">Space</span> pause.
            </div>
          </div>
        </div>
      </div>

      <div className="ss-footer">
        <div className="ss-panel">
          © {new Date().getFullYear()} visualize.cool · Mean radii & semi-major axes; circular,
          coplanar orbits for clarity.
        </div>
        <div className="ss-row">
          <button
            className="ss-btn"
            onClick={toggleFullscreen}
            type="button"
            aria-pressed={isFullscreen}
            title={isFullscreen ? 'Exit fullscreen view' : 'Enter fullscreen view'}
          >
            {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          </button>
          <button className="ss-btn" onClick={fitAll} type="button">
            Fit all
          </button>
          <button className="ss-btn" onClick={centerSun} type="button">
            Center Sun
          </button>
          <button className="ss-btn" onClick={resetAll} type="button">
            Reset
          </button>
          <button className="ss-btn" onClick={togglePause} type="button">
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>

      <style>{css}</style>
    </div>
  );
}

function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function formatKM(n: number) {
  return `${Math.round(n).toLocaleString()} km`;
}

function formatNumber(n: number) {
  if (n >= 1000) return n.toFixed(0);
  if (n >= 10) return n.toFixed(1);
  return n.toFixed(2);
}

function sliderToZoom(slider: number) {
  const t = Math.pow(clamp(slider / 100, 0, 1), ZOOM_SLIDER_EXP);
  const ratio = Math.pow(ZOOM_MAX / ZOOM_MIN, t);
  return clamp(ZOOM_MIN * ratio, ZOOM_MIN, ZOOM_MAX);
}

function zoomToSlider(zoom: number) {
  const safeZoom = clamp(zoom, ZOOM_MIN, ZOOM_MAX);
  const totalRatio = ZOOM_MAX / ZOOM_MIN;
  const ratio = safeZoom / ZOOM_MIN;
  const t = Math.log(ratio) / Math.log(totalRatio || 10);
  const slider = Math.pow(clamp(t, 0, 1), 1 / ZOOM_SLIDER_EXP) * 100;
  return Math.round(slider);
}

function formatZoom(z: number) {
  if (z >= 1000) return `${Math.round(z).toLocaleString()}× zoom`;
  if (z >= 10) return `${z.toFixed(1)}× zoom`;
  if (z >= 1) return `${z.toFixed(2)}× zoom`;
  return `${z.toFixed(3)}× zoom`;
}

function formatSpeed(daysPerSecond: number) {
  if (daysPerSecond <= 0) return 'Paused';
  if (daysPerSecond >= 365) {
    return `${formatNumber(daysPerSecond / 365)} years per second`;
  }
  if (daysPerSecond >= 1) {
    return `${formatNumber(daysPerSecond)} days per second`;
  }
  const secondsPerDay = 1 / daysPerSecond;
  if (secondsPerDay < 60) {
    return `1 day every ${secondsPerDay.toFixed(0)} sec`;
  }
  const minutesPerDay = secondsPerDay / 60;
  if (minutesPerDay < 60) {
    return `1 day every ${minutesPerDay.toFixed(1)} min`;
  }
  const hoursPerDay = minutesPerDay / 60;
  if (hoursPerDay < 48) {
    return `1 day every ${hoursPerDay.toFixed(2)} hr`;
  }
  const daysReal = hoursPerDay / 24;
  if (daysReal < 365) {
    return `1 day every ${daysReal.toFixed(1)} days`;
  }
  const yearsReal = daysReal / 365;
  return `1 day every ${yearsReal.toFixed(2)} years`;
}

function sliderToSpeed(slider: number) {
  const t = clamp(slider / 100, 0, 1);
  const eased = Math.pow(t, 3.2);
  return Math.round(eased * SPEED_MAX);
}

function speedToSlider(speed: number) {
  const t = clamp(speed, SPEED_MIN, SPEED_MAX) / SPEED_MAX;
  const slider = Math.pow(t, 1 / 3.2);
  return Math.round(slider * 100);
}

function toRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function normalizeAngle(angle: number) {
  let a = angle % TAU;
  if (a < 0) a += TAU;
  return a;
}

function solveKepler(meanAnomaly: number, eccentricity: number) {
  const m = normalizeAngle(meanAnomaly);
  let e = eccentricity;
  if (e === 0) return m;
  let E = e < 0.8 ? m : Math.PI;
  for (let i = 0; i < 12; i++) {
    const f = E - e * Math.sin(E) - m;
    const fPrime = 1 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-8) break;
  }
  return E;
}

function getFullscreenElement(): Element | null {
  const doc = document as Document & { webkitFullscreenElement?: Element | null };
  return document.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
}

function requestElementFullscreen(element: HTMLElement) {
  if (element.requestFullscreen) {
    return element.requestFullscreen();
  }
  const anyElement = element as HTMLElement & { webkitRequestFullscreen?: () => void };
  if (anyElement.webkitRequestFullscreen) {
    anyElement.webkitRequestFullscreen();
  }
  return Promise.resolve();
}

function exitFullscreen() {
  if (document.exitFullscreen) {
    return document.exitFullscreen();
  }
  const doc = document as Document & { webkitExitFullscreen?: () => void };
  if (doc.webkitExitFullscreen) {
    doc.webkitExitFullscreen();
  }
  return Promise.resolve();
}

const rootStyle: React.CSSProperties = {
  position: 'relative',
  width: '100%',
  overflow: 'hidden',
  borderRadius: '24px',
  border: '1px solid rgba(255,255,255,0.06)',
  boxShadow: '0 18px 36px rgba(0,0,0,0.4)'
};

const css = `
.ss-root {
  --bg: #0b0f1a; --panel: rgba(20,24,37,0.82); --text: #e8ecf1; --muted: #a7b1c2;
  --accent: #6ae3ff; --accent2: #b084ff; --border: rgba(255,255,255,0.08);
  --shadow: 0 10px 30px rgba(0,0,0,0.35); --radius: 14px;
  background:
    radial-gradient(1200px 800px at 80% -10%, #14203c 0%, rgba(20,32,60,0) 60%),
    radial-gradient(900px 600px at 10% 110%, #26153b 0%, rgba(38,21,59,0) 55%),
    var(--bg);
  color: var(--text);
}
.ss-canvas { position: absolute; inset: 0; display: block; background: transparent; }
.ss-hud { position: absolute; top: 16px; left: 16px; right: 16px; display:flex; gap:16px; align-items:flex-start; pointer-events:none; flex-wrap:wrap; }
.ss-panel {
  pointer-events:auto; background:var(--panel); border:1px solid var(--border);
  box-shadow:var(--shadow); border-radius: var(--radius); padding: 12px 14px;
  backdrop-filter: blur(8px) saturate(120%);
  width: min(100%, 320px);
}
.ss-panel--collapsed { padding: 10px 12px; width: auto; }
.ss-right { margin-left:auto; max-width:300px; }
.ss-brand { display:flex; align-items:flex-start; gap:12px; justify-content:space-between; }
.ss-brand-left { display:flex; align-items:center; gap:10px; }
.ss-dot { width:10px; height:10px; border-radius:50%; background: linear-gradient(180deg, var(--accent), var(--accent2)); box-shadow: 0 0 12px rgba(106,227,255,0.7); }
.ss-h1 { font-size:16px; font-weight:600; margin:0; }
.ss-sub { font-size:12px; color:var(--muted); margin-top:4px; }
.ss-collapse {
  border:1px solid rgba(255,255,255,0.14); border-radius:999px; padding:4px 10px;
  background:rgba(255,255,255,0.06); color:var(--text); font-size:11px;
  letter-spacing:0.04em; text-transform:uppercase; cursor:pointer;
  transition:background 0.2s ease, border-color 0.2s ease;
}
.ss-collapse:hover { background:rgba(106,227,255,0.14); border-color:rgba(106,227,255,0.35); }
.ss-collapsed-hint { font-size:12px; color:var(--muted); margin-top:10px; }
.ss-controls { display:grid; grid-template-columns: 1fr; gap:10px; margin-top:10px; align-items:start; }
.ss-controls label { font-size:12px; color:var(--muted); }
.ss-controls input[type="range"] { width:100%; max-width:240px; accent-color: var(--accent); }
.ss-row { display:flex; gap:10px; align-items:center; }
.ss-sliderwrap { display:grid; gap:6px; }
.ss-meta { font-size:11px; color:rgba(240,244,255,0.65); letter-spacing:0.04em; text-transform:uppercase; }
.ss-chiplist { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; max-width:560px; }
.ss-chip {
  padding:6px 10px; border-radius:999px; font-size:12px; border:1px solid var(--border);
  background: rgba(255,255,255,0.05); cursor:pointer; user-select:none; color:var(--text);
}
.ss-chip[aria-current="true"] { background: linear-gradient(90deg, rgba(106,227,255,0.15), rgba(176,132,255,0.15)); border-color:rgba(255,255,255,0.18) }
.ss-kbd { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; padding:1px 6px; border-radius:6px; border:1px solid var(--border); }
.ss-legend { font-size:12px; color:var(--muted); margin-top:8px; }
.ss-info { font-size:13px; display:grid; gap:6px; }
.ss-info b { color:#fff; }
.ss-tip { margin-top:6px; color:var(--muted); }
.ss-footer {
  position:absolute; left:16px; right:16px; bottom:16px; display:flex; align-items:center; justify-content:space-between;
}
.ss-btn {
  appearance:none; border:1px solid var(--border); background: rgba(255,255,255,0.05);
  color:var(--text); padding:8px 12px; border-radius:10px; cursor:pointer; font-size:12px;
}
.ss-btn[aria-pressed="true"] {
  background: rgba(106,227,255,0.12);
  border-color: rgba(106,227,255,0.35);
}
@media (max-width: 840px) {
  .ss-controls { grid-template-columns: 1fr; }
  .ss-right { display:none; }
  .ss-footer { flex-direction: column; align-items: stretch; gap: 12px; }
  .ss-row { justify-content: space-between; }
}
`;
