import { create } from "zustand";
import { persist } from "zustand/middleware";

// Desktop panel visibility (Games/Field/Standings Panels - see CONTEXT.md).
// Persisted so a returning user keeps their choice; a first-time visitor
// with nothing in storage gets both panels open by default.
const useLayoutStore = create(
  persist(
    (set) => ({
      gamesPanelOpen: true,
      standingsPanelOpen: true,
      standingsView: "condensed", // "condensed" | "full"

      toggleGamesPanel: () =>
        set((state) => ({ gamesPanelOpen: !state.gamesPanelOpen })),
      toggleStandingsPanel: () =>
        set((state) => ({ standingsPanelOpen: !state.standingsPanelOpen })),
      toggleStandingsView: () =>
        set((state) => ({
          standingsView: state.standingsView === "condensed" ? "full" : "condensed",
        })),
    }),
    { name: "nfl-stats-layout" }
  )
);

export default useLayoutStore;
