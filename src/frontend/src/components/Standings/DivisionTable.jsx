import { calculateWinPct } from "../../utils/calculateWinPct";

// Condensed set mirrors what ESPN/NFL.com show by default; the full set is
// every stat the API returns (see CONTEXT.md: Condensed/Full Standings View).
const CONDENSED_COLUMNS = [
  { key: "wins", label: "W" },
  { key: "ties", label: "D" },
  { key: "losses", label: "L" },
  { key: "pct", label: "PCT", value: (t) => calculateWinPct(t.wins, t.losses, t.ties) },
  { key: "points_for", label: "PF" },
  { key: "points_against", label: "PA" },
  { key: "streak", label: "STRK" },
];

const FULL_COLUMNS = [
  { key: "wins", label: "W" },
  { key: "ties", label: "D" },
  { key: "losses", label: "L" },
  { key: "pct", label: "PCT", value: (t) => calculateWinPct(t.wins, t.losses, t.ties) },
  { key: "points_for", label: "PF" },
  { key: "points_against", label: "PA" },
  { key: "point_differential", label: "DIFF" },
  { key: "division_wins", label: "DW" },
  { key: "division_losses", label: "DL" },
  { key: "conference_wins", label: "CW" },
  { key: "conference_losses", label: "CL" },
  { key: "home_wins", label: "HW" },
  { key: "home_losses", label: "HL" },
  { key: "road_wins", label: "RW" },
  { key: "road_losses", label: "RL" },
  { key: "streak", label: "STRK" },
];

function DivisionTable({ division, standings, condensed }) {
  const columns = condensed ? CONDENSED_COLUMNS : FULL_COLUMNS;
  const gridTemplateColumns = `2fr repeat(${columns.length}, 1fr)`;

  return (
    <div className="my-2.5 overflow-x-auto rounded-lg border border-border bg-surface-raised pt-2.5">
      <div className="min-w-max">
        <div
          className="grid items-end border-b border-text-tertiary bg-surface-raised font-bold"
          style={{ gridTemplateColumns }}
        >
          <div className="sticky left-0 z-10 flex h-full w-[54px] items-center justify-center bg-surface p-1.5 text-text-tertiary">
            {division}
          </div>
          {columns.map((col) => (
            <div
              key={col.key}
              className="flex w-[30px] items-center justify-center p-1.5 text-text-tertiary"
            >
              {col.label}
            </div>
          ))}
        </div>

        {standings.map((team) => (
          <div
            className="relative z-0 grid items-center"
            style={{ gridTemplateColumns }}
            key={team.team.team_id}
          >
            <div className="sticky left-0 z-10 flex w-max items-center justify-center border-r border-border bg-surface p-2">
              <img
                className="h-auto"
                style={{ width: "clamp(24px, 4vw, 48px)" }}
                src={team?.team?.logo}
                alt={team.team.team_name}
              />
            </div>
            {columns.map((col) => (
              <div
                key={col.key}
                className="flex w-[30px] items-center justify-center bg-surface-raised p-1.5 text-text-primary"
              >
                {col.value ? col.value(team) : team[col.key]}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default DivisionTable;
