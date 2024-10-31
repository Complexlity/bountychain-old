import { z } from "zod";
import { SupportedChainKey, supportedChains } from "./viem";

const clientEnvSchema = z
  .object({
    NODE_ENV: z.string().default("development"),
    NEXT_PUBLIC_BACKUP_SERVER: z.string().url().optional(),
    NEXT_PUBLIC_ACTIVE_CHAIN: z
    .string()
    .default("arbitrumSepolia")
    .refine((val): val is SupportedChainKey => val in supportedChains, {
      message:
        "ACTIVE_CHAIN must be one of the supported chains: " +
        Object.keys(supportedChains).join(", "),
    }),
  })
  .superRefine((input, ctx) => {
    if (input.NODE_ENV === "development" && !input.NEXT_PUBLIC_BACKUP_SERVER) {
      input.NEXT_PUBLIC_BACKUP_SERVER = "http://localhost:3001";
    }
    if (input.NODE_ENV === "production" && !input.NEXT_PUBLIC_BACKUP_SERVER) {
      ctx.addIssue({
        code: z.ZodIssueCode.invalid_type,
        expected: "string",
        received: "undefined",
        path: ["NEXT_PUBLIC_BACKUP_SERVER"],
        message: "Must be set when NODE_ENV is 'production'",
      });
    }
  });

const { data: clientEnv, error } = clientEnvSchema.safeParse(process.env);

if (error) {
  console.error("❌ Invalid env:");
  console.error(JSON.stringify(error.flatten().fieldErrors, null, 2));
  throw new Error(JSON.stringify(error.flatten().fieldErrors, null, 2));
}

export default clientEnv!;
