import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ListTodo,
  TriangleAlert,
} from "lucide-react";
import { api } from "../lib/api";
import {
  AnimatedNumber,
  Avatar,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
} from "../components/ui";

export default function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api("/analytics")
      .then((result) => {
        if (active) {
          setData(result);
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

  if (loading)
    return <LoadingState label="Gathering your productivity stats" />;
  if (error)
    return (
      <>
        <PageHeader
          eyebrow="SMALL SIGNALS, BETTER DAYS"
          title="Analytics"
          description="A simple read on what’s getting done and where the team’s time is going."
        />
        <ErrorState
          message={error}
          onRetry={() => {
            setLoading(true);
            setReloadKey((key) => key + 1);
          }}
        />
      </>
    );

  const { stats, employees, completionRate } = data;
  const statusRows = [
    {
      name: "Completed",
      value: Number(stats.completedTasks || 0),
      color: "bar-green",
      icon: CheckCircle2,
    },
    {
      name: "In progress",
      value: Number(stats.inProgressTasks || 0),
      color: "bar-blue",
      icon: Clock3,
    },
    {
      name: "Pending",
      value: Number(stats.pendingTasks || 0),
      color: "bar-sand",
      icon: CircleDashed,
    },
  ];
  const maxEmployeeTasks = Math.max(
    ...employees.map((employee) => Number(employee.taskCount || 0)),
    1,
  );

  return (
    <>
      <PageHeader
        eyebrow="SMALL SIGNALS, BETTER DAYS"
        title="Analytics"
        description="A simple read on what’s getting done and where the team’s time is going."
      />
      <section className="stats-grid analytics-stats-grid">
        <StatCard
          label="Total tasks"
          value={stats.totalTasks}
          note="In your workspace"
          icon={ListTodo}
          tone="mint"
        />
        <StatCard
          label="Completed"
          value={stats.completedTasks}
          note="Work across the finish line"
          icon={CheckCircle2}
          tone="green"
        />
        <StatCard
          label="In progress"
          value={stats.inProgressTasks}
          note="Moving forward"
          icon={Clock3}
          tone="blue"
        />
        <StatCard
          label="Pending"
          value={stats.pendingTasks}
          note="Ready to begin"
          icon={CircleDashed}
          tone="sand"
        />
        <StatCard
          label="Overdue"
          value={stats.overdueTasks}
          note="Worth a check-in"
          icon={TriangleAlert}
          tone="coral"
        />
      </section>

      <section className="analytics-grid">
        <article className="panel completion-analytics">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">THE BIG PICTURE</p>
              <h2>Completion rate</h2>
            </div>
            <span className="panel-icon">
              <ArrowUpRight size={18} />
            </span>
          </div>
          <div className="analytics-rate">
            <strong>
              <AnimatedNumber value={completionRate} />
              <small>%</small>
            </strong>
            <span>of all tasks are complete</span>
          </div>
          <div className="progress-track progress-track-tall">
            <span style={{ width: `${completionRate}%` }} />
          </div>
          <div className="status-breakdown">
            {statusRows.map(({ name, value, color, icon: Icon }) => (
              <div className="status-breakdown-row" key={name}>
                <span className={`status-icon ${color}`}>
                  <Icon size={16} />
                </span>
                <span>{name}</span>
                <div className="breakdown-track">
                  <span
                    className={color}
                    style={{
                      width: `${stats.totalTasks ? (value / stats.totalTasks) * 100 : 0}%`,
                    }}
                  />
                </div>
                <strong>
                  <AnimatedNumber value={value} />
                </strong>
              </div>
            ))}
          </div>
        </article>

        <article className="panel employee-analytics">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">SHARED OWNERSHIP</p>
              <h2>Work by teammate</h2>
            </div>
            <span className="quiet-count">{employees.length} people</span>
          </div>
          {employees.length ? (
            <div className="employee-chart">
              {employees.map((employee) => {
                const taskCount = Number(employee.taskCount || 0);
                const completed = Number(employee.completedCount || 0);
                const width = taskCount
                  ? Math.max((taskCount / maxEmployeeTasks) * 100, 4)
                  : 0;
                return (
                  <div className="employee-chart-row" key={employee.id}>
                    <div className="employee-chart-head">
                      <span className="employee-chart-person">
                        <Avatar name={employee.name} size="small" />
                        <span>
                          <strong>{employee.name}</strong>
                          <small>{employee.role}</small>
                        </span>
                      </span>
                      <strong>
                        <AnimatedNumber value={taskCount} />
                        <small> tasks</small>
                      </strong>
                    </div>
                    <div className="employee-chart-track">
                      <span style={{ width: `${width}%` }} />
                      <i
                        style={{
                          left: `${taskCount ? (completed / maxEmployeeTasks) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <div className="employee-chart-caption">
                      <span>
                        <AnimatedNumber value={completed} /> completed
                      </span>
                      <span>
                        <AnimatedNumber
                          value={Number(employee.pendingCount || 0)}
                        />{" "}
                        pending
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="No team data yet"
              detail="Add teammates and assign tasks to see a workload breakdown."
            />
          )}
        </article>
      </section>
      <p className="analytics-note">
        Productivity reflects the current task list. Overdue work is counted
        when its deadline passes and it isn’t complete.
      </p>
    </>
  );
}
