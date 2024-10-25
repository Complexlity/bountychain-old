import { z } from "zod";
import {
  insertBountiesSchema,
  insertSubmissionsSchema,
} from "../../../db/schema";
import { Address } from "viem";

export type CreateBountySchema = z.infer<typeof insertBountiesSchema>;

export type WithSignature<T> = T & { signature: Address; address: Address };
export type CreateBountySubmissionSchema = z.infer<
  typeof insertSubmissionsSchema
>;
