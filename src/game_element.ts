import { CELL_SIZE } from "./consts";
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
    this.html.setAttribute("style", this.styles.to_styles_string());
  }
}
