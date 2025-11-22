"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

interface Token {
  id: number;
  text: string;
  embedding: number[];
}

interface AttentionWeights {
  query: number[];
  key: number[];
  value: number[];
  weights: number[]; // attention weights to all previous tokens (including self)
}

interface AttentionHead {
  id: number;
  tokens: AttentionWeights[];
  color: string;
}

interface TransformerLayer {
  id: number;
  heads: AttentionHead[];
  outputEmbeddings: number[][];
}

const NUM_LAYERS = 3;
const NUM_HEADS = 3;
const EMBEDDING_DIM = 63; // Divisible by 3 heads
const HEAD_DIM = Math.floor(EMBEDDING_DIM / NUM_HEADS);

const HEAD_COLORS = ["#FF6B6B", "#4ECDC4", "#FFE66D"];
const LAYER_COLORS = ["#6366F1", "#8B5CF6", "#EC4899"];

const SAMPLE_SENTENCES = [
  "The cat sat",
  "AI will change",
  "Hello world program",
  "Dogs love to",
  "The quick brown",
  "Machine learning is",
];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Simple seeded random for reproducibility
function seededRandom(seed: number): () => number {
  return () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Generate pseudo-random embedding
function generateEmbedding(token: string, dim: number): number[] {
  const seed = token.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const rand = seededRandom(seed);
  return Array.from({ length: dim }, () => rand() * 2 - 1);
}

// Softmax function
function softmax(arr: number[]): number[] {
  const max = Math.max(...arr);
  const exps = arr.map((x) => Math.exp(x - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((x) => x / sum);
}

// Dot product
function dot(a: number[], b: number[]): number {
  return a.reduce((sum, ai, i) => sum + ai * b[i], 0);
}

// Simple tokenizer (word-level for simplicity)
function tokenize(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// Generate attention weights for a head (with causal masking)
function computeAttention(
  tokens: Token[],
  headId: number
): AttentionWeights[] {
  const rand = seededRandom(headId * 1000);

  // Generate Q, K, V projections for each token
  const projections = tokens.map((token) => {
    const startIdx = headId * HEAD_DIM;
    const slice = token.embedding.slice(startIdx, startIdx + HEAD_DIM);

    // Add some variation based on head
    const query = slice.map((x) => x + rand() * 0.5 - 0.25);
    const key = slice.map((x) => x + rand() * 0.5 - 0.25);
    const value = slice.map((x) => x + rand() * 0.5 - 0.25);

    return { query, key, value };
  });

  // Compute attention weights with causal masking
  return tokens.map((_, i) => {
    const scores: number[] = [];

    for (let j = 0; j <= i; j++) {
      // Scaled dot-product attention
      const score = dot(projections[i].query, projections[j].key) / Math.sqrt(HEAD_DIM);
      scores.push(score);
    }

    // Apply softmax to get attention weights
    const weights = softmax(scores);

    // Pad with zeros for future tokens (causal mask)
    while (weights.length < tokens.length) {
      weights.push(0);
    }

    return {
      query: projections[i].query,
      key: projections[i].key,
      value: projections[i].value,
      weights,
    };
  });
}

// Process through a transformer layer
function processLayer(
  tokens: Token[],
  layerId: number
): TransformerLayer {
  const heads: AttentionHead[] = [];

  for (let h = 0; h < NUM_HEADS; h++) {
    const attention = computeAttention(tokens, layerId * NUM_HEADS + h);
    heads.push({
      id: h,
      tokens: attention,
      color: HEAD_COLORS[h],
    });
  }

  // Compute output embeddings (simplified: weighted sum of values + residual)
  const outputEmbeddings = tokens.map((token, i) => {
    const combined = new Array(EMBEDDING_DIM).fill(0);

    // Combine outputs from all heads
    heads.forEach((head, h) => {
      const headOutput = new Array(HEAD_DIM).fill(0);

      // Weighted sum of values
      head.tokens[i].weights.forEach((weight, j) => {
        if (j <= i) {
          head.tokens[j].value.forEach((v, k) => {
            headOutput[k] += weight * v;
          });
        }
      });

      // Place in combined embedding
      const startIdx = h * HEAD_DIM;
      headOutput.forEach((v, k) => {
        combined[startIdx + k] = v;
      });
    });

    // Add residual connection (simplified)
    return combined.map((v, k) => v * 0.5 + token.embedding[k] * 0.5);
  });

  return {
    id: layerId,
    heads,
    outputEmbeddings,
  };
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface Props {
  height?: string;
}

export default function GPTArchitecture({ height = "600px" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(0);

  const [dimensions, setDimensions] = useState({ width: 1000, height: 700 });
  const [inputText, setInputText] = useState("The cat sat");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [layers, setLayers] = useState<TransformerLayer[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [selectedHead, setSelectedHead] = useState<number | null>(null);
  const [hoveredToken, setHoveredToken] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showAttentionMatrix, setShowAttentionMatrix] = useState(false);

  // Process input text
  useEffect(() => {
    const words = tokenize(inputText);
    if (words.length === 0) return;

    const newTokens: Token[] = words.slice(0, 8).map((word, i) => ({
      id: i,
      text: word,
      embedding: generateEmbedding(word, EMBEDDING_DIM),
    }));

    setTokens(newTokens);

    // Process through all layers
    const newLayers: TransformerLayer[] = [];
    let currentTokens = newTokens;

    for (let l = 0; l < NUM_LAYERS; l++) {
      const layer = processLayer(currentTokens, l);
      newLayers.push(layer);

      // Update token embeddings for next layer
      currentTokens = currentTokens.map((t, i) => ({
        ...t,
        embedding: layer.outputEmbeddings[i],
      }));
    }

    setLayers(newLayers);
  }, [inputText]);

  // Handle resize
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

  // Animation loop
  useEffect(() => {
    if (!isAnimating) return;

    const animate = () => {
      setAnimationProgress((p) => (p + 0.005) % 1);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [isAnimating]);

  // Draw visualization
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || tokens.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = dimensions;
    const padding = 60;
    const tokenWidth = 70;
    const tokenHeight = 36;
    const layerHeight = (height - padding * 2 - 100) / (NUM_LAYERS + 1);

    // Clear
    ctx.fillStyle = "#0f0f1a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid background
    ctx.strokeStyle = "rgba(100, 100, 150, 0.1)";
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Calculate token positions
    const totalTokenWidth = tokens.length * tokenWidth + (tokens.length - 1) * 20;
    const startX = (width - totalTokenWidth) / 2;

    // Draw layer labels
    ctx.font = "bold 14px system-ui";
    ctx.textAlign = "right";

    const inputY = padding + 30;
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("Input", startX - 20, inputY + tokenHeight / 2 + 5);

    for (let l = 0; l < NUM_LAYERS; l++) {
      const layerY = inputY + (l + 1) * layerHeight;
      ctx.fillStyle = LAYER_COLORS[l];
      ctx.fillText("Layer " + (l + 1), startX - 20, layerY + tokenHeight / 2 + 5);
    }

    const outputY = inputY + (NUM_LAYERS + 1) * layerHeight;
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    ctx.fillText("Output", startX - 20, outputY + tokenHeight / 2 + 5);

    // Draw attention connections
    const activeLayer = selectedLayer !== null ? selectedLayer : Math.floor(animationProgress * NUM_LAYERS * 3) % NUM_LAYERS;
    const activeHead = selectedHead !== null ? selectedHead : Math.floor(animationProgress * NUM_LAYERS * 3 * NUM_HEADS) % NUM_HEADS;

    if (layers[activeLayer]) {
      const layer = layers[activeLayer];
      const head = layer.heads[activeHead];
      const layerY = inputY + activeLayer * layerHeight;
      const nextLayerY = layerY + layerHeight;

      // Draw attention lines
      tokens.forEach((_, toIdx) => {
        const toX = startX + toIdx * (tokenWidth + 20) + tokenWidth / 2;
        const weights = head.tokens[toIdx].weights;

        weights.forEach((weight, fromIdx) => {
          if (fromIdx <= toIdx && weight > 0.05) {
            const fromX = startX + fromIdx * (tokenWidth + 20) + tokenWidth / 2;

            const gradient = ctx.createLinearGradient(fromX, layerY + tokenHeight, toX, nextLayerY);
            gradient.addColorStop(0, head.color + "00");
            gradient.addColorStop(0.3, head.color + Math.floor(weight * 200).toString(16).padStart(2, "0"));
            gradient.addColorStop(0.7, head.color + Math.floor(weight * 200).toString(16).padStart(2, "0"));
            gradient.addColorStop(1, head.color + "00");

            ctx.strokeStyle = gradient;
            ctx.lineWidth = weight * 6 + 1;
            ctx.beginPath();

            // Curved lines
            const midY = (layerY + tokenHeight + nextLayerY) / 2;
            const curveOffset = (toIdx - fromIdx) * 15;

            ctx.moveTo(fromX, layerY + tokenHeight);
            ctx.bezierCurveTo(
              fromX, midY - curveOffset,
              toX, midY + curveOffset,
              toX, nextLayerY
            );
            ctx.stroke();

            // Animated particle
            if (isAnimating && weight > 0.1) {
              const t = (animationProgress * 3 + fromIdx * 0.1) % 1;
              const particleX = fromX + (toX - fromX) * t;
              const particleY = layerY + tokenHeight + (nextLayerY - layerY - tokenHeight) * t;

              ctx.fillStyle = head.color;
              ctx.beginPath();
              ctx.arc(particleX, particleY, 3, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
      });
    }

    // Draw tokens at each layer
    const drawToken = (x: number, y: number, token: Token, isInput: boolean, layerIdx: number) => {
      const isHovered = hoveredToken === token.id;
      const isActive = selectedLayer === layerIdx || (selectedLayer === null && Math.floor(animationProgress * NUM_LAYERS * 3) % NUM_LAYERS === layerIdx);

      // Token box
      const gradient = ctx.createLinearGradient(x, y, x, y + tokenHeight);
      if (isInput) {
        gradient.addColorStop(0, isHovered ? "#4a4a6a" : "#2a2a4a");
        gradient.addColorStop(1, isHovered ? "#3a3a5a" : "#1a1a3a");
      } else {
        const color = LAYER_COLORS[Math.min(layerIdx, LAYER_COLORS.length - 1)];
        gradient.addColorStop(0, isHovered ? color + "60" : color + "40");
        gradient.addColorStop(1, isHovered ? color + "40" : color + "20");
      }

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, tokenWidth, tokenHeight, 8);
      ctx.fill();

      // Border
      ctx.strokeStyle = isActive ? "#fff" : "rgba(255, 255, 255, 0.3)";
      ctx.lineWidth = isActive ? 2 : 1;
      ctx.stroke();

      // Token text
      ctx.fillStyle = "#fff";
      ctx.font = "13px system-ui";
      ctx.textAlign = "center";
      ctx.fillText(token.text, x + tokenWidth / 2, y + tokenHeight / 2 + 5);

      // Position indicator
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.font = "10px system-ui";
      ctx.fillText(String(token.id), x + tokenWidth / 2, y - 6);
    };

    // Draw input tokens
    tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + 20);
      drawToken(x, inputY, token, true, -1);
    });

    // Draw layer tokens
    for (let l = 0; l < NUM_LAYERS; l++) {
      const layerY = inputY + (l + 1) * layerHeight;
      tokens.forEach((token, i) => {
        const x = startX + i * (tokenWidth + 20);
        drawToken(x, layerY, token, false, l);
      });
    }

    // Draw output tokens
    tokens.forEach((token, i) => {
      const x = startX + i * (tokenWidth + 20);
      drawToken(x, outputY, token, false, NUM_LAYERS);
    });

    // Draw head legend
    const legendX = width - 180;
    const legendY = padding;

    ctx.fillStyle = "rgba(20, 20, 40, 0.9)";
    ctx.beginPath();
    ctx.roundRect(legendX - 15, legendY - 15, 170, 120, 10);
    ctx.fill();
    ctx.strokeStyle = "rgba(100, 100, 150, 0.5)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px system-ui";
    ctx.textAlign = "left";
    ctx.fillText("Attention Heads", legendX, legendY);

    HEAD_COLORS.forEach((color, i) => {
      const y = legendY + 25 + i * 28;
      const isActive = selectedHead === i || (selectedHead === null && Math.floor(animationProgress * NUM_LAYERS * 3 * NUM_HEADS) % NUM_HEADS === i);

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(legendX + 10, y, 8, 0, Math.PI * 2);
      ctx.fill();

      if (isActive) {
        ctx.strokeStyle = "#fff";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.fillStyle = isActive ? "#fff" : "rgba(255, 255, 255, 0.7)";
      ctx.font = isActive ? "bold 12px system-ui" : "12px system-ui";
      ctx.fillText("Head " + (i + 1), legendX + 28, y + 4);
    });

    // Draw attention matrix if enabled
    if (showAttentionMatrix && layers[activeLayer]) {
      const matrixSize = Math.min(200, width * 0.25);
      const cellSize = matrixSize / tokens.length;
      const matrixX = padding;
      const matrixY = height - matrixSize - padding - 40;

      // Background
      ctx.fillStyle = "rgba(20, 20, 40, 0.95)";
      ctx.beginPath();
      ctx.roundRect(matrixX - 15, matrixY - 35, matrixSize + 30, matrixSize + 60, 10);
      ctx.fill();
      ctx.strokeStyle = "rgba(100, 100, 150, 0.5)";
      ctx.stroke();

      ctx.fillStyle = "#fff";
      ctx.font = "bold 11px system-ui";
      ctx.textAlign = "left";
      ctx.fillText("Attention Matrix (L" + (activeLayer + 1) + " H" + (activeHead + 1) + ")", matrixX, matrixY - 15);

      const head = layers[activeLayer].heads[activeHead];

      // Draw matrix cells
      tokens.forEach((_, toIdx) => {
        tokens.forEach((_, fromIdx) => {
          const weight = fromIdx <= toIdx ? head.tokens[toIdx].weights[fromIdx] : 0;
          const x = matrixX + fromIdx * cellSize;
          const y = matrixY + toIdx * cellSize;

          if (fromIdx <= toIdx) {
            ctx.fillStyle = head.color + Math.floor(weight * 255).toString(16).padStart(2, "0");
          } else {
            ctx.fillStyle = "rgba(50, 50, 70, 0.5)";
          }
          ctx.fillRect(x, y, cellSize - 1, cellSize - 1);

          // Show weight value for hovered
          if (hoveredToken === toIdx && fromIdx <= toIdx && weight > 0.05) {
            ctx.fillStyle = "#fff";
            ctx.font = "9px system-ui";
            ctx.textAlign = "center";
            ctx.fillText(weight.toFixed(2), x + cellSize / 2, y + cellSize / 2 + 3);
          }
        });
      });

      // Labels
      ctx.font = "9px system-ui";
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      tokens.forEach((token, i) => {
        ctx.textAlign = "center";
        ctx.fillText(token.text.slice(0, 4), matrixX + i * cellSize + cellSize / 2, matrixY + matrixSize + 12);
        ctx.save();
        ctx.translate(matrixX - 5, matrixY + i * cellSize + cellSize / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(token.text.slice(0, 4), 0, 0);
        ctx.restore();
      });
    }
  }, [dimensions, tokens, layers, selectedLayer, selectedHead, hoveredToken, animationProgress, isAnimating, showAttentionMatrix]);

  // Render loop
  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse interaction
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const { width, height } = dimensions;
      const padding = 60;
      const tokenWidth = 70;
      const tokenHeight = 36;
      const layerHeight = (height - padding * 2 - 100) / (NUM_LAYERS + 1);
      const totalTokenWidth = tokens.length * tokenWidth + (tokens.length - 1) * 20;
      const startX = (width - totalTokenWidth) / 2;
      const inputY = padding + 30;

      // Check if hovering over a token
      let found: number | null = null;
      for (let l = -1; l <= NUM_LAYERS; l++) {
        const layerY = l === -1 ? inputY : inputY + (l + 1) * layerHeight;
        for (let i = 0; i < tokens.length; i++) {
          const tokenX = startX + i * (tokenWidth + 20);
          if (x >= tokenX && x <= tokenX + tokenWidth && y >= layerY && y <= layerY + tokenHeight) {
            found = i;
            break;
          }
        }
        if (found !== null) break;
      }
      setHoveredToken(found);
    },
    [dimensions, tokens]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if clicking on head legend
      const legendX = dimensions.width - 180;
      const legendY = 60;

      for (let i = 0; i < NUM_HEADS; i++) {
        const headY = legendY + 25 + i * 28;
        if (x >= legendX && x <= legendX + 150 && y >= headY - 15 && y <= headY + 15) {
          setSelectedHead(selectedHead === i ? null : i);
          return;
        }
      }
    },
    [dimensions, selectedHead]
  );

  return (
    <div
      ref={containerRef}
      className="gpt-container"
      style={{ height, position: "relative", overflow: "hidden", background: "#0f0f1a" }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ cursor: hoveredToken !== null ? "pointer" : "default" }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      />

      {/* Controls */}
      <div className="gpt-controls">
        <div className="gpt-control-group">
          <label>Input Text</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text..."
            maxLength={50}
          />
        </div>

        <div className="gpt-samples">
          {SAMPLE_SENTENCES.map((sentence) => (
            <button
              key={sentence}
              className={inputText === sentence ? "active" : ""}
              onClick={() => setInputText(sentence)}
            >
              {sentence}
            </button>
          ))}
        </div>

        <div className="gpt-buttons">
          <button onClick={() => setIsAnimating(!isAnimating)}>
            {isAnimating ? "Pause" : "Play"}
          </button>
          <button onClick={() => setShowAttentionMatrix(!showAttentionMatrix)}>
            {showAttentionMatrix ? "Hide Matrix" : "Show Matrix"}
          </button>
        </div>

        <div className="gpt-layer-select">
          <label>Focus Layer</label>
          <div className="gpt-layer-buttons">
            <button
              className={selectedLayer === null ? "active" : ""}
              onClick={() => setSelectedLayer(null)}
            >
              Auto
            </button>
            {[0, 1, 2].map((l) => (
              <button
                key={l}
                className={selectedLayer === l ? "active" : ""}
                onClick={() => setSelectedLayer(selectedLayer === l ? null : l)}
                style={{ borderColor: LAYER_COLORS[l] }}
              >
                L{l + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="gpt-info">
        <h4>GPT Architecture</h4>
        <div className="gpt-info-row">
          <span>Sequence Length:</span>
          <strong>{tokens.length} tokens</strong>
        </div>
        <div className="gpt-info-row">
          <span>Layers:</span>
          <strong>{NUM_LAYERS}</strong>
        </div>
        <div className="gpt-info-row">
          <span>Attention Heads:</span>
          <strong>{NUM_HEADS} per layer</strong>
        </div>
        <div className="gpt-info-row">
          <span>Embedding Dim:</span>
          <strong>{EMBEDDING_DIM}</strong>
        </div>
        <div className="gpt-info-row">
          <span>Head Dim:</span>
          <strong>{HEAD_DIM}</strong>
        </div>
      </div>

      {/* Token info */}
      {hoveredToken !== null && tokens[hoveredToken] && (
        <div className="gpt-token-info">
          <h4>Token: "{tokens[hoveredToken].text}"</h4>
          <p>Position: {hoveredToken}</p>
          <p>Can attend to: tokens 0-{hoveredToken}</p>
          {selectedLayer !== null && layers[selectedLayer] && (
            <div className="gpt-attention-weights">
              <p>Attention weights (L{selectedLayer + 1}):</p>
              {layers[selectedLayer].heads.map((head, h) => (
                <div key={h} className="gpt-head-weights">
                  <span style={{ color: head.color }}>H{h + 1}:</span>
                  {head.tokens[hoveredToken].weights.slice(0, hoveredToken + 1).map((w, i) => (
                    <span key={i} className="gpt-weight" style={{ opacity: w }}>
                      {w.toFixed(2)}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .gpt-container {
          font-family: system-ui, -apple-system, sans-serif;
          color: #fff;
        }

        .gpt-controls {
          position: absolute;
          top: 12px;
          left: 12px;
          background: rgba(15, 15, 30, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          min-width: 220px;
          border: 1px solid rgba(100, 100, 150, 0.3);
        }

        .gpt-control-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gpt-control-group label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gpt-control-group input {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(100, 100, 150, 0.3);
          border-radius: 6px;
          padding: 8px 12px;
          color: #fff;
          font-size: 13px;
        }

        .gpt-control-group input:focus {
          outline: none;
          border-color: rgba(100, 150, 255, 0.5);
        }

        .gpt-samples {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .gpt-samples button {
          background: rgba(100, 100, 150, 0.2);
          border: 1px solid rgba(100, 100, 150, 0.3);
          color: rgba(255, 255, 255, 0.8);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gpt-samples button:hover,
        .gpt-samples button.active {
          background: rgba(100, 150, 255, 0.3);
          border-color: rgba(100, 150, 255, 0.5);
          color: #fff;
        }

        .gpt-buttons {
          display: flex;
          gap: 8px;
        }

        .gpt-buttons button {
          flex: 1;
          background: rgba(100, 100, 150, 0.2);
          border: 1px solid rgba(100, 100, 150, 0.4);
          color: #fff;
          padding: 8px;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gpt-buttons button:hover {
          background: rgba(100, 100, 150, 0.4);
        }

        .gpt-layer-select {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .gpt-layer-select label {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.6);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .gpt-layer-buttons {
          display: flex;
          gap: 6px;
        }

        .gpt-layer-buttons button {
          flex: 1;
          background: rgba(100, 100, 150, 0.15);
          border: 2px solid rgba(100, 100, 150, 0.3);
          color: rgba(255, 255, 255, 0.7);
          padding: 6px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .gpt-layer-buttons button:hover,
        .gpt-layer-buttons button.active {
          background: rgba(100, 150, 255, 0.2);
          color: #fff;
        }

        .gpt-info {
          position: absolute;
          bottom: 12px;
          right: 12px;
          background: rgba(15, 15, 30, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
          min-width: 180px;
          border: 1px solid rgba(100, 100, 150, 0.3);
        }

        .gpt-info h4 {
          margin: 0 0 12px;
          font-size: 14px;
          color: #fff;
        }

        .gpt-info-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin: 4px 0;
        }

        .gpt-info-row span {
          color: rgba(255, 255, 255, 0.6);
        }

        .gpt-info-row strong {
          color: #fff;
        }

        .gpt-token-info {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(15, 15, 30, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 16px;
          min-width: 200px;
          max-width: 300px;
          border: 1px solid rgba(100, 100, 150, 0.3);
        }

        .gpt-token-info h4 {
          margin: 0 0 8px;
          font-size: 14px;
        }

        .gpt-token-info p {
          margin: 4px 0;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.8);
        }

        .gpt-attention-weights {
          margin-top: 8px;
          padding-top: 8px;
          border-top: 1px solid rgba(100, 100, 150, 0.3);
        }

        .gpt-head-weights {
          display: flex;
          gap: 6px;
          font-size: 10px;
          margin: 4px 0;
          align-items: center;
        }

        .gpt-weight {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .gpt-controls {
            min-width: 180px;
            padding: 12px;
          }

          .gpt-info {
            display: none;
          }

          .gpt-token-info {
            bottom: auto;
            top: 12px;
            right: 12px;
            left: auto;
          }
        }
      `}</style>
    </div>
  );
}
