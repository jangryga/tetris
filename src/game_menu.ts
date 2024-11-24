import { CANVAS_HEIGHT, CANVAS_WIDTH } from "./consts";
import { ctx } from "./game_context";
import { Styles } from "./styles";

export class GameMenu {
  state: "open" | "closed";
  select: "resume" | "new_game";
  styles: Styles;
  root: HTMLDivElement;

  constructor() {
    this.root = document.createElement("div");
    this.styles = new Styles({
      backgroundColor: "rgba(50, 50, 50, 0.5);",
      width: `${CANVAS_WIDTH}px;`,
      height: `${CANVAS_HEIGHT}px;`,
      position: "absolute;",
      left: "0;",
      top: "0;",
      display: "none;",
      flexDirection: "column;",
      justifyContent: "space-evenly;",
      alignItems: "center;",
    });
    this.update();

    const new_game = document.createElement("button");
    const new_game_styles = new Styles({
      color: "black;",
      backgroundColor: "inherit;",
      fontSize: "16px;",
      width: "100px;",
      // border: "none;",
      // outline: "none;",
    });
    new_game.setAttribute("style", new_game_styles.to_styles_string());
    new_game.innerText = "New Game";

    const resume = document.createElement("button");
    const resume_styles = new Styles({
      color: "black;",
      backgroundColor: "inherit;",
      fontSize: "16px;",
      width: "100px;",
    });
    resume.setAttribute("style", resume_styles.to_styles_string());
    resume.innerText = "Resume";

    this.root.appendChild(new_game);
    this.root.appendChild(resume);

    ctx.root.appendChild(this.root);
  }

  show() {
    this.styles.params.display = "flex;";
    this.update();
  }

  hide() {
    this.styles.params.display = "hidden;";
  }

  private update() {
    this.root.setAttribute("style", this.styles.to_styles_string());
  }
}
