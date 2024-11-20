import { ClusterBase, ClusterMethods } from "./cluster_base";
import { WIDTH } from "../consts";
import { Rectangle } from "../rectangle";
import { random_color } from "../utils/invariant";

export class Cluster6 extends ClusterBase implements ClusterMethods {
  constructor(initial_column?: number) {
    super();
    this.rotation_count = 4;
    const init_col = initial_column ?? Math.floor(Math.random() * (WIDTH - 3));
    const color = random_color();
    const r1 = new Rectangle({ col: init_col + 2, color });
    const r2 = new Rectangle({ col: init_col, color });
    const r3 = new Rectangle({ col: init_col + 1, color });
    const r4 = new Rectangle({ col: init_col + 2, color });
    this.elements = [r1, r2, r3, r4];
    r2.descent();
    r3.descent();
    r4.descent();

    this.check_collisions();
  }

  project_rotation(): { coordinates: number[][] | null } {
    const b = this.elements.map((e) => e.coordinates());
    const cs_after: number[][] = [];
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
}
