"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { flushSync } from "react-dom";

export function ModeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const playClick = () => {
    const audio = new Audio("/click.mp3");
    audio.play();
  };

  const ref = React.useRef<HTMLButtonElement>(null);
  const handleClick = async () => {
    playClick();
    if (
      !ref.current ||
      !document.startViewTransition ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      console.warn("View Transitions API not supported in this browser");
      setTheme(theme === "dark" || resolvedTheme === "dark" ? "light" : "dark");
      return;
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setTheme(
          theme === "dark" || resolvedTheme === "dark" ? "light" : "dark"
        );
      });
    }).ready;

    const { top, left, width, height } = ref.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const right = window.innerWidth - left;
    const bottom = window.innerHeight - top;
    const maxRadius = Math.hypot(Math.max(left, right), Math.max(top, bottom));

    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${maxRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 500,
        easing: "ease-in-out",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  };
  return (
    <Button
      ref={ref}
      variant="outline"
      size="icon"
      onClick={() => handleClick()}
    >
      {resolvedTheme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}
