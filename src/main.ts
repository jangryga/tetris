import { Game } from "./game";
import { Board } from "./game_board";
import { ctx } from "./game_context";
import { registerGameEffects } from "./game_effects";
import { GameMenu } from "./game_menu/game_menu";
import { menuManager } from "./game_menu/menu";
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

  customElements.define("game-menu", GameMenu);

  registerGameEffects(ctx);

  function game_loop() {
    requestAnimationFrame(game_loop);

    switch (ctx.game_stage) {
      case "running": {
        return ctx.game!.update();
      }
      case "not_started":
        return menuManager.show();
      // return console.log(createMenu());
    }
  }

  game_loop();
}
