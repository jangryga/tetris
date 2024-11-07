import { GameContext } from "./game_context";

export function registerGameEffects(context: GameContext) {
  document.addEventListener("keydown", (e) => {
    switch (e.key) {
      case "LeftArrow": {
        // move left
      }
      case "RightArrow": {
        // move right
      }
      case "ArrowUp": {
        // rotate
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
