import { Cluster1 } from "./clusters/cluster1";
import { Cluster2 } from "./clusters/cluster2";
import { Cluster3 } from "./clusters/cluster3";
import { ctx, Shape } from "./game_context";
import { Rectangle } from "./rectangle";

const elements = [Cluster1, Cluster2, Cluster3];

export class Game {
  spawn_element() {
    const cluster = this.roll_element();
    for (const rect of cluster.elements) {
      ctx.game_elements.push(rect);
    }
    ctx.game_moving_element = cluster;
    cluster.render();
  }

  roll_element(): Shape {
    const idx = Math.floor(Math.random() * elements.length);
    return new elements[idx]();
  }

  remove_rows(rows: number[]) {
    if (rows.length === 0) return;
    const to_remove: Rectangle[] = [];

    ctx.game_elements = ctx.game_elements.filter((el) => {
      const [_, r] = el.coordinates();
      const keep = !rows.includes(r);
      if (!keep) to_remove.push(el);
      else {
        for (const row of rows) {
          if (r < row) {
            el.descent();
          }
        }
      }
      return keep;
    });
    for (const el of to_remove) {
      ctx.root.removeChild(el.html);
    }
  }

  update() {
    if (globalThis.running === false) return;
    if (!ctx.game_moving_element) this.spawn_element();
    else ctx.game_moving_element?.descent();
  }
}
