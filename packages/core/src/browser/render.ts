import { hydrate, VNode } from "preact";
import { rootId } from "../env";
import { getElementById } from "./getElementById";

export const render = (vnode: VNode) => hydrate(vnode, getElementById(rootId));
