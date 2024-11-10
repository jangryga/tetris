import { type GameContext, ctx } from "./game_context";

export function registerGameEffects(context: GameContext) {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft": {
        return ctx.game_moving_element?.shift_left();
      }
      case "ArrowRight": {
        return ctx.game_moving_element?.shift_right();
      }
      case "ArrowDown": {
        if (context.key_pressed) return;
        context.tick_duration = 50;
        context.key_pressed = true;
        return;
      }
      case "ArrowUp": {
        return ctx.game_moving_element?.rotate();
      }
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowDown" && context.key_pressed) {
      context.tick_duration = 500;
      context.key_pressed = false;
    }
  });
}
