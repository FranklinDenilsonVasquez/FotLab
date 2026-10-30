import { create } from "zustand";
import "./PlayerCard.css";
import usePlayerStore from "../../store/usePlayersStore";
import usePlayerCardStore from "../../store/usePlayerCardStore";
import { useEffect, useMemo, useRef } from "react";
import usePlayersStore from "../../store/usePlayersStore";
import useGameStore from "../../store/useGameStore";
import { MdHighlightOff, MdAccountCircle } from "react-icons/md";
import { X } from "lucide-react";
import { findPlayerTeam } from "../../utils/findPlayerTeam";
import { useSeasonStore } from "../../store/seasonStore";
import { getRatingColor } from "../../utils/ratingColor";
import { getHeadshotSrc } from "../../utils/headshot";
import StatsSection from "./StatsSection";

function PlayerCard() {
  const players = usePlayersStore((state) => state.players);
  const { selectedSeason } = useSeasonStore();
  const { rosters } = usePlayerStore();
  const { selectedPlayer, isOpen, openPlayerCard, closePlayerCard } =
    usePlayerCardStore();
  const { selectedGameId, homeTeamId, awayTeamId } = useGameStore();

  const selectedGame = useGameStore((state) =>
    state.games.find((g) => g.game_id === state.selectedGameId),
  );
  // console.log(selectedGame);

  const allPlayers = useMemo(
    () => ({
      home_team: players?.home_team || [],
      away_team: players?.away_team || [],
    }),
    [players],
  );

  const player = useMemo(() => {
    const flatRoster = Object.values(rosters || {}).flat();
    const flatStats = Object.values(allPlayers || {}).flat();
    const teamAffiliation = findPlayerTeam(rosters, selectedPlayer);
    const foundPlayer =
      flatStats.find((player) => player.player_id === selectedPlayer) ||
      flatRoster.find((player) => player.player_id === selectedPlayer);

    return {
      ...foundPlayer,
      team: teamAffiliation,
    };
  }, [rosters, allPlayers, selectedPlayer]);

  console.log("player: ", player);
  // console.log(
  //   "Rosters: ",
  //   rosters?.home?.find((p) => p.player_id === selectedPlayer)?.jersey_number,
  // );

  useEffect(() => {
    closePlayerCard();
  }, [selectedGameId, selectedSeason]);

  const cardScrollRef = useRef(null);
  const imageSectionRef = useRef(null);
  const collapseRafRef = useRef(null);

  const COLLAPSE_SCROLL_RANGE = 80;

  const handleCardScroll = () => {
    if (collapseRafRef.current) return;
    collapseRafRef.current = requestAnimationFrame(() => {
      collapseRafRef.current = null;
      const scrollEl = cardScrollRef.current;
      const imageSection = imageSectionRef.current;
      if (!scrollEl || !imageSection) return;
      const collapse = Math.min(
        1,
        Math.max(0, scrollEl.scrollTop / COLLAPSE_SCROLL_RANGE),
      );
      imageSection.style.setProperty("--collapse", collapse);
    });
  };

  useEffect(() => {
    if (cardScrollRef.current) {
      cardScrollRef.current.scrollTop = 0;
    }
    if (imageSectionRef.current) {
      imageSectionRef.current.style.setProperty("--collapse", 0);
    }
  }, [selectedPlayer]);

  return (
    <>
      {isOpen && (
        <div>
          <div className="player-card-container" style={{ color: "white" }}>
            <div
              className="player-card"
              ref={cardScrollRef}
              onScroll={handleCardScroll}
            >
              <div className="player-image-section" ref={imageSectionRef}>
                <div className="player-rating-wrapper">
                  <div
                    className="image-container"
                    style={{
                      borderColor: getRatingColor(player?.rating) || undefined,
                    }}
                  >
                    {getHeadshotSrc(player) ? (
                      <img
                        src={getHeadshotSrc(player)}
                        alt={player?.player_name}
                      ></img>
                    ) : (
                      <MdAccountCircle
                        style={{
                          inset: 0,
                          height: "100%",
                          width: "100%",
                          opacity: 0.25,
                        }}
                      />
                    )}
                  </div>
                  {player?.rating != null && (
                    <div
                      className="player-rating-badge"
                      style={{ backgroundColor: getRatingColor(player.rating) }}
                    >
                      {player.rating.toFixed(1)}
                    </div>
                  )}
                  <div className="team-badge">
                    {player && player?.team?.team === "home" ? (
                      <img
                        src={selectedGame?.home_team?.logo}
                        alt={selectedGame?.home_team?.team_name}
                      ></img>
                    ) : (
                      <img
                        src={selectedGame?.away_team?.logo}
                        alt={selectedGame?.away_team?.team_name}
                      ></img>
                    )}
                  </div>
                </div>
                <div className="bio-section">
                  <div className="name-section">
                    {player ? player.player_name : "Unknown"}
                  </div>
                  <div className="meta-row">
                    <div className="bio-stat-section">
                      {player ? player.position : "N/A"}
                      <div className="bio-shadow-text"> Position </div>
                    </div>
                    <div className="bio-stat-section">
                      #{" "}
                      {player && player?.team?.team === "home"
                        ? rosters?.home?.find(
                            (p) => p.player_id === selectedPlayer,
                          )?.jersey_number
                        : rosters?.away?.find(
                            (p) => p.player_id === selectedPlayer,
                          )?.jersey_number}
                      <div className="bio-shadow-text"> Number </div>
                    </div>
                    <div className="bio-stat-section">
                      {player && player?.team?.team === "home"
                        ? rosters?.home?.find(
                            (p) => p.player_id === selectedPlayer,
                          )?.college
                        : rosters?.away?.find(
                            (p) => p.player_id === selectedPlayer,
                          )?.college}
                      <div className="bio-shadow-text"> College </div>
                    </div>
                    <div className="bio-stat-section">
                      {player && player?.team?.team === "home"
                        ? rosters?.home?.find(
                            (p) => p.player_id === selectedPlayer,
                          )?.age
                        : rosters?.away?.find(
                            (p) => p.player_id === selectedPlayer,
                          )?.age}
                      <div className="bio-shadow-text"> Age </div>
                    </div>
                  </div>
                </div>
              </div>
              <StatsSection player={player} roster={rosters} />
            </div>
            <button className="close-player-card-btn" onClick={closePlayerCard}>
              <X size={10} />
            </button>
          </div>
        </div>
      )}{" "}
    </>
  );
}

export default PlayerCard;
