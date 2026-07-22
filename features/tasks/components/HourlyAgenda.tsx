"use client";

import { useState, useTransition } from "react";
import { appContent } from "@/lib/content/app";
import { formatHourLabel } from "@/lib/utils/date";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import type { TaskDto } from "@/types/app";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/app/actions/tasks";

interface HourlyAgendaProps {
  date: string;
  tasks: TaskDto[];
  hours: number[];
  compact?: boolean;
}

export function HourlyAgenda({ date, tasks, hours, compact = false }: HourlyAgendaProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null);
  const [selectedHour, setSelectedHour] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const taskByHour = new Map(tasks.map((t) => [t.hour, t]));

  function openCreate(hour: number) {
    setEditingTask(null);
    setSelectedHour(hour);
    setTitle("");
    setError("");
    setModalOpen(true);
  }

  function openEdit(task: TaskDto) {
    setEditingTask(task);
    setSelectedHour(task.hour);
    setTitle(task.title);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
    setSelectedHour(null);
    setTitle("");
    setError("");
  }

  // Saves a new or edited task via server action.
  function handleSave() {
    if (!title.trim() || selectedHour === null) return;

    startTransition(async () => {
      if (editingTask) {
        const result = await updateTaskAction(editingTask.id, { title: title.trim() });
        if (result.error) {
          setError(appContent.auth.errors.generic);
          return;
        }
      } else {
        const result = await createTaskAction({
          date,
          hour: selectedHour,
          title: title.trim(),
        });
        if (result.error === "SLOT_OCCUPIED") {
          setError("Este horario ya tiene una tarea");
          return;
        }
        if (result.error) {
          setError(appContent.auth.errors.generic);
          return;
        }
      }
      closeModal();
    });
  }

  function toggleComplete(task: TaskDto) {
    startTransition(async () => {
      await updateTaskAction(task.id, { completed: !task.completed });
    });
  }

  function handleDelete() {
    if (!editingTask) return;
    startTransition(async () => {
      await deleteTaskAction(editingTask.id);
      closeModal();
    });
  }

  return (
    <>
      <div className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
        {hours.map((hour) => {
          const task = taskByHour.get(hour);
          return (
            <div
              key={hour}
              className={cn(
                "flex gap-3 sm:gap-4",
                compact ? "px-2 py-2" : "px-4 py-3 sm:px-5 sm:py-4",
              )}
            >
              <div
                className={cn(
                  "shrink-0 font-mono text-xs text-muted sm:text-sm",
                  compact ? "w-16" : "w-28",
                )}
              >
                {compact ? `${String(hour).padStart(2, "0")}:00` : formatHourLabel(hour)}
              </div>

              {task ? (
                <button
                  type="button"
                  onClick={() => openEdit(task)}
                  className={cn(
                    "flex min-w-0 flex-1 items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors duration-200 cursor-pointer",
                    task.completed
                      ? "border-success/30 bg-success/5 text-muted line-through"
                      : "border-border bg-zinc-50 hover:border-cta/40",
                  )}
                >
                  <span
                    role="checkbox"
                    aria-checked={task.completed}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(task);
                    }}
                    className={cn(
                      "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 cursor-pointer",
                      task.completed ? "border-success bg-success text-white" : "border-border",
                    )}
                  >
                    {task.completed && (
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </span>
                  <span className="truncate text-sm font-medium">{task.title}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => openCreate(hour)}
                  className="flex flex-1 items-center rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted transition-colors duration-200 hover:border-cta/50 hover:text-cta cursor-pointer"
                >
                  + {appContent.dashboard.addTask}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        title={editingTask ? appContent.dashboard.editTask : appContent.dashboard.addTask}
        onClose={closeModal}
      >
        <div className="space-y-4">
          {selectedHour !== null && (
            <p className="text-sm text-muted">{formatHourLabel(selectedHour)}</p>
          )}
          <Input
            label={appContent.dashboard.taskTitle}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={error}
            autoFocus
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSave} disabled={isPending || !title.trim()}>
              {appContent.dashboard.save}
            </Button>
            <Button variant="ghost" onClick={closeModal}>
              {appContent.dashboard.cancel}
            </Button>
            {editingTask && (
              <>
                <Button
                  variant="secondary"
                  onClick={() => toggleComplete(editingTask)}
                  disabled={isPending}
                >
                  {editingTask.completed
                    ? appContent.dashboard.markIncomplete
                    : appContent.dashboard.markComplete}
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={isPending}>
                  {appContent.dashboard.deleteTask}
                </Button>
              </>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
