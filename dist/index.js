(() => {
  // src/consts.ts
  var CELL_SIZE = 20;
  var WIDTH = 10;
  var HEIGHT = 15;
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
  function create_default_styles(col) {
    return new Styles({
      backgroundColor: "red;",
      height: `${CELL_SIZE}px;`,
      width: `${CELL_SIZE}px;`,
      left: `${typeof col === "number" ? col * CELL_SIZE : Math.floor(Math.random() * WIDTH) * CELL_SIZE}px;`,
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

  // src/rectangle.ts
  var Rectangle = class {
    html;
    styles;
    ceil_distance;
    constructor(params) {
      this.ceil_distance = 0;
      this.styles = create_default_styles(params?.col);
      this.html = document.createElement("div");
      this.html.setAttribute("style", this.styles.to_styles_string());
    }
    descent() {
      let top = this.styles.get_offset_top();
      this.ceil_distance = top + CELL_SIZE;
      this.styles.set_offset_top(top + CELL_SIZE);
      this._update();
    }
    render() {
      ctx.root.appendChild(this.html);
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
    /**
     * Calculates the coordinates based on the offset positions.
     *
     * @returns {number[]} in order: [col, row]
     */
    coordinates() {
      const col = this.styles.get_offset_left() / CELL_SIZE;
      const row = this.styles.get_offset_top() / CELL_SIZE;
      return [col, row];
    }
  };

  // src/clusters.ts
  var Cluster1 = class {
    elements;
    constructor() {
      const init_col = Math.floor(Math.random() * (WIDTH - 2));
      const r1 = new Rectangle({ col: init_col });
      const r2 = new Rectangle({ col: init_col + 1 });
      const r3 = new Rectangle({ col: init_col + 1 });
      const r4 = new Rectangle({ col: init_col + 2 });
      r3.descent();
      r4.descent();
      this.elements = [r1, r2, r3, r4];
      this.check_collisions();
    }
    render() {
      this.elements.forEach((el) => el.render());
    }
    rotate() {
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
      else setTimeout(() => this.check_collisions(), 350);
    }
    bottom_row() {
      return Math.max(...this.elements.map((el) => el.coordinates()[1]));
    }
    check_collisions() {
      if (ctx.game_moving_element === null) return;
      const row = this.bottom_row();
      const coordinates = this.elements.map((e) => e.coordinates());
      const exposed_coordinates = [];
      for (const c of coordinates) {
        const element_below = coordinates.find(
          (e) => e[0] === c[0] && e[1] === c[1] + 1
        );
        if (!element_below) exposed_coordinates.push(c);
      }
      const collision = row == HEIGHT - 1 || exposed_coordinates.map((c) => ctx.board.is_taken(c[0], c[1] + 1)).some((found_colision) => found_colision);
      if (collision) {
        const rows = /* @__PURE__ */ new Set();
        this.elements.forEach((e) => {
          const [col, row2] = e.coordinates();
          rows.add(row2);
          ctx.board.take(col, row2);
        });
        ctx.game.remove_rows(
          Array.from(rows).filter(
            (r) => ctx.board.check_level_completion(r)
          )
        );
        ctx.game_moving_element = null;
        ctx.board.log_baord();
        return;
      }
    }
  };

  // src/game.ts
  var elements = [Cluster1];
  var Game = class {
    spawn_element() {
      const cluster = this.roll_element();
      for (const rect of cluster.elements) {
        ctx.game_elements.push(rect);
      }
      ctx.game_moving_element = cluster;
      cluster.render();
    }
    roll_element() {
      const idx = Math.floor(Math.random() * elements.length);
      return new elements[idx]();
    }
    remove_rows(rows) {
      if (rows.length === 0) return;
      const to_remove = [];
      ctx.game_elements = ctx.game_elements.filter((el) => {
        const [_, r] = el.coordinates();
        const keep = !rows.includes(r);
        if (!keep) to_remove.push(el);
        else {
          for (const row of rows) {
            if (r < row) {
              el.descent();
            }
          }
        }
        return keep;
      });
      for (const el of to_remove) {
        ctx.root.removeChild(el.html);
      }
    }
    update() {
      if (globalThis.running === false) return;
      if (!ctx.game_moving_element) this.spawn_element();
      else ctx.game_moving_element?.descent();
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
          return ctx.game_moving_element?.shift_left();
        }
        case "ArrowRight": {
          return ctx.game_moving_element?.shift_right();
        }
        case "ArrowDown": {
          if (context.key_pressed) return;
          context.tick_duration = 50;
          context.key_pressed = true;
          return;
        }
        case "ArrowUp": {
          return ctx.game_moving_element?.rotate();
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
