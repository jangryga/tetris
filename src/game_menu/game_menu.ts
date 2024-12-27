import { CANVAS_HEIGHT, CANVAS_WIDTH } from "../consts";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    div {
      background-color: rgba(50, 50, 50, 0.5);
      position: absolute;
      width: ${CANVAS_WIDTH}px;
      height: ${CANVAS_HEIGHT}px;
      inset: 0;
      color: white;
    }

    ul {
      display: flex;
      flex-direction: column;
      justify-content: space-evenly;
      align-items: center;
      height: 100%;
      width: 100%;
      padding: 0;
      margin: 0;
      list-style-type: none;
    }

    ::slotted(li) {
      cursor: pointer;
    }
  </style>

  <div>
    <ul>
      <slot></slot>
    </ul>
  </div
`;

export class GameMenu extends HTMLElement {
  constructor() {
    super();
    const shadowDOM = this.attachShadow({ mode: "open" });
    shadowDOM.append(template.content.cloneNode(true));
  }

  // todo: attach event listeners for key
  // add selected item - first slot item
  // add styling for the selected item
  // arrow down, arrow up
  connectedCallback() {
    console.log("connected");
  }

  // called on querySelector("").remove() <- todo: add to menu lifecycle methods
  // remove event listeners
  disconnectedCallback() {
    console.log("disconnected");
  }
}
