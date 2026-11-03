// Horizontal, scrollable game picker shown above the Field Panel on narrow
// viewports (< lg). Logos only, to keep the strip uncluttered.
function GameStrip({ games, loading, error, selectedGame, onSelect }) {
  return (
    <div className="flex-none border-b border-border bg-surface px-3 py-2 lg:hidden">
      {loading && (
        <div className="flex h-12 items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-border border-t-text-primary" />
        </div>
      )}
      {error && <p className="text-center text-sm italic text-red-400">{error}</p>}
      {!loading && !error && games.length === 0 && (
        <p className="py-3 text-center text-sm text-text-secondary">No games found.</p>
      )}
      {!loading && !error && games.length > 0 && (
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1">
          {games.map((game) => {
            const isSelected = selectedGame === game;
            return (
              <li key={game.game_id} className="flex-none snap-start">
                <button
                  type="button"
                  onClick={() => onSelect(game)}
                  aria-label={`${game.home_team.team_name} vs ${game.away_team.team_name}`}
                  aria-pressed={isSelected}
                  className={
                    "flex h-14 cursor-pointer items-center gap-1.5 rounded-2xl border px-3 text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary " +
                    (isSelected ? "border-accent bg-accent-muted text-text-primary" : "border-border")
                  }
                >
                  <img
                    src={game.home_team.logo}
                    alt=""
                    className="h-9 w-9 object-contain"
                  />
                  <span className="text-[10px] uppercase text-text-tertiary">vs</span>
                  <img
                    src={game.away_team.logo}
                    alt=""
                    className="h-9 w-9 object-contain"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default GameStrip;
