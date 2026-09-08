import { create } from "zustand";

// Which Panel fills the screen on mobile (< lg), where only one Panel is
// shown at a time and a bottom tab bar switches between them.
const useUiStore = create((set) => ({
  mobileTab: "games", // "games" | "field" | "standings"

  setMobileTab: (tab) => set({ mobileTab: tab }),
}));

export default useUiStore;
