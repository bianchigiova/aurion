/**
 * The home-screen scenes the user can pick between in Settings: the picture
 * behind the day counter, and how it grows with each day and answers each
 * relapse.
 *
 * To add one: write a component taking `SceneProps` that fills the screen
 * (see `.scene` in styles.css), give it a thumbnail, list it here, and give
 * it a name and description in every language (src/i18n). Its id is what
 * gets stored, so never change or reuse one.
 */

import type { ComponentType } from "react";
import CherryTree from "./components/CherryTree";
import StarrySky from "./components/StarrySky";
import cherryThumb from "./assets/thumbs/cherry-tree.jpg";
import skyThumb from "./assets/thumbs/night-sky.jpg";

export interface SceneProps {
  /** When the whole journey began; never moved by relapses. Scenes seed
   *  their randomness from it, so the same picture comes back every time. */
  journeyStartISO: string;
  /** Days in the whole journey, not the current streak. */
  days: number;
  /** Every relapse, oldest first. */
  relapseISOs: string[];
}

/** Also the key of the scene's name and description in the messages
 *  (src/i18n), so a new scene needs those in every language. */
export type SceneId = "sky" | "cherry";

export interface Scene {
  id: SceneId;
  thumbnail: string;
  /** Whether the picture is dark or light, so the counter and buttons on
   *  top of it can switch to colours that read against it. */
  tone: "dark" | "light";
  /** The colour along the top of the picture. iOS tints and blurs the status
   *  bar area with the page's colour, so the home screen switches to this
   *  while it's up, and the band blends into the picture. */
  topColor: string;
  Component: ComponentType<SceneProps>;
}

export const SCENES: Scene[] = [
  {
    id: "sky",
    thumbnail: skyThumb,
    tone: "dark",
    topColor: "#01133e",
    Component: StarrySky,
  },
  {
    id: "cherry",
    thumbnail: cherryThumb,
    tone: "light",
    topColor: "#fdebe3",
    Component: CherryTree,
  },
];

/** The scene with this id, or the first (the default) for null or an id
 *  that no longer exists. */
export function sceneById(id: string | null): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
