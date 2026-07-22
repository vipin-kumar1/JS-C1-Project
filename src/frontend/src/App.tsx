import { Link, Route, Routes } from "react-router-dom";
import { CurrentUserProvider, useCurrentUser } from "./context/CurrentUser";
import { ToastProvider } from "./context/Toast";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketListPage } from "./pages/TicketListPage";

function UserSwitcher() {
  const { users, currentUser, setCurrentUserId } = useCurrentUser();
  return (
    <label className="user-switcher">
      <span>Acting as</span>
      <select
        value={currentUser?.id ?? ""}
        onChange={(e) => setCurrentUserId(e.target.value)}
      >
        {users.map((u) => (
          <option key={u.id} value={u.id}>
            {u.name} ({u.role})
          </option>
        ))}
      </select>
    </label>
  );
}

function Header() {
  return (
    <header className="app-header">
      <div className="app-header-inner">
        <Link to="/" className="brand">
          <span className="brand-mark">◈</span>
          <span>Support Desk</span>
        </Link>
        <UserSwitcher />
      </div>
    </header>
  );
}

export function App() {
  return (
    <ToastProvider>
      <CurrentUserProvider>
        <Header />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<TicketListPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Routes>
        </main>
      </CurrentUserProvider>
    </ToastProvider>
  );
}
