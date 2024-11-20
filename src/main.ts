import { Game } from "./game";
import { Board } from "./game_board";
import { ctx } from "./game_context";
import { registerGameEffects } from "./game_effects";
import { init_game_styles, init_queue_styles } from "./styles";
import { invariant } from "./utils/invariant";

export function main() {
  let root = document.getElementById("root")!;
  invariant(root !== undefined, "Root element not found");

  const queue_panel = document.createElement("div");
  queue_panel.setAttribute("style", init_queue_styles());
  root.appendChild(queue_panel);

  root.setAttribute("style", init_game_styles());

  ctx.root = root;
  ctx.game = new Game();
  ctx.board = new Board();
  ctx.queue_element = queue_panel;

  registerGameEffects(ctx);

  function game_loop() {
    requestAnimationFrame(game_loop);

    const now = Date.now();
    const should_tick = now - ctx.last_tick_at > ctx.tick_duration;

    if (!should_tick) return;
    ctx.last_tick_at = now;
    ctx.game.update();
  }

  game_loop();
}
