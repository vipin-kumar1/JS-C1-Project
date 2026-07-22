import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiRequestError, api } from "../api/client";
import { useCurrentUser } from "../context/CurrentUser";
import { useToast } from "../context/Toast";
import { ALL_PRIORITIES, PRIORITY_LABELS } from "../lib/labels";
import type { TicketPriority } from "../types";

interface Props {
  onClose: () => void;
}

// Client-side validation mirrors the backend Zod rules for fast feedback;
// the backend remains the source of truth and its errors are surfaced too.
export function CreateTicketModal({ onClose }: Props) {
  const { users, currentUser } = useCurrentUser();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: () =>
      api.createTicket({
        title: title.trim(),
        description: description.trim(),
        priority,
        createdBy: currentUser!.id,
        assignedTo: assignedTo || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      notify("success", "Ticket created");
      onClose();
    },
    onError: (err) => {
      if (err instanceof ApiRequestError) {
        notify("error", err.message);
      } else {
        notify("error", "Failed to create ticket");
      }
    },
  });

  function validate() {
    const next: Record<string, string> = {};
    if (title.trim().length < 3) next.title = "Title must be at least 3 characters";
    if (description.trim().length < 5)
      next.description = "Description must be at least 5 characters";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label="Create ticket"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>Create ticket</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="form">
          <label className="field">
            <span>Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short summary of the issue"
              autoFocus
            />
            {errors.title && <span className="field-error">{errors.title}</span>}
          </label>

          <label className="field">
            <span>Description</span>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Steps to reproduce, expected vs actual..."
            />
            {errors.description && (
              <span className="field-error">{errors.description}</span>
            )}
          </label>

          <div className="field-row">
            <label className="field">
              <span>Priority</span>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TicketPriority)}
              >
                {ALL_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {PRIORITY_LABELS[p]}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>Assignee</span>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn ghost" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create ticket"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
