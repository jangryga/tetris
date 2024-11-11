import { HEIGHT, WIDTH } from "./consts";
import { ctx } from "./game_context";
import { Rectangle } from "./rectangle";
import { invariant } from "./utils/invariant";

interface ClusterMethods {
  rotation: "1" | "2" | "3";
  rotate: () => void;
  descent: () => void;
  check_collisions: () => void;
  render: () => void;
  shift_left: () => void;
  shift_right: () => void;
}

export class Cluster1 implements ClusterMethods {
  elements: Rectangle[];
  rotation: "1" | "2" = "1";

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

  project_rotation(): { coordinates: number[][] | null } {
    const b = this.elements.map((e) => e.coordinates());
    const cs_after: number[][] = [];
    switch (this.rotation) {
      case "1": {
        cs_after.push([b[0][0] + 2, b[0][1] - 1]);
        cs_after.push([b[1][0], b[1][1]]);
        cs_after.push([b[2][0], b[2][1]]);
        cs_after.push([b[3][0], b[3][1] - 1]);
        break;
      }
      case "2": {
        cs_after.push([b[0][0] - 2, b[0][1] + 1]);
        cs_after.push([b[1][0], b[1][1]]);
        cs_after.push([b[2][0], b[2][1]]);
        cs_after.push([b[3][0], b[3][1] + 1]);
        break;
      }
    }

    function will_collide(coords: number[][]): boolean {
      for (const cs of coords) {
        if (ctx.board.is_taken(cs[0], cs[1])) return true;
      }
      return false;
    }

    function project_shift(coords: number[][], dir: "left" | "right") {
      const c = JSON.parse(JSON.stringify(coords));
      for (let i = 0; i < c.length; i++) {
        if (dir === "left") {
          c[i] = [c[i][0] - 1, c[i][1]];
        } else {
          c[i] = [c[i][0] + 1, c[i][1]];
        }
      }
      return c;
    }

    if (!will_collide(cs_after)) {
      return { coordinates: cs_after };
    }

    const cs_after_left_shifted = project_shift(cs_after, "left");
    if (!will_collide(cs_after_left_shifted)) {
      return { coordinates: cs_after_left_shifted };
    }

    const cs_after_right_shifted = project_shift(cs_after, "right");
    if (!will_collide(cs_after_right_shifted)) {
      return { coordinates: cs_after_right_shifted };
    }

    return { coordinates: null };
  }

  rotate() {
    switch (this.rotation) {
      case "1": {
        const { coordinates: new_coords } = this.project_rotation();
        if (!new_coords) return;
        this.rotation = "2";
        return this._move_coordinates(new_coords);
      }
      case "2": {
        const { coordinates: new_coords } = this.project_rotation();
        if (!new_coords) return;
        this.rotation = "1";
        return this._move_coordinates(new_coords);
      }
    }
  }

  private _move_coordinates(coords: number[][]) {
    invariant(this.elements.length === coords.length, "rotation error");
    for (const [idx, e] of this.elements.entries()) {
      const [col, row] = coords[idx];
      e.move_to_coordinates(col, row);
    }
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

    if (ctx.key_pressed) this.check_collisions();
    else setTimeout(() => this.check_collisions(), 350);
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
