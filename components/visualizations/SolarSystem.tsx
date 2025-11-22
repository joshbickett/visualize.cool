"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// ASTRONOMICAL DATA (J2000 Epoch)
// All distances in AU, radii in km, periods in Earth days
// =============================================================================

interface CelestialBody {
  name: string;
  type: "star" | "planet" | "dwarf";
  radius: number;
  semiMajorAxis: number;
  eccentricity: number;
  orbitalPeriod: number;
  perihelionArg: number;
  meanAnomaly: number;
  inclination: number;
  color: string;
  glowColor: string;
  description: string;
  moons?: number;
  rings?: { inner: number; outer: number; color: string; opacity: number }[];
  atmosphere?: string;
  surfaceFeatures?: string[];
}

const BODIES: CelestialBody[] = [
  {
    name: "Sun",
    type: "star",
    radius: 696340,
    semiMajorAxis: 0,
    eccentricity: 0,
    orbitalPeriod: 0,
    perihelionArg: 0,
    meanAnomaly: 0,
    inclination: 0,
    color: "#FDB813",
    glowColor: "#FF6B00",
    description: "Our star, containing 99.86% of the solar system's mass",
    atmosphere: "Plasma - hydrogen and helium",
    surfaceFeatures: ["Sunspots", "Solar flares", "Corona"],
  },
  {
    name: "Mercury",
    type: "planet",
    radius: 2439.7,
    semiMajorAxis: 0.387,
    eccentricity: 0.2056,
    orbitalPeriod: 87.97,
    perihelionArg: 29.124,
    meanAnomaly: 174.796,
    inclination: 7.0,
    color: "#B5A7A7",
    glowColor: "#8B7D7D",
    description: "Smallest planet, extreme temperature swings",
    surfaceFeatures: ["Caloris Basin", "Scarps", "Craters"],
  },
  {
    name: "Venus",
    type: "planet",
    radius: 6051.8,
    semiMajorAxis: 0.723,
    eccentricity: 0.0068,
    orbitalPeriod: 224.7,
    perihelionArg: 54.884,
    meanAnomaly: 50.115,
    inclination: 3.39,
    color: "#E6C87A",
    glowColor: "#D4A84B",
    description: "Hottest planet due to runaway greenhouse effect",
    atmosphere: "96% CO2, sulfuric acid clouds",
    surfaceFeatures: ["Maxwell Montes", "Ishtar Terra", "Volcanic plains"],
  },
  {
    name: "Earth",
    type: "planet",
    radius: 6371,
    semiMajorAxis: 1.0,
    eccentricity: 0.0167,
    orbitalPeriod: 365.25,
    perihelionArg: 114.208,
    meanAnomaly: 358.617,
    inclination: 0,
    color: "#6B93D6",
    glowColor: "#4A7FC1",
    description: "Our home - the only known world with life",
    moons: 1,
    atmosphere: "78% N2, 21% O2",
    surfaceFeatures: ["Oceans", "Continents", "Ice caps"],
  },
  {
    name: "Mars",
    type: "planet",
    radius: 3389.5,
    semiMajorAxis: 1.524,
    eccentricity: 0.0934,
    orbitalPeriod: 686.98,
    perihelionArg: 286.502,
    meanAnomaly: 19.373,
    inclination: 1.85,
    color: "#C1440E",
    glowColor: "#8B2500",
    description: "The Red Planet - target for human exploration",
    moons: 2,
    atmosphere: "95% CO2, thin",
    surfaceFeatures: ["Olympus Mons", "Valles Marineris", "Polar ice caps"],
  },
  {
    name: "Jupiter",
    type: "planet",
    radius: 69911,
    semiMajorAxis: 5.203,
    eccentricity: 0.0489,
    orbitalPeriod: 4332.59,
    perihelionArg: 273.867,
    meanAnomaly: 20.02,
    inclination: 1.31,
    color: "#D8CA9D",
    glowColor: "#C4A35A",
    description: "Largest planet - more massive than all others combined",
    moons: 95,
    atmosphere: "H2 and He with ammonia clouds",
    surfaceFeatures: ["Great Red Spot", "Cloud bands", "Storms"],
    rings: [{ inner: 1.29, outer: 1.8, color: "#8B7355", opacity: 0.15 }],
  },
  {
    name: "Saturn",
    type: "planet",
    radius: 58232,
    semiMajorAxis: 9.537,
    eccentricity: 0.0565,
    orbitalPeriod: 10759.22,
    perihelionArg: 339.392,
    meanAnomaly: 317.02,
    inclination: 2.49,
    color: "#F4D59E",
    glowColor: "#DAB86F",
    description: "The ringed planet - lowest density of any planet",
    moons: 146,
    atmosphere: "H2 and He",
    surfaceFeatures: ["Hexagonal storm", "Cloud bands"],
    rings: [
      { inner: 1.11, outer: 1.24, color: "#A09080", opacity: 0.2 },
      { inner: 1.24, outer: 1.525, color: "#C8B898", opacity: 0.5 },
      { inner: 1.525, outer: 1.95, color: "#E8D8C8", opacity: 0.85 },
      { inner: 2.02, outer: 2.27, color: "#D8C8B8", opacity: 0.7 },
      { inner: 2.32, outer: 2.37, color: "#B8A898", opacity: 0.3 },
    ],
  },
  {
    name: "Uranus",
    type: "planet",
    radius: 25362,
    semiMajorAxis: 19.191,
    eccentricity: 0.0472,
    orbitalPeriod: 30688.5,
    perihelionArg: 96.998,
    meanAnomaly: 142.238,
    inclination: 0.77,
    color: "#B5E3E3",
    glowColor: "#7CC4C4",
    description: "Ice giant tilted 98 degrees - rolls around the Sun",
    moons: 28,
    atmosphere: "H2, He, methane",
    surfaceFeatures: ["Faint cloud bands", "Dark spot"],
    rings: [{ inner: 1.64, outer: 2.0, color: "#4A5568", opacity: 0.25 }],
  },
  {
    name: "Neptune",
    type: "planet",
    radius: 24622,
    semiMajorAxis: 30.07,
    eccentricity: 0.0086,
    orbitalPeriod: 60182,
    perihelionArg: 276.336,
    meanAnomaly: 256.228,
    inclination: 1.77,
    color: "#5B7FDE",
    glowColor: "#3A5BB8",
    description: "Windiest planet - storms up to 2,100 km/h",
    moons: 16,
    atmosphere: "H2, He, methane",
    surfaceFeatures: ["Great Dark Spot", "Scooter clouds"],
    rings: [{ inner: 1.69, outer: 2.54, color: "#4A5568", opacity: 0.15 }],
  },
  {
    name: "Pluto",
    type: "dwarf",
    radius: 1188.3,
    semiMajorAxis: 39.482,
    eccentricity: 0.2488,
    orbitalPeriod: 90560,
    perihelionArg: 113.834,
    meanAnomaly: 14.53,
    inclination: 17.16,
    color: "#C9B8A5",
    glowColor: "#9A8B7A",
    description: "Heart-shaped glacier, thin nitrogen atmosphere",
    moons: 5,
    surfaceFeatures: ["Tombaugh Regio", "Sputnik Planitia"],
  },
];

// =============================================================================
// CONSTANTS & UTILITIES
// =============================================================================

const AU_TO_PX = 80;
const SUN_DISPLAY_RADIUS = 25;
const MIN_PLANET_RADIUS = 3;
const MAX_PLANET_RADIUS = 18;

function solveKepler(M: number, e: number, tolerance = 1e-8): number {
  let E = M;
  for (let i = 0; i < 100; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < tolerance) break;
  }
  return E;
}

function trueAnomaly(E: number, e: number): number {
  return 2 * Math.atan2(
    Math.sqrt(1 + e) * Math.sin(E / 2),
    Math.sqrt(1 - e) * Math.cos(E / 2)
  );
}

function getOrbitalPosition(
  body: CelestialBody,
  daysSinceEpoch: number
): { x: number; y: number; r: number } {
  if (body.semiMajorAxis === 0) return { x: 0, y: 0, r: 0 };

  const n = (2 * Math.PI) / body.orbitalPeriod;
  const M0 = (body.meanAnomaly * Math.PI) / 180;
  const M = M0 + n * daysSinceEpoch;

  const e = body.eccentricity;
  const E = solveKepler(M, e);
  const v = trueAnomaly(E, e);

  const r = (body.semiMajorAxis * (1 - e * e)) / (1 + e * Math.cos(v));
  const omega = (body.perihelionArg * Math.PI) / 180;

  return {
    x: r * Math.cos(v + omega),
    y: r * Math.sin(v + omega),
    r,
  };
}

function scaleRadius(radius: number, isSun: boolean): number {
  if (isSun) return SUN_DISPLAY_RADIUS;
  const scaled = Math.log10(radius / 1000 + 1) * 8;
  return Math.max(MIN_PLANET_RADIUS, Math.min(MAX_PLANET_RADIUS, scaled));
}

function lightenColor(color: string, amount: number): string {
  const num = parseInt(color.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

function darkenColor(color: string, amount: number): string {
  const num = parseInt(color.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Props {
  height?: string;
}

export default function SolarSystem({ height = "600px" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [time, setTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [focusedBody, setFocusedBody] = useState<string | null>(null);
  const [hoveredBody, setHoveredBody] = useState<string | null>(null);
  const [showOrbits, setShowOrbits] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const stateRef = useRef({
    zoom: 1,
    offset: { x: 0, y: 0 },
    time: 0,
    speed: 1,
    isPaused: false,
    focusedBody: null as string | null,
    showOrbits: true,
    showLabels: true,
  });

  useEffect(() => {
    stateRef.current = { zoom, offset, time, speed, isPaused, focusedBody, showOrbits, showLabels };
  }, [zoom, offset, time, speed, isPaused, focusedBody, showOrbits, showLabels]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const worldToScreen = useCallback(
    (x: number, y: number, state: typeof stateRef.current) => {
      const cx = dimensions.width / 2;
      const cy = dimensions.height / 2;
      return {
        x: cx + (x * AU_TO_PX * state.zoom) + state.offset.x,
        y: cy + (y * AU_TO_PX * state.zoom) + state.offset.y,
      };
    },
    [dimensions]
  );

  const drawStarfield = useCallback((ctx: CanvasRenderingContext2D) => {
    const gradient = ctx.createRadialGradient(
      dimensions.width / 2, dimensions.height / 2, 0,
      dimensions.width / 2, dimensions.height / 2, Math.max(dimensions.width, dimensions.height)
    );
    gradient.addColorStop(0, "#0a0a12");
    gradient.addColorStop(0.5, "#050510");
    gradient.addColorStop(1, "#000005");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    const starColors = ["#FFFFFF", "#FFE4C4", "#B0C4DE", "#FFD700", "#FFA07A"];
    const seed = 12345;
    const random = (i: number) => {
      const x = Math.sin(seed + i * 9301 + 49297) * 233280;
      return x - Math.floor(x);
    };

    for (let i = 0; i < 400; i++) {
      const x = random(i) * dimensions.width;
      const y = random(i + 1000) * dimensions.height;
      const size = random(i + 2000) * 1.5 + 0.5;
      const brightness = random(i + 3000) * 0.7 + 0.3;
      const colorIndex = Math.floor(random(i + 4000) * starColors.length);

      ctx.globalAlpha = brightness;
      ctx.fillStyle = starColors[colorIndex];
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      if (random(i + 5000) > 0.9) {
        const twinkle = Math.sin(Date.now() / 1000 + i) * 0.3 + 0.7;
        ctx.globalAlpha = brightness * twinkle * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, size * 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }, [dimensions]);

  const drawOrbit = useCallback(
    (ctx: CanvasRenderingContext2D, body: CelestialBody, state: typeof stateRef.current) => {
      if (body.semiMajorAxis === 0) return;

      const a = body.semiMajorAxis;
      const e = body.eccentricity;
      const omega = (body.perihelionArg * Math.PI) / 180;

      ctx.save();
      ctx.strokeStyle = body.type === "dwarf" ? "rgba(100, 100, 120, 0.3)" : "rgba(80, 100, 140, 0.4)";
      ctx.lineWidth = body.type === "dwarf" ? 0.5 : 1;
      ctx.setLineDash(body.type === "dwarf" ? [5, 5] : []);

      ctx.beginPath();
      for (let i = 0; i <= 360; i += 2) {
        const angle = (i * Math.PI) / 180;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(angle));
        const x = r * Math.cos(angle + omega);
        const y = r * Math.sin(angle + omega);
        const screen = worldToScreen(x, y, state);

        if (i === 0) ctx.moveTo(screen.x, screen.y);
        else ctx.lineTo(screen.x, screen.y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    },
    [worldToScreen]
  );

  const drawRings = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      body: CelestialBody,
      screenX: number,
      screenY: number,
      displayRadius: number
    ) => {
      if (!body.rings) return;

      ctx.save();
      const tilt = 0.4;

      for (const ring of body.rings) {
        const innerRadius = displayRadius * ring.inner;
        const outerRadius = displayRadius * ring.outer;

        ctx.beginPath();
        ctx.ellipse(screenX, screenY, outerRadius, outerRadius * tilt, 0, 0, Math.PI * 2);
        ctx.ellipse(screenX, screenY, innerRadius, innerRadius * tilt, 0, Math.PI * 2, 0);

        const gradient = ctx.createRadialGradient(
          screenX, screenY, innerRadius,
          screenX, screenY, outerRadius
        );
        gradient.addColorStop(0, ring.color + "00");
        gradient.addColorStop(0.2, ring.color);
        gradient.addColorStop(0.8, ring.color);
        gradient.addColorStop(1, ring.color + "00");

        ctx.fillStyle = gradient;
        ctx.globalAlpha = ring.opacity;
        ctx.fill("evenodd");
      }
      ctx.restore();
      ctx.globalAlpha = 1;
    },
    []
  );

  const drawBody = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      body: CelestialBody,
      state: typeof stateRef.current,
      positions: Map<string, { x: number; y: number; screenX: number; screenY: number; radius: number }>
    ) => {
      const pos = getOrbitalPosition(body, state.time);
      const screen = worldToScreen(pos.x, pos.y, state);
      const displayRadius = scaleRadius(body.radius, body.type === "star") * Math.sqrt(state.zoom);

      positions.set(body.name, {
        x: pos.x,
        y: pos.y,
        screenX: screen.x,
        screenY: screen.y,
        radius: displayRadius,
      });

      // Draw rings behind planet (back half)
      if (body.rings) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, 0, dimensions.width, screen.y);
        ctx.clip();
        drawRings(ctx, body, screen.x, screen.y, displayRadius);
        ctx.restore();
      }

      // Glow effect
      if (body.type === "star") {
        const coronaGradient = ctx.createRadialGradient(
          screen.x, screen.y, displayRadius * 0.8,
          screen.x, screen.y, displayRadius * 4
        );
        coronaGradient.addColorStop(0, "rgba(255, 200, 100, 0.6)");
        coronaGradient.addColorStop(0.3, "rgba(255, 150, 50, 0.3)");
        coronaGradient.addColorStop(0.6, "rgba(255, 100, 0, 0.1)");
        coronaGradient.addColorStop(1, "rgba(255, 50, 0, 0)");

        ctx.fillStyle = coronaGradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, displayRadius * 4, 0, Math.PI * 2);
        ctx.fill();

        const flareCount = 8;
        for (let i = 0; i < flareCount; i++) {
          const angle = (i / flareCount) * Math.PI * 2 + state.time * 0.001;
          const flareLength = displayRadius * (1.5 + Math.sin(state.time * 0.05 + i) * 0.5);

          const flareGradient = ctx.createLinearGradient(
            screen.x, screen.y,
            screen.x + Math.cos(angle) * flareLength,
            screen.y + Math.sin(angle) * flareLength
          );
          flareGradient.addColorStop(0, "rgba(255, 200, 100, 0.4)");
          flareGradient.addColorStop(1, "rgba(255, 100, 0, 0)");

          ctx.strokeStyle = flareGradient;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(
            screen.x + Math.cos(angle) * displayRadius,
            screen.y + Math.sin(angle) * displayRadius
          );
          ctx.lineTo(
            screen.x + Math.cos(angle) * flareLength,
            screen.y + Math.sin(angle) * flareLength
          );
          ctx.stroke();
        }
      } else {
        const glowGradient = ctx.createRadialGradient(
          screen.x, screen.y, displayRadius * 0.5,
          screen.x, screen.y, displayRadius * 2.5
        );
        glowGradient.addColorStop(0, body.glowColor + "40");
        glowGradient.addColorStop(1, body.glowColor + "00");

        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, displayRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Main body
      const bodyGradient = ctx.createRadialGradient(
        screen.x - displayRadius * 0.3,
        screen.y - displayRadius * 0.3,
        0,
        screen.x,
        screen.y,
        displayRadius
      );

      if (body.type === "star") {
        bodyGradient.addColorStop(0, "#FFFFFF");
        bodyGradient.addColorStop(0.2, "#FFF5E0");
        bodyGradient.addColorStop(0.6, body.color);
        bodyGradient.addColorStop(1, body.glowColor);
      } else {
        bodyGradient.addColorStop(0, lightenColor(body.color, 40));
        bodyGradient.addColorStop(0.5, body.color);
        bodyGradient.addColorStop(1, darkenColor(body.color, 40));
      }

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, displayRadius, 0, Math.PI * 2);
      ctx.fill();

      // Surface details for gas giants
      if (["Jupiter", "Saturn", "Uranus", "Neptune"].includes(body.name)) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, displayRadius, 0, Math.PI * 2);
        ctx.clip();

        const bandCount = body.name === "Jupiter" ? 8 : 5;
        for (let i = 0; i < bandCount; i++) {
          const y = screen.y - displayRadius + (displayRadius * 2 * (i + 0.5)) / bandCount;
          const bandWidth = (displayRadius * 2) / bandCount;

          ctx.fillStyle = i % 2 === 0
            ? darkenColor(body.color, 15) + "60"
            : lightenColor(body.color, 10) + "40";
          ctx.fillRect(screen.x - displayRadius, y - bandWidth / 2, displayRadius * 2, bandWidth);
        }

        if (body.name === "Jupiter") {
          const spotAngle = state.time * 0.1;
          const spotX = screen.x + Math.cos(spotAngle) * displayRadius * 0.3;
          const spotY = screen.y + displayRadius * 0.2;

          if (Math.cos(spotAngle) > 0) {
            ctx.fillStyle = "#CE5A4B";
            ctx.beginPath();
            ctx.ellipse(spotX, spotY, displayRadius * 0.25, displayRadius * 0.15, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.restore();
      }

      // Earth's continents hint
      if (body.name === "Earth") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, displayRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#5A8C4A60";
        ctx.beginPath();
        ctx.ellipse(screen.x - displayRadius * 0.2, screen.y - displayRadius * 0.1, displayRadius * 0.3, displayRadius * 0.4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screen.x + displayRadius * 0.3, screen.y + displayRadius * 0.2, displayRadius * 0.25, displayRadius * 0.3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#FFFFFF80";
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y - displayRadius * 0.85, displayRadius * 0.4, displayRadius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y + displayRadius * 0.85, displayRadius * 0.35, displayRadius * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Mars surface details
      if (body.name === "Mars") {
        ctx.save();
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, displayRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#FFFFFF90";
        ctx.beginPath();
        ctx.ellipse(screen.x, screen.y - displayRadius * 0.8, displayRadius * 0.3, displayRadius * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#8B200030";
        ctx.beginPath();
        ctx.ellipse(screen.x + displayRadius * 0.1, screen.y + displayRadius * 0.1, displayRadius * 0.4, displayRadius * 0.3, 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Draw rings in front of planet (front half)
      if (body.rings) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(0, screen.y, dimensions.width, dimensions.height - screen.y);
        ctx.clip();
        drawRings(ctx, body, screen.x, screen.y, displayRadius);
        ctx.restore();
      }

      // Highlight if hovered or focused
      const isHighlighted = hoveredBody === body.name || state.focusedBody === body.name;
      if (isHighlighted) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, displayRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Label
      if (state.showLabels && (state.zoom > 0.3 || body.type === "star" || isHighlighted)) {
        ctx.fillStyle = "#FFFFFF";
        ctx.font = isHighlighted ? "bold 13px system-ui" : "12px system-ui";
        ctx.textAlign = "center";
        ctx.fillText(body.name, screen.x, screen.y + displayRadius + 16);
      }
    },
    [dimensions, worldToScreen, drawRings, hoveredBody]
  );

  // Main render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const positions = new Map<string, { x: number; y: number; screenX: number; screenY: number; radius: number }>();

    const render = () => {
      const state = stateRef.current;

      if (!state.isPaused) {
        stateRef.current.time += state.speed;
        setTime(stateRef.current.time);
      }

      if (state.focusedBody) {
        const body = BODIES.find((b) => b.name === state.focusedBody);
        if (body) {
          const pos = getOrbitalPosition(body, stateRef.current.time);
          const targetOffsetX = -pos.x * AU_TO_PX * state.zoom;
          const targetOffsetY = -pos.y * AU_TO_PX * state.zoom;

          stateRef.current.offset.x += (targetOffsetX - stateRef.current.offset.x) * 0.08;
          stateRef.current.offset.y += (targetOffsetY - stateRef.current.offset.y) * 0.08;
          setOffset({ ...stateRef.current.offset });
        }
      }

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      drawStarfield(ctx);

      if (state.showOrbits) {
        BODIES.forEach((body) => drawOrbit(ctx, body, state));
      }

      const sun = BODIES.find((b) => b.type === "star");
      if (sun) drawBody(ctx, sun, state, positions);

      const otherBodies = BODIES.filter((b) => b.type !== "star")
        .map((body) => ({
          body,
          pos: getOrbitalPosition(body, state.time),
        }))
        .sort((a, b) => b.pos.y - a.pos.y);

      otherBodies.forEach(({ body }) => drawBody(ctx, body, state, positions));

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, drawStarfield, drawOrbit, drawBody]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.max(0.05, Math.min(50, z * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    setFocusedBody(null);
  }, [offset]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) {
        setOffset({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      } else {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let found: string | null = null;
        for (const body of BODIES) {
          const pos = getOrbitalPosition(body, stateRef.current.time);
          const screen = worldToScreen(pos.x, pos.y, stateRef.current);
          const displayRadius = scaleRadius(body.radius, body.type === "star") * Math.sqrt(stateRef.current.zoom);

          const dist = Math.sqrt((mouseX - screen.x) ** 2 + (mouseY - screen.y) ** 2);
          if (dist < displayRadius + 10) {
            found = body.name;
            break;
          }
        }
        setHoveredBody(found);
      }
    },
    [isDragging, dragStart, worldToScreen]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (hoveredBody) {
      setFocusedBody(hoveredBody);
      const body = BODIES.find((b) => b.name === hoveredBody);
      if (body) {
        if (body.type === "star") setZoom(2);
        else if (body.semiMajorAxis < 2) setZoom(8);
        else if (body.semiMajorAxis < 10) setZoom(2);
        else setZoom(0.5);
      }
    }
  }, [hoveredBody]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key >= "0" && key <= "9") {
        const index = key === "0" ? 0 : parseInt(key);
        if (index < BODIES.length) {
          setFocusedBody(BODIES[index].name);
        }
      }

      switch (key) {
        case " ":
          e.preventDefault();
          setIsPaused((p) => !p);
          break;
        case "f":
          setZoom(0.15);
          setOffset({ x: 0, y: 0 });
          setFocusedBody(null);
          break;
        case "o":
          setShowOrbits((s) => !s);
          break;
        case "l":
          setShowLabels((s) => !s);
          break;
        case "escape":
          setFocusedBody(null);
          break;
        case "+":
        case "=":
          setSpeed((s) => Math.min(100, s * 1.5));
          break;
        case "-":
          setSpeed((s) => Math.max(0.01, s / 1.5));
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const selectedBody = focusedBody ? BODIES.find((b) => b.name === focusedBody) : null;

  return (
    <div
      ref={containerRef}
      className="ss-container"
      style={{ height, position: "relative", overflow: "hidden", background: "#000" }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ cursor: hoveredBody ? "pointer" : isDragging ? "grabbing" : "grab" }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
      />

      <div className="ss-controls">
        <div className="ss-control-group">
          <label>Speed: {speed.toFixed(2)} days/frame</label>
          <input
            type="range"
            min="-2"
            max="2"
            step="0.1"
            value={Math.log10(speed)}
            onChange={(e) => setSpeed(Math.pow(10, parseFloat(e.target.value)))}
          />
        </div>

        <div className="ss-control-group">
          <label>Zoom: {zoom.toFixed(2)}x</label>
          <input
            type="range"
            min="-1.3"
            max="1.7"
            step="0.05"
            value={Math.log10(zoom)}
            onChange={(e) => setZoom(Math.pow(10, parseFloat(e.target.value)))}
          />
        </div>

        <div className="ss-buttons">
          <button onClick={() => setIsPaused((p) => !p)} title="Space to toggle">
            {isPaused ? "Play" : "Pause"}
          </button>
          <button onClick={() => setShowOrbits((s) => !s)} title="O to toggle">
            {showOrbits ? "Hide Orbits" : "Show Orbits"}
          </button>
          <button onClick={() => setShowLabels((s) => !s)} title="L to toggle">
            {showLabels ? "Hide Labels" : "Show Labels"}
          </button>
          <button onClick={toggleFullscreen}>
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
          <button onClick={() => { setZoom(0.15); setOffset({ x: 0, y: 0 }); setFocusedBody(null); }} title="F to fit">
            Fit System
          </button>
        </div>
      </div>

      <div className="ss-planet-chips">
        {BODIES.map((body, idx) => (
          <button
            key={body.name}
            className={"ss-chip" + (focusedBody === body.name ? " ss-chip--active" : "")}
            onClick={() => {
              setFocusedBody(body.name);
              if (body.type === "star") setZoom(2);
              else if (body.semiMajorAxis < 2) setZoom(8);
              else if (body.semiMajorAxis < 10) setZoom(2);
              else setZoom(0.5);
            }}
            title={"Press " + idx + " to select"}
          >
            <span className="ss-chip-dot" style={{ background: body.color }} />
            {body.name}
          </button>
        ))}
      </div>

      {selectedBody && (
        <div className="ss-info-panel">
          <h3 style={{ color: selectedBody.color }}>{selectedBody.name}</h3>
          <p className="ss-info-desc">{selectedBody.description}</p>
          <div className="ss-info-stats">
            <div>
              <span>Radius:</span>
              <strong>{selectedBody.radius.toLocaleString()} km</strong>
            </div>
            {selectedBody.semiMajorAxis > 0 && (
              <>
                <div>
                  <span>Distance:</span>
                  <strong>{selectedBody.semiMajorAxis.toFixed(3)} AU</strong>
                </div>
                <div>
                  <span>Orbital Period:</span>
                  <strong>{(selectedBody.orbitalPeriod / 365.25).toFixed(2)} years</strong>
                </div>
                <div>
                  <span>Eccentricity:</span>
                  <strong>{selectedBody.eccentricity.toFixed(4)}</strong>
                </div>
              </>
            )}
            {selectedBody.moons !== undefined && (
              <div>
                <span>Known Moons:</span>
                <strong>{selectedBody.moons}</strong>
              </div>
            )}
            {selectedBody.atmosphere && (
              <div>
                <span>Atmosphere:</span>
                <strong>{selectedBody.atmosphere}</strong>
              </div>
            )}
          </div>
          {selectedBody.surfaceFeatures && (
            <div className="ss-info-features">
              <span>Notable features:</span>
              <ul>
                {selectedBody.surfaceFeatures.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}
          <button className="ss-info-close" onClick={() => setFocusedBody(null)}>
            Close
          </button>
        </div>
      )}

      <div className="ss-time">
        <span>Day {Math.floor(time).toLocaleString()}</span>
        <span className="ss-time-hint">since J2000 epoch</span>
      </div>

      <div className="ss-hints">
        <span>Space: pause</span>
        <span>0-9: planets</span>
        <span>F: fit</span>
        <span>O: orbits</span>
        <span>+/-: speed</span>
      </div>

      <style jsx>{`
        .ss-container {
          font-family: system-ui, -apple-system, sans-serif;
          color: #fff;
        }

        .ss-controls {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(10, 15, 30, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 200px;
          border: 1px solid rgba(100, 120, 180, 0.3);
        }

        .ss-control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ss-control-group label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
        }

        .ss-control-group input[type="range"] {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: rgba(100, 120, 180, 0.3);
          appearance: none;
          cursor: pointer;
        }

        .ss-control-group input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6B93D6;
          cursor: pointer;
        }

        .ss-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .ss-buttons button {
          background: rgba(100, 120, 180, 0.2);
          border: 1px solid rgba(100, 120, 180, 0.4);
          color: #fff;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ss-buttons button:hover {
          background: rgba(100, 120, 180, 0.4);
          border-color: rgba(100, 120, 180, 0.6);
        }

        .ss-planet-chips {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          max-width: calc(100% - 24px);
        }

        .ss-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(10, 15, 30, 0.8);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(100, 120, 180, 0.3);
          color: #fff;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ss-chip:hover {
          background: rgba(30, 40, 70, 0.9);
          border-color: rgba(100, 120, 180, 0.6);
        }

        .ss-chip--active {
          background: rgba(60, 80, 140, 0.8);
          border-color: rgba(130, 160, 220, 0.8);
        }

        .ss-chip-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }

        .ss-info-panel {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(10, 15, 30, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 20px;
          width: 280px;
          border: 1px solid rgba(100, 120, 180, 0.3);
        }

        .ss-info-panel h3 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .ss-info-desc {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
          margin: 0 0 16px;
          line-height: 1.5;
        }

        .ss-info-stats {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ss-info-stats > div {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
        }

        .ss-info-stats span {
          color: rgba(255, 255, 255, 0.6);
        }

        .ss-info-stats strong {
          color: #fff;
        }

        .ss-info-features {
          margin-top: 12px;
          font-size: 12px;
        }

        .ss-info-features span {
          color: rgba(255, 255, 255, 0.6);
        }

        .ss-info-features ul {
          margin: 6px 0 0;
          padding-left: 16px;
        }

        .ss-info-features li {
          color: rgba(255, 255, 255, 0.9);
          margin: 2px 0;
        }

        .ss-info-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.5);
          font-size: 14px;
          cursor: pointer;
          padding: 4px;
        }

        .ss-info-close:hover {
          color: #fff;
        }

        .ss-time {
          position: absolute;
          top: 12px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10, 15, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 8px;
          padding: 8px 16px;
          border: 1px solid rgba(100, 120, 180, 0.3);
          text-align: center;
        }

        .ss-time span:first-child {
          font-size: 14px;
          font-weight: 600;
        }

        .ss-time-hint {
          display: block;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.5);
          margin-top: 2px;
        }

        .ss-hints {
          position: absolute;
          bottom: 60px;
          left: 12px;
          display: flex;
          flex-direction: column;
          gap: 2px;
          font-size: 10px;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 768px) {
          .ss-controls {
            min-width: 160px;
            padding: 12px;
          }

          .ss-info-panel {
            width: 240px;
            padding: 16px;
          }

          .ss-planet-chips {
            bottom: 8px;
          }

          .ss-chip {
            padding: 4px 8px;
            font-size: 10px;
          }

          .ss-hints {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
