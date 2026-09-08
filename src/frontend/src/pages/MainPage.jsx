import React from "react";
import Header from "../components/Header/Header";
import GameList from "../components/GameList/GameList";
import PlayerCard from "../components/PlayerCard/PlayerCard";

export default function HomePage() {
  return (
    <div className="grid h-[100dvh] grid-rows-[auto_1fr] overflow-hidden bg-bg">
      <Header />
      <GameList />
      <PlayerCard />
    </div>
  );
}
