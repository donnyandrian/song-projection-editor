import type { ProjectionMaster, ProjectionTransition } from "@/types";
import type { NodeType } from "@/types/node";
import { projectionToNode } from "@/lib/node";
import { createItemName } from "@/lib/projection";

function pTransitionToMaster(t?: ProjectionTransition) {
    switch (t) {
        case "fade":
            return "Fade";
        case "none":
        default:
            return "None";
    }
}

export function pToMaster(p: ProjectionMaster) {
    const contents: { type: NodeType; label: string }[] = [];
    const backgrounds: string[] = [];
    const transitions: string[] = [];

    if (!p) return { contents, backgrounds, transitions };

    for (const c of p.contents) {
        contents.push({ type: projectionToNode(c.type), label: createItemName(c) });
        backgrounds.push(c.bg ?? p.bg);
        transitions.push(pTransitionToMaster(c.transition ?? p.transition));
    }
    return { contents, backgrounds, transitions };
}
