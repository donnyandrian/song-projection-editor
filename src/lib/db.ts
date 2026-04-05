import Dexie, { type Table } from "dexie";

export interface StoredAsset {
    id: string; // "asset://uuid-filename.ext" — mirrors LocalAsset.id
    name: string; // bare filename, e.g. "uuid-filename.ext"
    type: string; // MIME type, e.g. "image/png"
    data: ArrayBuffer; // raw file bytes
}

class ProjectionEditorDB extends Dexie {
    assets!: Table<StoredAsset, string>;

    constructor() {
        super("xellanix-song-projection-editor");
        this.version(1).stores({
            // Only index the primary key. All other fields are just stored data.
            assets: "id",
        });
    }
}

export const db = new ProjectionEditorDB();
