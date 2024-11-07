(() => {
  // src/consts.ts
  var CELL_SIZE = 20;
  var WIDTH = 10;
  var HEIGHT = 7;
  var CANVAS_WIDTH = CELL_SIZE * WIDTH;
  var CANVAS_HEIGHT = CELL_SIZE * HEIGHT;

  // src/game_context.ts
  var ctx = {
    game: null,
    game_elements: [],
    game_moving_element: null,
    game_root: null,
    tick_duration: 500,
    key_pressed: false,
    last_tick_at: Date.now(),
    board: null
  };

  // src/styles.ts
  function create_default_styles() {
    return new Styles({
      backgroundColor: "red;",
      height: `${CELL_SIZE}px;`,
      width: `${CELL_SIZE}px;`,
      left: `${Math.floor(Math.random() * WIDTH) * CELL_SIZE}px;`,
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
    coordinates() {
      const col = this.styles.get_offset_left() / CELL_SIZE;
      const row = this.styles.get_offset_top() / CELL_SIZE;
      return [col, row];
    }
  };

  // src/game.ts
  var Game = class {
    spawn_element() {
      const el = new GameElement();
      ctx.game_elements.push(el);
      ctx.game_moving_element = el;
      ctx.root.appendChild(el.html);
    }
    check_collisions() {
      if (ctx.game_moving_element === null) return;
      let [col, row] = ctx.game_moving_element.coordinates();
      const boundary = row == HEIGHT - 1 || ctx.board.is_taken(col, row + 1);
      if (boundary) {
        ctx.board.take(col, row);
        ctx.board.check_level_completion(row) && this.remove_row(row);
        ctx.game_moving_element = null;
        ctx.board.log_baord();
        return;
      }
    }
    remove_row(row) {
      const to_remove = [];
      ctx.game_elements = ctx.game_elements.filter((el) => {
        const [_, r] = el.coordinates();
        const keep = r != row;
        if (!keep) to_remove.push(el);
        else if (r < row) {
          el.descent();
        }
        return keep;
      });
      for (const el of to_remove) {
        ctx.root.removeChild(el.html);
      }
    }
    update() {
      if (!ctx.game_moving_element) this.spawn_element();
      else ctx.game_moving_element?.descent();
      this.check_collisions();
    }
  };

  // src/game_board.ts
  var Board = class {
    board = [];
    constructor() {
      for (let i = 0; i < HEIGHT; i++) {
        this.board.push(this.new_level());
      }
    }
    new_level() {
      const level = [];
      for (let j = 0; j < WIDTH; j++) {
        level.push("_");
      }
      return level;
    }
    check_level_completion(idx) {
      if (!this.board[idx].every((v) => v === "X")) return false;
      this.board = [
        this.new_level(),
        ...this.board.slice(0, idx),
        ...this.board.slice(idx + 1)
      ];
      return true;
    }
    take(col, row) {
      this.board[row][col] = "X";
    }
    is_taken(col, row) {
      if (col < 0 || col > WIDTH - 1) return false;
      if (row < 0 || row > HEIGHT - 1) return false;
      return this.board[row][col] === "X";
    }
    log_baord() {
      const str = this.board.map((lvl) => lvl.join(" ")).join("\n");
      console.log(str);
    }
  };

  // src/game_effects.ts
  function registerGameEffects(context) {
    document.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowLeft": {
          if (!ctx.game_moving_element) return;
          const [col, row] = ctx.game_moving_element.coordinates();
          if (ctx.board.is_taken(col - 1, row)) return;
          ctx.game_moving_element?.shift_left();
          ctx.game.check_collisions();
          return;
        }
        case "ArrowRight": {
          if (!ctx.game_moving_element) return;
          const [col, row] = ctx.game_moving_element.coordinates();
          if (ctx.board.is_taken(col + 1, row)) return;
          ctx.game_moving_element?.shift_right();
          ctx.game.check_collisions();
          return;
        }
        case "ArrowDown": {
          if (context.key_pressed) return;
          context.tick_duration = 50;
          context.key_pressed = true;
          return;
        }
        case "ArrowUp": {
          return;
        }
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
    ctx.board = new Board();
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
