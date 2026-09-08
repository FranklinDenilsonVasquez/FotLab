import { useSeasonStore } from "../../store/seasonStore";
import useGameStore from "../../store/useGameStore";

function SeasonSelector() {
  const { season } = useGameStore();
  const { setSeason } = useSeasonStore();

  const seasons = Array.from(
    { length: 10 },
    (_, i) => new Date().getFullYear() - i,
  );
  if (season === undefined) return null;

  return (
    <select
      className="h-8 cursor-pointer rounded-full border border-white bg-surface px-4 text-sm text-text-primary transition-[filter] hover:brightness-150"
      value={season}
      onChange={(e) => setSeason(Number(e.target.value))}
    >
      {seasons.map((year) => (
        <option key={year.toString()} value={year.toString()}>
          {year}
        </option>
      ))}
    </select>
  );
}

export default SeasonSelector;
