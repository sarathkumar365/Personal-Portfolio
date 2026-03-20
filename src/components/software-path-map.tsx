"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { SkillCategory, SkillsSection } from "@/data/types";

type Milestone = {
  id: string;
  label: string;
  side: "left" | "right";
  labelClassName: string;
  cardPlacement?: "side" | "top";
  t: number;
  categoryTitles: string[];
};

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
    t: 0.24,
    categoryTitles: ["Build"],
  },
  {
    id: "integrate",
    label: "Integrate",
    side: "left",
    labelClassName: "right-3 -top-7",
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
  const mapRef = useRef<HTMLDivElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const milestoneRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [activeId, setActiveId] = useState<string>(milestones[0].id);
  const [cardVisible, setCardVisible] = useState(false);
  const [cardPosition, setCardPosition] = useState<{ left: number; top: number }>({
    left: 16,
    top: 16,
  });

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

  const positionMilestones = () => {
    const path = pathRef.current;
    if (!path) return;
    const totalLength = path.getTotalLength();
    const next: Record<string, { x: number; y: number }> = {};

    milestones.forEach((item) => {
      const point = path.getPointAtLength(totalLength * item.t);
      next[item.id] = {
        x: (point.x / 800) * 100,
        y: (point.y / 600) * 100,
      };
    });

    setPositions(next);
  };

  useEffect(() => {
    positionMilestones();
    window.addEventListener("resize", positionMilestones);
    return () => {
      window.removeEventListener("resize", positionMilestones);
    };
  }, []);

  const showCard = (milestoneId: string) => {
    const map = mapRef.current;
    const node = milestoneRefs.current[milestoneId];
    const milestone = milestones.find((item) => item.id === milestoneId);
    if (!map || !node || !milestone) return;

    const mapRect = map.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();
    const isTopPlacement = milestone.cardPlacement === "top";
    const offsetX = milestone.side === "left" ? -260 : 24;
    const left = isTopPlacement
      ? nodeRect.left - mapRect.left - 120
      : nodeRect.left - mapRect.left + offsetX;
    const top = isTopPlacement
      ? nodeRect.top - mapRect.top - 170
      : nodeRect.top - mapRect.top - 12;

    setCardPosition({
      left: Math.max(10, Math.min(left, mapRect.width - 296)),
      top: Math.max(10, Math.min(top, mapRect.height - 182)),
    });
    setActiveId(milestoneId);
    setCardVisible(true);
  };

  const hideCard = () => {
    setCardVisible(false);
  };

  return (
    <div
      ref={mapRef}
      className="relative h-[560px] overflow-hidden border border-black/20 bg-white/35"
      onMouseLeave={hideCard}
    >
      <svg viewBox="0 0 800 600" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path
          ref={pathRef}
          d={PATH_D}
          className="fill-none stroke-black/60 [stroke-dasharray:3.5_8] [stroke-linecap:round] [stroke-linejoin:round]"
          strokeWidth={2.2}
        />
      </svg>

      {milestones.map((item) => {
        const position = positions[item.id];
        const style =
          position !== undefined ? { left: `${position.x}%`, top: `${position.y}%` } : undefined;

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
            onMouseEnter={() => showCard(item.id)}
            onMouseLeave={hideCard}
            onFocus={() => showCard(item.id)}
            onBlur={hideCard}
          >
            <span
              className={`absolute left-0 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[1.5px] bg-white transition group-hover:border-[var(--ink-blue)] group-focus-visible:border-[var(--ink-blue)] ${
                activeId === item.id && cardVisible
                  ? "border-[var(--ink-blue)] shadow-[0_0_0_6px_rgba(11,114,133,0.16)]"
                  : "border-black/75 shadow-[0_0_0_6px_rgba(0,0,0,0)]"
              }`}
            />
            <span
              className={`absolute whitespace-nowrap border border-black/20 bg-[rgba(247,247,242,0.9)] px-2 py-1 text-[0.6rem] uppercase tracking-[0.22em] leading-none text-black ${item.labelClassName}`}
            >
              {item.label}
            </span>
          </button>
        );
      })}

      <div
        className={`pointer-events-none absolute z-10 min-w-[220px] max-w-[300px] border border-black/20 bg-white/90 p-3 shadow-[0_14px_28px_-18px_rgba(0,0,0,0.45)] transition-all duration-200 ${
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
    </div>
  );
}
