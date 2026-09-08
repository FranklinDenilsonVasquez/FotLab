import { useEffect, useMemo } from "react";
import useStandingStore from "../../store/useStandingStore";
import { useSeasonStore } from "../../store/seasonStore";
import { groupStandings } from "../../utils/groupStandings";
import useLayoutStore from "../../store/useLayoutStore";
import ConferenceStandings from "./ConferenceStandings";

function StandingsContainer() {
  const { data, fetchStandings } = useStandingStore();
  const { selectedSeason } = useSeasonStore();
  const { standingsView, toggleStandingsView } = useLayoutStore();

  useEffect(() => {
    if (selectedSeason !== undefined) {
      fetchStandings(selectedSeason);
    }
  }, [selectedSeason, fetchStandings]);

  const grouped = useMemo(() => groupStandings(data), [data]);

  const afc = grouped["American Football Conference"] || {};
  const nfc = grouped["National Football Conference"] || {};
  const condensed = standingsView === "condensed";

  return (
    <>
      <p className="mb-2 flex items-center justify-between border-b border-border pb-1 text-lg font-semibold text-text-primary">
        Standings
        <button
          onClick={toggleStandingsView}
          className="rounded-md border border-border px-2 py-0.5 text-xs font-normal text-text-secondary transition-colors hover:border-border-strong hover:text-text-primary"
        >
          {condensed ? "Full stats" : "Condensed"}
        </button>
      </p>
      <ConferenceStandings label="AFC" divisions={afc} condensed={condensed} />
      <ConferenceStandings label="NFC" divisions={nfc} condensed={condensed} />
    </>
  );
}

export default StandingsContainer;
