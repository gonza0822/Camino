import { z } from "zod";

export const footballMatchesQuerySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    leagueId: z.string().regex(/^\d+$/).optional(),
    teamId: z.string().regex(/^\d+$/).optional(),
    scope: z.enum(["next", "last"]).optional().default("next"),
  })
  .refine((data) => Boolean(data.date || data.leagueId || data.teamId), {
    message: "Provide date, leagueId, or teamId",
  });

export const footballLeaguesQuerySchema = z.object({
  country: z.string().trim().min(2).max(60).optional(),
});

export const footballTeamsQuerySchema = z.object({
  q: z.string().trim().min(2).max(80),
});

export type FootballMatchesQuery = z.infer<typeof footballMatchesQuerySchema>;
