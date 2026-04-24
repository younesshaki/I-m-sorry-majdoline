import { useCallback, useEffect, useRef } from "react";
import gsap from "gsap";
import { sorryScenes } from "./data";
import { sorryScrollGate } from "./sorryScrollGate";

type Props = {
  activeSceneIndex: number;
  isActive: boolean;
};

// ── Timing constants ────────────────────────────────────────────────────────
const APPEAR_S           = 1.4;   // fade-in duration
const DISAPPEAR_FLASH_S  = 0.55;  // PS2-style bloom phase
const DISAPPEAR_FADE_S   = 1.4;   // dissolve phase
const LINE_GAP_MS        = 420;   // pause between lines
const SCENE_HANDOFF_MS   = 450;   // fade-out before new scene starts
const MIN_HOLD_MS        = 3400;  // minimum reading time per line
const MAX_HOLD_MS        = 7400;  // maximum reading time per line
const MS_PER_WORD        = 440;   // reading-speed multiplier

function holdDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.min(MAX_HOLD_MS, Math.max(MIN_HOLD_MS, words * MS_PER_WORD));
}

const CINEMATIC_FONT = "'Playfair Display', 'Cormorant Garamond', Georgia, serif";

export function SorryLyricsDisplay({ activeSceneIndex, isActive }: Props) {
  const lineRef  = useRef<HTMLParagraphElement>(null);
  const timers   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const currentSceneRef = useRef(-1);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const after = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }, []);

  const setLineContent = (text: string) => {
    if (lineRef.current) lineRef.current.textContent = text;
  };

  // ── Animations ────────────────────────────────────────────────────────────
  // NOTE: do NOT animate `letter-spacing` — it reflows layout and causes the
  // text to visibly shift/jump between lines. We use only transform, opacity,
  // and filter so the element stays in its absolute center position.

  const animateLineIn = useCallback((text: string, onDone: () => void) => {
    const el = lineRef.current;
    if (!el) { onDone(); return; }

    gsap.killTweensOf(el);
    // Set invisible FIRST, then write text — no flash possible
    gsap.set(el, {
      opacity: 0,
      y: 14,
      scale: 1.04,
      filter: "brightness(1.7) blur(8px)",
    });
    setLineContent(text);

    gsap.to(el, {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: "brightness(1) blur(0px)",
      duration: APPEAR_S,
      ease: "power3.out",
      onComplete: onDone,
    });
  }, []);

  const animateLineOut = useCallback((onDone: () => void) => {
    const el = lineRef.current;
    if (!el) { onDone(); return; }

    gsap.killTweensOf(el);
    const tl = gsap.timeline({ onComplete: onDone });

    // Phase 1 — PS2 boot-style bloom: brightness peaks, subtle scale up
    tl.to(el, {
      filter: "brightness(3.2) blur(0px)",
      scale: 1.03,
      duration: DISAPPEAR_FLASH_S,
      ease: "power1.inOut",
    });

    // Phase 2 — evaporate: blur expands, brightness collapses, opacity fades,
    // gentle upward lift (no letter-spacing, so no reflow)
    tl.to(el, {
      opacity: 0,
      y: -8,
      scale: 1.06,
      filter: "brightness(0.4) blur(14px)",
      duration: DISAPPEAR_FADE_S,
      ease: "power2.inOut",
    });
  }, []);

  // ── Line sequencer ───────────────────────────────────────────────────────

  const runLines = useCallback(
    (lines: { text: string }[], index: number) => {
      if (index >= lines.length) {
        // Paragraph finished — allow the scroll-to-continue indicator.
        sorryScrollGate.open();
        return;
      }

      animateLineIn(lines[index].text, () => {
        const hold = holdDuration(lines[index].text);

        after(() => {
          animateLineOut(() => {
            after(() => runLines(lines, index + 1), LINE_GAP_MS);
          });
        }, hold);
      });
    },
    [animateLineIn, animateLineOut, after]
  );

  // ── Scene entry ──────────────────────────────────────────────────────────

  const startScene = useCallback(
    (sceneIndex: number) => {
      const scene = sorryScenes[sceneIndex];
      if (!scene) return;

      const lineEl = lineRef.current;
      if (lineEl) gsap.set(lineEl, { opacity: 0 });
      setLineContent("");

      // Brief settling pause, then start lines
      after(() => runLines(scene.lines ?? [], 0), 400);
    },
    [after, runLines]
  );

  // ── Scene change effect ──────────────────────────────────────────────────

  useEffect(() => {
    if (!isActive) {
      clearTimers();
      return;
    }

    // -1 means the GSAP timeline hasn't confirmed the first scene yet — stay dormant
    if (activeSceneIndex < 0) return;

    if (activeSceneIndex === currentSceneRef.current) return;
    currentSceneRef.current = activeSceneIndex;

    clearTimers();
    sorryScrollGate.reset();

    const lineEl = lineRef.current;
    gsap.killTweensOf(lineEl);

    // Crossfade out current line, then start the new scene
    if (lineEl) {
      gsap.to(lineEl, {
        opacity: 0,
        duration: SCENE_HANDOFF_MS / 1000,
        ease: "power2.in",
      });
    }

    after(() => startScene(activeSceneIndex), SCENE_HANDOFF_MS + 50);
  }, [activeSceneIndex, isActive, clearTimers, after, startScene]);

  if (!isActive) return null;

  return (
    <div
      aria-live="polite"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 600,
        pointerEvents: "none",
      }}
    >
      {/* Subtle vignette behind text for clarity */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 45% at 50% 55%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0) 75%)",
          pointerEvents: "none",
        }}
      />

      {/* Current line — absolutely centered so width changes never shift position */}
      <p
        ref={lineRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          margin: 0,
          padding: "0 2rem",
          width: "min(56rem, calc(100vw - 5rem))",
          fontFamily: CINEMATIC_FONT,
          fontSize: "clamp(1.35rem, 3vw, 2.15rem)",
          fontWeight: 700,
          fontStyle: "normal",
          lineHeight: 1.55,
          letterSpacing: "0.015em",
          textAlign: "center",
          color: "rgba(252, 246, 240, 0.97)",
          opacity: 0,
          textShadow:
            "0 2px 6px rgba(0,0,0,0.85), 0 4px 28px rgba(0,0,0,0.75), 0 0 60px rgba(0,0,0,0.5)",
          willChange: "filter, opacity, transform",
        }}
      />
    </div>
  );
}
