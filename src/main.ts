import { Game } from "./game";
import { GameContext } from "./game_context";
import { registerGameEffects } from "./game_effects";
import { invariant } from "./utils/invariant";

export function main() {
  let root = document.getElementById("root")!;

  invariant(root !== undefined, "Root element not found");

  const game = new Game(root);

  registerGameEffects(GameContext);

  function game_loop() {
    requestAnimationFrame(game_loop);
    const now = Date.now();
    const shouldTick =
      now - GameContext.last_tick_at > GameContext.tick_duration;
    if (!shouldTick) return;
    GameContext.last_tick_at = now;
    if (!game.moving_element) game.spawn_element();
    else game.moving_element?.descent();
    game.check_collisions();
  }

  game_loop();
}
