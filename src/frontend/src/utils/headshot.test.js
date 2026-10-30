import { describe, expect, it } from "vitest";
import { getHeadshotSrc } from "./headshot";
import defaultHeadshot from "../img/default_headshot.svg";

describe("getHeadshotSrc", () => {
  it("returns the player's real photo when present", () => {
    expect(getHeadshotSrc({ player_img: "https://x/1.png" })).toBe(
      "https://x/1.png",
    );
  });

  it("returns the Default Headshot for a player with no photo", () => {
    expect(getHeadshotSrc({ player_img: null })).toBe(defaultHeadshot);
    expect(defaultHeadshot).toBeTruthy();
  });

  it("returns null when there is no player (Empty Slot Icon case)", () => {
    expect(getHeadshotSrc(undefined)).toBeNull();
    expect(getHeadshotSrc(null)).toBeNull();
  });
});
