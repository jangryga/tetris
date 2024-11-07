import { HEIGHT, WIDTH } from "./consts";

export class Board {
  public board: string[][] = [];
  constructor() {
    for (let i = 0; i < HEIGHT; i++) {
      const level: string[] = [];
      for (let j = 0; j < WIDTH; j++) {
        level.push("_");
      }
      this.board.push(level);
    }
  }

  log_baord() {
    const str = this.board.map((lvl) => lvl.join(" ")).join("\n");
    console.log(str);
  }
}
