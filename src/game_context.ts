export const GameContext = {
  tick_duration: 500,
  key_pressed: false,
  last_tick_at: Date.now(),
};

export type GameContext = typeof GameContext;
