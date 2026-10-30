# FotLab

Tracks NFL game, team, and player stats (2022-2024 seasons) and surfaces them through a FastAPI backend and React frontend.

## Language

**Player Game Rating**:
A per-(player, game) score in the 0.0-10.0 range, seeded at a baseline of 6.0 and adjusted by fixed, position-weighted point deltas for the statistical events that player recorded in that specific finished game. Absolute, not relative: a player's rating depends only on their own stat line for that game, never on how other players performed. Computed once per game (via ETL, after that game's stats are inserted) and persisted; safe to idempotently recompute if the underlying stats are corrected. Clamped to [0.0, 10.0] and rounded to 1 decimal place.
_Avoid_: Player rating, score, grade (ambiguous with the two related-but-out-of-scope concepts below)

**Live Rating** _(future, not yet built)_:
A hypothetical incremental version of Player Game Rating that would update in real time during an in-progress game, driven by a play-by-play event stream. Not buildable today because this project has no live/play-by-play data source, only finished-game aggregate stats.

**League Percentile Rating** _(future, not yet built)_:
A hypothetical relative rating that would compare a player's stat line against other players at the same position, for cross-player/league-wide comparison. Deliberately not what Player Game Rating does (see above): Player Game Rating answers "how did this player play," not "how did this player compare to others."

## Player Headshots

**Placeholder Headshot**:
The "image not available" picture the stats API serves in place of a real photo for players it has no headshot for. Recognized by an exact byte match against the known placeholder image. Never shown to users.
_Avoid_: Missing image, broken image, default image (reserved for our own replacement below)

**Default Headshot**:
Our own neutral silhouette image, shown in place of a Placeholder Headshot. One image for every player, with no team or position variation. Treated like a real headshot for display purposes, including the rating ring and badge.
_Avoid_: Fallback image, placeholder

**Empty Slot Icon**:
The faded generic account icon shown when a lineup slot has no player or no game is selected. Not a headshot and unrelated to the Default Headshot.

## Frontend Layout

**Panel**:
One of the three regions of the game view: the Games Panel (game list), the Field Panel (selected game's field diagram), and the Standings Panel (conference/division tables). On desktop all three are visible side by side (Games left, Field center, Standings right), each independently closable. On narrow viewports only one Panel fills the screen at a time, switched via the Mobile Tab Bar; there are no off-canvas drawers.
_Avoid_: Sidebar, drawer

**Mobile Tab Bar**:
The bottom navigation bar shown only on narrow viewports, with one tab per Panel (Games, Field, Standings). Tapping a tab makes that Panel the one filling the screen. Selecting a game from the Games Panel also switches the active tab to Field.
_Avoid_: Bottom nav, drawer toggle

**Condensed Standings View** / **Full Standings View**:
The Standings Panel's two display modes for its per-team stat columns. Condensed (the default) shows a short, curated set of stats (W-L-T, PCT, PF, PA, Streak); Full shows all 18 tracked stat columns and is reached via an explicit expand action.
_Avoid_: Compact view, detailed view

**Team Theming** _(future, not yet built)_:
A hypothetical mode where the Field Panel (and possibly header accents) would recolor to the two teams' colors when a game is selected. Deliberately deferred: the current UI uses one fixed dark palette regardless of the selected game.
