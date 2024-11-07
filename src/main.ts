import { Game } from "./game";
import { ctx } from "./game_context";
import { registerGameEffects } from "./game_effects";
import { init_game_styles } from "./styles";
import { invariant } from "./utils/invariant";

export function main() {
  let root = document.getElementById("root")!;

  invariant(root !== undefined, "Root element not found");

  root.setAttribute("style", init_game_styles());

  ctx.root = root;
  ctx.game = new Game();

  registerGameEffects(ctx);

  function game_loop() {
    requestAnimationFrame(game_loop);

    const now = Date.now();
    const shouldTick = now - ctx.last_tick_at > ctx.tick_duration;

    if (!shouldTick) return;
    ctx.last_tick_at = now;
    ctx.game.update();
  }

  game_loop();
}
