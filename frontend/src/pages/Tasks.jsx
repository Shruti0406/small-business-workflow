import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Edit3,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { api, formatDate, jsonBody } from "../lib/api";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  PriorityBadge,
  StatusBadge,
  TaskAssignee,
  TaskForm,
} from "../components/ui";
import { useToast } from "../components/useToast";

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    employeeId: "",
    overdue: searchParams.get("overdue") === "true",
  });
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formClosing, setFormClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const closeTimer = useRef(null);
  const notify = useToast();

  useEffect(() => () => window.clearTimeout(closeTimer.current), []);

  useEffect(() => {
    let active = true;
    api("/employees")
      .then((rows) => {
        if (active) setEmployees(rows);
      })
      .catch(() => {
        if (active) setEmployees([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      const query = new URLSearchParams();
      if (filters.search.trim()) query.set("search", filters.search.trim());
      if (filters.status) query.set("status", filters.status);
      if (filters.priority) query.set("priority", filters.priority);
      if (filters.employeeId) query.set("employeeId", filters.employeeId);
      if (filters.overdue) query.set("overdue", "true");
      setLoading(true);
      api(`/tasks${query.size ? `?${query}` : ""}`)
        .then((rows) => {
          if (active) {
            setTasks(rows);
            setError("");
          }
        })
        .catch((requestError) => {
          if (active) setError(requestError.message);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, 180);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [filters, reloadKey]);

  function openCreate() {
    window.clearTimeout(closeTimer.current);
    setFormClosing(false);
    setEditing(null);
    setFormOpen(true);
  }

  function closeForm() {
    window.clearTimeout(closeTimer.current);
    setFormClosing(true);
    closeTimer.current = window.setTimeout(() => {
      setFormOpen(false);
      setFormClosing(false);
      setEditing(null);
    }, 170);
  }

  async function saveTask(values) {
    setSaving(true);
    try {
      await api(editing ? `/tasks/${editing.id}` : "/tasks", {
        method: editing ? "PUT" : "POST",
        body: jsonBody(values),
      });
      closeForm();
      notify(editing ? "Task updated." : "Task created.");
      setReloadKey((key) => key + 1);
    } finally {
      setSaving(false);
    }
  }

  async function deleteTask(task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`))
      return;
    try {
      await api(`/tasks/${task.id}`, { method: "DELETE" });
      notify("Task deleted.");
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      notify(requestError.message, "error");
    }
  }

  async function changeStatus(task, status) {
    try {
      await api(`/tasks/${task.id}/status`, {
        method: "PATCH",
        body: jsonBody({ status }),
      });
      notify(`Task marked ${status.toLowerCase()}.`);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      notify(requestError.message, "error");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="THE WORK, IN ONE PLACE"
        title="Tasks"
        description="Keep the next step clear, and the whole team moving."
        action={
          <button className="button button-primary" onClick={openCreate}>
            <Plus size={17} />
            New task
          </button>
        }
      />
      <section className="filter-bar" aria-label="Task filters">
        <label className="search-field">
          <Search size={17} />
          <input
            value={filters.search}
            onChange={(event) =>
              setFilters({ ...filters, search: event.target.value })
            }
            placeholder="Search tasks"
            aria-label="Search by task title"
          />
          <kbd>/</kbd>
        </label>
        <label className="filter-select">
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(event) =>
              setFilters({ ...filters, status: event.target.value })
            }
          >
            <option value="">All statuses</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
          </select>
        </label>
        <label className="filter-select">
          <span>Priority</span>
          <select
            value={filters.priority}
            onChange={(event) =>
              setFilters({ ...filters, priority: event.target.value })
            }
          >
            <option value="">All priorities</option>
            <option>High</option>
            <option>Medium</option>
            <option>Low</option>
          </select>
        </label>
        <label className="filter-select filter-employee">
          <span>Assignee</span>
          <select
            value={filters.employeeId}
            onChange={(event) =>
              setFilters({ ...filters, employeeId: event.target.value })
            }
          >
            <option value="">Everyone</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </label>
        <label
          className={`overdue-toggle ${filters.overdue ? "overdue-toggle-active" : ""}`}
        >
          <input
            type="checkbox"
            checked={filters.overdue}
            onChange={(event) =>
              setFilters({ ...filters, overdue: event.target.checked })
            }
          />
          <AlertCircle size={15} />
          Overdue
        </label>
      </section>

      <section className="panel task-table-panel">
        <div className="table-toolbar">
          <div>
            <p className="eyebrow">THE TASK BOARD</p>
            <h2>
              All work{" "}
              <span className="result-count">
                {loading ? "…" : error ? "—" : tasks.length}
              </span>
            </h2>
          </div>
          <span className="table-hint">
            <CalendarDays size={15} />
            Dates update automatically
          </span>
        </div>
        {loading ? (
          <LoadingState label="Finding your tasks" />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => setReloadKey((key) => key + 1)}
          />
        ) : tasks.length === 0 ? (
          <EmptyState
            title="No tasks match this view"
            detail={
              filters.search ||
              filters.status ||
              filters.priority ||
              filters.employeeId ||
              filters.overdue
                ? "Try adjusting your filters, or start fresh with a new task."
                : "Create a task and give your day a clear next step."
            }
            action={
              <button
                className="button button-primary button-small"
                onClick={openCreate}
              >
                Create a task
              </button>
            }
          />
        ) : (
          <div className="table-scroll">
            <table className="task-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Assignee</th>
                  <th>Priority</th>
                  <th>Deadline</th>
                  <th>Status</th>
                  <th>
                    <span className="visually-hidden">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task.id}
                    className={task.overdue ? "overdue-row" : ""}
                  >
                    <td className="task-title-cell">
                      <span className="task-table-title">
                        {task.overdue ? <AlertCircle size={14} /> : null}
                        <strong>{task.title}</strong>
                      </span>
                      {task.description && (
                        <span className="task-description-preview">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td>
                      <TaskAssignee name={task.employeeName} />
                    </td>
                    <td>
                      <PriorityBadge priority={task.priority} />
                    </td>
                    <td>
                      <span
                        className={`deadline-cell ${task.overdue ? "text-danger" : ""}`}
                      >
                        {formatDate(task.deadline)}
                      </span>
                      {task.overdue && (
                        <span className="overdue-label">Overdue</span>
                      )}
                    </td>
                    <td>
                      <label className="status-edit">
                        <span className="visually-hidden">
                          Change status for {task.title}
                        </span>
                        <select
                          value={task.status}
                          onChange={(event) =>
                            changeStatus(task, event.target.value)
                          }
                        >
                          <option>Pending</option>
                          <option>In Progress</option>
                          <option>Completed</option>
                        </select>
                        <StatusBadge status={task.status} />
                      </label>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          className="icon-button"
                          onClick={() => {
                            window.clearTimeout(closeTimer.current);
                            setFormClosing(false);
                            setEditing(task);
                            setFormOpen(true);
                          }}
                          aria-label={`Edit ${task.title}`}
                          title="Edit task"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="icon-button icon-danger"
                          onClick={() => deleteTask(task)}
                          aria-label={`Delete ${task.title}`}
                          title="Delete task"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && tasks.length > 0 && (
          <div className="table-foot">
            <span>
              <Check size={14} />
              Showing {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </span>
            <span>Overdue work stays visible until it’s complete.</span>
          </div>
        )}
      </section>

      {formOpen && (
        <Modal
          title={editing ? "Edit task" : "Create a task"}
          subtitle={
            editing
              ? "Keep the details current as work moves."
              : "Give the team a clear next step."
          }
          onClose={closeForm}
          closing={formClosing}
        >
          <TaskForm
            task={editing}
            employees={employees}
            onSave={saveTask}
            onCancel={closeForm}
            saving={saving}
          />
        </Modal>
      )}
    </>
  );
}
