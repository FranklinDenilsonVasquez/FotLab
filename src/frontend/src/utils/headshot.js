import defaultHeadshot from "../img/default_headshot.svg";

// Image to show for a player (see CONTEXT.md: Default Headshot). Players with
// no real photo have a null player_img (the ETL clears the API's Placeholder
// Headshot) and get our Default Headshot. No player at all returns null so the
// caller can show the Empty Slot Icon instead.
export const getHeadshotSrc = (player) => {
  if (!player) return null;
  return player.player_img || defaultHeadshot;
};
