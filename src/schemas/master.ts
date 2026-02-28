import { ProjectionMasterSchema } from "@/schemas/projection";
import { array, union } from "zod";

// Allowed import shapes (array of projections or a single one)
export const ImportSchema = union([array(ProjectionMasterSchema), ProjectionMasterSchema]);
