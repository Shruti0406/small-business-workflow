export function asyncRoute(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function notFound(response, message = "Record not found.") {
  response.status(404).json({ error: message });
}

export function validateTask(body) {
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const description =
    typeof body.description === "string" ? body.description.trim() : "";
  const employeeId =
    body.employeeId === "" || body.employeeId == null
      ? null
      : Number(body.employeeId);
  if (!title || title.length > 160)
    return "Title is required and must be under 160 characters.";
  if (description.length > 4000)
    return "Description must be under 4,000 characters.";
  if (!["Low", "Medium", "High"].includes(body.priority))
    return "Choose a valid priority.";
  if (!["Pending", "In Progress", "Completed"].includes(body.status))
    return "Choose a valid status.";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(body.deadline || "")))
    return "Choose a valid deadline.";
  if (employeeId !== null && (!Number.isInteger(employeeId) || employeeId < 1))
    return "Choose a valid employee.";
  return {
    title,
    description,
    priority: body.priority,
    status: body.status,
    deadline: body.deadline,
    employeeId,
  };
}

export function validateEmployee(body) {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = typeof body.role === "string" ? body.role.trim() : "";
  if (!name || name.length > 100)
    return "Name is required and must be under 100 characters.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 190)
    return "Enter a valid email address.";
  if (!role || role.length > 100)
    return "Role or department is required and must be under 100 characters.";
  return { name, email, role };
}
