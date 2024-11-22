import { Cluster1 } from "./clusters/cluster1";
import { Cluster2 } from "./clusters/cluster2";
import { Cluster3 } from "./clusters/cluster3";
import { Cluster4 } from "./clusters/cluster4";
import { Cluster5 } from "./clusters/cluster5";
import { Cluster6 } from "./clusters/cluster6";
import { QUEUE_SIZE } from "./consts";
import { ctx, Shape } from "./game_context";
import { Rectangle } from "./rectangle";
import { Styles } from "./styles";

const elements = [Cluster1, Cluster2, Cluster3, Cluster4, Cluster5, Cluster6];

export class Game {
  spawn_element() {
    const cluster = this.queue_get_cluster();
    for (const rect of cluster.elements) {
      ctx.game_elements.push(rect);
    }
    ctx.game_moving_element = cluster;
    cluster.check_collisions();
    cluster.force_update();
    cluster.render();
  }

  queue_get_cluster() {
    if (ctx.queue.length !== QUEUE_SIZE) {
      for (let i = 0; i < QUEUE_SIZE; i++) {
        ctx.queue.push(this.roll_element());
      }
      this.queue_render_elements();
      return this.roll_element();
    }
    const cluster = ctx.queue[0];
    ctx.queue = ctx.queue.slice(1);
    ctx.queue.push(this.roll_element());
    this.queue_render_elements();
    return cluster;
  }

  queue_render_elements() {
    for (const child of Array.from(ctx.queue_element?.children)) {
      ctx.queue_element.removeChild(child);
    }

    for (const cluster of ctx.queue) {
      const container = document.createElement("div");
      const styles = new Styles({
        position: "relative;",
        width: "85%;",
        height: "45px;",
        "margin-left": "auto;",
      });
      container.setAttribute("style", styles.to_styles_string());
      cluster.render_to_side_container(container);
      ctx.queue_element.appendChild(container);
    }
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
    const now = Date.now();
    const should_tick = now - ctx.last_tick_at > ctx.tick_duration;
    if (!should_tick) return;
    ctx.last_tick_at = now;
    if (!ctx.game_moving_element) this.spawn_element();
    else ctx.game_moving_element?.descent();
  }
}
