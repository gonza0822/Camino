"use client";

import { useState, useTransition } from "react";
import { appContent } from "@/lib/content/app";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { GoalDto } from "@/types/app";

interface GoalListProps {
  goals: GoalDto[];
  placeholder: string;
  onCreate: (title: string) => Promise<{ error?: string }>;
  onUpdate: (id: string, data: { title?: string; completed?: boolean }) => Promise<{ error?: string }>;
  onDelete: (id: string) => Promise<{ error?: string }>;
}

export function GoalList({ goals, placeholder, onCreate, onUpdate, onDelete }: GoalListProps) {
  const [newTitle, setNewTitle] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    startTransition(async () => {
      const result = await onCreate(newTitle.trim());
      if (!result.error) setNewTitle("");
    });
  }

  function startEdit(goal: GoalDto) {
    setEditingId(goal.id);
    setEditTitle(goal.title);
  }

  function saveEdit(id: string) {
    if (!editTitle.trim()) return;
    startTransition(async () => {
      await onUpdate(id, { title: editTitle.trim() });
      setEditingId(null);
    });
  }

  function toggleComplete(goal: GoalDto) {
    startTransition(async () => {
      await onUpdate(goal.id, { completed: !goal.completed });
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await onDelete(id);
    });
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleCreate} className="flex flex-col gap-2 sm:flex-row">
        <Input
          placeholder={placeholder}
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !newTitle.trim()} className="shrink-0">
          {appContent.goals.save}
        </Button>
      </form>

      {goals.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">{appContent.goals.empty}</p>
      ) : (
        <ul className="space-y-2">
          {goals.map((goal) => (
            <li
              key={goal.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-border bg-surface p-3 transition-colors duration-200",
                goal.completed && "bg-success/5",
              )}
            >
              <button
                type="button"
                onClick={() => toggleComplete(goal)}
                aria-checked={goal.completed}
                role="checkbox"
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 cursor-pointer",
                  goal.completed ? "border-success bg-success text-white" : "border-border",
                )}
              >
                {goal.completed && (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>

              <div className="min-w-0 flex-1">
                {editingId === goal.id ? (
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={() => saveEdit(goal.id)} disabled={isPending}>
                      {appContent.goals.save}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>
                      {appContent.goals.cancel}
                    </Button>
                  </div>
                ) : (
                  <p
                    className={cn(
                      "text-sm font-medium",
                      goal.completed && "text-muted line-through",
                    )}
                  >
                    {goal.title}
                  </p>
                )}
              </div>

              {editingId !== goal.id && (
                <div className="flex shrink-0 gap-1">
                  <Button size="sm" variant="ghost" onClick={() => startEdit(goal)}>
                    {appContent.goals.edit}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(goal.id)}>
                    {appContent.goals.delete}
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
