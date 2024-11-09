import { Cluster1 } from "./clusters";
import { ctx, Shape } from "./game_context";

const elements = [Cluster1];

export class Game {
  spawn_element() {
    const el = this.roll_element();
    ctx.game_elements.push(el);
    ctx.game_moving_element = el;
    el.render();
  }

  roll_element(): Shape {
    const idx = Math.floor(Math.random() * elements.length);
    return new elements[idx]();
  }

  remove_row(row: number) {
    const to_remove: Shape[] = [];
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
  }
}
