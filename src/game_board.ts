import { HEIGHT, WIDTH } from "./consts";

export class Board {
  public board: string[][] = [];
  constructor() {
    for (let i = 0; i < HEIGHT; i++) {
      this.board.push(this.new_level());
    }
  }

  new_level(): string[] {
    const level: string[] = [];
    for (let j = 0; j < WIDTH; j++) {
      level.push("_");
    }
    return level;
  }

  check_level_completion(idx: number): boolean {
    if (!this.board[idx].every((v) => v === "X")) return false;
    this.board = [
      this.new_level(),
      ...this.board.slice(0, idx),
      ...this.board.slice(idx + 1),
    ];
    return true;
  }

  take(col: number, row: number) {
    this.board[row][col] = "X";
  }

  is_taken(col: number, row: number): boolean {
    return this.board[row][col] === "X";
  }

  log_baord() {
    const str = this.board.map((lvl) => lvl.join(" ")).join("\n");
    console.log(str);
  }
}
