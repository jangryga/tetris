import { CANVAS_HEIGHT, CANVAS_WIDTH, CELL_SIZE } from "./consts";
import { GameElement } from "./game_element";
import { ctx } from "./game_context";

export class Game {
  spawn_element() {
    const el = new GameElement();
    ctx.game_elements.push(el);
    ctx.game_moving_element = el;
    this.render();
  }

  render() {
    for (const el of ctx.game_elements) {
      ctx.root.appendChild(el.html);
    }
  }

  check_collisions() {
    if (ctx.game_moving_element === null) return;

    const cell_left_offset = ctx.game_moving_element?.styles.get_offset_left();

    let col_height =
      CANVAS_HEIGHT -
      (ctx.game_elements.filter(
        (e) => e.styles.get_offset_left() === cell_left_offset
      ).length -
        1) *
        CELL_SIZE;

    const boundary = Math.min(col_height, CANVAS_HEIGHT) - CELL_SIZE;
    if (ctx.game_moving_element?.ceil_distance === boundary) {
      ctx.game_moving_element = null;
      ctx.board.log_baord();
      return;
    }
  }

  update() {
    if (!ctx.game_moving_element) this.spawn_element();
    else ctx.game_moving_element?.descent();
    this.check_collisions();
  }
}
