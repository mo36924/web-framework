import type { VNode } from "preact";
import { renderToString } from "preact-render-to-string";

export const render = (vnode: VNode) => renderToString(vnode);
