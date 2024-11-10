import { HEIGHT, WIDTH } from "./consts";
import { ctx } from "./game_context";
import { Rectangle } from "./rectangle";

interface ClusterMethods {
  rotate: () => void;
  descent: () => void;
  check_collisions: () => void;
  render: () => void;
  shift_left: () => void;
  shift_right: () => void;
}

export class Cluster1 implements ClusterMethods {
  elements: Rectangle[];

  constructor() {
    const init_col = Math.floor(Math.random() * (WIDTH - 2));
    const r1 = new Rectangle({ col: init_col });
    const r2 = new Rectangle({ col: init_col + 1 });
    const r3 = new Rectangle({ col: init_col + 1 });
    const r4 = new Rectangle({ col: init_col + 2 });
    r3.descent();
    r4.descent();
    this.elements = [r1, r2, r3, r4];

    this.check_collisions();
  }

  render() {
    this.elements.forEach((el) => el.render());
  }

  rotate() {
    // todo
  }

  shift_left() {
    let canShift = true;

    for (const e of this.elements) {
      const [col, row] = e.coordinates();
      if (col === 0 || ctx.board.is_taken(col - 1, row)) canShift = false;
    }

    if (!canShift) return;

    for (const e of this.elements) {
      e.shift_left();
    }
  }

  shift_right() {
    let canShift = true;

    for (const e of this.elements) {
      const [col, row] = e.coordinates();
      if (col === WIDTH - 1 || ctx.board.is_taken(col + 1, row))
        canShift = false;
    }

    if (!canShift) return;

    for (const e of this.elements) {
      e.shift_right();
    }
  }

  descent() {
    for (const e of this.elements) {
      e.descent();
    }

    setTimeout(() => this.check_collisions(), 50);
  }

  private bottom_row(): number {
    return Math.max(...this.elements.map((el) => el.coordinates()[1]));
  }

  check_collisions() {
    if (ctx.game_moving_element === null) return;

    const row = this.bottom_row();

    const coordinates: number[][] = this.elements.map((e) => e.coordinates());
    const exposed_coordinates: number[][] = [];
    for (const c of coordinates) {
      const element_below = coordinates.find(
        (e) => e[0] === c[0] && e[1] === c[1] + 1
      );
      if (!element_below) exposed_coordinates.push(c);
    }

    const collision =
      row == HEIGHT - 1 ||
      exposed_coordinates
        .map((c) => ctx.board.is_taken(c[0], c[1] + 1))
        .some((found_colision) => found_colision);
    if (collision) {
      const rows = new Set();
      this.elements.forEach((e) => {
        const [col, row] = e.coordinates();
        rows.add(row);
        ctx.board.take(col, row);
      });
      ctx.game.remove_rows(
        Array.from(rows).filter((r) =>
          ctx.board.check_level_completion(r as number)
        ) as number[]
      );

      ctx.game_moving_element = null;
      ctx.board.log_baord();
      return;
    }
  }
}