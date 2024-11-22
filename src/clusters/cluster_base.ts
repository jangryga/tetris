import { HEIGHT, WIDTH } from "../consts";
import { ctx } from "../game_context";
import { Rectangle } from "../rectangle";
import { invariant } from "../utils/invariant";

export interface ClusterMethods {
  rotate: () => void;
  descent: () => void;
  check_collisions: () => void;
  render: () => void;
  shift_left: () => void;
  shift_right: () => void;
}

export class ClusterBase {
  elements: Rectangle[];
  rotation_count: number;
  current_rotation = 0;
  init_col: number;

  constructor() {
    this.rotation_count = 4;
  }

  project_rotation(): { coordinates: number[][] | null } {
    return { coordinates: null };
  }

  rotate() {
    const { coordinates: new_coords } = this.project_rotation();
    if (!new_coords) return;
    this.current_rotation =
      this.current_rotation === this.rotation_count - 1
        ? 0
        : this.current_rotation + 1;
    return this._move_coordinates(new_coords);
  }

  render() {
    this.elements.forEach((el) => el.render());
  }

  render_to_side_container(container: HTMLElement) {
    this.elements.forEach((el) =>
      el.render_to_side_container(container, this.init_col)
    );
  }

  force_update() {
    for (const e of this.elements) {
      e._update();
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
    else setTimeout(() => this.check_collisions(), 100);
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
      ctx.game!.remove_rows(
        Array.from(rows).filter((r) =>
          ctx.board.check_level_completion(r as number)
        ) as number[]
      );

      ctx.game_moving_element = null;
      ctx.board.log_baord();
      return;
    }
  }

  private bottom_row(): number {
    return Math.max(...this.elements.map((el) => el.coordinates()[1]));
  }

  private will_collide(coords: number[][]): boolean {
    for (const cs of coords) {
      if (
        cs[0] < 0 ||
        cs[1] < 0 ||
        cs[0] >= WIDTH ||
        ctx.board.is_taken(cs[0], cs[1])
      ) {
        console.log(`ERROR projected collision ${cs}`);
        return true;
      }
    }

    return false;
  }

  private project_shift(coords: number[][], dir: "left" | "right" | "down") {
    const c = JSON.parse(JSON.stringify(coords));
    for (let i = 0; i < c.length; i++) {
      if (dir === "left") {
        c[i] = [c[i][0] - 1, c[i][1]];
      } else if (dir === "right") {
        c[i] = [c[i][0] + 1, c[i][1]];
      } else {
        c[i] = [c[i][0], c[i][1] + 1];
      }
    }
    return c;
  }

  protected morph_projected_coordiantes(coords: number[][]): {
    coordinates: number[][] | null;
  } {
    if (!this.will_collide(coords)) {
      return { coordinates: coords };
    }

    let cs_after_left_shifted = this.project_shift(coords, "left");
    if (!this.will_collide(cs_after_left_shifted)) {
      return { coordinates: cs_after_left_shifted };
    }

    const cs_after_right_shifted = this.project_shift(coords, "right");
    if (!this.will_collide(cs_after_right_shifted)) {
      return { coordinates: cs_after_right_shifted };
    }

    const cs_after_down_shifted = this.project_shift(coords, "down");
    if (
      coords.some((c) => c[1] < 0) &&
      !this.will_collide(cs_after_down_shifted)
    ) {
      return { coordinates: cs_after_down_shifted };
    }

    const cs_after_left_left_shifted = this.project_shift(
      cs_after_left_shifted,
      "left"
    );
    if (
      coords.some((c) => c[0] === WIDTH) &&
      !this.will_collide(cs_after_left_left_shifted)
    ) {
      return { coordinates: cs_after_left_left_shifted };
    }

    return { coordinates: null };
  }

  protected _move_coordinates(coords: number[][]) {
    invariant(
      this.elements.length === coords.length,
      `[rotation error] expected ${this.elements.length} coordinates, received: ${coords.length}`
    );
    for (const [idx, e] of this.elements.entries()) {
      const [col, row] = coords[idx];
      e.move_to_coordinates(col, row);
    }
  }
}
