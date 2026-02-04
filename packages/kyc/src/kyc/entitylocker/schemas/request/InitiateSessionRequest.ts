import { z } from 'zod';

export const InitiateSessionRequestSchema = z.object({});

export type InitiateSessionRequest = z.infer<typeof InitiateSessionRequestSchema>;
