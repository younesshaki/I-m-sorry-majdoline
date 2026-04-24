import { useEffect, useRef, useState } from "react";
import { useProgress } from "@react-three/drei";
import { LoaderShell } from "../shared/LoaderShell";
import { BirdSvg } from "../shared/BirdSvg";
import type { LoaderComponentProps } from "../shared/types";
import "./styles.css";

export function Loader({ className }: LoaderComponentProps) {
  const { active, progress } = useProgress();
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef<number>(0);
  const currentRef = useRef(0);

  // Smoothly count up to the real progress value, always reaching 100 when done.
  useEffect(() => {
    const target = active ? Math.round(progress) : 100;

    const tick = () => {
      const diff = target - currentRef.current;
      if (Math.abs(diff) < 0.5) {
        currentRef.current = target;
        setDisplayed(target);
        return;
      }
      currentRef.current += diff * 0.07;
      setDisplayed(Math.round(currentRef.current));
      rafRef.current = requestAnimationFrame(tick);
    };

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, progress]);

  const pct = displayed;
  const isReady = !active && pct >= 100;

  return (
    <LoaderShell className={`loader-variant-preload${className ? ` ${className}` : ""}`}>
      <div className="sunbeam sunbeam-1" />
      <div className="sunbeam sunbeam-2" />
      <div className="sunbeam sunbeam-3" />
      <div className="sunbeam sunbeam-4" />
      <div className="flower flower-1">
        <span className="petal" /><span className="petal" /><span className="petal" />
        <span className="petal" /><span className="petal" /><span className="center" />
      </div>
      <div className="flower flower-2">
        <span className="petal" /><span className="petal" /><span className="petal" />
        <span className="petal" /><span className="petal" /><span className="center" />
      </div>
      <div className="flower flower-3">
        <span className="petal" /><span className="petal" /><span className="petal" />
        <span className="petal" /><span className="petal" /><span className="center" />
      </div>
      <BirdSvg />

      <div className="loading-progress-block">
        <span className="loading-progress-number">{pct}</span>
        <span className="loading-progress-symbol">%</span>
        <span className="loading-progress-label">
          {isReady ? "ready" : "loading"}
        </span>
      </div>
    </LoaderShell>
  );
}
