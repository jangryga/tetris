import { ClusterBase, ClusterMethods } from "./cluster_base";
import { WIDTH } from "../consts";
import { Rectangle } from "../rectangle";

export class Cluster1 extends ClusterBase implements ClusterMethods {
  rotation: "1" | "2" = "1";

  constructor() {
    super();
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

  project_rotation(): { coordinates: number[][] | null } {
    const b = this.elements.map((e) => e.coordinates());
    const cs_after: number[][] = [];
    switch (this.rotation) {
      case "1": {
        cs_after.push([b[0][0] + 2, b[0][1] - 1]);
        cs_after.push([b[1][0], b[1][1]]);
        cs_after.push([b[2][0], b[2][1]]);
        cs_after.push([b[3][0], b[3][1] - 1]);
        break;
      }
      case "2": {
        cs_after.push([b[0][0] - 2, b[0][1] + 1]);
        cs_after.push([b[1][0], b[1][1]]);
        cs_after.push([b[2][0], b[2][1]]);
        cs_after.push([b[3][0], b[3][1] + 1]);
        break;
      }
    }

    return this.morph_projected_coordiantes(cs_after);
  }

  rotate() {
    switch (this.rotation) {
      case "1": {
        const { coordinates: new_coords } = this.project_rotation();
        if (!new_coords) return;
        this.rotation = "2";
        return this._move_coordinates(new_coords);
      }
      case "2": {
        const { coordinates: new_coords } = this.project_rotation();
        if (!new_coords) return;
        this.rotation = "1";
        return this._move_coordinates(new_coords);
      }
    }
  }
}
