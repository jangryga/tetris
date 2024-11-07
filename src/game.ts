import { CANVAS_HEIGHT, CELL_SIZE, HEIGHT } from "./consts";
import { GameElement } from "./game_element";
import { ctx } from "./game_context";

export class Game {
  spawn_element() {
    const el = new GameElement();
    ctx.game_elements.push(el);
    ctx.game_moving_element = el;
    ctx.root.appendChild(el.html);
  }

  check_collisions() {
    if (ctx.game_moving_element === null) return;

    let [col, row] = ctx.game_moving_element.coordinates();
    const boundary = row == HEIGHT - 1 || ctx.board.is_taken(col, row + 1);
    if (boundary) {
      ctx.board.take(col, row);
      ctx.board.check_level_completion(row) && this.remove_row(row);

      ctx.game_moving_element = null;
      ctx.board.log_baord();
      return;
    }
  }

  remove_row(row: number) {
    const to_remove: GameElement[] = [];
    ctx.game_elements = ctx.game_elements.filter((el) => {
      const [_, r] = el.coordinates();
      const keep = r != row;
      if (!keep) to_remove.push(el);
      else if (r < row) {
        el.descent();
      }
      return keep;
    });
    for (const el of to_remove) {
      ctx.root.removeChild(el.html);
    }
  }

  update() {
    if (!ctx.game_moving_element) this.spawn_element();
    else ctx.game_moving_element?.descent();
    this.check_collisions();
  }
}
