import { CELL_SIZE, WIDTH_MULTIPLIER } from "./consts";

export function create_default_styles() {
  return new Styles({
    backgroundColor: "red;",
    height: `${CELL_SIZE}px;`,
    width: `${CELL_SIZE}px;`,
    left: `${Math.floor(Math.random() * WIDTH_MULTIPLIER) * CELL_SIZE}px;`,
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
