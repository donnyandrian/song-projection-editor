import { converter, convertReactToJson } from "@/lib/component-converter";
import { AllowedComponentSchemas } from "@/schemas/converter";
import type { BackgroundUnion } from "@/types";
import {
    union,
    string,
    object,
    record,
    number,
    type ZodType,
    literal,
    array,
    codec,
    custom,
    tuple,
} from "zod";

export const TransitionSchema = union([literal("fade"), literal("none")]);

const ProjectionItemBaseSchema = object({
    name: string().optional(),
    group: string().optional(),
    bg: (string() as ZodType<BackgroundUnion>).optional(),
    transition: TransitionSchema.optional(),
});

const ProjectionItemPrimitiveSchema = ProjectionItemBaseSchema.extend({
    type: union([literal("Image"), literal("Video")]),
    content: string(),
});

const ProjectionItemTextSchema = ProjectionItemBaseSchema.extend({
    type: literal("Text"),
    content: string(),
    options: object({
        className: string().optional(),
        style: (
            record(string(), union([string(), number()])) as ZodType<React.CSSProperties>
        ).optional(),
    }).optional(),
});

const ProjectionItemComponentSchema = ProjectionItemBaseSchema.extend({
    type: literal("Component"),
    content: codec(AllowedComponentSchemas(), tuple([custom<React.ReactNode>(), string()]), {
        decode: (json) => [converter(json), JSON.stringify(json)] as [React.ReactNode, string],
        encode: ([node, str]) => {
            const res = JSON.stringify(convertReactToJson(node));
            console.log(res, res === str);
            return convertReactToJson(node);
        },
    }),
});

export const ProjectionItemSchema = union([
    ProjectionItemPrimitiveSchema,
    ProjectionItemTextSchema,
    ProjectionItemComponentSchema,
]);

export const ProjectionLoopQueueSchema = object({
    group: number().optional(),
    item: number().optional(),
});

export const ProjectionMasterSchema = object({
    title: string(),
    bg: string() as ZodType<BackgroundUnion>,
    contents: array(ProjectionItemSchema),
    transition: TransitionSchema.optional(),
    loopQueue: array(ProjectionLoopQueueSchema).optional(),
});
