import { array, object, string } from "zod";

export const StyleClipboardSchema = array(
    object({
        property: string(),
        value: string(),
    }),
);
