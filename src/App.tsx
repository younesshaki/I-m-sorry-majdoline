import "./App.scss";
import { useCallback, useState } from "react";
import { UiSoundProvider } from "./experience/audio/UiSoundProvider";
import Experience from "./experience/Experience";
import { StoryProvider } from "./experience/story/StoryProvider";
import PreloadGate from "./experience/ui/PreloadGate";
import SorryTitleCard from "./experience/ui/SorryTitleCard";
import StoryHomePage from "./experience/ui/StoryHomePage";
import PhoneExperienceNotice from "./experience/ui/PhoneExperienceNotice";

type AppScreen = "gate" | "home" | "titlecard" | "experience";

const SORRY_ENTRY = {
  partIndex: 6,
  chapterIndex: 0,
};

export default function App() {
  const [screen, setScreen] = useState<AppScreen>("gate");
  const [entryPartIndex, setEntryPartIndex] = useState(0);
  const [entryChapterIndex, setEntryChapterIndex] = useState(0);

  const handleGoHome = useCallback(() => setScreen("home"), []);

  const handleEnterExperience = useCallback(
    (partIndex: number, chapterIndex: number) => {
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

  const handleStartExperience = useCallback(() => setScreen("experience"), []);

  return (
    <div style={{ width: "100%", height: "100%", margin: 0, padding: 0, overflow: "hidden" }}>
      <UiSoundProvider>
        {screen === "gate" ? (
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
