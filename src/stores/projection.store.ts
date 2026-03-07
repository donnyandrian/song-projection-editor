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
    duplicateProjection: (projectionIndex: number) => string | null;
    updateProjection: (
        projectionIndex: number,
        updater: (old: ProjectionMasterWithId) => ProjectionMasterWithId,
    ) => void;
    deleteProjection: (projectionIndex: number) => string | null;

    addContent: (projectionIndex: number, content: ProjectionMaster["contents"][number]) => number;
    duplicateContent: (projectionIndex: number, contentIndex: number) => number | null;
    updateContent: (
        projectionIndex: number,
        contentIndex: number,
        updater: (
            old: ProjectionMaster["contents"][number],
        ) => ProjectionMaster["contents"][number],
    ) => void;
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
    duplicateProjection: (projectionIndex) => {
        if (projectionIndex > get().projections.length - 1 || projectionIndex < 0) return null;

        let newId: string | null = null;
        set((s) => {
            const p = [...s.projections];
            const original = p[projectionIndex];

            const duplicated = {
                ...original,
                id: uuidv4(),
                contents: original.contents.map((c) => ({ ...c })),
            };
            newId = duplicated.id;

            // Insert exactly after the active queue
            p.splice(projectionIndex + 1, 0, duplicated);

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return newId;
    },
    updateProjection: (projectionIndex, updater) => {
        set((s) => {
            const p = [...s.projections];
            const oldProjection = p[projectionIndex];
            if (!oldProjection) return s;

            // Update the projection using the updater callback
            p[projectionIndex] = updater({ ...oldProjection });

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });
    },
    deleteProjection: (projectionIndex) => {
        if (projectionIndex > get().projections.length - 1 || projectionIndex < 0) return null;

        let newId: string | null = null;
        set((s) => {
            const p = [...s.projections];
            p.splice(projectionIndex, 1);

            const newIndex = projectionIndex === 0 ? 0 : projectionIndex - 1;
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

            // Shallow clone projection and contents to prevent mutable references issues
            const newProjection = { ...p[projectionIndex] };
            newProjection.contents = [...newProjection.contents, content];

            p[projectionIndex] = newProjection;
            last = newProjection.contents.length - 1;

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return last;
    },
    duplicateContent: (projectionIndex, contentIndex) => {
        if (projectionIndex > get().projections.length - 1 || projectionIndex < 0) return null;

        let newIndex: number | null = null;
        set((s) => {
            const p = [...s.projections];
            const originalContent = p[projectionIndex].contents[contentIndex];
            if (!originalContent) return s;

            newIndex = contentIndex + 1;

            // Shallow clone projection and contents to prevent mutable references issues
            const newProjection = { ...p[projectionIndex] };
            newProjection.contents = [...newProjection.contents];
            newProjection.contents.splice(newIndex, 0, { ...originalContent });
            p[projectionIndex] = newProjection;

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });

        return newIndex;
    },
    updateContent: (projectionIndex, contentIndex, updater) => {
        set((s) => {
            const p = [...s.projections];
            const oldContent = p[projectionIndex].contents[contentIndex];
            if (!oldContent) return s;

            // Shallow clone projection and contents to prevent mutable references issues
            const newProjection = { ...p[projectionIndex] };
            newProjection.contents = [...newProjection.contents];
            newProjection.contents[contentIndex] = updater(oldContent);

            p[projectionIndex] = newProjection;

            useTransitionStore.getState().syncWithProjections(p);
            return {
                ...backgroundMiner(p),
                projections: p,
            };
        });
    },
    deleteContent: (projectionIndex, contentIndex) => {
        if (projectionIndex > get().projections.length - 1 || projectionIndex < 0) return null;

        let newIndex: number | null = null;
        set((s) => {
            const p = [...s.projections];

            // Shallow clone projection and contents to prevent mutable references issues
            const newProjection = { ...p[projectionIndex] };
            newProjection.contents = [...newProjection.contents];

            newProjection.contents.splice(contentIndex, 1);

            p[projectionIndex] = newProjection;

            if (newProjection.contents.length === 0) newIndex = -1;
            else if (contentIndex === 0) newIndex = 0;
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
