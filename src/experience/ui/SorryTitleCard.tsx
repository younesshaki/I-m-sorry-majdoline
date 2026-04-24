import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import "./SorryTitleCard.css";
import sorryTitleBackground from "../scenes/sorry/background video/sorryentry2.png";

type SorryTitleCardProps = {
  onPlay: () => void;
};

export default function SorryTitleCard({ onPlay }: SorryTitleCardProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    if (!rootRef.current) {
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".sorryTitleCard__fade",
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.4,
          ease: "power3.out",
          stagger: 0.14,
        }
      );
    }, rootRef);

    return () => {
      ctx.revert();
    };
  }, []);

  const handlePlay = () => {
    if (isLeaving || !rootRef.current) {
      return;
    }

    setIsLeaving(true);

    gsap.to(rootRef.current, {
      autoAlpha: 0,
      duration: 1,
      ease: "power2.inOut",
      onComplete: onPlay,
    });
  };

  return (
    <div ref={rootRef} className="sorryTitleCard">
      <div
        className="sorryTitleCard__image"
        style={{ backgroundImage: `url(${sorryTitleBackground})` }}
      />
      <div className="sorryTitleCard__overlay" />
      <div className="sorryTitleCard__content">
        <p className="sorryTitleCard__eyebrow sorryTitleCard__fade">For Dounia</p>
        <h1 className="sorryTitleCard__title sorryTitleCard__fade">Sorry</h1>
        <p className="sorryTitleCard__text sorryTitleCard__fade">
          I need you to see what I failed to protect.
        </p>
        <button
          type="button"
          className="sorryTitleCard__play sorryTitleCard__fade"
          onClick={handlePlay}
          disabled={isLeaving}
        >
          Play
        </button>
      </div>
    </div>
  );
}
