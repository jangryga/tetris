import { Game } from "./game";
import { Board } from "./game_board";
import { Cluster1 } from "./clusters/cluster1";
import { Rectangle } from "./rectangle";
import { Cluster2 } from "./clusters/cluster2";
import { GameMenu } from "./game_menu";

export type Shape = Cluster1 | Cluster2;

export interface GameContext {
  root: HTMLElement;
  game: Game | null;
  game_stage: "not_started" | "running" | "paused" | "ended";
  game_elements: Rectangle[];
  game_moving_element: Shape | null;
  tick_duration: number;
  key_pressed: boolean;
  last_tick_at: number;
  board: Board;
  queue: Shape[];
  queue_element: HTMLElement;
  game_menu: GameMenu | null;
}

export const ctx = {
  game: null,
  game_stage: "not_started",
  game_elements: [],
  game_moving_element: null,
  game_root: null,
  tick_duration: 500,
  key_pressed: false,
  last_tick_at: Date.now(),
  board: null,
  queue: [],
  game_menu: GameMenu,
} as unknown as GameContext;
