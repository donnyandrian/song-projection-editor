import type { ProjectionBackgroundsMap, ProjectionMaster, ProjectionMasterWithId } from "@/types";
import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { useTransitionStore } from "@/stores/transition.store";

type Setter<T> = React.SetStateAction<T>;

type ProjectionBackgrounds = {
    backgrounds: string[];
    maps: ProjectionBackgroundsMap;
};

interface ProjectionState {
    projections: ProjectionMasterWithId[];
    backgrounds: string[];
    maps: ProjectionBackgroundsMap;
}

interface ProjectionActions {
    getProjectionLength: (projectionIndex: number) => number;
    getBackground: (projectionIndex: number, contentIndex: number) => [string, number];
    getContents: (projectionIndex: number) => ProjectionMaster["contents"];
    getIndexById: (id: string) => number;

    setProjections: (projections: Setter<ProjectionMaster[]>) => void;
    setProjectionsWithIds: (projections: Setter<ProjectionMasterWithId[]>) => void;

    addProjection: (projection: ProjectionMaster) => string;
    deleteProjection: (projectionIndex: number) => string | null;
    addContent: (projectionIndex: number, content: ProjectionMaster["contents"][number]) => number;
    deleteContent: (projectionIndex: number, contentIndex: number) => number | null;
}

type ProjectionStore = ProjectionState & ProjectionActions;

const backgroundMiner = (projections: ProjectionMaster[]): ProjectionBackgrounds => {
    const backgrounds: string[] = [];
    const backgroundsMap: ProjectionBackgroundsMap = {};

    for (let i = 0; i < projections.length; i++) {
        const projection = projections[i]!;
        const bg = projection.bg;

        if (!backgrounds.includes(bg)) {
            backgrounds.push(bg);
        }

        const bgIndex = backgrounds.indexOf(bg);
        for (let j = 0; j < projection.contents.length; j++) {
            const content = projection.contents[j]!;
            const contentBg = content.bg;

            if (contentBg && !backgrounds.includes(contentBg)) {
                backgrounds.push(contentBg);
            }

            backgroundsMap[i] ??= {} as ProjectionBackgroundsMap[number];
            backgroundsMap[i]![j] = contentBg ? backgrounds.indexOf(contentBg) : bgIndex;
        }
    }

    return { backgrounds, maps: backgroundsMap };
};

export const generateId = (projection: ProjectionMaster) => {
    return {
        ...projection,
        id: uuidv4(),
    } as ProjectionMasterWithId;
};

const generateIds = (projections: ProjectionMaster[]) => {
    return projections.map<ProjectionMasterWithId>(generateId);
};

export const useProjectionStore = create<ProjectionStore>((set, get) => ({
    backgrounds: [],
    maps: {},
    projections: [],

    getProjectionLength: (projectionIndex: number) =>
        get().projections[projectionIndex]?.contents.length ?? 0,

    getBackground: (projectionIndex: number, contentIndex: number) => {
        const bgIndex = get().maps[projectionIndex]?.[contentIndex] ?? 0;
        return [get().backgrounds[bgIndex] ?? "", bgIndex];
    },

    getContents: (projectionIndex: number) => get().projections[projectionIndex]?.contents ?? [],

    getIndexById: (id: string) => get().projections.findIndex((p) => p.id === id),

    setProjections: (projections) => {
        set((s) => {
            const p = typeof projections === "function" ? projections(s.projections) : projections;

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: generateIds(p),
            };
        });
    },

    setProjectionsWithIds: (projections) => {
        set((s) => {
            const p = typeof projections === "function" ? projections(s.projections) : projections;

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });
    },

    addProjection: (projection) => {
        const id = uuidv4();
        set((s) => {
            const p = [...s.projections, { ...projection, id }];
            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return id;
    },
    deleteProjection: (projectionIndex) => {
        if (projectionIndex > get().projections.length - 1 || projectionIndex < 0) return null;

        let newId: string | null = null;
        set((s) => {
            const p = [...s.projections];
            p.splice(projectionIndex, 1);

            const newIndex = projectionIndex === 0 ? -1 : projectionIndex - 1;
            newId = p.length === 0 ? "" : (p[newIndex]?.id ?? "");

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return newId;
    },
    addContent: (projectionIndex, content) => {
        let last: number = -1;

        set((s) => {
            const p = [...s.projections];
            last = p[projectionIndex]!.contents.push(content) - 1;
            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return last;
    },
    deleteContent: (projectionIndex, contentIndex) => {
        if (projectionIndex > get().projections.length - 1 || projectionIndex < 0) return null;

        let newIndex: number | null = null;
        set((s) => {
            const p = [...s.projections];
            p[projectionIndex].contents.splice(contentIndex, 1);

            if (p[projectionIndex].contents.length === 0 || contentIndex === 0) newIndex = -1;
            else newIndex = contentIndex - 1;

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return newIndex;
    },
}));
