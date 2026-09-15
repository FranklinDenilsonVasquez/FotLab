import PlayerContainer from "../Player/PlayerContainer";
import Field from "./Field";
import { useEffect } from "react";
import useGameStore from "../../store/useGameStore";
import usePlayerStore from "../../store/usePlayersStore";
import { CgToggleSquareOff, CgToggleSquare } from "react-icons/cg";

function FieldContainer({ game }) {
  const homeLogo = game?.home_team?.logo;
  const awayLogo = game?.away_team?.logo;

  const { selectedGameId, offensiveSide, toggleOffensiveSide } = useGameStore();
  const { fetchGamePlayers, players } = usePlayerStore();

  useEffect(() => {
    if (selectedGameId) {
      fetchGamePlayers(selectedGameId);
    }
  }, [selectedGameId]);

  const displayTeam = (side) => {
    // side: "top" | "bottom" - which physical endzone this is rendering
    if (side === "top") return offensiveSide === "home" ? game?.away_team : game?.home_team;
    return offensiveSide === "home" ? game?.home_team : game?.away_team;
  };

  const renderEndzone = (side) => {
    const team = displayTeam(side);
    const logo = side === "top" ? (offensiveSide === "home" ? awayLogo : homeLogo) : (offensiveSide === "home" ? homeLogo : awayLogo);

    return (
      <div className="flex min-h-16 w-full items-center justify-center border-2 border-white bg-[#14161a] box-border">
        {logo ? (
          <div className="flex w-full items-center justify-between px-5 py-2.5">
            <img src={logo} className="h-[60px] w-[60px] object-contain" alt={team?.team_name} />
            <p className="flex-1 text-center text-sm font-bold text-white">{team?.team_name}</p>
            <img src={logo} className="h-[60px] w-[60px] object-contain" alt={team?.team_name} />
          </div>
        ) : (
          <p>NFL</p>
        )}
      </div>
    );
  };

  return (
    <div className="relative mx-auto flex aspect-[9/4] h-full w-auto min-w-0 max-w-full flex-col justify-between rounded bg-surface text-white">
      {game && (
        <button
          className="absolute right-[1.5%] top-[10.5%] z-10 flex h-6 w-9 items-center justify-center rounded border border-white/40 bg-black/85 text-xs font-bold text-white hover:bg-white/10"
          onClick={toggleOffensiveSide}
          title="Swap offensive and defensive sides"
        >
          {offensiveSide === "home" ? (
            <CgToggleSquareOff className="h-full w-full" />
          ) : (
            <CgToggleSquare className="h-full w-full" />
          )}
        </button>
      )}

      {renderEndzone("top")}
      <div className="h-10 border-x-2 border-white bg-field" />
      <Field />
      <div>
        <div className="h-10 border-x-2 border-white bg-field">
          <PlayerContainer players={players} game={game} />
        </div>
        {renderEndzone("bottom")}
      </div>
    </div>
  );
}

export default FieldContainer;
