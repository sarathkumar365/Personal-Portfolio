"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { SkillCategory, SkillsSection } from "@/data/types";

type Milestone = {
  id: string;
  label: string;
  side: "left" | "right";
  labelClassName: string;
  cardPlacement?: "side" | "top";
  fixedPosition?: { left: string; top: string };
  t: number;
  categoryTitles: string[];
};

type PointerKind = "mouse" | "touch" | "pen";

type DepthConfig = {
  tiltXDeg: number;
  tiltYDeg: number;
  shiftX: number;
  shiftY: number;
  scrollDriftY: number;
  baseTiltXDeg: number;
  baseTiltYDeg: number;
};

type DepthTuning = {
  perspective: number;
  originY: number;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  cardZ: number;
};

const DEPTH_TUNING_STORAGE_KEY = "timeline-depth-tuning-defaults";

const DEPTH_CONFIG: DepthConfig = {
  tiltXDeg: 3.2,
  tiltYDeg: 2.6,
  shiftX: 16,
  shiftY: 12,
  scrollDriftY: 12,
  baseTiltXDeg: 0,
  baseTiltYDeg: 0,
};

const DEPTH_TUNING_DEFAULTS: DepthTuning = {
  perspective: 900,
  originY: 78,
  rotateX: 10.8,
  rotateY: -4.8,
  rotateZ: 0.45,
  cardZ: 68,
};

const normalizeDepthTuning = (input: Partial<DepthTuning>): DepthTuning => {
  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));
  const merged = { ...DEPTH_TUNING_DEFAULTS, ...input };

  return {
    perspective: clamp(merged.perspective, 760, 1320),
    originY: clamp(merged.originY, 60, 90),
    rotateX: clamp(merged.rotateX, -8, 14),
    rotateY: clamp(merged.rotateY, -24, 24),
    rotateZ: clamp(merged.rotateZ, -2, 2),
    cardZ: clamp(merged.cardZ, 38, 108),
  };
};

const VIEW_PRESETS: Array<{ label: string; tuning: Partial<DepthTuning> }> = [
  { label: "Front", tuning: { rotateX: 0, rotateY: 0, rotateZ: 0 } },
  { label: "Left", tuning: { rotateX: 6, rotateY: -16, rotateZ: 0 } },
  { label: "Right", tuning: { rotateX: 6, rotateY: 16, rotateZ: 0 } },
  { label: "Top-Left", tuning: { rotateX: 11, rotateY: -12, rotateZ: 0.4 } },
  { label: "Top-Right", tuning: { rotateX: 11, rotateY: 12, rotateZ: -0.4 } },
];

const PATH_D =
  "m24.99895,25.5c0,0.98097 0,1.96194 0,4.90484c0,3.92388 0,9.80969 0,14.71453c0,6.86678 -0.34468,13.85198 2.74758,23.54325c4.12538,12.9291 10.58996,23.994 19.23307,32.37197c9.65136,9.35528 23.72479,17.15199 41.21372,20.60035c17.32581,3.4162 37.77937,4.95898 60.4468,0.98097c26.08551,-4.57788 53.962,-14.11724 84.25917,-20.60035c29.24043,-6.25698 56.77421,-10.46159 82.42745,-9.80969c22.05064,0.56036 43.07528,3.3367 56.78335,16.67647c13.70808,13.33977 27.76088,26.84491 35.71856,46.10554c8.67616,20.99957 12.92032,47.06215 19.23307,76.51557c6.51248,30.38528 12.01656,61.53867 23.81237,91.2301c11.22606,28.25728 26.94617,53.66583 47.62475,72.59169c18.94094,17.33553 42.62704,28.19809 67.77368,34.33391c28.04024,6.84184 59.62395,7.05712 91.58605,11.77163c28.48972,4.20232 54.12856,10.65879 73.26884,22.56228c17.58593,10.93684 30.85003,29.74732 37.55028,50.02941c6.00223,18.16912 6.86873,36.27286 7.32688,51.99135c0.31438,10.78539 -0.91586,17.65744 -1.83172,23.54325l0,1.96194l0,0.98097";

const milestones: Milestone[] = [
  {
    id: "design",
    label: "Plan",
    side: "right",
    labelClassName: "left-3 -top-7",
    t: 0.06,
    categoryTitles: ["Plan"],
  },
  {
    id: "build",
    label: "Build",
    side: "right",
    labelClassName: "left-3 -top-7",
    fixedPosition: { left: "28.5198%", top: "18.5%" },
    t: 0.24,
    categoryTitles: ["Build"],
  },
  {
    id: "integrate",
    label: "Integrate",
    side: "left",
    labelClassName: "right-3 -top-7",
    fixedPosition: { left: "435px", top: "181px" },
    t: 0.46,
    categoryTitles: ["Integrate"],
  },
  {
    id: "ship",
    label: "Ship",
    side: "left",
    labelClassName: "right-3 -top-7",
    cardPlacement: "top",
    t: 0.68,
    categoryTitles: ["Ship"],
  },
  {
    id: "evolve",
    label: "Evolve",
    side: "left",
    labelClassName: "right-3 -top-7",
    t: 0.9,
    categoryTitles: ["Evolve"],
  },
];

type SoftwarePathMapProps = {
  skills: SkillsSection;
};

export default function SoftwarePathMap({ skills }: SoftwarePathMapProps) {
  const isDevMode = process.env.NODE_ENV !== "production";
  const mapRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const milestoneRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const cardVisibleRef = useRef(false);
  const depthEnabledRef = useRef(true);
  const pointerKindRef = useRef<PointerKind>("mouse");
  const rafRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const showTimerRef = useRef<number | null>(null);
  const draggingRef = useRef(false);
  const dragPointerIdRef = useRef<number | null>(null);
  const dragFrameRef = useRef<number | null>(null);
  const dragNextRotationRef = useRef<{ rotateX: number; rotateY: number } | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; rotateX: number; rotateY: number } | null>(
    null,
  );
  const sceneCurrentRef = useRef({ x: 0, y: 0, scroll: 0 });
  const sceneTargetRef = useRef({ x: 0, y: 0, scroll: 0 });

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [activeId, setActiveId] = useState<string>(milestones[0].id);
  const [cardVisible, setCardVisible] = useState(false);
  const [pinnedMilestoneId, setPinnedMilestoneId] = useState<string | null>(null);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [isSceneDragging, setIsSceneDragging] = useState(false);
  const [depthTuning, setDepthTuning] = useState<DepthTuning>(DEPTH_TUNING_DEFAULTS);
  const [savedDefaults, setSavedDefaults] = useState<DepthTuning>(DEPTH_TUNING_DEFAULTS);
  const [settingsMessage, setSettingsMessage] = useState<string>("");
  const [cardPosition, setCardPosition] = useState<{ left: number; top: number }>({
    left: 16,
    top: 16,
  });

  useEffect(() => {
    cardVisibleRef.current = cardVisible;
  }, [cardVisible]);

  useEffect(() => {
    return () => {
      if (showTimerRef.current !== null) {
        window.clearTimeout(showTimerRef.current);
      }
      if (hideTimerRef.current !== null) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const raw = window.localStorage.getItem(DEPTH_TUNING_STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<DepthTuning>;
      const merged = normalizeDepthTuning(parsed);
      setSavedDefaults(merged);
      setDepthTuning(merged);
    } catch {
      // Ignore invalid stored values and keep in-memory defaults.
    }
  }, []);

  const categoriesByTitle = useMemo(
    () =>
      new Map(
        skills.categories.map((category) => [category.title, category] satisfies [string, SkillCategory]),
      ),
    [skills.categories],
  );

  const activeMilestone = milestones.find((item) => item.id === activeId) ?? milestones[0];
  const activeCategories = activeMilestone.categoryTitles
    .map((title) => categoriesByTitle.get(title))
    .filter((value): value is SkillCategory => Boolean(value));

  const setMapDepthVars = useCallback((x: number, y: number, scroll: number) => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const damp = cardVisibleRef.current ? 0.55 : 1;

    map.style.setProperty(
      "--map-tilt-x",
      `${DEPTH_CONFIG.baseTiltXDeg + -y * DEPTH_CONFIG.tiltXDeg * damp}deg`,
    );
    map.style.setProperty(
      "--map-tilt-y",
      `${DEPTH_CONFIG.baseTiltYDeg + x * DEPTH_CONFIG.tiltYDeg * damp}deg`,
    );
    map.style.setProperty("--map-shift-x", `${x * DEPTH_CONFIG.shiftX * damp}px`);
    map.style.setProperty("--map-shift-y", `${y * DEPTH_CONFIG.shiftY * damp}px`);
    map.style.setProperty("--map-scroll-drift-y", `${scroll * DEPTH_CONFIG.scrollDriftY * damp}px`);
  }, []);

  const requestFrame = useCallback(() => {
    if (rafRef.current !== null) {
      return;
    }

    const step = () => {
      const next = sceneTargetRef.current;
      const current = sceneCurrentRef.current;
      const ease = 0.14;

      current.x += (next.x - current.x) * ease;
      current.y += (next.y - current.y) * ease;
      current.scroll += (next.scroll - current.scroll) * ease;

      setMapDepthVars(current.x, current.y, current.scroll);

      const settled =
        Math.abs(next.x - current.x) < 0.0015 &&
        Math.abs(next.y - current.y) < 0.0015 &&
        Math.abs(next.scroll - current.scroll) < 0.0015;

      if (settled) {
        sceneCurrentRef.current = { ...next };
        setMapDepthVars(next.x, next.y, next.scroll);
        rafRef.current = null;
        return;
      }

      rafRef.current = window.requestAnimationFrame(step);
    };

    rafRef.current = window.requestAnimationFrame(step);
  }, [setMapDepthVars]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const positionMilestones = () => {
      const map = mapRef.current;
      const path = pathRef.current;
      if (!path || !map) {
        return;
      }

      const totalLength = path.getTotalLength();
      const mapRect = map.getBoundingClientRect();
      const next: Record<string, { x: number; y: number }> = {};

      milestones.forEach((item) => {
        const point = path.getPointAtLength(totalLength * item.t);
        next[item.id] = {
          // Snap to physical pixels to keep circles/labels consistently crisp.
          x: Math.round((point.x / 800) * mapRect.width),
          y: Math.round((point.y / 600) * mapRect.height),
        };
      });

      setPositions(next);
    };

    const updateScrollTarget = () => {
      sceneTargetRef.current.scroll = 0;
      requestFrame();
    };

    const syncMotionPreference = () => {
      depthEnabledRef.current = !mediaQuery.matches;
      if (!depthEnabledRef.current) {
        sceneTargetRef.current.x = 0;
        sceneTargetRef.current.y = 0;
        mapRef.current?.style.setProperty("--map-tilt-x", "0deg");
        mapRef.current?.style.setProperty("--map-tilt-y", "0deg");
      }

      updateScrollTarget();
    };

    syncMotionPreference();

    const onPreferenceChange = () => {
      syncMotionPreference();
    };

    mediaQuery.addEventListener("change", onPreferenceChange);

    positionMilestones();
    updateScrollTarget();

    const onResize = () => {
      positionMilestones();
      updateScrollTarget();
    };

    window.addEventListener("resize", onResize);

    return () => {
      mediaQuery.removeEventListener("change", onPreferenceChange);
      window.removeEventListener("resize", onResize);
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      if (dragFrameRef.current !== null) {
        window.cancelAnimationFrame(dragFrameRef.current);
      }
    };
  }, [requestFrame]);

  useEffect(() => {
    if (!pinnedMilestoneId) {
      return;
    }

    const closePinnedOnOutsideTap = (event: PointerEvent) => {
      const map = mapRef.current;
      if (!map) {
        return;
      }

      if (!map.contains(event.target as Node)) {
        setPinnedMilestoneId(null);
        setCardVisible(false);
      }
    };

    window.addEventListener("pointerdown", closePinnedOnOutsideTap);

    return () => {
      window.removeEventListener("pointerdown", closePinnedOnOutsideTap);
    };
  }, [pinnedMilestoneId]);

  useEffect(() => {
    const syncMousePointerKind = (event: PointerEvent) => {
      if (event.pointerType === "mouse") {
        pointerKindRef.current = "mouse";
      }
    };

    window.addEventListener("pointermove", syncMousePointerKind, { passive: true });

    return () => {
      window.removeEventListener("pointermove", syncMousePointerKind);
    };
  }, []);

  const showCard = (milestoneId: string) => {
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }

    const map = mapRef.current;
    const node = milestoneRefs.current[milestoneId];
    const milestone = milestones.find((item) => item.id === milestoneId);
    if (!map || !node || !milestone) {
      return;
    }

    const mapRect = map.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const isTopPlacement = milestone.cardPlacement === "top";
    const offsetX = milestone.side === "left" ? -260 : 24;

    let left = isTopPlacement
      ? nodeRect.left - mapRect.left - 120
      : nodeRect.left - mapRect.left + offsetX;
    let top = isTopPlacement
      ? nodeRect.top - mapRect.top - 170
      : nodeRect.top - mapRect.top - 12;

    if (milestoneId === "evolve") {
      left -= 22;
      top -= 30;
    }

    setCardPosition({
      left: Math.max(10, Math.min(left, mapRect.width - 296)),
      top: Math.max(10, Math.min(top, mapRect.height - 182)),
    });

    setActiveId(milestoneId);
    showTimerRef.current = window.setTimeout(() => {
      setCardVisible(true);
      showTimerRef.current = null;
    }, 40);
  };

  const hideCard = () => {
    if (pinnedMilestoneId) {
      return;
    }

    if (hideTimerRef.current !== null) {
      window.clearTimeout(hideTimerRef.current);
    }
    if (showTimerRef.current !== null) {
      window.clearTimeout(showTimerRef.current);
      showTimerRef.current = null;
    }

    hideTimerRef.current = window.setTimeout(() => {
      setCardVisible(false);
      hideTimerRef.current = null;
    }, 110);
  };

  const handleMilestonePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    milestoneId: string,
  ) => {
    pointerKindRef.current = (event.pointerType as PointerKind) || "mouse";

    const isTouchLike = event.pointerType === "touch" || event.pointerType === "pen";
    if (!isTouchLike) {
      return;
    }

    event.preventDefault();

    if (pinnedMilestoneId === milestoneId) {
      setPinnedMilestoneId(null);
      setCardVisible(false);
      return;
    }

    setPinnedMilestoneId(milestoneId);
    showCard(milestoneId);
  };

  const handleMilestoneMouseEnter = (milestoneId: string) => {
    if (pinnedMilestoneId || pointerKindRef.current !== "mouse") {
      return;
    }

    showCard(milestoneId);
  };

  const handleMilestoneFocus = (milestoneId: string) => {
    showCard(milestoneId);
  };

  const handleMilestoneBlur = () => {
    hideCard();
  };

  const updateDepthTuning =
    (key: keyof DepthTuning) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const next = Number(event.target.value);
      setDepthTuning((current) => ({ ...current, [key]: next }));
    };

  const applyViewPreset = (preset: Partial<DepthTuning>) => {
    setDepthTuning((current) => ({ ...current, ...preset }));
  };

  const copySettings = async () => {
    const payload = JSON.stringify(depthTuning, null, 2);

    try {
      await navigator.clipboard.writeText(payload);
      setSettingsMessage("Copied");
    } catch {
      setSettingsMessage("Copy failed");
    }
  };

  const pasteSettings = async () => {
    let raw = "";

    try {
      raw = await navigator.clipboard.readText();
    } catch {
      const manual = window.prompt("Paste depth settings JSON");
      if (!manual) {
        return;
      }
      raw = manual;
    }

    try {
      const parsed = JSON.parse(raw) as Partial<DepthTuning>;
      const merged = normalizeDepthTuning({ ...depthTuning, ...parsed });
      setDepthTuning(merged);
      setSettingsMessage("Pasted");
    } catch {
      setSettingsMessage("Invalid JSON");
    }
  };

  const saveAsDefault = () => {
    const normalized = normalizeDepthTuning(depthTuning);
    window.localStorage.setItem(DEPTH_TUNING_STORAGE_KEY, JSON.stringify(normalized));
    setSavedDefaults(normalized);
    setDepthTuning(normalized);
    setSettingsMessage("Default saved");
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

  const applySceneDragRotation = useCallback((rotateX: number, rotateY: number) => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    scene.style.setProperty("--scene-rotate-x", `${rotateX}deg`);
    scene.style.setProperty("--scene-rotate-y", `${rotateY}deg`);
  }, []);

  const flushSceneDragRotation = useCallback(() => {
    if (dragFrameRef.current !== null) {
      dragFrameRef.current = null;
    }

    const next = dragNextRotationRef.current;
    if (next) {
      applySceneDragRotation(next.rotateX, next.rotateY);
    }

    if (draggingRef.current) {
      dragFrameRef.current = window.requestAnimationFrame(flushSceneDragRotation);
    }
  }, [applySceneDragRotation]);

  const handleScenePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") {
      return;
    }

    const target = event.target as HTMLElement;
    if (target.closest("button")) {
      return;
    }

    draggingRef.current = true;
    setIsSceneDragging(true);
    dragPointerIdRef.current = event.pointerId;
    dragStartRef.current = {
      x: event.clientX,
      y: event.clientY,
      rotateX: depthTuning.rotateX,
      rotateY: depthTuning.rotateY,
    };
    dragNextRotationRef.current = {
      rotateX: depthTuning.rotateX,
      rotateY: depthTuning.rotateY,
    };

    if (dragFrameRef.current === null) {
      dragFrameRef.current = window.requestAnimationFrame(flushSceneDragRotation);
    }
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleScenePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current || dragPointerIdRef.current !== event.pointerId || !dragStartRef.current) {
      return;
    }

    const dx = event.clientX - dragStartRef.current.x;
    const dy = event.clientY - dragStartRef.current.y;
    const rotateY = clamp(dragStartRef.current.rotateY + dx * 0.11, -28, 28);
    const rotateX = clamp(dragStartRef.current.rotateX - dy * 0.11, -8, 14);

    dragNextRotationRef.current = {
      rotateX,
      rotateY,
    };
  };

  const endSceneDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) {
      return;
    }

    draggingRef.current = false;
    setIsSceneDragging(false);
    dragPointerIdRef.current = null;
    dragStartRef.current = null;
    if (dragFrameRef.current !== null) {
      window.cancelAnimationFrame(dragFrameRef.current);
      dragFrameRef.current = null;
    }

    const nextRotation = dragNextRotationRef.current;
    if (nextRotation) {
      applySceneDragRotation(nextRotation.rotateX, nextRotation.rotateY);
      setDepthTuning((current) => ({
        ...current,
        rotateX: nextRotation.rotateX,
        rotateY: nextRotation.rotateY,
      }));
    }
    dragNextRotationRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <div
      ref={mapRef}
      className="timeline-depth-stage relative h-[560px] overflow-hidden border border-black/20 bg-white/28"
      onMouseLeave={hideCard}
    >
      <div className="timeline-cinematic-overlay absolute inset-0" aria-hidden="true" />
      <div
        ref={sceneRef}
        className={`timeline-map-scene absolute inset-0 ${isSceneDragging ? "cursor-grabbing" : "cursor-grab"}`}
        style={
          {
            "--scene-perspective": `${depthTuning.perspective}px`,
            "--scene-origin-y": `${depthTuning.originY}%`,
            "--scene-rotate-x": `${depthTuning.rotateX}deg`,
            "--scene-rotate-y": `${depthTuning.rotateY}deg`,
            "--scene-rotate-z": `${depthTuning.rotateZ}deg`,
            "--scene-card-z": `${depthTuning.cardZ}px`,
            "--scene-perspective-num": `${depthTuning.perspective}`,
            "--scene-origin-y-num": `${depthTuning.originY}`,
            "--scene-pitch-num": `${depthTuning.rotateX}`,
            "--scene-yaw-num": `${depthTuning.rotateY}`,
            "--scene-roll-num": `${depthTuning.rotateZ}`,
          } as React.CSSProperties
        }
        onPointerDown={handleScenePointerDown}
        onPointerMove={handleScenePointerMove}
        onPointerUp={endSceneDrag}
        onPointerCancel={endSceneDrag}
      >
        <div className="timeline-contour-overlay absolute inset-0" aria-hidden="true" />
        <div className="timeline-route-plane absolute inset-0">
          <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path
              ref={pathRef}
              d={PATH_D}
              className="timeline-route-base fill-none [stroke-dasharray:3.5_8] [stroke-linecap:round] [stroke-linejoin:round]"
              strokeWidth={2.2}
              shapeRendering="geometricPrecision"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>

        <div className="timeline-node-plane absolute inset-0">
          {milestones.map((item) => {
            const position = positions[item.id];
            const style = item.fixedPosition
              ? item.fixedPosition
              : position !== undefined
                ? { left: `${position.x}px`, top: `${position.y}px` }
                : undefined;

            const isActive = activeId === item.id && cardVisible;

            return (
              <button
                key={item.id}
                ref={(node) => {
                  milestoneRefs.current[item.id] = node;
                }}
                type="button"
                className="group absolute h-0 w-0 -translate-x-1/2 -translate-y-1/2 overflow-visible bg-transparent p-0 text-inherit"
                style={style}
                aria-label={item.label}
                onPointerDown={(event) => handleMilestonePointerDown(event, item.id)}
                onMouseEnter={() => handleMilestoneMouseEnter(item.id)}
                onMouseLeave={hideCard}
                onFocus={() => handleMilestoneFocus(item.id)}
              onBlur={handleMilestoneBlur}
            >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-transparent"
                />
                <span
                  className={`timeline-node-halo absolute left-0 top-0 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full ${
                    isActive ? "opacity-100" : "opacity-0"
                  }`}
                />
                <span
                  className={`timeline-node-core absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] transition group-hover:border-[var(--ink-blue)] group-focus-visible:border-[var(--ink-blue)] ${
                    isActive
                      ? "border-[var(--ink-blue)] bg-[rgba(255,255,255,0.97)] shadow-[0_0_0_7px_rgba(11,114,133,0.14)]"
                      : "border-black/75 bg-white/95 shadow-[0_2px_4px_rgba(0,0,0,0.22)]"
                  }`}
                />
                <span
                  className={`timeline-node-label absolute whitespace-nowrap border border-black/20 bg-[rgba(247,247,242,0.9)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.22em] leading-none text-black ${item.labelClassName}`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="timeline-map-watermark absolute top-4 right-6" aria-hidden="true">
        <div className="timeline-compass-mark">
          <span className="timeline-compass-n">N</span>
          <span className="timeline-compass-v" />
          <span className="timeline-compass-h" />
        </div>
        <div className="timeline-scale-mark">
          <span className="timeline-scale-bar" />
          <span className="timeline-scale-label">2 KM</span>
        </div>
      </div>
      <div
        className={`timeline-card-plane pointer-events-none absolute z-10 min-w-[220px] max-w-[300px] border border-black/20 bg-white/92 p-3 shadow-[0_18px_36px_-20px_rgba(0,0,0,0.5)] transition-all duration-200 ${
          cardVisible ? "translate-y-0 opacity-100" : "translate-y-1.5 opacity-0"
        }`}
        style={{ left: `${cardPosition.left}px`, top: `${cardPosition.top}px` }}
      >
        <p className="text-[0.55rem] uppercase tracking-[0.3em] text-black/55">Delivery Phase</p>
        <h3 className="mt-1 text-lg font-serif tracking-tight">{activeMilestone.label}</h3>
        <div className="mt-2 space-y-2">
          {activeCategories.map((category) => (
            <div key={category.title} className="space-y-1">
              <p className="text-[0.52rem] uppercase tracking-[0.28em] text-black/55">
                {category.title}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {category.items.map((item) => (
                  <span
                    key={`${category.title}-${item}`}
                    className="border border-black/20 bg-white/85 px-2 py-1 text-[0.52rem] uppercase tracking-[0.2em] text-black/80"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      {isDevMode ? (
      <div className="absolute bottom-3 right-3 z-20">
        <button
          type="button"
          className="border border-black/30 bg-white/90 px-3 py-1 text-[0.55rem] uppercase tracking-[0.22em] text-black/80 shadow-[0_8px_18px_-14px_rgba(0,0,0,0.42)] backdrop-blur-sm"
          onClick={() => setControlsOpen((value) => !value)}
        >
          {controlsOpen ? "Close Depth" : "Depth Controls"}
        </button>
        {controlsOpen ? (
          <div className="mt-2 w-[248px] space-y-2 border border-black/25 bg-white/95 p-3 text-[0.58rem] uppercase tracking-[0.16em] text-black/75 shadow-[0_16px_24px_-20px_rgba(0,0,0,0.45)]">
            <p className="text-[0.47rem] tracking-[0.14em] text-black/55">
              Drag empty map area to rotate
            </p>
            <div className="grid grid-cols-3 gap-1">
              {VIEW_PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  className="border border-black/25 bg-white px-1.5 py-1 text-[0.5rem] tracking-[0.16em] text-black/75"
                  onClick={() => applyViewPreset(preset.tuning)}
                >
                  {preset.label}
                </button>
              ))}
              <button
                type="button"
                className="border border-black/30 bg-black px-1.5 py-1 text-[0.5rem] tracking-[0.16em] text-white"
                onClick={() => setDepthTuning(DEPTH_TUNING_DEFAULTS)}
              >
                Reset
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                className="border border-black/25 bg-white px-1.5 py-1 text-[0.5rem] tracking-[0.16em] text-black/75"
                onClick={() => void copySettings()}
              >
                Copy
              </button>
              <button
                type="button"
                className="border border-black/25 bg-white px-1.5 py-1 text-[0.5rem] tracking-[0.16em] text-black/75"
                onClick={() => void pasteSettings()}
              >
                Paste
              </button>
              <button
                type="button"
                className="border border-black/25 bg-white px-1.5 py-1 text-[0.5rem] tracking-[0.16em] text-black/75"
                onClick={saveAsDefault}
              >
                Save Default
              </button>
            </div>
            <button
              type="button"
              className="w-full border border-black/30 bg-white px-2 py-1 text-[0.52rem] uppercase tracking-[0.2em] text-black/75"
              onClick={() => setDepthTuning(savedDefaults)}
            >
              Reset to Saved Default
            </button>
            <pre className="max-h-24 overflow-auto border border-black/15 bg-white/85 p-2 text-[0.46rem] normal-case tracking-normal text-black/65">
{JSON.stringify(depthTuning)}
            </pre>
            {settingsMessage ? (
              <p className="text-[0.46rem] tracking-[0.12em] text-black/55">{settingsMessage}</p>
            ) : null}
            <label className="flex items-center justify-between gap-3">
              <span>Perspective</span>
              <input
                type="range"
                min={720}
                max={1320}
                step={10}
                value={depthTuning.perspective}
                onChange={updateDepthTuning("perspective")}
                className="w-[118px]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Origin Y</span>
              <input
                type="range"
                min={60}
                max={90}
                step={1}
                value={depthTuning.originY}
                onChange={updateDepthTuning("originY")}
                className="w-[118px]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Pitch (X)</span>
              <input
                type="range"
                min={-4}
                max={14}
                step={0.1}
                value={depthTuning.rotateX}
                onChange={updateDepthTuning("rotateX")}
                className="w-[118px]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Yaw (Y)</span>
              <input
                type="range"
                min={-24}
                max={24}
                step={0.1}
                value={depthTuning.rotateY}
                onChange={updateDepthTuning("rotateY")}
                className="w-[118px]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Roll (Z)</span>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.05}
                value={depthTuning.rotateZ}
                onChange={updateDepthTuning("rotateZ")}
                className="w-[118px]"
              />
            </label>
            <label className="flex items-center justify-between gap-3">
              <span>Card Z</span>
              <input
                type="range"
                min={38}
                max={108}
                step={1}
                value={depthTuning.cardZ}
                onChange={updateDepthTuning("cardZ")}
                className="w-[118px]"
              />
            </label>
          </div>
        ) : null}
      </div>
      ) : null}
    </div>
  );
}
