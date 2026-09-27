CREATE DATABASE IF NOT EXISTS smallbiz_flow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smallbiz_flow;

CREATE TABLE IF NOT EXISTS employees (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  employee_id INT UNSIGNED NULL,
  priority ENUM('Low', 'Medium', 'High') NOT NULL DEFAULT 'Medium',
  status ENUM('Pending', 'In Progress', 'Completed') NOT NULL DEFAULT 'Pending',
  deadline DATE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tasks_employee FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  INDEX idx_tasks_status_deadline (status, deadline),
  INDEX idx_tasks_employee (employee_id)
);

INSERT INTO employees (id, name, email, role) VALUES
  (1, 'Rahul Sharma', 'rahul@smallbiz.demo', 'Sales'),
  (2, 'Priya Kapoor', 'priya@smallbiz.demo', 'Marketing'),
  (3, 'Amit Verma', 'amit@smallbiz.demo', 'Operations')
ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role);

INSERT INTO tasks (id, title, description, employee_id, priority, status, deadline) VALUES
  (1, 'Prepare Monthly Sales Report', 'Pull together this month’s sales figures and share the summary with the team.', 1, 'High', 'In Progress', DATE_ADD(CURDATE(), INTERVAL 2 DAY)),
  (2, 'Social Media Campaign', 'Plan and schedule the upcoming product launch posts.', 2, 'High', 'Pending', DATE_ADD(CURDATE(), INTERVAL 4 DAY)),
  (3, 'Inventory Check', 'Reconcile stock counts with the latest supplier deliveries.', 3, 'Medium', 'Pending', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
  (4, 'Client Follow-up', 'Check in with priority accounts and log next steps.', 1, 'Medium', 'Completed', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (5, 'Website Update', 'Refresh the seasonal offers and confirm links before publishing.', 2, 'Low', 'In Progress', DATE_ADD(CURDATE(), INTERVAL 1 DAY)),
  (6, 'Supplier Invoice Review', 'Verify outstanding supplier invoices against purchase orders.', 3, 'High', 'Pending', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
  (7, 'New Lead Outreach', 'Reach out to new enquiries received through the website.', 1, 'Medium', 'Completed', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
  (8, 'Weekly Team Check-in', 'Collect blockers and confirm priorities for the week.', 2, 'Low', 'Pending', DATE_ADD(CURDATE(), INTERVAL 3 DAY))
ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), employee_id = VALUES(employee_id), priority = VALUES(priority), status = VALUES(status), deadline = VALUES(deadline);