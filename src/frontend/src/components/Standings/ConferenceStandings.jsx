import DivisionTable from "./DivisionTable";

function ConferenceStandings({ label, divisions, condensed }) {
  return (
    <div className="mb-2.5 grid rounded-lg border border-surface-raised bg-surface-raised p-2.5">
      <div className="text-center text-xl font-bold text-text-primary">
        {label}
      </div>
      {Object.entries(divisions).map(([division, standings]) => (
        <DivisionTable
          key={division}
          division={division}
          standings={standings}
          condensed={condensed}
        />
      ))}
    </div>
  );
}

export default ConferenceStandings;
