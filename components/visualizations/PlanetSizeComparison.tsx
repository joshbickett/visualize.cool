"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// PLANET DATA - Real radii in kilometers
// =============================================================================

interface Planet {
  name: string;
  radius: number; // km (equatorial)
  color: string;
  glowColor: string;
  description: string;
  type: "star" | "planet" | "dwarf";
  features?: string[];
}

// Ordered from smallest to largest
const BODIES: Planet[] = [
  {
    name: "Pluto",
    radius: 1188.3,
    color: "#C9B8A5",
    glowColor: "#9A8B7A",
    description: "Dwarf planet",
    type: "dwarf",
  },
  {
    name: "Moon",
    radius: 1737.4,
    color: "#A0A0A0",
    glowColor: "#707070",
    description: "Earth's natural satellite",
    type: "dwarf",
  },
  {
    name: "Mercury",
    radius: 2439.7,
    color: "#B5A7A7",
    glowColor: "#8B7D7D",
    description: "Smallest planet",
    type: "planet",
  },
  {
    name: "Mars",
    radius: 3389.5,
    color: "#C1440E",
    glowColor: "#8B2500",
    description: "The Red Planet",
    type: "planet",
  },
  {
    name: "Venus",
    radius: 6051.8,
    color: "#E6C87A",
    glowColor: "#D4A84B",
    description: "Hottest planet",
    type: "planet",
  },
  {
    name: "Earth",
    radius: 6371,
    color: "#6B93D6",
    glowColor: "#4A7FC1",
    description: "Our home",
    type: "planet",
    features: ["continents", "iceCaps"],
  },
  {
    name: "Neptune",
    radius: 24622,
    color: "#5B7FDE",
    glowColor: "#3A5BB8",
    description: "Windiest planet",
    type: "planet",
    features: ["bands"],
  },
  {
    name: "Uranus",
    radius: 25362,
    color: "#B5E3E3",
    glowColor: "#7CC4C4",
    description: "Ice giant tilted 98°",
    type: "planet",
    features: ["bands"],
  },
  {
    name: "Saturn",
    radius: 58232,
    color: "#F4D59E",
    glowColor: "#DAB86F",
    description: "The ringed planet",
    type: "planet",
    features: ["rings", "bands"],
  },
  {
    name: "Jupiter",
    radius: 69911,
    color: "#D8CA9D",
    glowColor: "#C4A35A",
    description: "Largest planet",
    type: "planet",
    features: ["bands", "greatRedSpot"],
  },
  {
    name: "Sun",
    radius: 696340,
    color: "#FDB813",
    glowColor: "#FF6B00",
    description: "Our star",
    type: "star",
  },
];

// =============================================================================
// UTILITIES
// =============================================================================

function lightenColor(color: string, amount: number): string {
  const num = parseInt(color.slice(1), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00ff) + amount);
  const b = Math.min(255, (num & 0x0000ff) + amount);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

function darkenColor(color: string, amount: number): string {
  const num = parseInt(color.slice(1), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00ff) - amount);
  const b = Math.max(0, (num & 0x0000ff) - amount);
  return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Props {
  height?: string;
}

export default function PlanetSizeComparison({ height = "600px" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  // Calculate total scroll width based on planet sizes
  // We want smooth transitions between each planet "section"
  const SECTION_WIDTH = 1200; // Base width per planet section
  const totalScrollWidth = BODIES.length * SECTION_WIDTH;

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

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const maxScroll = scrollWidth - clientWidth;
      const progress = maxScroll > 0 ? scrollLeft / maxScroll : 0;
      setScrollProgress(progress);
    }
  }, []);

  // Draw starfield background
  const drawStarfield = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, dimensions.width, 0);
      gradient.addColorStop(0, "#0a0a12");
      gradient.addColorStop(0.5, "#050510");
      gradient.addColorStop(1, "#0a0a12");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, dimensions.width, dimensions.height);

      const starColors = ["#FFFFFF", "#FFE4C4", "#B0C4DE", "#FFD700", "#FFA07A"];
      const seed = 54321;
      const random = (i: number) => {
        const x = Math.sin(seed + i * 9301 + 49297) * 233280;
        return x - Math.floor(x);
      };

      for (let i = 0; i < 300; i++) {
        const x = random(i) * dimensions.width;
        const y = random(i + 1000) * dimensions.height;
        const size = random(i + 2000) * 1.5 + 0.5;
        const brightness = random(i + 3000) * 0.5 + 0.2;
        const colorIndex = Math.floor(random(i + 4000) * starColors.length);

        ctx.globalAlpha = brightness;
        ctx.fillStyle = starColors[colorIndex];
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    },
    [dimensions]
  );

  // Draw a single planet
  const drawPlanet = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      planet: Planet,
      x: number,
      y: number,
      displayRadius: number,
      isHovered: boolean
    ) => {
      // Glow effect
      if (planet.type === "star") {
        const coronaGradient = ctx.createRadialGradient(
          x, y, displayRadius * 0.8,
          x, y, displayRadius * 2.5
        );
        coronaGradient.addColorStop(0, "rgba(255, 200, 100, 0.6)");
        coronaGradient.addColorStop(0.3, "rgba(255, 150, 50, 0.3)");
        coronaGradient.addColorStop(0.6, "rgba(255, 100, 0, 0.1)");
        coronaGradient.addColorStop(1, "rgba(255, 50, 0, 0)");
        ctx.fillStyle = coronaGradient;
        ctx.beginPath();
        ctx.arc(x, y, displayRadius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const glowGradient = ctx.createRadialGradient(
          x, y, displayRadius * 0.5,
          x, y, displayRadius * 2
        );
        glowGradient.addColorStop(0, planet.glowColor + "40");
        glowGradient.addColorStop(1, planet.glowColor + "00");
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, displayRadius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Saturn's rings (behind)
      if (planet.features?.includes("rings")) {
        ctx.save();
        const tilt = 0.4;
        const rings = [
          { inner: 1.2, outer: 1.4, color: "#A09080", opacity: 0.3 },
          { inner: 1.4, outer: 1.8, color: "#C8B898", opacity: 0.5 },
          { inner: 1.8, outer: 2.3, color: "#E8D8C8", opacity: 0.7 },
        ];

        ctx.beginPath();
        ctx.rect(0, 0, dimensions.width, y);
        ctx.clip();

        for (const ring of rings) {
          const innerRadius = displayRadius * ring.inner;
          const outerRadius = displayRadius * ring.outer;
          ctx.beginPath();
          ctx.ellipse(x, y, outerRadius, outerRadius * tilt, 0, 0, Math.PI * 2);
          ctx.ellipse(x, y, innerRadius, innerRadius * tilt, 0, Math.PI * 2, 0);
          ctx.fillStyle = ring.color;
          ctx.globalAlpha = ring.opacity;
          ctx.fill("evenodd");
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // Main body gradient
      const bodyGradient = ctx.createRadialGradient(
        x - displayRadius * 0.3,
        y - displayRadius * 0.3,
        0,
        x,
        y,
        displayRadius
      );

      if (planet.type === "star") {
        bodyGradient.addColorStop(0, "#FFFFFF");
        bodyGradient.addColorStop(0.2, "#FFF5E0");
        bodyGradient.addColorStop(0.6, planet.color);
        bodyGradient.addColorStop(1, planet.glowColor);
      } else {
        bodyGradient.addColorStop(0, lightenColor(planet.color, 40));
        bodyGradient.addColorStop(0.5, planet.color);
        bodyGradient.addColorStop(1, darkenColor(planet.color, 40));
      }

      ctx.fillStyle = bodyGradient;
      ctx.beginPath();
      ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
      ctx.fill();

      // Surface features
      if (planet.features?.includes("bands")) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
        ctx.clip();

        const bandCount = planet.name === "Jupiter" ? 8 : 5;
        for (let i = 0; i < bandCount; i++) {
          const bandY = y - displayRadius + (displayRadius * 2 * (i + 0.5)) / bandCount;
          const bandWidth = (displayRadius * 2) / bandCount;
          ctx.fillStyle = i % 2 === 0
            ? darkenColor(planet.color, 15) + "60"
            : lightenColor(planet.color, 10) + "40";
          ctx.fillRect(x - displayRadius, bandY - bandWidth / 2, displayRadius * 2, bandWidth);
        }
        ctx.restore();
      }

      // Jupiter's Great Red Spot
      if (planet.features?.includes("greatRedSpot") && displayRadius > 30) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = "#CE5A4B";
        ctx.beginPath();
        ctx.ellipse(x + displayRadius * 0.3, y + displayRadius * 0.2, displayRadius * 0.2, displayRadius * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Earth features
      if (planet.features?.includes("continents") && displayRadius > 20) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#5A8C4A60";
        ctx.beginPath();
        ctx.ellipse(x - displayRadius * 0.2, y - displayRadius * 0.1, displayRadius * 0.3, displayRadius * 0.4, 0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x + displayRadius * 0.3, y + displayRadius * 0.2, displayRadius * 0.25, displayRadius * 0.3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      if (planet.features?.includes("iceCaps") && displayRadius > 20) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, displayRadius, 0, Math.PI * 2);
        ctx.clip();

        ctx.fillStyle = "#FFFFFF80";
        ctx.beginPath();
        ctx.ellipse(x, y - displayRadius * 0.85, displayRadius * 0.4, displayRadius * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(x, y + displayRadius * 0.85, displayRadius * 0.35, displayRadius * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // Saturn's rings (front)
      if (planet.features?.includes("rings")) {
        ctx.save();
        const tilt = 0.4;
        const rings = [
          { inner: 1.2, outer: 1.4, color: "#A09080", opacity: 0.3 },
          { inner: 1.4, outer: 1.8, color: "#C8B898", opacity: 0.5 },
          { inner: 1.8, outer: 2.3, color: "#E8D8C8", opacity: 0.7 },
        ];

        ctx.beginPath();
        ctx.rect(0, y, dimensions.width, dimensions.height - y);
        ctx.clip();

        for (const ring of rings) {
          const innerRadius = displayRadius * ring.inner;
          const outerRadius = displayRadius * ring.outer;
          ctx.beginPath();
          ctx.ellipse(x, y, outerRadius, outerRadius * tilt, 0, 0, Math.PI * 2);
          ctx.ellipse(x, y, innerRadius, innerRadius * tilt, 0, Math.PI * 2, 0);
          ctx.fillStyle = ring.color;
          ctx.globalAlpha = ring.opacity;
          ctx.fill("evenodd");
        }
        ctx.restore();
        ctx.globalAlpha = 1;
      }

      // Hover highlight
      if (isHovered) {
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.arc(x, y, displayRadius + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    },
    [dimensions]
  );

  // Main render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    drawStarfield(ctx);

    // Calculate which planets to show and at what scale
    // As we scroll right, we zoom out to show larger planets
    const currentSection = scrollProgress * (BODIES.length - 1);
    const baseIndex = Math.floor(currentSection);
    const sectionProgress = currentSection - baseIndex;

    // Determine visible range of planets
    // Show more planets as we progress
    const visibleStart = 0;
    const visibleEnd = Math.min(BODIES.length - 1, baseIndex + 2);

    // Calculate scale based on the largest visible planet
    // We want the largest planet to fit nicely in the viewport
    const maxVisibleRadius = BODIES[visibleEnd].radius;
    const targetHeight = dimensions.height * 0.6;
    const baseScale = targetHeight / (maxVisibleRadius * 2);

    // Render planets
    const centerY = dimensions.height / 2;
    let currentX = dimensions.width * 0.15;

    for (let i = visibleStart; i <= visibleEnd; i++) {
      const planet = BODIES[i];
      const displayRadius = Math.max(3, planet.radius * baseScale);

      // Space planets proportionally
      const spacing = displayRadius + 40;

      if (i > visibleStart) {
        const prevRadius = Math.max(3, BODIES[i - 1].radius * baseScale);
        currentX += prevRadius + spacing;
      }

      // Apply some easing for planets entering view
      let alpha = 1;
      if (i === visibleEnd && sectionProgress < 0.3) {
        alpha = sectionProgress / 0.3;
      }

      ctx.globalAlpha = alpha;
      drawPlanet(
        ctx,
        planet,
        currentX,
        centerY,
        displayRadius,
        hoveredPlanet === planet.name
      );
      ctx.globalAlpha = 1;

      // Draw label below planet
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "14px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.globalAlpha = alpha;
      ctx.fillText(planet.name, currentX, centerY + displayRadius + 24);

      // Draw radius info
      ctx.font = "11px system-ui, -apple-system, sans-serif";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      const radiusText = planet.radius >= 10000
        ? `${(planet.radius / 1000).toFixed(0)}k km`
        : `${planet.radius.toLocaleString()} km`;
      ctx.fillText(radiusText, currentX, centerY + displayRadius + 42);
      ctx.globalAlpha = 1;
    }

    // Draw comparison line at bottom
    if (visibleEnd > visibleStart) {
      const lineY = dimensions.height - 60;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, lineY);
      ctx.lineTo(dimensions.width - 40, lineY);
      ctx.stroke();

      // Size comparison text
      const smallest = BODIES[visibleStart];
      const largest = BODIES[visibleEnd];
      const ratio = largest.radius / smallest.radius;

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      ctx.font = "13px system-ui, -apple-system, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(
        `${largest.name} is ${ratio.toFixed(1)}× larger than ${smallest.name}`,
        dimensions.width / 2,
        lineY + 20
      );
    }

  }, [dimensions, scrollProgress, drawStarfield, drawPlanet, hoveredPlanet]);

  // Get current stage info for display
  const currentSection = Math.floor(scrollProgress * (BODIES.length - 1));
  const currentPlanet = BODIES[Math.min(currentSection + 1, BODIES.length - 1)];

  return (
    <div
      ref={containerRef}
      className="psc-container"
      style={{ height, position: "relative", overflow: "hidden", background: "#000" }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ position: "absolute", top: 0, left: 0 }}
      />

      {/* Scroll container overlay */}
      <div
        ref={scrollContainerRef}
        className="psc-scroll"
        onScroll={handleScroll}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <div style={{ width: totalScrollWidth, height: "100%" }} />
      </div>

      {/* Progress indicator */}
      <div className="psc-progress">
        <div className="psc-progress-bar">
          <div
            className="psc-progress-fill"
            style={{ width: `${scrollProgress * 100}%` }}
          />
        </div>
        <div className="psc-progress-labels">
          {BODIES.map((body, i) => (
            <span
              key={body.name}
              className={`psc-progress-dot ${i <= currentSection + 1 ? "active" : ""}`}
              style={{ left: `${(i / (BODIES.length - 1)) * 100}%` }}
              title={body.name}
            />
          ))}
        </div>
      </div>

      {/* Info panel */}
      <div className="psc-info">
        <h3>{currentPlanet.name}</h3>
        <p>{currentPlanet.description}</p>
        <div className="psc-info-stat">
          <span>Radius:</span>
          <strong>{currentPlanet.radius.toLocaleString()} km</strong>
        </div>
        {currentPlanet.name !== "Sun" && (
          <div className="psc-info-stat">
            <span>vs Earth:</span>
            <strong>{(currentPlanet.radius / 6371).toFixed(2)}×</strong>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="psc-hint">
        <span>← Scroll horizontally to zoom out →</span>
      </div>

      <style jsx>{`
        .psc-container {
          font-family: system-ui, -apple-system, sans-serif;
          color: #fff;
        }

        .psc-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(100, 120, 180, 0.5) transparent;
        }

        .psc-scroll::-webkit-scrollbar {
          height: 8px;
        }

        .psc-scroll::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .psc-scroll::-webkit-scrollbar-thumb {
          background: rgba(100, 120, 180, 0.5);
          border-radius: 4px;
        }

        .psc-progress {
          position: absolute;
          bottom: 90px;
          left: 40px;
          right: 40px;
          height: 20px;
        }

        .psc-progress-bar {
          position: absolute;
          top: 8px;
          left: 0;
          right: 0;
          height: 4px;
          background: rgba(100, 120, 180, 0.2);
          border-radius: 2px;
        }

        .psc-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #6B93D6, #FDB813);
          border-radius: 2px;
          transition: width 0.1s ease-out;
        }

        .psc-progress-labels {
          position: relative;
          width: 100%;
          height: 20px;
        }

        .psc-progress-dot {
          position: absolute;
          top: 4px;
          width: 12px;
          height: 12px;
          background: rgba(100, 120, 180, 0.3);
          border-radius: 50%;
          transform: translateX(-50%);
          transition: all 0.2s;
        }

        .psc-progress-dot.active {
          background: #6B93D6;
          box-shadow: 0 0 8px rgba(107, 147, 214, 0.5);
        }

        .psc-info {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(10, 15, 30, 0.85);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px 20px;
          min-width: 180px;
          border: 1px solid rgba(100, 120, 180, 0.3);
        }

        .psc-info h3 {
          margin: 0 0 4px;
          font-size: 18px;
          color: #fff;
        }

        .psc-info p {
          margin: 0 0 12px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.6);
        }

        .psc-info-stat {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin-top: 6px;
        }

        .psc-info-stat span {
          color: rgba(255, 255, 255, 0.5);
        }

        .psc-info-stat strong {
          color: #fff;
        }

        .psc-hint {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(10, 15, 30, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 8px 20px;
          border: 1px solid rgba(100, 120, 180, 0.3);
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .psc-info {
            top: auto;
            bottom: 120px;
            right: 16px;
            left: 16px;
            min-width: auto;
          }

          .psc-hint {
            font-size: 11px;
            padding: 6px 14px;
          }
        }
      `}</style>
    </div>
  );
}
