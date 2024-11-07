import { type GameContext, ctx } from "./game_context";

export function registerGameEffects(context: GameContext) {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "ArrowLeft": {
        if (!ctx.game_moving_element) return;
        const [col, row] = ctx.game_moving_element!.coordinates();
        if (ctx.board.is_taken(col - 1, row)) return;
        ctx.game_moving_element?.shift_left();
        ctx.game.check_collisions();
        return;
      }
      case "ArrowRight": {
        if (!ctx.game_moving_element) return;
        const [col, row] = ctx.game_moving_element!.coordinates();
        if (ctx.board.is_taken(col + 1, row)) return;
        ctx.game_moving_element?.shift_right();
        ctx.game.check_collisions();
        return;
      }
      case "ArrowDown": {
        if (context.key_pressed) return;
        context.tick_duration = 50;
        context.key_pressed = true;
        return;
      }
      case "ArrowUp": {
        // rotate
        return;
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
