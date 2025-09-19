"use client";

import { useEffect, useRef } from "react";
import { Mesh, Program, Renderer, Triangle } from "ogl";

export type RippleGridProps = {
  className?: string;
  enableRainbow?: boolean;
  gridColor?: string;
  rippleIntensity?: number;
  gridSize?: number;
  gridThickness?: number;
  fadeDistance?: number;
  vignetteStrength?: number;
  glowIntensity?: number;
  opacity?: number;
  gridRotation?: number;
  mouseInteraction?: boolean;
  mouseInteractionRadius?: number;
};

const DEFAULT_PROPS: Required<Omit<RippleGridProps, "className">> = {
  enableRainbow: false,
  gridColor: "#111111",
  rippleIntensity: 0.06,
  gridSize: 14,
  gridThickness: 18,
  fadeDistance: 1.4,
  vignetteStrength: 2,
  glowIntensity: 0.12,
  opacity: 0.8,
  gridRotation: 0.15,
  mouseInteraction: true,
  mouseInteractionRadius: 0.9,
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
    : normalized;
  const num = parseInt(value, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return [r / 255, g / 255, b / 255];
}

const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
uniform float iTime;
uniform vec2 iResolution;
uniform bool enableRainbow;
uniform vec3 gridColor;
uniform float rippleIntensity;
uniform float gridSize;
uniform float gridThickness;
uniform float fadeDistance;
uniform float vignetteStrength;
uniform float glowIntensity;
uniform float opacity;
uniform float gridRotation;
uniform bool mouseInteraction;
uniform vec2 mousePosition;
uniform float mouseInfluence;
uniform float mouseInteractionRadius;
varying vec2 vUv;

mat2 rotation(float angle) {
  float s = sin(angle);
  float c = cos(angle);
  return mat2(c, -s, s, c);
}

float gridLines(vec2 uv, float thickness) {
  vec2 g = abs(fract(uv) - 0.5);
  float line = smoothstep(thickness, thickness - 0.01, max(g.x, g.y));
  return 1.0 - line;
}

vec3 palette(float t) {
  vec3 a = vec3(0.5, 0.5, 0.5);
  vec3 b = vec3(0.5, 0.5, 0.5);
  vec3 c = vec3(1.0, 1.0, 1.0);
  vec3 d = vec3(0.263, 0.416, 0.557);
  return a + b * cos(6.28318 * (c * t + d));
}

void main() {
  vec2 uv = vUv;
  vec2 centered = uv - 0.5;
  centered = rotation(gridRotation) * centered;

  float aspect = iResolution.x / max(iResolution.y, 1.0);
  centered.x *= aspect;

  vec2 rippleUv = centered * gridSize;
  float dist = length(centered);

  float wave = sin((dist * 10.0 - iTime * 1.4) * (5.0 + rippleIntensity * 60.0));
  float ripple = 0.5 + 0.5 * wave;

  if (mouseInteraction) {
    vec2 mouse = mousePosition - 0.5;
    mouse = rotation(gridRotation) * mouse;
    mouse.x *= aspect;
    float mouseDist = length(centered - mouse);
    float influence = smoothstep(mouseInteractionRadius, 0.0, mouseDist);
    ripple += influence * mouseInfluence * 0.8;
  }

  float thickness = clamp(gridThickness * 0.005, 0.005, 0.15);
  float grid = gridLines(rippleUv, thickness);

  float fade = smoothstep(fadeDistance, 0.0, dist);
  float vignette = exp(-dist * vignetteStrength * 3.0);
  float glow = glowIntensity / (1.0 + dist * 8.0);
  float strength = mix(0.35, 1.0, ripple) * fade * vignette;

  vec3 baseColor = enableRainbow ? palette(ripple + iTime * 0.05) : gridColor;
  vec3 color = baseColor * (grid * strength + glow);

  float alpha = grid * opacity * fade * vignette + glow;
  gl_FragColor = vec4(color, alpha);
}
`;

export default function RippleGrid({
  className,
  enableRainbow = DEFAULT_PROPS.enableRainbow,
  gridColor = DEFAULT_PROPS.gridColor,
  rippleIntensity = DEFAULT_PROPS.rippleIntensity,
  gridSize = DEFAULT_PROPS.gridSize,
  gridThickness = DEFAULT_PROPS.gridThickness,
  fadeDistance = DEFAULT_PROPS.fadeDistance,
  vignetteStrength = DEFAULT_PROPS.vignetteStrength,
  glowIntensity = DEFAULT_PROPS.glowIntensity,
  opacity = DEFAULT_PROPS.opacity,
  gridRotation = DEFAULT_PROPS.gridRotation,
  mouseInteraction = DEFAULT_PROPS.mouseInteraction,
  mouseInteractionRadius = DEFAULT_PROPS.mouseInteractionRadius,
}: RippleGridProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const animationRef = useRef<number>();
  type Uniform<T> = { value: T };
  type RippleUniforms = {
    iTime: Uniform<number>;
    iResolution: Uniform<[number, number]>;
    enableRainbow: Uniform<boolean>;
    gridColor: Uniform<[number, number, number]>;
    rippleIntensity: Uniform<number>;
    gridSize: Uniform<number>;
    gridThickness: Uniform<number>;
    fadeDistance: Uniform<number>;
    vignetteStrength: Uniform<number>;
    glowIntensity: Uniform<number>;
    opacity: Uniform<number>;
    gridRotation: Uniform<number>;
    mouseInteraction: Uniform<boolean>;
    mousePosition: Uniform<[number, number]>;
    mouseInfluence: Uniform<number>;
    mouseInteractionRadius: Uniform<number>;
  };

  const uniformsRef = useRef<RippleUniforms | null>(null);
  const meshRef = useRef<Mesh | null>(null);
  const resolutionRef = useRef<[number, number]>([1, 1]);
  const mousePositionRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const mouseInfluenceRef = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const renderer = new Renderer({
      dpr: Math.min(window.devicePixelRatio, 2),
      alpha: true,
      premultipliedAlpha: false,
    });

    rendererRef.current = renderer;

    const { gl } = renderer;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";
    container.appendChild(gl.canvas);

    const uniforms: RippleUniforms = {
      iTime: { value: 0 },
      iResolution: { value: resolutionRef.current },
      enableRainbow: { value: enableRainbow },
      gridColor: { value: hexToRgb(gridColor) },
      rippleIntensity: { value: rippleIntensity },
      gridSize: { value: gridSize },
      gridThickness: { value: gridThickness },
      fadeDistance: { value: fadeDistance },
      vignetteStrength: { value: vignetteStrength },
      glowIntensity: { value: glowIntensity },
      opacity: { value: opacity },
      gridRotation: { value: gridRotation },
      mouseInteraction: { value: mouseInteraction },
      mousePosition: { value: [0.5, 0.5] },
      mouseInfluence: { value: 0 },
      mouseInteractionRadius: { value: mouseInteractionRadius },
    };

    uniformsRef.current = uniforms;

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms,
      transparent: true,
    });

    const mesh = new Mesh(gl, { geometry, program });
    meshRef.current = mesh;

    const resize = () => {
      const { clientWidth, clientHeight } = container;
      renderer.setSize(clientWidth, clientHeight);
      const resolution: [number, number] = [clientWidth, clientHeight];
      resolutionRef.current = resolution;
      uniforms.iResolution.value = resolution;
    };

    const updateMouse = () => {
      mousePositionRef.current.x +=
        (targetMouseRef.current.x - mousePositionRef.current.x) * 0.08;
      mousePositionRef.current.y +=
        (targetMouseRef.current.y - mousePositionRef.current.y) * 0.08;

      mouseInfluenceRef.current +=
        (0 - mouseInfluenceRef.current) * 0.03;

      uniforms.mousePosition.value = [
        mousePositionRef.current.x,
        1.0 - mousePositionRef.current.y,
      ];
      uniforms.mouseInfluence.value = mouseInfluenceRef.current;
    };

    const handleMouseMove = (event: MouseEvent) => {
      if (!mouseInteraction) return;
      const rect = container.getBoundingClientRect();
      targetMouseRef.current = {
        x: (event.clientX - rect.left) / rect.width,
        y: (event.clientY - rect.top) / rect.height,
      };
      mouseInfluenceRef.current = 1.0;
    };

    const handleMouseEnter = () => {
      if (!mouseInteraction) return;
      mouseInfluenceRef.current = 1.0;
    };

    const handleMouseLeave = () => {
      if (!mouseInteraction) return;
      targetMouseRef.current = { x: 0.5, y: 0.5 };
    };

    const render = (time: number) => {
      uniforms.iTime.value = time * 0.001;
      updateMouse();
      renderer.render({ scene: mesh });
      animationRef.current = requestAnimationFrame(render);
    };

    resize();
    animationRef.current = requestAnimationFrame(render);

    window.addEventListener("resize", resize);
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationRef.current ?? 0);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
      if (meshRef.current) {
        meshRef.current.delete();
        meshRef.current = null;
      }
      if (rendererRef.current) {
        const canvas = rendererRef.current.gl.canvas;
        if (canvas.parentElement === container) {
          container.removeChild(canvas);
        }
        rendererRef.current = null;
      }
    };
  }, [enableRainbow, fadeDistance, glowIntensity, gridColor, gridRotation, gridSize, gridThickness, mouseInteraction, mouseInteractionRadius, opacity, rippleIntensity, vignetteStrength]);

  return (
    <div
      ref={containerRef}
      className={[
        "relative h-full w-full overflow-hidden",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
