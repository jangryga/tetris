import { CANVAS_HEIGHT, CANVAS_WIDTH, CELL_SIZE } from "./consts";
import { GameElement } from "./game_element";
import { Styles } from "./styles";

export class Game {
  constructor(
    public root: HTMLElement,
    public elements: GameElement[] = [],
    public moving_element: GameElement | null = null
  ) {
    const styles = new Styles({
      backgroundColor: "black;",
      height: `${CANVAS_HEIGHT}px;`,
      width: `${CANVAS_WIDTH}px;`,
      left: null,
      top: null,
      margin: "auto;",
      position: "relative;",
    });
    this.root.setAttribute("style", styles.to_styles_string());
  }

  spawn_element() {
    const el = new GameElement();
    this.elements.push(el);
    this.moving_element = el;
    this.render();
  }

  render() {
    for (const el of this.elements) {
      this.root.appendChild(el.html);
    }
  }

  check_collisions() {
    if (this.moving_element === null) return;

    const cell_left_offset = this.moving_element?.styles.get_offset_left();

    let col_height =
      CANVAS_HEIGHT -
      (this.elements.filter(
        (e) => e.styles.get_offset_left() === cell_left_offset
      ).length -
        1) *
        CELL_SIZE;

    const boundary = Math.min(col_height, CANVAS_HEIGHT) - CELL_SIZE;
    if (this.moving_element?.ceil_distance === boundary) {
      this.moving_element = null;
      return;
    }
  }
}
