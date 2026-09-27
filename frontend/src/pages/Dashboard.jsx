import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ListTodo,
  Plus,
  TrendingUp,
  TriangleAlert,
  UsersRound,
} from "lucide-react";
import { api, formatDate } from "../lib/api";
import {
  AnimatedNumber,
  Avatar,
  EmptyState,
  ErrorState,
  LoadingState,
  PageHeader,
  StatCard,
  TaskLine,
} from "../components/ui";

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    api("/dashboard")
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

  if (loading) return <LoadingState />;
  if (error)
    return (
      <>
        <PageHeader
          eyebrow="YOUR BUSINESS, IN RHYTHM"
          title="Good morning."
          description="Here’s what’s moving across your team today."
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

  const {
    stats,
    recentTasks,
    upcomingDeadlines,
    overdueTasks,
    employees,
    completionRate,
  } = data;
  const statCards = [
    {
      label: "Total tasks",
      value: stats.totalTasks,
      note: "In your workspace",
      icon: ListTodo,
      tone: "mint",
    },
    {
      label: "Pending",
      value: stats.pendingTasks,
      note: "Ready to pick up",
      icon: CircleDashed,
      tone: "sand",
    },
    {
      label: "In progress",
      value: stats.inProgressTasks,
      note: "Being worked on",
      icon: Clock3,
      tone: "blue",
    },
    {
      label: "Completed",
      value: stats.completedTasks,
      note: "Across your team",
      icon: CheckCircle2,
      tone: "lavender",
    },
    {
      label: "Overdue",
      value: stats.overdueTasks,
      note: "Needs attention",
      icon: TriangleAlert,
      tone: "coral",
    },
    {
      label: "Team members",
      value: stats.totalEmployees,
      note: "On your team",
      icon: UsersRound,
      tone: "green",
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow="MONDAY, MADE MANAGEABLE"
        title="Good morning."
        description="Here’s what’s moving across your team today."
        action={
          <Link to="/tasks" className="button button-primary">
            <Plus size={17} />
            New task
          </Link>
        }
      />
      <section className="stats-grid" aria-label="Workspace task statistics">
        {statCards.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </section>

      <section className="dashboard-grid dashboard-grid-main">
        <article className="panel recent-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">THE LATEST</p>
              <h2>Recent tasks</h2>
            </div>
            <Link className="text-link" to="/tasks">
              All tasks
              <ArrowRight size={15} />
            </Link>
          </div>
          <div className="task-list">
            {recentTasks.length ? (
              recentTasks.map((task) => <TaskLine key={task.id} task={task} />)
            ) : (
              <EmptyState
                title="Nothing on the board yet"
                detail="Add the first task to get your team in rhythm."
                action={
                  <Link
                    to="/tasks"
                    className="button button-primary button-small"
                  >
                    Create a task
                  </Link>
                }
              />
            )}
          </div>
        </article>

        <article className="panel progress-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">A LITTLE MOMENTUM</p>
              <h2>Work in motion</h2>
            </div>
            <span className="panel-icon">
              <TrendingUp size={18} />
            </span>
          </div>
          <div className="completion-block">
            <div
              className="completion-ring"
              style={{ "--completion-target": `${completionRate}%` }}
            >
              <span>
                <AnimatedNumber value={completionRate} />
                <small>%</small>
              </span>
            </div>
            <div className="completion-copy">
              <strong>Tasks completed</strong>
              <span>
                {stats.completedTasks} of {stats.totalTasks} tasks are done
              </span>
            </div>
          </div>
          <div className="progress-track">
            <span style={{ width: `${completionRate}%` }} />
          </div>
          <div className="progress-foot">
            <span>Completion rate</span>
            <strong>{completionRate}%</strong>
          </div>
          <div className="mini-stat-row">
            <div>
              <span className="mini-stat-dot dot-mint" />
              <span>On track</span>
              <strong>
                {Math.max(stats.totalTasks - stats.overdueTasks, 0)}
              </strong>
            </div>
            <div>
              <span className="mini-stat-dot dot-coral" />
              <span>Overdue</span>
              <strong>{stats.overdueTasks}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="dashboard-grid dashboard-grid-lower">
        <article className="panel deadlines-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">COMING UP</p>
              <h2>Upcoming deadlines</h2>
            </div>
            <span className="quiet-count">{upcomingDeadlines.length} soon</span>
          </div>
          {upcomingDeadlines.length ? (
            <div className="deadline-list">
              {upcomingDeadlines.map((task) => (
                <div className="deadline-row" key={task.id}>
                  <div className="deadline-date">
                    <span>
                      {formatDate(task.deadline, {
                        month: "short",
                      }).toUpperCase()}
                    </span>
                    <strong>
                      {formatDate(task.deadline, { day: "2-digit" })}
                    </strong>
                  </div>
                  <div className="deadline-copy">
                    <strong>{task.title}</strong>
                    <span>{task.employeeName || "Unassigned"}</span>
                  </div>
                  <span
                    className={`priority priority-${task.priority.toLowerCase()}`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Clear skies ahead"
              detail="No upcoming deadlines for now."
            />
          )}
        </article>

        <article className="panel team-summary-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">GOOD WORK, TOGETHER</p>
              <h2>Team pulse</h2>
            </div>
            <Link to="/team" className="icon-link" aria-label="View team">
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {employees.length ? (
            <div className="team-pulse-list">
              {employees.map((employee) => {
                const progress = Number(employee.taskCount)
                  ? Math.round(
                      (Number(employee.completedCount) /
                        Number(employee.taskCount)) *
                        100,
                    )
                  : 0;
                return (
                  <div className="team-pulse-row" key={employee.id}>
                    <Avatar name={employee.name} />
                    <div className="team-pulse-copy">
                      <div className="team-pulse-label">
                        <strong>{employee.name}</strong>
                        <span>
                          <AnimatedNumber
                            value={Number(employee.completedCount)}
                          />
                          /
                          <AnimatedNumber
                            value={Number(employee.taskCount)}
                          />{" "}
                          complete
                        </span>
                      </div>
                      <div className="progress-track progress-track-small">
                        <span style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                    <span className="team-pulse-percent">
                      <AnimatedNumber value={progress} />%
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="Your team is waiting"
              detail="Add a teammate to share the workload."
            />
          )}
          <Link to="/team" className="text-link team-link">
            Meet the team
            <ArrowRight size={15} />
          </Link>
        </article>
      </section>

      {overdueTasks.length > 0 && (
        <section className="attention-strip">
          <span className="attention-symbol">
            <TriangleAlert size={17} />
          </span>
          <div>
            <strong>
              {overdueTasks.length} task{overdueTasks.length === 1 ? "" : "s"}{" "}
              past deadline
            </strong>
            <span>
              {overdueTasks
                .slice(0, 2)
                .map((task) => task.title)
                .join(" · ")}
            </span>
          </div>
          <Link to="/tasks?overdue=true" className="text-link">
            Review
            <ArrowRight size={15} />
          </Link>
        </section>
      )}
    </>
  );
}
