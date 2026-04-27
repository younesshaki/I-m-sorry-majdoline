import "./App.scss";
import { useCallback, useEffect, useState } from "react";
import { OutsideSorryMusic } from "./experience/audio/OutsideSorryMusic";
import { UiSoundProvider } from "./experience/audio/UiSoundProvider";
import Experience from "./experience/Experience";
import { StoryProvider } from "./experience/story/StoryProvider";
import PreloadGate from "./experience/ui/PreloadGate";
import SorryTitleCard from "./experience/ui/SorryTitleCard";
import StoryHomePage from "./experience/ui/StoryHomePage";
import PhoneExperienceNotice from "./experience/ui/PhoneExperienceNotice";
import AdminPage from "./experience/ui/AdminPage";
import { MediaQualitySettings } from "./experience/ui/MediaQualitySettings";
import type { SorryVideoQuality } from "./experience/scenes/sorry/data/sceneAssets";

type AppScreen = "gate" | "home" | "titlecard" | "experience" | "admin";

const SORRY_ENTRY = {
  partIndex: 6,
  chapterIndex: 0,
};

const MEDIA_QUALITY_STORAGE_KEY = "nomad.media-quality.v1";

function readInitialMediaQuality(): SorryVideoQuality {
  if (typeof window === "undefined") return "high";

  const stored = window.localStorage.getItem(MEDIA_QUALITY_STORAGE_KEY);
  return stored === "normal" || stored === "high" ? stored : "high";
}

export default function App() {
  const initialHash = typeof window !== "undefined" ? window.location.hash : "";
  const [screen, setScreen] = useState<AppScreen>(
    initialHash === "#admin" ? "admin" : "gate"
  );
  const [entryPartIndex, setEntryPartIndex] = useState(0);
  const [entryChapterIndex, setEntryChapterIndex] = useState(0);
  const [sorryChapterRevealed, setSorryChapterRevealed] = useState(false);
  const [mediaQuality, setMediaQuality] = useState<SorryVideoQuality>(
    readInitialMediaQuality
  );

  // React to hash changes (e.g., user manually types #admin to enter, or removes it to exit)
  useEffect(() => {
    const handler = () => {
      if (window.location.hash === "#admin") setScreen("admin");
    };
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  const handleGoHome = useCallback(() => {
    setSorryChapterRevealed(false);
    if (window.location.hash === "#admin") {
      window.history.replaceState(null, "", window.location.pathname);
    }
    setScreen("home");
  }, []);

  const handleEnterExperience = useCallback(
    (partIndex: number, chapterIndex: number) => {
      setSorryChapterRevealed(false);
      setEntryPartIndex(partIndex);
      setEntryChapterIndex(chapterIndex);
      if (
        partIndex === SORRY_ENTRY.partIndex &&
        chapterIndex === SORRY_ENTRY.chapterIndex
      ) {
        setScreen("titlecard");
        return;
      }
      setScreen("experience");
    },
    []
  );

  const handleStartExperience = useCallback(() => {
    setSorryChapterRevealed(false);
    setScreen("experience");
  }, []);

  const handleMediaQualityChange = useCallback((quality: SorryVideoQuality) => {
    setMediaQuality(quality);
    window.localStorage.setItem(MEDIA_QUALITY_STORAGE_KEY, quality);
  }, []);

  const isSorryExperience =
    screen === "experience" &&
    entryPartIndex === SORRY_ENTRY.partIndex &&
    entryChapterIndex === SORRY_ENTRY.chapterIndex;

  return (
    <div style={{ width: "100%", height: "100%", margin: 0, padding: 0, overflow: "hidden" }}>
      <UiSoundProvider>
        <MediaQualitySettings
          quality={mediaQuality}
          visible={!isSorryExperience}
          onQualityChange={handleMediaQualityChange}
        />
        <OutsideSorryMusic enabled={!(isSorryExperience && sorryChapterRevealed)} />
        {screen === "admin" ? (
          <AdminPage onExit={handleGoHome} />
        ) : screen === "gate" ? (
          <>
            <PhoneExperienceNotice />
            <PreloadGate onStart={handleGoHome} />
          </>
        ) : (
          <StoryProvider>
            {screen === "titlecard" ? (
              <SorryTitleCard onPlay={handleStartExperience} />
            ) : screen === "experience" ? (
              <Experience
                initialPartIndex={entryPartIndex}
                initialChapterIndex={entryChapterIndex}
                onGoHome={handleGoHome}
                onSorryChapterRevealChange={setSorryChapterRevealed}
                mediaQuality={mediaQuality}
              />
            ) : (
              <StoryHomePage onEnter={handleEnterExperience} />
            )}
          </StoryProvider>
        )}
      </UiSoundProvider>
    </div>
  );
}
