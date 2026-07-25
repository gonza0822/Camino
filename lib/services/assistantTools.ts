import { tool } from "ai";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { HOUR_END, HOUR_START } from "@/lib/utils/date";
import { getTasksByDate, saveTaskSlot } from "@/lib/services/taskService";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Usá fecha YYYY-MM-DD");

const hourSchema = z
  .number()
  .int()
  .min(HOUR_START)
  .max(HOUR_END)
  .describe(`Hora de la agenda entre ${HOUR_START} y ${HOUR_END}`);

// Builds authenticated tools so the model can mutate only the current user's agenda.
export function createAssistantTools(userId: string) {
  return {
    createAgendaTask: tool({
      description:
        "Crea o actualiza una tarea en un bloque horario de la agenda del usuario. Usala cuando pidan agendar algo.",
      inputSchema: z.object({
        date: dateSchema.describe("Fecha de la tarea en formato YYYY-MM-DD"),
        hour: hourSchema,
        title: z
          .string()
          .trim()
          .min(1)
          .max(200)
          .describe("Texto de la tarea a guardar"),
      }),
      execute: async ({ date, hour, title }) => {
        const task = await saveTaskSlot(userId, { date, hour, title });
        revalidatePath("/");
        revalidatePath("/semanal");
        return {
          ok: true as const,
          date,
          hour,
          title: task?.title ?? title,
          message: `Tarea guardada el ${date} a las ${String(hour).padStart(2, "0")}:00`,
        };
      },
    }),

    listAgendaTasks: tool({
      description:
        "Lista las tareas de la agenda del usuario para una fecha (útil para confirmar o responder qué hay planificado).",
      inputSchema: z.object({
        date: dateSchema.describe("Fecha a consultar en formato YYYY-MM-DD"),
      }),
      execute: async ({ date }) => {
        const tasks = await getTasksByDate(userId, date);
        return {
          ok: true as const,
          date,
          tasks: tasks.map((t) => ({
            hour: t.hour,
            title: t.title,
            completed: t.completed,
          })),
          count: tasks.length,
        };
      },
    }),
  };
}
