import { ProgressBarCircle } from "@/components/base/progress-indicators/progress-circles";
import "./SorryChapterProgress.css";

type SorryChapterProgressProps = {
  value: number;
};

export function SorryChapterProgress({ value }: SorryChapterProgressProps) {
  return (
    <div className="sorryChapterProgress" aria-label="Sorry chapter progress">
      <ProgressBarCircle
        size="sm"
        min={0}
        max={100}
        value={value}
        label="Sorry chapter progress"
      />
    </div>
  );
}
