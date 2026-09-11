import { create } from "zustand"

// Function to return season year depending on the dynamic month the page is
// being accessed on
// Latest season with data available in the DB; bump this once later seasons are ingested.
const MAX_AVAILABLE_SEASON = 2025

const getDefaultSeason = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const currentSeason = month >= 9 ? year : year - 1
    return Math.min(currentSeason, MAX_AVAILABLE_SEASON)
}

const generateSeasons = (numSeasons = 10) => {
    const currentSeason = getDefaultSeason()
    return Array.from({ length: numSeasons}, (_, i) => currentSeason - i)
}

export const useSeasonStore = create((set => ({
        selectedSeason: getDefaultSeason(),
        seasons: generateSeasons(10),
        setSeason: (season) => set({ selectedSeason: season })
    })

))