import { useMemo } from "react";
import { storyManifest } from "../story/manifest";
import type {
  ChapterDisplayInfo,
  ChapterStatus,
  PartDisplayInfo,
} from "../story/selectors";
import CinematicShell from "./CinematicShell";
import { PartGroup } from "./StoryHomePage";
import "./StoryHomePage.css";
import "./NomadHomePage.css";

type NomadHomePageProps = {
  onEnter: (partIndex: number, chapterIndex: number) => void;
  onGoHome: () => void;
};

const AVAILABLE_CHAPTER_ID = "part-1-chapter-1";

function getNomadStatus(chapterId: string): ChapterStatus {
  return chapterId === AVAILABLE_CHAPTER_ID ? "available" : "locked";
}

function getNomadParts(): PartDisplayInfo[] {
  return storyManifest.slice(0, 6).map((part, partIndex) => {
    const chapters: ChapterDisplayInfo[] = part.chapters.map(
      (chapter, chapterIndex) => ({
        definition: chapter,
        partDefinition: part,
        partIndex,
        chapterIndex,
        status: getNomadStatus(chapter.id),
        sceneCount: chapter.scenes.length,
        completedSceneCount: 0,
      })
    );

    return {
      definition: part,
      partIndex,
      chapters,
      completedChapterCount: 0,
      totalChapterCount: chapters.length,
    };
  });
}

export default function NomadHomePage({
  onEnter,
  onGoHome,
}: NomadHomePageProps) {
  const parts = useMemo(() => getNomadParts(), []);
  const globalOffsets = useMemo(() => {
    let sum = 0;
    return parts.map((part) => {
      const offset = sum;
      sum += part.totalChapterCount;
      return offset;
    });
  }, [parts]);

  return (
    <CinematicShell>
      <div className="storyHome nomadHome">
        <section className="nomadHome__hero">
          <button
            className="nomadHome__back"
            type="button"
            onClick={onGoHome}
          >
            Back home
          </button>
          <p className="nomadHome__eyebrow">The Gift</p>
          <h1 className="nomadHome__title">The Gift I Never Got to Give</h1>
          <p className="nomadHome__subtitle">
            A new world is open. Only the first door is ready.
          </p>
        </section>

        <div className="storyHome__divider" />

        <section className="storyHome__chapters nomadHome__chapters">
          <p className="storyHome__sectionLabel">Nomad</p>
          {parts.map((part, index) => (
            <PartGroup
              key={part.definition.id}
              part={part}
              globalOffset={globalOffsets[index]}
              onChapterSelect={onEnter}
            />
          ))}
        </section>

        <div className="storyHome__footer" />
      </div>
    </CinematicShell>
  );
}
