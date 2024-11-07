import { CANVAS_WIDTH, CELL_SIZE } from "./consts";
import { create_default_styles, Styles } from "./styles";

interface ElementType {
  html: HTMLDivElement;
  styles: Styles;
  ceil_distance: number;
  descent: () => void;
}

export class GameElement implements ElementType {
  html: HTMLDivElement;
  styles: Styles;
  ceil_distance: number;

  constructor() {
    this.ceil_distance = 0;
    this.styles = create_default_styles();
    this.html = document.createElement("div");

    this.html.setAttribute("style", this.styles.to_styles_string());
  }

  descent() {
    let top = this.styles.get_offset_top();
    this.ceil_distance = top + CELL_SIZE;
    this.styles.set_offset_top(top + CELL_SIZE);
    this._update();
  }

  _update() {
    this.html.setAttribute("style", this.styles.to_styles_string());
  }

  shift_left() {
    if (this.styles.get_offset_left() <= 0) return;
    this.styles.set_offset_left();
    this._update();
  }

  shift_right() {
    if (this.styles.get_offset_left() >= CANVAS_WIDTH - CELL_SIZE) return;
    this.styles.set_offset_right();
    this._update();
  }

  coordinates() {
    const col = this.styles.get_offset_left() / CELL_SIZE;
    const row = this.styles.get_offset_top() / CELL_SIZE;
    return [col, row];
  }
}
