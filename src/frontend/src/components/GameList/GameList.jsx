import React, { useState, useEffect } from "react";
import { useSeasonStore } from "../../store/seasonStore";
import FieldContainer from "../Field/FieldContainer";
import StandingsContainer from "../Standings/StandingsContainer";
import useGameStore from "../../store/useGameStore";
import usePlayersStore from "../../store/usePlayersStore";
import useUiStore from "../../store/useUiStore";
import useLayoutStore from "../../store/useLayoutStore";
import {
  MdVisibility,
  MdVisibilityOff,
  MdChevronLeft,
  MdChevronRight,
  MdViewList,
  MdSportsFootball,
  MdLeaderboard,
} from "react-icons/md";

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

const MOBILE_TABS = [
  { id: "games", label: "Games", icon: MdViewList },
  { id: "field", label: "Field", icon: MdSportsFootball },
  { id: "standings", label: "Standings", icon: MdLeaderboard },
];

function GameList() {
  const [selectedGame, setGameSelected] = useState(null);

  const {
    games,
    week,
    season,
    loading,
    error,
    setSeason,
    setWeek,
    fetchGames,
    showScore,
    setShowScore,
    selectedGameId,
    setSelectedGameId,
    clearSelectedGame,
  } = useGameStore();

  const { clearPlayers } = usePlayersStore();
  const { selectedSeason } = useSeasonStore();
  const { mobileTab, setMobileTab } = useUiStore();
  const {
    gamesPanelOpen,
    standingsPanelOpen,
    toggleGamesPanel,
    toggleStandingsPanel,
  } = useLayoutStore();

  useEffect(() => {
    setShowScore(false);
  }, []);

  useEffect(() => {
    if (selectedSeason !== undefined) {
      setSeason(selectedSeason);
      // Reset the field to its default state when the season changes
      setGameSelected(null);
      clearSelectedGame();
      clearPlayers();
    }
  }, [selectedSeason, setSeason, clearSelectedGame, clearPlayers]);

  useEffect(() => {
    if (season !== undefined && week !== undefined) {
      fetchGames();
    }
  }, [season, week, fetchGames]);

  const onClickGameIdSelect = (gameId) => {
    setSelectedGameId(gameId);
  };

  const onClickTeamSelect = (game) => {
    setGameSelected(game);
  };

  const handleGameClick = (game) => {
    onClickTeamSelect(game);
    onClickGameIdSelect(game.game_id);
    setMobileTab("field");
  };

  return (
    <main className="relative flex min-h-0 min-w-0 flex-col overflow-hidden lg:flex-row ">
      {/* Desktop panel toggles (>= lg) */}
      <button
        className="absolute left-2 top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-text-primary backdrop-blur-md transition-colors hover:bg-white/10 hover:text-text-primary lg:flex"
        onClick={toggleGamesPanel}
        title={gamesPanelOpen ? "Hide games panel" : "Show games panel"}
        aria-expanded={gamesPanelOpen}
      >
        {gamesPanelOpen ? <MdChevronLeft /> : <MdChevronRight />}
      </button>
      <button
        className="absolute right-2 top-2 z-20 hidden h-8 w-8 items-center justify-center rounded-md border border-white/20 bg-white/10 text-text-primary backdrop-blur-md transition-colors hover:bg-white/10 hover:text-text-primary lg:flex"
        onClick={toggleStandingsPanel}
        title={
          standingsPanelOpen ? "Hide standings panel" : "Show standings panel"
        }
        aria-expanded={standingsPanelOpen}
      >
        {standingsPanelOpen ? <MdChevronRight /> : <MdChevronLeft />}
      </button>

      {/* Games Panel */}
      <div
        className={cx(
          "min-h-0 flex-col overflow-y-auto bg-surface px-6 pb-24",
          mobileTab === "games" ? "flex flex-1" : "hidden",
          "lg:flex lg:flex-none lg:shrink-0 lg:border-r lg:border-border lg:pb-0 lg:pt-12 lg:transition-[width,padding,opacity] lg:duration-200",
          gamesPanelOpen
            ? "lg:w-100 lg:opacity-100"
            : "lg:w-0 lg:overflow-hidden lg:border-0 lg:p-0 lg:opacity-0",
        )}
      >
        <p className="mb-2 flex items-center justify-between border-b border-border pb-1 text-lg font-semibold text-text-primary">
          Games
          <button
            onClick={() => setShowScore(!showScore)}
            className="text-text-secondary transition-transform hover:scale-125 hover:text-text-primary"
            title="Toggle scores"
          >
            {showScore ? <MdVisibility /> : <MdVisibilityOff />}
          </button>
        </p>
        {loading && (
          <p className="mx-auto my-2.5 h-6 w-6 animate-spin rounded-full border-[3px] border-border border-t-text-primary" />
        )}
        {error && <p className="text-center italic text-red-400">{error}</p>}
        {!loading && !error && (
          <ul className="flex flex-col items-center p-0">
            {games.map((game, idx) => (
              <li
                key={idx}
                className={cx(
                  "my-1.5 w-full max-w-[500px] cursor-pointer list-none rounded-3xl px-4 py-2.5 text-center text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary border",
                  selectedGame === game && "bg-accent-muted text-text-primary",
                )}
                onClick={() => handleGameClick(game)}
              >
                <div className="flex items-center gap-2">
                  <img
                    src={game.home_team.logo}
                    alt={game.home_team.team_name}
                    className="mx-1 inline-block h-10 w-10 object-contain align-middle"
                  />
                  {game.home_team.team_name}
                  {showScore ? (
                    <div className="flex flex-1 justify-end">
                      {game.home_team_score}
                    </div>
                  ) : (
                    <span className="text-text-primary"></span>
                  )}{" "}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={game.away_team.logo}
                    alt={game.away_team.team_name}
                    className="mx-1 inline-block h-10 w-10 object-contain align-middle"
                  />
                  {game.away_team.team_name}
                  {showScore ? (
                    <div className="flex flex-1 justify-end">
                      {game.away_team_score}
                    </div>
                  ) : (
                    <span className="text-text-primary"></span>
                  )}{" "}
                </div>
              </li>
            ))}
          </ul>
        )}
        {!loading && !error && games.length === 0 && (
          <p className="text-text-secondary">No games found.</p>
        )}
      </div>

      {/* Field Panel */}
      <div
        className={cx(
          "min-h-0 min-w-0 flex-1 items-center justify-center overflow-auto p-2.5 pb-24",
          mobileTab === "field" ? "flex" : "hidden",
          "lg:flex lg:pb-2.5",
        )}
      >
        <FieldContainer game={selectedGame} />
      </div>

      {/* Standings Panel */}
      <div
        className={cx(
          "min-h-0 flex-col overflow-y-auto bg-surface p-4 pb-24",
          mobileTab === "standings" ? "flex flex-1" : "hidden",
          "lg:flex lg:flex-none lg:shrink-0 lg:border-l lg:border-border lg:pb-4 lg:pt-12 lg:transition-[width,padding,opacity] lg:duration-200",
          standingsPanelOpen
            ? "lg:w-100 lg:opacity-100"
            : "lg:w-0 lg:overflow-hidden lg:border-0 lg:p-0 lg:opacity-0",
        )}
      >
        <StandingsContainer />
      </div>

      {/* Mobile bottom tab bar (< lg) - floats over the panels, which scroll underneath it */}
      <nav className="absolute inset-x-4 bottom-4 z-[1100] flex rounded-4xl border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md lg:hidden">
        {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={cx(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
              mobileTab === id ? "text-accent" : "text-text-secondary",
            )}
            onClick={() => setMobileTab(id)}
            aria-current={mobileTab === id}
          >
            <Icon className="text-xl" />
            {label}
          </button>
        ))}
      </nav>
    </main>
  );
}

export default GameList;
