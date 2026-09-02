import { z } from 'zod';

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  AUTH_SESSION_SECRET: z.string().min(1),
  TREASURY_PRIVATE_KEY: z.string().min(1).optional(),
  PK: z.string().min(1).optional(),
  AGENT_TREASURY_ADDRESS: z.string().min(1).optional(),
  CELO_RPC_URL: z.string().min(1).optional(),
});

export const validateEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    return {
      isValid: false,
      errors: result.error.issues.map((e: z.ZodIssue) => e.path.join('.')),
    };
  }
  return { isValid: true, errors: [] };
};
