(() => {
  // src/consts.ts
  var CELL_SIZE = 20;
  var WIDTH = 10;
  var HEIGHT = 15;
  var CANVAS_WIDTH = CELL_SIZE * WIDTH;
  var CANVAS_HEIGHT = CELL_SIZE * HEIGHT;
  var COLORS = ["red", "blue", "green", "yellow", "orange"];
  var QUEUE_SIZE = 5;

  // src/game_context.ts
  var ctx = {
    game: null,
    game_elements: [],
    game_moving_element: null,
    game_root: null,
    tick_duration: 500,
    key_pressed: false,
    last_tick_at: Date.now(),
    board: null,
    queue: []
  };

  // src/utils/invariant.ts
  function invariant(condition, message) {
    if (condition) return;
    throw new Error(`[Assertion Error] ${message}`);
  }
  function random_color() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  // src/clusters/cluster_base.ts
  var ClusterBase = class {
    elements;
    rotation_count;
    current_rotation = 0;
    init_col;
    constructor() {
      this.rotation_count = 4;
    }
    project_rotation() {
      return { coordinates: null };
    }
    rotate() {
      const { coordinates: new_coords } = this.project_rotation();
      if (!new_coords) return;
      this.current_rotation = this.current_rotation === this.rotation_count - 1 ? 0 : this.current_rotation + 1;
      return this._move_coordinates(new_coords);
    }
    render() {
      this.elements.forEach((el) => el.render());
    }
    render_to_side_container(container) {
      this.elements.forEach(
        (el) => el.render_to_side_container(container, this.init_col)
      );
    }
    force_update() {
      for (const e of this.elements) {
        e._update();
      }
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
      else setTimeout(() => this.check_collisions(), 100);
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
    bottom_row() {
      return Math.max(...this.elements.map((el) => el.coordinates()[1]));
    }
    will_collide(coords) {
      for (const cs of coords) {
        if (cs[0] < 0 || cs[1] < 0 || ctx.board.is_taken(cs[0], cs[1]))
          return true;
      }
      return false;
    }
    project_shift(coords, dir) {
      const c = JSON.parse(JSON.stringify(coords));
      for (let i = 0; i < c.length; i++) {
        if (dir === "left") {
          c[i] = [c[i][0] - 1, c[i][1]];
        } else if (dir === "right") {
          c[i] = [c[i][0] + 1, c[i][1]];
        } else {
          c[i] = [c[i][0], c[i][1] + 1];
        }
      }
      return c;
    }
    morph_projected_coordiantes(coords) {
      if (!this.will_collide(coords)) {
        return { coordinates: coords };
      }
      const cs_after_left_shifted = this.project_shift(coords, "left");
      if (!this.will_collide(cs_after_left_shifted)) {
        return { coordinates: cs_after_left_shifted };
      }
      const cs_after_right_shifted = this.project_shift(coords, "right");
      if (!this.will_collide(cs_after_right_shifted)) {
        return { coordinates: cs_after_right_shifted };
      }
      const cs_after_down_shifted = this.project_shift(coords, "down");
      if (coords.some((c) => c[1] < 0) && !this.will_collide(cs_after_down_shifted)) {
        return { coordinates: cs_after_down_shifted };
      }
      return { coordinates: null };
    }
    _move_coordinates(coords) {
      invariant(
        this.elements.length === coords.length,
        `[rotation error] expected ${this.elements.length} coordinates, received: ${coords.length}`
      );
      for (const [idx, e] of this.elements.entries()) {
        const [col, row] = coords[idx];
        e.move_to_coordinates(col, row);
      }
    }
  };

  // src/styles.ts
  function create_default_styles(col, color) {
    return new Styles({
      backgroundColor: `${color};`,
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
    set_custom_board_position(col, row) {
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
    get_offset_left() {
      return Number.parseInt(this.params.left.slice(0, -3));
    }
    to_styles_string(custom_styles) {
      const styles = [];
      for (let [key, val] of Object.entries(custom_styles ?? this.params)) {
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
  var init_queue_styles = () => {
    const s = new Styles({
      backgroundColor: "black;",
      height: `${CANVAS_HEIGHT}px;`,
      width: "100px;",
      left: `${CANVAS_WIDTH}px;`,
      top: null,
      margin: null,
      position: "relative;",
      "border-left": "yellow 1px solid;",
      display: "flex;",
      "flex-direction": "column;",
      "justify-content": "space-between;",
      padding: "0px;"
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
      this.styles = create_default_styles(params?.col, params?.color);
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
    render_to_side_container(container, col_shift) {
      let styles = JSON.parse(JSON.stringify(this.styles));
      let left = this.styles.get_offset_left() - col_shift * CELL_SIZE;
      styles.params.left = `${left}px;`;
      this._update(this.styles.to_styles_string(styles.params));
      container.appendChild(this.html);
    }
    move_to_coordinates(col, row) {
      this.styles.set_custom_board_position(col, row);
      this._update();
    }
    _update(styles) {
      this.html.setAttribute("style", styles ?? this.styles.to_styles_string());
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

  // src/clusters/cluster1.ts
  var Cluster1 = class extends ClusterBase {
    constructor() {
      super();
      this.rotation_count = 2;
      const init_col = Math.floor(Math.random() * (WIDTH - 2));
      const color = random_color();
      const r1 = new Rectangle({ col: init_col, color });
      const r2 = new Rectangle({ col: init_col + 1, color });
      const r3 = new Rectangle({ col: init_col + 1, color });
      const r4 = new Rectangle({ col: init_col + 2, color });
      r3.descent();
      r4.descent();
      this.elements = [r1, r2, r3, r4];
      this.init_col = init_col;
      this.check_collisions();
    }
    project_rotation() {
      const b = this.elements.map((e) => e.coordinates());
      const cs_after = [];
      switch (this.current_rotation) {
        case 0: {
          cs_after.push([b[0][0] + 2, b[0][1] - 1]);
          cs_after.push([b[1][0], b[1][1]]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0], b[3][1] - 1]);
          break;
        }
        case 1: {
          cs_after.push([b[0][0] - 2, b[0][1] + 1]);
          cs_after.push([b[1][0], b[1][1]]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0], b[3][1] + 1]);
          break;
        }
      }
      return this.morph_projected_coordiantes(cs_after);
    }
  };

  // src/clusters/cluster2.ts
  var Cluster2 = class extends ClusterBase {
    constructor() {
      super();
      this.rotation_count = 4;
      const init_col = Math.floor(Math.random() * (WIDTH - 2));
      const color = random_color();
      const r1 = new Rectangle({ col: init_col, color });
      const r2 = new Rectangle({ col: init_col + 1, color });
      const r3 = new Rectangle({ col: init_col + 1, color });
      const r4 = new Rectangle({ col: init_col + 2, color });
      r1.descent();
      r3.descent();
      r4.descent();
      this.elements = [r1, r2, r3, r4];
      this.init_col = init_col;
      this.check_collisions();
    }
    project_rotation() {
      const b = this.elements.map((e) => e.coordinates());
      const cs_after = [];
      switch (this.current_rotation) {
        case 0: {
          cs_after.push([b[0][0] + 1, b[0][1] + 1]);
          cs_after.push([b[1][0], b[1][1]]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0], b[3][1]]);
          break;
        }
        case 1: {
          cs_after.push([b[0][0], b[0][1]]);
          cs_after.push([b[1][0] - 1, b[1][1] + 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0], b[3][1]]);
          break;
        }
        case 2: {
          cs_after.push([b[0][0], b[0][1]]);
          cs_after.push([b[1][0], b[1][1]]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] - 1, b[3][1] - 1]);
          break;
        }
        case 3: {
          cs_after.push([b[0][0] - 1, b[0][1] - 1]);
          cs_after.push([b[1][0] + 1, b[1][1] - 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] + 1, b[3][1] + 1]);
          break;
        }
      }
      return this.morph_projected_coordiantes(cs_after);
    }
  };

  // src/clusters/cluster3.ts
  var Cluster3 = class extends ClusterBase {
    constructor() {
      super();
      this.rotation_count = 4;
      const init_col = Math.floor(Math.random() * (WIDTH - 3));
      const color = random_color();
      const r1 = new Rectangle({ col: init_col, color });
      const r2 = new Rectangle({ col: init_col + 1, color });
      const r3 = new Rectangle({ col: init_col + 2, color });
      const r4 = new Rectangle({ col: init_col + 3, color });
      this.elements = [r1, r2, r3, r4];
      r1.descent();
      r2.descent();
      r3.descent();
      r4.descent();
      this.init_col = init_col;
      this.check_collisions();
    }
    project_rotation() {
      const b = this.elements.map((e) => e.coordinates());
      const cs_after = [];
      switch (this.current_rotation) {
        case 0: {
          cs_after.push([b[0][0] + 1, b[0][1] - 1]);
          cs_after.push([b[1][0], b[1][1]]);
          cs_after.push([b[2][0] - 1, b[2][1] + 1]);
          cs_after.push([b[3][0] - 2, b[3][1] + 2]);
          break;
        }
        case 1: {
          cs_after.push([b[0][0] - 1, b[0][1] + 1]);
          cs_after.push([b[1][0], b[1][1]]);
          cs_after.push([b[2][0] + 1, b[2][1] - 1]);
          cs_after.push([b[3][0] + 2, b[3][1] - 2]);
          break;
        }
        case 2: {
          cs_after.push([b[0][0] + 2, b[0][1] - 1]);
          cs_after.push([b[1][0] + 1, b[1][1]]);
          cs_after.push([b[2][0], b[2][1] + 1]);
          cs_after.push([b[3][0] - 1, b[3][1] + 2]);
          break;
        }
        case 3: {
          cs_after.push([b[0][0] - 2, b[0][1] + 1]);
          cs_after.push([b[1][0] - 1, b[1][1]]);
          cs_after.push([b[2][0], b[2][1] - 1]);
          cs_after.push([b[3][0] + 1, b[3][1] - 2]);
          break;
        }
      }
      return this.morph_projected_coordiantes(cs_after);
    }
  };

  // src/clusters/cluster4.ts
  var Cluster4 = class extends ClusterBase {
    constructor() {
      super();
      this.rotation_count = 1;
      const init_col = Math.floor(Math.random() * (WIDTH - 3));
      const color = random_color();
      const r1 = new Rectangle({ col: init_col, color });
      const r2 = new Rectangle({ col: init_col + 1, color });
      const r3 = new Rectangle({ col: init_col, color });
      const r4 = new Rectangle({ col: init_col + 1, color });
      this.elements = [r1, r2, r3, r4];
      r3.descent();
      r4.descent();
      this.init_col = init_col;
      this.check_collisions();
    }
  };

  // src/clusters/cluster5.ts
  var Cluster5 = class extends ClusterBase {
    constructor() {
      super();
      this.rotation_count = 4;
      const init_col = Math.floor(Math.random() * (WIDTH - 3));
      const color = random_color();
      const r1 = new Rectangle({ col: init_col, color });
      const r2 = new Rectangle({ col: init_col, color });
      const r3 = new Rectangle({ col: init_col + 1, color });
      const r4 = new Rectangle({ col: init_col + 2, color });
      this.elements = [r1, r2, r3, r4];
      r2.descent();
      r3.descent();
      r4.descent();
      this.init_col = init_col;
      this.check_collisions();
    }
    project_rotation() {
      const b = this.elements.map((e) => e.coordinates());
      const cs_after = [];
      switch (this.current_rotation) {
        case 0: {
          cs_after.push([b[0][0] + 2, b[0][1]]);
          cs_after.push([b[1][0] + 1, b[1][1] - 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] - 1, b[3][1] + 1]);
          break;
        }
        case 1: {
          cs_after.push([b[0][0], b[0][1] + 2]);
          cs_after.push([b[1][0] + 1, b[1][1] + 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] - 1, b[3][1] - 1]);
          break;
        }
        case 2: {
          cs_after.push([b[0][0] - 2, b[0][1]]);
          cs_after.push([b[1][0] - 1, b[1][1] + 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] + 1, b[3][1] - 1]);
          break;
        }
        case 3: {
          cs_after.push([b[0][0], b[0][1] - 2]);
          cs_after.push([b[1][0] - 1, b[1][1] - 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] + 1, b[3][1] + 1]);
          break;
        }
      }
      return this.morph_projected_coordiantes(cs_after);
    }
  };

  // src/clusters/cluster6.ts
  var Cluster6 = class extends ClusterBase {
    constructor() {
      super();
      this.rotation_count = 4;
      const init_col = Math.floor(Math.random() * (WIDTH - 3));
      const color = random_color();
      const r1 = new Rectangle({ col: init_col + 2, color });
      const r2 = new Rectangle({ col: init_col, color });
      const r3 = new Rectangle({ col: init_col + 1, color });
      const r4 = new Rectangle({ col: init_col + 2, color });
      this.elements = [r1, r2, r3, r4];
      r2.descent();
      r3.descent();
      r4.descent();
      this.init_col = init_col;
      this.check_collisions();
    }
    project_rotation() {
      const b = this.elements.map((e) => e.coordinates());
      const cs_after = [];
      switch (this.current_rotation) {
        case 0: {
          cs_after.push([b[0][0], b[0][1] + 2]);
          cs_after.push([b[1][0] + 1, b[1][1] - 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] - 1, b[3][1] + 1]);
          break;
        }
        case 1: {
          cs_after.push([b[0][0] - 2, b[0][1]]);
          cs_after.push([b[1][0] + 1, b[1][1] + 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] - 1, b[3][1] - 1]);
          break;
        }
        case 2: {
          cs_after.push([b[0][0], b[0][1] - 2]);
          cs_after.push([b[1][0] - 1, b[1][1] + 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] + 1, b[3][1] - 1]);
          break;
        }
        case 3: {
          cs_after.push([b[0][0] + 2, b[0][1]]);
          cs_after.push([b[1][0] - 1, b[1][1] - 1]);
          cs_after.push([b[2][0], b[2][1]]);
          cs_after.push([b[3][0] + 1, b[3][1] + 1]);
          break;
        }
      }
      return this.morph_projected_coordiantes(cs_after);
    }
  };

  // src/game.ts
  var elements = [Cluster1, Cluster2, Cluster3, Cluster4, Cluster5, Cluster6];
  var Game = class {
    spawn_element() {
      const cluster = this.queue_get_cluster();
      for (const rect of cluster.elements) {
        ctx.game_elements.push(rect);
      }
      ctx.game_moving_element = cluster;
      cluster.check_collisions();
      cluster.force_update();
      cluster.render();
    }
    queue_get_cluster() {
      if (ctx.queue.length !== QUEUE_SIZE) {
        for (let i = 0; i < QUEUE_SIZE; i++) {
          ctx.queue.push(this.roll_element());
        }
        this.queue_render_elements();
        return this.roll_element();
      }
      const cluster = ctx.queue[0];
      ctx.queue = ctx.queue.slice(1);
      ctx.queue.push(this.roll_element());
      this.queue_render_elements();
      return cluster;
    }
    queue_render_elements() {
      for (const child of Array.from(ctx.queue_element?.children)) {
        ctx.queue_element.removeChild(child);
      }
      for (const cluster of ctx.queue) {
        const container = document.createElement("div");
        const styles = new Styles({
          position: "relative;",
          width: "85%;",
          height: "45px;",
          "margin-left": "auto;"
        });
        container.setAttribute("style", styles.to_styles_string());
        cluster.render_to_side_container(container);
        ctx.queue_element.appendChild(container);
      }
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

  // src/main.ts
  function main() {
    let root = document.getElementById("root");
    invariant(root !== void 0, "Root element not found");
    const queue_panel = document.createElement("div");
    queue_panel.setAttribute("style", init_queue_styles());
    root.appendChild(queue_panel);
    root.setAttribute("style", init_game_styles());
    ctx.root = root;
    ctx.game = new Game();
    ctx.board = new Board();
    ctx.queue_element = queue_panel;
    registerGameEffects(ctx);
    function game_loop() {
      requestAnimationFrame(game_loop);
      const now = Date.now();
      const should_tick = now - ctx.last_tick_at > ctx.tick_duration;
      if (!should_tick) return;
      ctx.last_tick_at = now;
      ctx.game.update();
    }
    game_loop();
  }

  // index.ts
  main();
})();
