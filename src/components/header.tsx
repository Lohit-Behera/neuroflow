import React from "react";
import dynamic from "next/dynamic";

const ModeToggle = dynamic(
  () => import("@/components/mode-toggle").then((mod) => mod.ModeToggle),
  {
    ssr: false,
  }
);

function Header() {
  return (
    <header className="z-20 w-full sticky top-0 p-2 backdrop-blur bg-background">
      <nav className="flex justify-between space-x-2">
        <p>logo</p>
        <ModeToggle />
      </nav>
    </header>
  );
}

export default Header;
