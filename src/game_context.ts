import { Game } from "./game";
import { Board } from "./game_board";
import { Cluster1 } from "./clusters";
import { Rectangle } from "./rectangle";

export type Shape = Cluster1;

export interface GameContext {
  root: HTMLElement;
  game: Game;
  game_elements: Rectangle[];
  game_moving_element: Shape | null;
  tick_duration: number;
  key_pressed: boolean;
  last_tick_at: number;
  board: Board;
}

export const ctx = {
  game: null,
  game_elements: [],
  game_moving_element: null,
  game_root: null,
  tick_duration: 500,
  key_pressed: false,
  last_tick_at: Date.now(),
  board: null,
} as unknown as GameContext;
