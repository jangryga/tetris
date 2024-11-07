import { AsyncLocalStorage } from "async_hooks";
import { CANVAS_HEIGHT, CANVAS_WIDTH, CELL_SIZE } from "./consts";
import { create_default_styles, Styles } from "./styles";
import { invariant } from "./utils/invariant";
import { GameContext } from "./game_context";

interface ElementType {
  html: HTMLDivElement;
  styles: Styles;
  ceil_distance: number;
  descent: () => void;
}

class GameElement implements ElementType {
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

class Game {
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

function registerGameEffects(context: GameContext) {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "LeftArrow": {
        // move left
      }
      case "RightArrow": {
        // move right
      }
      case "ArrowUp": {
        // rotate
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown" && !context.key_pressed) {
      console.log("ArrowDown");
      context.tick_duration = 50;
      context.key_pressed = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === "ArrowDown" && context.key_pressed) {
      context.tick_duration = 500;
      context.key_pressed = false;
    }
  });
}

export function main() {
  let root = document.getElementById("root")!;

  invariant(root !== undefined, "Root element not found");

  const game = new Game(root);

  registerGameEffects(GameContext);

  function game_loop() {
    requestAnimationFrame(game_loop);
    const now = Date.now();
    const shouldTick =
      now - GameContext.last_tick_at > GameContext.tick_duration;
    if (!shouldTick) return;
    GameContext.last_tick_at = now;
    if (!game.moving_element) game.spawn_element();
    else game.moving_element?.descent();
    game.check_collisions();
  }

  game_loop();
}
