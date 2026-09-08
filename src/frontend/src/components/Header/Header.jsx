import { useEffect } from "react";
import { FaGithub, FaLinkedin } from "react-icons/fa";
import { useWeekStore } from "../../store/weekStore";
import useGameStore from "../../store/useGameStore";
import SeasonSelector from "../SeasonSelector/SeasonSelector";

function Header() {
  const { weekIndex, nextWeek, prevWeek, weeks } = useWeekStore();
  const { setWeek, setStage } = useGameStore();
  const currentWeek = weeks[weekIndex];

  useEffect(() => {
    setWeek(currentWeek.label);
    setStage(currentWeek.stage);
  }, [weekIndex, currentWeek, setWeek, setStage]);

  return (
    <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-b-border-strong bg-surface px-4 py-6 text-text-primary">
      <h1
        className="text-2xl tracking-wide text-text-primary"
        style={{ fontFamily: "'Anton', sans-serif" }}
      >
        FotLab
      </h1>

      <div className="order-3 flex w-full items-center justify-center gap-3 lg:order-none lg:w-auto">
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white transition-transform hover:scale-110 hover:bg-white hover:text-bg"
          onClick={prevWeek}
          aria-label="Previous week"
        >
          &lt;
        </button>
        <span
          className="min-w-[9rem] text-center text-sm font-extralight"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          {currentWeek.label}
        </span>
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-white transition-transform hover:scale-110 hover:bg-white hover:text-bg"
          onClick={nextWeek}
          aria-label="Next week"
        >
          &gt;
        </button>
        <SeasonSelector />
      </div>

      <div className="flex items-center gap-3">
        <a
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-text-primary transition-colors hover:bg-accent hover:text-bg"
          href="https://www.linkedin.com/in/franklin-vasquez-5b831333a/"
          aria-label="LinkedIn"
        >
          <FaLinkedin />
        </a>
        <a
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised text-text-primary transition-colors hover:bg-accent hover:text-bg"
          href="https://github.com/FranklinDenilsonVasquez"
          aria-label="GitHub"
        >
          <FaGithub />
        </a>
      </div>
    </header>
  );
}

export default Header;
