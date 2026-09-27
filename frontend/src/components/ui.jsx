import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, CircleAlert, X } from "lucide-react";
import { formatDate } from "../lib/api";

export function PageHeader({ eyebrow, title, description, action }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="page-description">{description}</p>}
      </div>
      {action && <div className="page-header-action">{action}</div>}
    </div>
  );
}

export function StatCard({ label, value, note, icon: Icon, tone = "mint" }) {
  return (
    <article className={`stat-card stat-${tone}`}>
      <div className="stat-topline">
        <span className="stat-icon">
          <Icon size={18} strokeWidth={1.8} />
        </span>
        {note && <span className="stat-note">{note}</span>}
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">
        <AnimatedNumber value={value ?? "—"} />
      </p>
    </article>
  );
}

export function AnimatedNumber({ value, duration = 680 }) {
  const numericValue =
    typeof value === "number" ||
    (typeof value === "string" &&
      value.trim() !== "" &&
      Number.isFinite(Number(value)))
      ? Number(value)
      : null;
  const [displayValue, setDisplayValue] = useState(
    numericValue === null ? value : 0,
  );
  const elementRef = useRef(null);
  const currentValueRef = useRef(0);

  useEffect(() => {
    if (numericValue === null) return undefined;

    const element = elementRef.current;
    if (!element) return undefined;

    let frame = 0;
    let initialTimer = 0;
    let observer;
    let started = false;

    function startCount() {
      if (started) return;
      started = true;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        currentValueRef.current = numericValue;
        setDisplayValue(numericValue);
        return;
      }

      const startValue = currentValueRef.current;
      let startTime;
      function tick(time) {
        if (startTime === undefined) startTime = time;
        const progress = Math.min((time - startTime) / duration, 1);
        const eased = 1 - (1 - progress) ** 3;
        const nextValue = Math.round(
          startValue + (numericValue - startValue) * eased,
        );
        currentValueRef.current = nextValue;
        setDisplayValue(nextValue);
        if (progress < 1) frame = window.requestAnimationFrame(tick);
      }
      frame = window.requestAnimationFrame(tick);
    }

    function isVisible() {
      const bounds = element.getBoundingClientRect();
      return bounds.bottom > 0 && bounds.top < window.innerHeight;
    }

    if (isVisible()) {
      initialTimer = window.setTimeout(startCount, 20);
      return () => {
        window.clearTimeout(initialTimer);
        window.cancelAnimationFrame(frame);
      };
    }

    function checkVisibility() {
      if (!isVisible()) return;
      observer?.disconnect();
      startCount();
    }

    window.addEventListener("scroll", checkVisibility, { passive: true });
    if (!("IntersectionObserver" in window)) {
      observer = null;
      checkVisibility();
      return () => {
        window.removeEventListener("scroll", checkVisibility);
        window.cancelAnimationFrame(frame);
      };
    }

    if (!observer) {
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            observer.disconnect();
            startCount();
          }
        },
        { threshold: 0.15 },
      );
    }
    observer.observe(element);

    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", checkVisibility);
      window.cancelAnimationFrame(frame);
    };
  }, [duration, numericValue]);

  return (
    <span ref={elementRef}>
      {numericValue === null
        ? value
        : new Intl.NumberFormat("en").format(
            typeof displayValue === "number" ? displayValue : 0,
          )}
    </span>
  );
}

export function StatusBadge({ status }) {
  const variant =
    status === "Completed"
      ? "success"
      : status === "In Progress"
        ? "progress"
        : "pending";
  return (
    <span className={`badge badge-${variant}`}>
      <i />
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`priority priority-${String(priority).toLowerCase()}`}>
      {priority}
    </span>
  );
}

export function Avatar({ name, size = "normal" }) {
  const initials = (name || "Unassigned")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  return (
    <span className={`avatar avatar-${size}`} aria-label={name || "Unassigned"}>
      {initials}
    </span>
  );
}

export function TaskAssignee({ name }) {
  if (!name) return <span className="assignee-unassigned">Unassigned</span>;
  return (
    <span className="assignee">
      <Avatar name={name} size="small" />
      {name.split(" ")[0]}
    </span>
  );
}

export function TaskLine({ task, compact = false }) {
  return (
    <div className={`task-line ${compact ? "task-line-compact" : ""}`}>
      <div className="task-line-main">
        <span
          className={`task-dot dot-${String(task.priority).toLowerCase()}`}
        />
        <div className="task-line-copy">
          <strong>{task.title}</strong>
          <span>{task.employeeName || "Unassigned"}</span>
        </div>
      </div>
      <div className="task-line-meta">
        <StatusBadge status={task.status} />
        <span className={`task-date ${task.overdue ? "text-danger" : ""}`}>
          {task.overdue ? <AlertCircle size={13} /> : null}
          {formatDate(task.deadline)}
        </span>
      </div>
    </div>
  );
}

export function LoadingState({ label = "Loading your workspace" }) {
  return (
    <div className="state-panel" role="status">
      <span className="spinner" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel state-error" role="alert">
      <CircleAlert size={20} />
      <span>{message}</span>
      {onRetry && (
        <button
          className="button button-small button-outline"
          onClick={onRetry}
        >
          Try again
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title, detail, action }) {
  return (
    <div className="empty-state">
      <span className="empty-mark">
        <Check size={20} />
      </span>
      <strong>{title}</strong>
      <p>{detail}</p>
      {action}
    </div>
  );
}

export function Modal({
  title,
  subtitle,
  onClose,
  children,
  wide = false,
  closing = false,
}) {
  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [onClose]);

  return (
    <div
      className={`modal-scrim ${closing ? "modal-closing" : ""}`}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className={`modal ${wide ? "modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <header className="modal-header">
          <div>
            <h2 id="modal-title">{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <X size={19} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

const emptyTask = {
  title: "",
  description: "",
  employeeId: "",
  priority: "Medium",
  status: "Pending",
  deadline: new Date().toISOString().slice(0, 10),
};

export function TaskForm({ task, employees, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => ({
    ...emptyTask,
    ...(task || {}),
    employeeId: task?.employeeId ?? "",
    deadline: task?.deadline?.slice(0, 10) || emptyTask.deadline,
  }));
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await onSave({ ...form, employeeId: form.employeeId || null });
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <label className="field">
        <span>Task title</span>
        <input
          autoFocus
          required
          maxLength="160"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Prepare monthly report"
        />
      </label>
      <label className="field">
        <span>
          Description <small>Optional</small>
        </span>
        <textarea
          rows="3"
          maxLength="4000"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Add context, next steps, or useful details"
        />
      </label>
      <div className="form-grid">
        <label className="field">
          <span>Assigned to</span>
          <select
            value={form.employeeId}
            onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
          >
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Deadline</span>
          <input
            required
            type="date"
            value={form.deadline}
            onChange={(e) => setForm({ ...form, deadline: e.target.value })}
          />
        </label>
        <label className="field">
          <span>Priority</span>
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </label>
        <label className="field">
          <span>Status</span>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>
      </div>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions">
        <button
          type="button"
          className="button button-quiet"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button className="button button-primary" disabled={saving}>
          {saving ? "Saving…" : task ? "Save changes" : "Create task"}
        </button>
      </div>
    </form>
  );
}

export function EmployeeForm({ employee, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    role: employee?.role || "",
  });
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    setError("");
    try {
      await onSave(form);
    } catch (saveError) {
      setError(saveError.message);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <label className="field">
        <span>Full name</span>
        <input
          autoFocus
          required
          maxLength="100"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Jordan Lee"
        />
      </label>
      <label className="field">
        <span>Work email</span>
        <input
          required
          type="email"
          maxLength="190"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="jordan@company.com"
        />
      </label>
      <label className="field">
        <span>Role or department</span>
        <input
          required
          maxLength="100"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          placeholder="e.g. Operations"
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      <div className="modal-actions">
        <button
          type="button"
          className="button button-quiet"
          onClick={onCancel}
        >
          Cancel
        </button>
        <button className="button button-primary" disabled={saving}>
          {saving ? "Saving…" : employee ? "Save changes" : "Add employee"}
        </button>
      </div>
    </form>
  );
}
