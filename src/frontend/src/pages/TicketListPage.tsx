import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { PriorityBadge, StatusBadge } from "../components/Badges";
import { CreateTicketModal } from "../components/CreateTicketModal";
import { ALL_STATUSES, STATUS_LABELS, formatDate } from "../lib/labels";
import type { TicketStatus } from "../types";

// Simple debounce so we do not fire a request on every keystroke.
function useDebounced<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export function TicketListPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [showCreate, setShowCreate] = useState(false);
  const debouncedQ = useDebounced(q);

  const { data: tickets, isLoading, isError, error, refetch, isFetching } =
    useQuery({
      queryKey: ["tickets", debouncedQ, status],
      queryFn: () => api.listTickets({ q: debouncedQ, status }),
    });

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Tickets</h1>
          <p className="muted">Track and progress support tickets.</p>
        </div>
        <button className="btn primary" onClick={() => setShowCreate(true)}>
          + New ticket
        </button>
      </div>

      <div className="toolbar">
        <div className="search">
          <span className="search-icon" aria-hidden>
            ⌕
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search title or description..."
            aria-label="Search tickets"
          />
        </div>
        <div className="filters" role="group" aria-label="Filter by status">
          <button
            className={`chip ${status === "" ? "active" : ""}`}
            onClick={() => setStatus("")}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              className={`chip ${status === s ? "active" : ""}`}
              onClick={() => setStatus(s)}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <div className="state-panel">Loading tickets...</div>}

      {isError && (
        <div className="state-panel error">
          <p>Could not load tickets: {(error as Error).message}</p>
          <button className="btn ghost" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}

      {tickets && tickets.length === 0 && (
        <div className="state-panel">
          <p>No tickets match your filters.</p>
        </div>
      )}

      {tickets && tickets.length > 0 && (
        <div className={`ticket-grid ${isFetching ? "dim" : ""}`}>
          {tickets.map((t) => (
            <Link key={t.id} to={`/tickets/${t.id}`} className="ticket-card">
              <div className="ticket-card-top">
                <StatusBadge status={t.status} />
                <PriorityBadge priority={t.priority} />
              </div>
              <h3>{t.title}</h3>
              <p className="ticket-desc">{t.description}</p>
              <div className="ticket-card-foot">
                <span>
                  {t.assignee ? `Assigned to ${t.assignee.name}` : "Unassigned"}
                </span>
                <span className="muted">{formatDate(t.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showCreate && <CreateTicketModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}
