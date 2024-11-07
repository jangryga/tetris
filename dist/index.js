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
      this.html.setAttribute("style", this.styles.to_styles_string());
    }
  };

  // src/game.ts
  var Game = class {
    constructor(root, elements = [], moving_element = null) {
      this.root = root;
      this.elements = elements;
      this.moving_element = moving_element;
      const styles = new Styles({
        backgroundColor: "black;",
        height: `${CANVAS_HEIGHT}px;`,
        width: `${CANVAS_WIDTH}px;`,
        left: null,
        top: null,
        margin: "auto;",
        position: "relative;"
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
      let col_height = CANVAS_HEIGHT - (this.elements.filter(
        (e) => e.styles.get_offset_left() === cell_left_offset
      ).length - 1) * CELL_SIZE;
      const boundary = Math.min(col_height, CANVAS_HEIGHT) - CELL_SIZE;
      if (this.moving_element?.ceil_distance === boundary) {
        this.moving_element = null;
        return;
      }
    }
  };

  // src/game_context.ts
  var GameContext = {
    tick_duration: 500,
    key_pressed: false,
    last_tick_at: Date.now()
  };

  // src/game_effects.ts
  function registerGameEffects(context) {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "LeftArrow": {
        }
        case "RightArrow": {
        }
        case "ArrowUp": {
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

  // src/utils/invariant.ts
  function invariant(condition, message) {
    if (condition) return;
    throw new Error(`[Assertion Error] ${message}`);
  }

  // src/main.ts
  function main() {
    let root = document.getElementById("root");
    invariant(root !== void 0, "Root element not found");
    const game = new Game(root);
    registerGameEffects(GameContext);
    function game_loop() {
      requestAnimationFrame(game_loop);
      const now = Date.now();
      const shouldTick = now - GameContext.last_tick_at > GameContext.tick_duration;
      if (!shouldTick) return;
      GameContext.last_tick_at = now;
      if (!game.moving_element) game.spawn_element();
      else game.moving_element?.descent();
      game.check_collisions();
    }
    game_loop();
  }

  // index.ts
  main();
})();
