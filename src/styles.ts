import { CANVAS_HEIGHT, CANVAS_WIDTH, CELL_SIZE, WIDTH } from "./consts";

export function create_default_styles(col?: number) {
  return new Styles({
    backgroundColor: "red;",
    height: `${CELL_SIZE}px;`,
    width: `${CELL_SIZE}px;`,
    left: `${
      typeof col === "number"
        ? col * CELL_SIZE
        : Math.floor(Math.random() * WIDTH) * CELL_SIZE
    }px;`,
    margin: null,
    position: "absolute;",
    top: "0px;",
  });
}

export class Styles {
  constructor(
    public params: {
      margin?: string | null;
      position?: string;
      width?: string;
      height?: string;
      left?: string | null;
      top?: string | null;
      backgroundColor?: string;
    }
  ) {}

  get_offset_top(): number {
    return Number.parseInt(this.params.top!.slice(0, -3));
  }

  set_offset_top(top: number) {
    this.params.top = `${top}px;`;
  }

  set_custom_board_position(col: number, row: number) {
    const left_shift = col * CELL_SIZE;
    const top_shift = row * CELL_SIZE;
    this.params.left = `${left_shift}px;`;
    this.params.top = `${top_shift}px;`;
  }

  set_offset_left() {
    this.params.left = `${this.get_offset_left() - CELL_SIZE}px;`;
  }

  set_offset_right() {
    this.params.left = `${this.get_offset_left() + CELL_SIZE}px;`;
  }

  get_offset_left(): number {
    return Number.parseInt(this.params.left!.slice(0, -3));
  }

  to_styles_string() {
    const styles: string[] = [];
    for (let [key, val] of Object.entries(this.params)) {
      if (!val) continue;
      if (key === "backgroundColor") key = "background-color";
      styles.push(`${key}: ${val}`);
    }
    return styles.join(" ");
  }
}

export const init_game_styles = () => {
  const s = new Styles({
    backgroundColor: "black;",
    height: `${CANVAS_HEIGHT}px;`,
    width: `${CANVAS_WIDTH}px;`,
    left: null,
    top: null,
    margin: "auto;",
    position: "relative;",
  });
  return s.to_styles_string();
};
