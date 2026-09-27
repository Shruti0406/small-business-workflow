import { useEffect, useRef, useState } from "react";
import {
  BriefcaseBusiness,
  Mail,
  Pencil,
  Plus,
  Trash2,
  UsersRound,
} from "lucide-react";
import { api, jsonBody } from "../lib/api";
import {
  AnimatedNumber,
  Avatar,
  EmptyState,
  EmployeeForm,
  ErrorState,
  LoadingState,
  Modal,
  PageHeader,
  StatCard,
} from "../components/ui";
import { useToast } from "../components/useToast";

export default function Team() {
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
        if (active) {
          setEmployees(rows);
          setError("");
        }
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  function openForm(employee = null) {
    window.clearTimeout(closeTimer.current);
    setFormClosing(false);
    setEditing(employee);
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

  async function saveEmployee(values) {
    setSaving(true);
    try {
      await api(editing ? `/employees/${editing.id}` : "/employees", {
        method: editing ? "PUT" : "POST",
        body: jsonBody(values),
      });
      closeForm();
      notify(editing ? "Team member updated." : "Team member added.");
      setReloadKey((key) => key + 1);
    } finally {
      setSaving(false);
    }
  }

  async function deleteEmployee(employee) {
    if (
      !window.confirm(
        `Remove ${employee.name} from the team? Their tasks will become unassigned.`,
      )
    )
      return;
    try {
      await api(`/employees/${employee.id}`, { method: "DELETE" });
      notify(`${employee.name} removed from the team.`);
      setReloadKey((key) => key + 1);
    } catch (requestError) {
      notify(requestError.message, "error");
    }
  }

  const taskTotal = employees.reduce(
    (sum, employee) => sum + Number(employee.taskCount || 0),
    0,
  );
  const completedTotal = employees.reduce(
    (sum, employee) => sum + Number(employee.completedCount || 0),
    0,
  );

  return (
    <>
      <PageHeader
        eyebrow="THE PEOPLE BEHIND THE PROGRESS"
        title="Your team"
        description="See who’s carrying what, and keep the work balanced."
        action={
          <button className="button button-primary" onClick={() => openForm()}>
            <Plus size={17} />
            Add teammate
          </button>
        }
      />
      <section className="stats-grid team-stats-grid">
        <StatCard
          label="Team members"
          value={loading || error ? "—" : employees.length}
          note="People in your workspace"
          icon={UsersRound}
          tone="mint"
        />
        <StatCard
          label="Assigned tasks"
          value={loading || error ? "—" : taskTotal}
          note="Across the team"
          icon={BriefcaseBusiness}
          tone="blue"
        />
        <StatCard
          label="Tasks completed"
          value={loading || error ? "—" : completedTotal}
          note="Good work, team"
          icon={UsersRound}
          tone="coral"
        />
      </section>

      <section className="team-section">
        <div className="section-intro">
          <div>
            <p className="eyebrow">YOUR PEOPLE</p>
            <h2>Everyone on the team</h2>
          </div>
          <span>
            {error
              ? "—"
              : `${employees.length} member${employees.length === 1 ? "" : "s"}`}
          </span>
        </div>
        {loading ? (
          <LoadingState label="Loading your team" />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              setLoading(true);
              setReloadKey((key) => key + 1);
            }}
          />
        ) : employees.length === 0 ? (
          <div className="panel">
            <EmptyState
              title="Good work starts together"
              detail="Add your first teammate to start assigning tasks and sharing the day."
              action={
                <button
                  className="button button-primary button-small"
                  onClick={() => openForm()}
                >
                  Add a teammate
                </button>
              }
            />
          </div>
        ) : (
          <div className="team-card-grid">
            {employees.map((employee) => {
              const assigned = Number(employee.taskCount || 0);
              const completed = Number(employee.completedCount || 0);
              const pending = Number(employee.pendingCount || 0);
              const progress = assigned
                ? Math.round((completed / assigned) * 100)
                : 0;
              return (
                <article className="employee-card" key={employee.id}>
                  <div className="employee-card-top">
                    <Avatar name={employee.name} size="large" />
                    <div className="employee-card-actions">
                      <button
                        className="icon-button"
                        onClick={() => openForm(employee)}
                        aria-label={`Edit ${employee.name}`}
                        title="Edit employee"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-button icon-danger"
                        onClick={() => deleteEmployee(employee)}
                        aria-label={`Remove ${employee.name}`}
                        title="Remove employee"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="employee-identity">
                    <h3>{employee.name}</h3>
                    <span className="employee-role">{employee.role}</span>
                  </div>
                  <a
                    className="employee-email"
                    href={`mailto:${employee.email}`}
                  >
                    <Mail size={14} />
                    {employee.email}
                  </a>
                  <div className="employee-progress">
                    <div className="employee-progress-label">
                      <span>Task completion</span>
                      <strong>
                        <AnimatedNumber value={progress} />%
                      </strong>
                    </div>
                    <div className="progress-track">
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <div className="employee-stats">
                    <div>
                      <strong>
                        <AnimatedNumber value={assigned} />
                      </strong>
                      <span>Assigned</span>
                    </div>
                    <div>
                      <strong>
                        <AnimatedNumber value={completed} />
                      </strong>
                      <span>Completed</span>
                    </div>
                    <div>
                      <strong>
                        <AnimatedNumber value={pending} />
                      </strong>
                      <span>Pending</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {formOpen && (
        <Modal
          title={editing ? "Edit team member" : "Add a teammate"}
          subtitle="A clear role makes it easier to share the work."
          onClose={closeForm}
          closing={formClosing}
        >
          <EmployeeForm
            employee={editing}
            onSave={saveEmployee}
            onCancel={closeForm}
            saving={saving}
          />
        </Modal>
      )}
    </>
  );
}
