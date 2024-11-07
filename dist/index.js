(() => {
  // src/consts.ts
  var CELL_SIZE = 20;
  var WIDTH_MULTIPLIER = 10;
  var HEIGHT_MULTIPLIER = 15;
  var CANVAS_WIDTH = CELL_SIZE * WIDTH_MULTIPLIER;
  var CANVAS_HEIGHT = CELL_SIZE * HEIGHT_MULTIPLIER;

  // src/styles.ts
  function create_default_styles() {
    return new Styles({
      backgroundColor: "red;",
      height: `${CELL_SIZE}px;`,
      width: `${CELL_SIZE}px;`,
      left: `${Math.floor(Math.random() * WIDTH_MULTIPLIER) * CELL_SIZE}px;`,
      margin: null,
      position: "absolute;",
      top: "0px;"
    });
  }
  var Styles = class {
    constructor(params) {
      this.params = params;
    }
    get_offset_top() {
      return Number.parseInt(this.params.top.slice(0, -3));
    }
    set_offset_top(top) {
      this.params.top = `${top}px;`;
    }
    set_offset_left() {
      this.params.left = `${this.get_offset_left() - CELL_SIZE}px;`;
    }
    set_offset_right() {
      this.params.left = `${this.get_offset_left() + CELL_SIZE}px;`;
    }
    get_offset_left() {
      return Number.parseInt(this.params.left.slice(0, -3));
    }
    to_styles_string() {
      const styles = [];
      for (let [key, val] of Object.entries(this.params)) {
        if (!val) continue;
        if (key === "backgroundColor") key = "background-color";
        styles.push(`${key}: ${val}`);
      }
      return styles.join(" ");
    }
  };
  var init_game_styles = () => {
    const s = new Styles({
      backgroundColor: "black;",
      height: `${CANVAS_HEIGHT}px;`,
      width: `${CANVAS_WIDTH}px;`,
      left: null,
      top: null,
      margin: "auto;",
      position: "relative;"
    });
    return s.to_styles_string();
  };

  // src/game_element.ts
  var GameElement = class {
    html;
    styles;
    ceil_distance;
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
  };

  // src/game_context.ts
  var ctx = {
    game: null,
    game_elements: [],
    game_moving_element: null,
    game_root: null,
    tick_duration: 500,
    key_pressed: false,
    last_tick_at: Date.now(),
    board_state: []
  };

  // src/game.ts
  var Game = class {
    spawn_element() {
      const el = new GameElement();
      ctx.game_elements.push(el);
      ctx.game_moving_element = el;
      this.render();
    }
    render() {
      for (const el of ctx.game_elements) {
        ctx.root.appendChild(el.html);
      }
    }
    check_collisions() {
      if (ctx.game_moving_element === null) return;
      const cell_left_offset = ctx.game_moving_element?.styles.get_offset_left();
      let col_height = CANVAS_HEIGHT - (ctx.game_elements.filter(
        (e) => e.styles.get_offset_left() === cell_left_offset
      ).length - 1) * CELL_SIZE;
      const boundary = Math.min(col_height, CANVAS_HEIGHT) - CELL_SIZE;
      if (ctx.game_moving_element?.ceil_distance === boundary) {
        ctx.game_moving_element = null;
        return;
      }
    }
    update() {
      if (!ctx.game_moving_element) this.spawn_element();
      else ctx.game_moving_element?.descent();
      this.check_collisions();
    }
  };

  // src/game_effects.ts
  function registerGameEffects(context) {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft": {
          ctx.game_moving_element?.shift_left();
          return;
        }
        case "ArrowRight": {
          ctx.game_moving_element?.shift_right();
          return;
        }
        case "ArrowUp": {
          return;
        }
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && !context.key_pressed) {
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

  // src/utils/invariant.ts
  function invariant(condition, message) {
    if (condition) return;
    throw new Error(`[Assertion Error] ${message}`);
  }

  // src/main.ts
  function main() {
    let root = document.getElementById("root");
    invariant(root !== void 0, "Root element not found");
    root.setAttribute("style", init_game_styles());
    ctx.root = root;
    ctx.game = new Game();
    registerGameEffects(ctx);
    function game_loop() {
      requestAnimationFrame(game_loop);
      const now = Date.now();
      const shouldTick = now - ctx.last_tick_at > ctx.tick_duration;
      if (!shouldTick) return;
      ctx.last_tick_at = now;
      ctx.game.update();
    }
    game_loop();
  }

  // index.ts
  main();
})();
