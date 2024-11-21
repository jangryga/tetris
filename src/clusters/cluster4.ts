import { ClusterBase, ClusterMethods } from "./cluster_base";
import { WIDTH } from "../consts";
import { Rectangle } from "../rectangle";
import { random_color } from "../utils/invariant";

export class Cluster4 extends ClusterBase implements ClusterMethods {
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
}
