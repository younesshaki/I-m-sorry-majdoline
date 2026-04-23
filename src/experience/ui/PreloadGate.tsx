import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useUiSounds } from "../audio/useUiSounds";
import { checkExistingSession, loginOrRegister } from "../../lib/authService";
import "../loaders/preloader/styles.css";
import preloadGateVideo from "../../assets/preload/preload-gate.mp4";

type Phase = "checking" | "auth" | "ready";

type PreloadGateProps = {
  onStart: () => void;
};

const ACCESS_PASSWORD = import.meta.env.VITE_ACCESS_PASSWORD as string;

const ERROR_MESSAGES: Record<string, string> = {
  wrong_password: "incorrect password",
  username_taken: "this name is already taken",
  invalid_username: "letters, numbers and underscores only (2–30 chars)",
  network_error: "something went wrong, try again",
};

export default function PreloadGate({ onStart }: PreloadGateProps) {
  const { playGateClick, playHover } = useUiSounds();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startTimeoutRef = useRef<number | null>(null);
  const authRef = useRef<HTMLDivElement | null>(null);
  const buttonShellRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<Phase>("checking");
  const [videoReady, setVideoReady] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkExistingSession().then((user) => {
      if (user) {
        setPhase("ready");
      } else {
        setPhase("auth");
      }
    });
  }, []);

  // Animate auth form in when phase becomes "auth"
  useEffect(() => {
    if (phase !== "auth" || !authRef.current) return;
    gsap.fromTo(
      authRef.current.querySelectorAll(".pgAuth__item"),
      { autoAlpha: 0, y: 18 },
      { autoAlpha: 1, y: 0, duration: 1.1, ease: "power3.out", stagger: 0.1 }
    );
  }, [phase]);

  // Animate play button in when phase becomes "ready"
  useEffect(() => {
    if (phase !== "ready" || !buttonShellRef.current) return;
    gsap.fromTo(
      buttonShellRef.current,
      { autoAlpha: 0, scale: 0.88 },
      { autoAlpha: 1, scale: 1, duration: 1.2, ease: "power3.out" }
    );
  }, [phase]);

  // Video setup
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    const handleCanPlay = () => {
      setVideoReady(true);
      video.play().catch(() => {});
    };
    video.addEventListener("canplay", handleCanPlay);
    return () => video.removeEventListener("canplay", handleCanPlay);
  }, []);

  useEffect(() => {
    return () => {
      if (startTimeoutRef.current !== null) {
        window.clearTimeout(startTimeoutRef.current);
      }
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setErrorKey(null);

    if (password.trim() !== ACCESS_PASSWORD) {
      setErrorKey("wrong_password");
      return;
    }

    setSubmitting(true);
    const result = await loginOrRegister(username, ACCESS_PASSWORD);
    setSubmitting(false);

    if (!result.success) {
      setErrorKey(result.error);
      return;
    }

    // Transition: fade out auth form, fade in play button
    if (authRef.current) {
      gsap.to(authRef.current, {
        autoAlpha: 0,
        y: -12,
        duration: 0.55,
        ease: "power2.in",
        onComplete: () => setPhase("ready"),
      });
    } else {
      setPhase("ready");
    }
  };

  const handleStart = () => {
    if (isStarting) return;
    setIsStarting(true);
    playGateClick();
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      setAudioEnabled(false);
    }
    startTimeoutRef.current = window.setTimeout(() => {
      onStart();
    }, 1080);
  };

  const handleAudioToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const shouldMute = event.target.checked;
    video.muted = shouldMute;
    setAudioEnabled(!shouldMute);
    if (!shouldMute) video.play().catch(() => {});
  };

  const busy = submitting;

  return (
    <div className="preloadGate">
      <video
        ref={videoRef}
        className="preloadGateVideo"
        src={preloadGateVideo}
        autoPlay
        loop
        playsInline
        preload="auto"
      />

      {/* Auth form — shown before login */}
      {phase === "auth" || (phase === "checking") ? (
        <div ref={authRef} className="pgAuth">
          <form className="pgAuth__form" onSubmit={handleAuthSubmit} noValidate>
            <p className="pgAuth__item pgAuth__eyebrow">For Dounia</p>
            <input
              className="pgAuth__item pgAuth__input"
              type="text"
              placeholder="choose a name"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorKey(null); }}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              disabled={busy}
            />
            <input
              className="pgAuth__item pgAuth__input pgAuth__input--password"
              type="password"
              placeholder="the password is the number of letters in the birthday jar + baby yoda's name"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrorKey(null); }}
              autoComplete="current-password"
              disabled={busy}
            />
            <p className="pgAuth__item pgAuth__error">
              {errorKey ? ERROR_MESSAGES[errorKey] ?? ERROR_MESSAGES.network_error : ""}
            </p>
            <button
              className="pgAuth__item pgAuth__submit"
              type="submit"
              disabled={busy || !username.trim() || !password.trim()}
              onMouseEnter={!busy ? playHover : undefined}
            >
              {submitting ? "..." : "Enter"}
            </button>
          </form>
        </div>
      ) : null}

      {/* Play button — shown after successful login */}
      {phase === "ready" ? (
        <div
          ref={buttonShellRef}
          className={`preloadGateButtonShell${isStarting ? " isStarting" : ""}`}
          style={{ opacity: 0 }}
        >
          <span className="preloadGatePulse preloadGatePulse--glow" aria-hidden="true" />
          <span className="preloadGatePulse preloadGatePulse--ring" aria-hidden="true" />
          <button
            className="preloadGateButton"
            type="button"
            onMouseEnter={isStarting ? undefined : playHover}
            onFocus={isStarting ? undefined : playHover}
            onClick={handleStart}
            disabled={isStarting}
          >
            Play
          </button>
        </div>
      ) : null}

      <div className="preloadGateAudioControls" aria-label="audio controls">
        <input
          id="preloadGateAudioToggle"
          type="checkbox"
          checked={!audioEnabled}
          onChange={handleAudioToggle}
          disabled={!videoReady}
        />
        <label htmlFor="preloadGateAudioToggle" className="toggleSwitch">
          <div className="speaker">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 75 75">
              <path
                d="M39.389,13.769 L22.235,28.606 L6,28.606 L6,47.699 L21.989,47.699 L39.389,62.75 L39.389,13.769z"
                style={{ stroke: "#fff", strokeWidth: 5, strokeLinejoin: "round", fill: "#fff" }}
              />
              <path
                d="M48,27.6a19.5,19.5 0 0 1 0,21.4M55.1,20.5a30,30 0 0 1 0,35.6M61.6,14a38.8,38.8 0 0 1 0,48.6"
                style={{ fill: "none", stroke: "#fff", strokeWidth: 5, strokeLinecap: "round" }}
              />
            </svg>
          </div>
          <div className="mute-speaker">
            <svg viewBox="0 0 75 75" stroke="#fff" strokeWidth="5">
              <path d="m39,14-17,15H6V48H22l17,15z" fill="#fff" strokeLinejoin="round" />
              <path d="m49,26 20,24m0-24-20,24" fill="#fff" strokeLinecap="round" />
            </svg>
          </div>
        </label>
      </div>
    </div>
  );
}
