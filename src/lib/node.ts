import type { ProjectionItem } from "@/types";
import type { NodeType } from "@/types/node";
import {
    BackgroundIcon,
    Image03Icon,
    TextIcon,
    FunctionIcon,
    Video02Icon,
} from "@hugeicons-pro/core-stroke-rounded";

export function typeNodeToColor(type: NodeType) {
    switch (type) {
        case "text":
            return "bg-amber-200 text-amber-700 border-amber-700/50 inset-ring-amber-700/50";
        case "image":
            return "bg-green-200 text-green-700 border-green-700/50 inset-ring-green-700/50";
        case "video":
            return "bg-cyan-200 text-cyan-700 border-cyan-700/50 inset-ring-cyan-700/50";
        case "transition":
            return "bg-violet-200 text-violet-700 border-violet-700/50 inset-ring-violet-700/50";
        case "background":
        default:
            return "bg-slate-200 text-slate-700 border-slate-700/50 inset-ring-slate-700/50";
    }
}

export function typeNodeToIcon(type: NodeType) {
    switch (type) {
        case "text":
            return TextIcon;
        case "image":
            return Image03Icon;
        case "video":
            return Video02Icon;
        case "transition":
            return FunctionIcon;
        case "background":
        default:
            return BackgroundIcon;
    }
}

export function projectionToNode(source: ProjectionItem["type"]): NodeType {
    switch (source) {
        case "Text":
            return "text";
        case "Image":
            return "image";
        case "Video":
            return "video";
        // This should be changed to its own type
        // // @ts-expect-error
        case "Component":
        default:
            return "background";
    }
}
