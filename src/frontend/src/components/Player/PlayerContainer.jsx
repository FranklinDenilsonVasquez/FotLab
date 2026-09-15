import React, { useEffect, useMemo, useState } from "react";
import usePlayerStore from "../../store/usePlayersStore";
import useGameStore from "../../store/useGameStore";
import { groupPlayersByPosition } from "../../utils/groupPlayersByPosition";
import { calculateImpactScore } from "../../utils/calculateImpactScore";
import { lineup } from "../../utils/lineupConfig";
import { getIndexFromSlot } from "../../utils/getIndexFromSlot";
import { useSeasonStore } from "../../store/seasonStore";
import { MdAccountCircle } from "react-icons/md";
import usePlayerCardStore from "../../store/usePlayerCardStore";
import { getRatingColor } from "../../utils/ratingColor";

function PlayerContainer({ game, players }) {
  const { fetchGameRoster, fetchGamePlayers, setRoster, rosters } =
    usePlayerStore();
  const { selectedSeason } = useSeasonStore();
  const { setPlayer, openPlayerCard } = usePlayerCardStore();
  const { week, offensiveSide } = useGameStore();

  const homePlayers = players?.home_team || [];
  const awayPlayers = players?.away_team || [];
  // console.log("HHHHHHH", homePlayers);
  // console.log("PPPPP", awayPlayers);

  useEffect(() => {
    if (
      !game?.home_team?.team_id ||
      !game?.away_team?.team_id ||
      !selectedSeason
    )
      return;

    // Cancellation flag: if the game or season changes (or the game is
    // cleared) while these fetches are in flight, drop the results so a
    // stale response can't re-populate rosters after a reset.
    let cancelled = false;

    const loadRosters = async () => {
      setRoster("home", []);
      setRoster("away", []);

      const home = await fetchGameRoster(
        game.home_team.team_id,
        selectedSeason,
      );
      const away = await fetchGameRoster(
        game.away_team.team_id,
        selectedSeason,
      );

      if (cancelled) return;

      setRoster("home", home);
      setRoster("away", away);
      // console.log("HomeRoster: ", home)
    };

    loadRosters();

    return () => {
      cancelled = true;
    };
  }, [game?.home_team?.team_id, game?.away_team?.team_id, selectedSeason]);

  const mergeRosterWithStats = (roster, statsPlayers) => {
    const statsMap = new Map(statsPlayers.map((p) => [Number(p.player_id), p]));

    // console.log("Stats Map: ", statsMap)

    return roster.map((player) => {
      const stats = statsMap.get(Number(player.player_id));

      // console.log("Player_id: ", player.player_id, player.player_name)
      // console.log("Stats for player " + player.player_id , player.player_name + " :", stats?.stats ?? null)

      return {
        ...player,
        stats: stats?.stats ?? null,
        rating: stats?.rating ?? null,
      };
    });
  };

  const groupedPlayers = useMemo(() => {
    const homeRoster = rosters.home;
    const awayRoster = rosters.away;
    const homeMerged = mergeRosterWithStats(homeRoster, homePlayers);
    // console.log("Home roster before merge: ", homeRoster);
    // console.log("HomeMerged: ", homeMerged);

    const awayMerged = mergeRosterWithStats(awayRoster, awayPlayers);
    //console.log("Away roster before merge: ", awayRoster);
    //console.log("AwayMerged: ", awayMerged);

    const groupAndRank = (rosters, players) => {
      const grouped = groupPlayersByPosition(players);
      // console.log("Grouped: ", grouped)

      const result = {};

      for (const position in grouped) {
        result[position] = grouped[position]
          .map((player) => ({
            ...player,
            impactScore: calculateImpactScore(player),
          }))
          .sort((a, b) => b.impactScore - a.impactScore);
      }

      return result;
    };

    const groupedHome = groupAndRank(homeRoster, homeMerged);
    const groupedAway = groupAndRank(awayRoster, awayMerged);

    return {
      offensePlayers: offensiveSide === "home" ? groupedHome : groupedAway,
      defensePlayers: offensiveSide === "home" ? groupedAway : groupedHome,
    };
  }, [homePlayers, awayPlayers, rosters, offensiveSide]);

  // Debug for loop to count the players in groupedHomePlayers for correctness
  // let count = 0;
  //     for (const [position, players] of Object.entries(groupedPlayers.groupedHomePlayers)) {
  //         count += players.length;
  //     }
  //     console.log("length: ", count)

  // Debugging
  // console.log(
  //   "This is the player list for home players: ",
  //   groupedPlayers.offensePlayers,
  // );
  // console.log(
  //   "This is the player list for away players: ",
  //   groupedPlayers.defensePlayers,
  // );

  // console.log(
  //   "Impact array for home players: ",
  //   playerImpactCalculation.homePlayerImpactRanking,
  // );
  // console.log(
  //   "Impact array for away players: ",
  //   playerImpactCalculation.awayPlayerImpactRanking,
  // );

  const handleClick = (player) => {
    if (!player) return;

    setPlayer(player?.player_id);
    openPlayerCard(player?.player_id);
    //console.log(player);
  };

  const playerButtonClasses =
    "group absolute rounded-full bg-[#262525] text-white " +
    "border-[3px] border-white max-lg:border max-lg:border-white " +
    "h-[clamp(25px,6vmin,60px)] w-[clamp(25px,6vmin,60px)] " +
    "max-lg:h-[clamp(35px,4vmin,60px)] max-lg:w-[clamp(35px,4vmin,60px)] " +
    "hover:cursor-pointer hover:z-[100] hover:scale-[1.6] " +
    "hover:[border-color:antiquewhite] hover:[text-shadow:0_2px_6px_rgba(0,0,0,1)] " +
    "active:scale-[1.2]";

  return (
    <div>
      {lineup.offense.map((slot) => {
        const index = getIndexFromSlot(slot.id);
        const player = groupedPlayers.offensePlayers[slot.position]?.[index];

        return (
          <button
            key={slot.id}
            className={`${playerButtonClasses} ${slot.className}`}
            style={{
              backgroundImage: player?.player_img
                ? `url(${player.player_img})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "3px solid",
              borderColor: getRatingColor(player?.rating) || undefined,
            }}
            onClick={() => handleClick(player)}
          >
            {(!player || !game) && (
              <MdAccountCircle
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.25,
                }}
              />
            )}
            {player?.rating != null && (
              <span
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 min-w-[16px] rounded-md border border-[#0f0f0f] px-[3px] text-center text-[length:clamp(6px,1.4vw,10px)] font-bold leading-[1.4] text-[#0f0f0f] whitespace-nowrap pointer-events-none group-hover:text-[length:clamp(8px,1vw,11px)]"
                style={{ backgroundColor: getRatingColor(player.rating) }}
              >
                {player.rating.toFixed(1)}
              </span>
            )}
            <span className="absolute top-[110%] left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-center font-bold text-[#f9f9f9] [text-shadow:0_6px_12px_rgb(0,0,0)] max-lg:text-[xx-small] group-hover:inline-block">
              {" "}
              {player ? player.player_name : slot.id}{" "}
            </span>
          </button>
        );
      })}
      {lineup.defense.map((slot) => {
        const index = getIndexFromSlot(slot.id);
        const player = groupedPlayers.defensePlayers[slot.position]?.[index];
        return (
          <button
            key={slot.id}
            className={`${playerButtonClasses} ${slot.className}`}
            style={{
              backgroundImage: player?.player_img
                ? `url(${player.player_img})`
                : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              border: "3px solid",
              borderColor: getRatingColor(player?.rating) || undefined,
            }}
            onClick={() => handleClick(player)}
          >
            {(!player || !game) && (
              <MdAccountCircle
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.25,
                }}
              />
            )}
            {player?.rating != null && (
              <span
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 min-w-[16px] rounded-md border border-[#0f0f0f] px-[3px] text-center text-[length:clamp(6px,1.4vw,10px)] font-bold leading-[1.4] text-[#0f0f0f] whitespace-nowrap pointer-events-none group-hover:text-[length:clamp(8px,1vw,11px)]"
                style={{ backgroundColor: getRatingColor(player.rating) }}
              >
                {player.rating.toFixed(1)}
              </span>
            )}
            <span className="absolute top-[110%] left-1/2 hidden -translate-x-1/2 whitespace-nowrap text-center font-bold text-[#f9f9f9] [text-shadow:0_6px_12px_rgb(0,0,0)] max-lg:text-[xx-small] group-hover:inline-block">
              {" "}
              {player ? player.player_name : slot.id}{" "}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default PlayerContainer;
