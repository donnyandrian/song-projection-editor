import type { ProjectionItem } from "@/types";

type HandleUpdate = (updater: (old: ProjectionItem) => ProjectionItem) => void;
type InputChanged = (e: React.ChangeEvent<HTMLInputElement, HTMLInputElement>) => void;

export type { HandleUpdate, InputChanged };
