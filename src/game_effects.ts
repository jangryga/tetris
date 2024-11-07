import { type GameContext, ctx } from "./game_context";

export function registerGameEffects(context: GameContext) {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft": {
        ctx.game_moving_element?.shift_left();
        return;
      }
      case "ArrowRight": {
        ctx.game_moving_element?.shift_right();
        return;
      }
      case "ArrowUp": {
        // rotate
        return;
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && !context.key_pressed) {
      context.tick_duration = 50;
      context.key_pressed = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowDown" && context.key_pressed) {
      context.tick_duration = 500;
      context.key_pressed = false;
    }
  });
}
