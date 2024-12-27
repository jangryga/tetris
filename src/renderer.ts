export function h(tag, props, ...children) {
  return { tag, props, children };
}

export function Fragment({ children }) {
  return children;
}

export function createElement(vnode) {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }

  const element = document.createElement(vnode.tag);

  if (vnode.props) {
    Object.entries(vnode.props).forEach(([key, value]) => {
      if (key === "is") {
        element.setAttribute("is", value);
      } else if (key === "style") {
        element.setAttribute("style", value);
      } else {
        element[key] = value;
      }
    });
  }

  if (vnode.children) {
    vnode.children.flat().forEach((child) => {
      element.appendChild(createElement(child));
    });
  }

  return element;
}
