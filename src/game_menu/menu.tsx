import { h, createElement } from "../renderer";
import { ctx } from "../game_context";

const menu = createElement(
  <game-menu>
    <li>New game</li>
    <li>Resume</li>
  </game-menu>
);

let isDisplayed = false;

export const menuManager = {
  show: () => {
    if (isDisplayed) return;
    isDisplayed = true;
    ctx.root.appendChild(menu);
  },
  hide: () => {
    if (!isDisplayed) return;
    isDisplayed = false;
    ctx.root.removeChild(menu);
  },
};
