import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiRequestError, api } from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badges";
import { useCurrentUser } from "../context/CurrentUser";
import { useToast } from "../context/Toast";
import {
  ALL_PRIORITIES,
  PRIORITY_LABELS,
  STATUS_LABELS,
  formatDate,
} from "../lib/labels";
import type { TicketPriority, TicketStatus } from "../types";

export function TicketDetailPage() {
  const { id = "" } = useParams();
  const { users, currentUser } = useCurrentUser();
  const { notify } = useToast();
  const queryClient = useQueryClient();

  const { data: ticket, isLoading, isError, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: () => api.getTicket(id),
  });

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [assignedTo, setAssignedTo] = useState<string>("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (ticket) {
      setTitle(ticket.title);
      setDescription(ticket.description);
      setPriority(ticket.priority);
      setAssignedTo(ticket.assignedTo ?? "");
    }
  }, [ticket]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["ticket", id] });
    queryClient.invalidateQueries({ queryKey: ["tickets"] });
  };

  const handleApiError = (err: unknown, fallback: string) => {
    notify("error", err instanceof ApiRequestError ? err.message : fallback);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      api.updateTicket(id, {
        title: title.trim(),
        description: description.trim(),
        priority,
        assignedTo: assignedTo || null,
      }),
    onSuccess: () => {
      invalidate();
      setEditing(false);
      notify("success", "Ticket updated");
    },
    onError: (err) => handleApiError(err, "Failed to update ticket"),
  });

  const statusMutation = useMutation({
    mutationFn: (next: TicketStatus) => api.changeStatus(id, next),
    onSuccess: (_data, next) => {
      invalidate();
      notify("success", `Status changed to ${STATUS_LABELS[next]}`);
    },
    onError: (err) => handleApiError(err, "Failed to change status"),
  });

  const commentMutation = useMutation({
    mutationFn: () =>
      api.addComment(id, { message: comment.trim(), createdBy: currentUser!.id }),
    onSuccess: () => {
      setComment("");
      invalidate();
      notify("success", "Comment added");
    },
    onError: (err) => handleApiError(err, "Failed to add comment"),
  });

  if (isLoading) return <div className="page state-panel">Loading ticket...</div>;
  if (isError)
    return (
      <div className="page state-panel error">
        <p>Could not load ticket: {(error as Error).message}</p>
        <Link className="btn ghost" to="/">
          Back to list
        </Link>
      </div>
    );
  if (!ticket) return null;

  return (
    <div className="page detail">
      <Link to="/" className="back-link">
        ← All tickets
      </Link>

      <div className="detail-grid">
        <section className="detail-main card">
          <div className="detail-head">
            <div className="badges">
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            {!editing && (
              <button className="btn ghost" onClick={() => setEditing(true)}>
                Edit
              </button>
            )}
          </div>

          {editing ? (
            <form
              className="form"
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
            >
              <label className="field">
                <span>Title</span>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="field">
                <span>Description</span>
                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <div className="field-row">
                <label className="field">
                  <span>Priority</span>
                  <select
                    value={priority}
                    onChange={(e) =>
                      setPriority(e.target.value as TicketPriority)
                    }
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
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1>{ticket.title}</h1>
              <p className="detail-desc">{ticket.description}</p>
            </>
          )}

          <div className="comments">
            <h2>Comments</h2>
            {ticket.comments && ticket.comments.length > 0 ? (
              <ul className="comment-list">
                {ticket.comments.map((c) => (
                  <li key={c.id} className="comment">
                    <div className="comment-head">
                      <strong>{c.author?.name ?? "Unknown"}</strong>
                      <span className="muted">{formatDate(c.createdAt)}</span>
                    </div>
                    <p>{c.message}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No comments yet.</p>
            )}

            <form
              className="comment-form"
              onSubmit={(e) => {
                e.preventDefault();
                if (comment.trim().length === 0) return;
                commentMutation.mutate();
              }}
            >
              <textarea
                rows={2}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                type="submit"
                className="btn primary"
                disabled={commentMutation.isPending || comment.trim().length === 0}
              >
                {commentMutation.isPending ? "Posting..." : "Comment"}
              </button>
            </form>
          </div>
        </section>

        <aside className="detail-side">
          <div className="card">
            <h3>Status</h3>
            <div className="status-current">
              <StatusBadge status={ticket.status} />
            </div>
            {ticket.allowedTransitions.length > 0 ? (
              <div className="transition-actions">
                <p className="muted small">Move to:</p>
                {ticket.allowedTransitions.map((s) => (
                  <button
                    key={s}
                    className="btn outline"
                    disabled={statusMutation.isPending}
                    onClick={() => statusMutation.mutate(s)}
                  >
                    {STATUS_LABELS[s]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="muted small">
                This ticket is {STATUS_LABELS[ticket.status].toLowerCase()} (no
                further transitions).
              </p>
            )}
          </div>

          <div className="card">
            <h3>Details</h3>
            <dl className="meta">
              <dt>Assignee</dt>
              <dd>{ticket.assignee?.name ?? "Unassigned"}</dd>
              <dt>Reporter</dt>
              <dd>{ticket.creator?.name ?? "Unknown"}</dd>
              <dt>Created</dt>
              <dd>{formatDate(ticket.createdAt)}</dd>
              <dt>Updated</dt>
              <dd>{formatDate(ticket.updatedAt)}</dd>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
