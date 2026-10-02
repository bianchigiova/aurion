/**
 * The home-screen scenes the user can pick between in Settings: the picture
 * behind the day counter, and how it grows with each day and answers each
 * relapse.
 *
 * To add one: write a component taking `SceneProps` that fills the screen
 * (see `.scene` in styles.css), give it a thumbnail, and list it here. Its
 * id is what gets stored, so never change or reuse one.
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

export interface Scene {
  id: string;
  name: string;
  /** One line for the picker. */
  description: string;
  thumbnail: string;
  /** Whether the picture is dark or light, so the counter and buttons on
   *  top of it can switch to colours that read against it. */
  tone: "dark" | "light";
  Component: ComponentType<SceneProps>;
}

export const SCENES: Scene[] = [
  {
    id: "sky",
    name: "Night sky",
    description: "A new star every day. Clouds drift over for a while after giving in.",
    thumbnail: skyThumb,
    tone: "dark",
    Component: StarrySky,
  },
  {
    id: "cherry",
    name: "Cherry tree",
    description: "A new blossom every day. One falls to the ground after giving in.",
    thumbnail: cherryThumb,
    tone: "light",
    Component: CherryTree,
  },
];

/** The scene with this id, or the first (the default) for null or an id
 *  that no longer exists. */
export function sceneById(id: string | null): Scene {
  return SCENES.find((s) => s.id === id) ?? SCENES[0];
}
