import { ProjectionMasterSchema } from "@/schemas/projection";

export const jsonObjectToProjection = (json: unknown) => {
    const p: unknown = typeof json === "string" ? JSON.parse(json) : json;
    const result = ProjectionMasterSchema.safeParse(p);

    if (!result.success) {
        console.error("Invalid JSON or Schema mismatch. Error: ", result.error);
        return null;
    }

    return result.data;
};

export const jsonArrayToProjections = (json: string) => {
    const p: unknown = JSON.parse(json);
    const ps: unknown[] = Array.isArray(p) ? p : [p];

    const results: NonNullable<ReturnType<typeof jsonObjectToProjection>>[] = [];
    for (const _p of ps) {
        const res = jsonObjectToProjection(_p);
        if (res === null) continue;
        results.push(res);
    }

    return results;
};
