// getElementById usage
const taskForm = document.getElementById("task-form");
const taskName = document.getElementById("task-name");
const taskCategory = document.getElementById("task-category");
const taskDue = document.getElementById("task-due");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");
const counterBadge = document.getElementById("counter-badge");
const totalCount = document.getElementById("total-count");
const doneCount = document.getElementById("done-count");
const flash = document.getElementById("flash");
const filter = document.getElementById("filter");

// querySelector / querySelectorAll usage
const taskTemplate = document.querySelector("#task-template");
const priorityRadios = document.querySelectorAll('input[name="priority"]');

// sibling navigation (error is the *next* element after #task-name)
const nameError = taskName.nextElementSibling;

// Keep date min at today  (also demonstrates attribute modification)
function setMinDateToday() {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(d.getDate()).padStart(2, "0")}`;
  if (taskDue) taskDue.min = date;
}

// Get selected priority
function getCheckedPriority() {
  const el = document.querySelector('input[name="priority"]:checked');
  return el ? el.value : null;
}

// Flash helper (uses setTimeout from BOM)
function showFlash(message, ms = 1500) {
  flash.textContent = message;
  flash.hidden = false;
  setTimeout(() => {
    flash.hidden = true;
    flash.textContent = "";
  }, ms);
}

// Counter badge updater (modifies text content)
function updateCounter() {
  const total = taskList.querySelectorAll("li.task").length;
  const done = taskList.querySelectorAll("li.task.completed").length;
  totalCount.textContent = String(total);
  doneCount.textContent = String(done);
}

// Empty state creator (uses createElement and append/remove)
function ensureEmptyState() {
  const hasTasks = !!taskList.querySelector("li.task");
  let emptyStateEl = taskList.querySelector("#empty-state");

  if (!hasTasks) {
    if (!emptyStateEl) {
      emptyStateEl = document.createElement("li");
      emptyStateEl.id = "empty-state";
      emptyStateEl.className = "muted";
      emptyStateEl.textContent = "You have no tasks yet.";
      //appendChild / prepend (append here)
      taskList.appendChild(emptyStateEl);
    }
  } else {
    if (emptyStateEl) emptyStateEl.remove();
  }
}

// Completed state toggler (class + attribute + button label)
function setCompletedState(li, completed) {
  if (!li || !li.classList || !li.classList.contains("task")) return;
  li.classList.toggle("completed", Boolean(completed));
  const btn = li.querySelector(".btn-done");
  if (btn) btn.textContent = completed ? "Undo" : "Done";
  updateCounter();
}

// Category filter (iterate over a NodeList, toggle visibility)
function applyFilter() {
  const selected = filter.value; // "All" | "Work" | "Personal" | "School"
  const items = taskList.querySelectorAll("li.task");

  for (const li of items) {
    const cat = li.getAttribute("data-category") || "";
    const shouldShow = selected === "All" || cat === selected;
    li.style.display = shouldShow ? "" : "none";
  }
}

// Validation (DOM event-based; toggles error visibility and button disabled)
function updateNameValidity() {
  const value = taskName.value.trim();
  const hasText = value.length > 0;
  const isValid = value.length >= 3; // mirrors minlength="3"

  if (isValid) {
    addBtn.removeAttribute("disabled");
  } else {
    addBtn.setAttribute("disabled", "");
  }

  if (!hasText) {
    nameError.textContent = "";
    nameError.classList.remove("error-visible");
  } else if (!isValid) {
    nameError.textContent = "Please enter at least 3 characters.";
    nameError.classList.add("error-visible");
  } else {
    nameError.textContent = "";
    nameError.classList.remove("error-visible");
  }
}

// Form submit → add task (clone template, prepend, flash, reset, counters)
taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Re-check validity; block if invalid
  updateNameValidity();
  if (addBtn.hasAttribute("disabled")) {
    console.log("submit blocked: name invalid");
    return;
  }

  if (
    typeof taskForm.reportValidity === "function" &&
    !taskForm.reportValidity()
  ) {
    return;
  }

  // Collect values
  const name = taskName.value.trim();
  const category = taskCategory.value;
  const priority = getCheckedPriority() || "Med";
  const due = taskDue.value;

  // Clone from template
  const frag = taskTemplate.content.cloneNode(true);
  const newTask = frag.querySelector(".task");

  // Fill text
  frag.querySelector(".title").textContent = name; // [R8]
  frag.querySelector(".badge.category").textContent = category; // [R8]
  frag.querySelector(".badge.priority").textContent = priority; // [R8]

  const dueSpan = frag.querySelector(".due");
  if (due) {
    dueSpan.textContent = `Due: ${due}`; // [R8]
    // Overdue if due < today (string compare ok for ISO yyyy-mm-dd)
    if (taskDue.min && due < taskDue.min) {
      dueSpan.classList.add("overdue"); // [R9]
    }
  } else {
    dueSpan.textContent = "";
  }

  // Attributes for filtering / tooltip
  newTask.setAttribute("data-category", category); // [R10]
  newTask.setAttribute("title", `${priority} priority`); // [R10]
  newTask.setAttribute("aria-checked", "false"); // [R10]

  // Insert at top
  taskList.prepend(newTask);

  // Initialize completed state explicitly (keeps label correct)
  setCompletedState(newTask, false);

  // Flash + counter + empty-state + respect current filter
  showFlash("Task added!"); // [R12]
  updateCounter(); // [R8]
  ensureEmptyState();
  applyFilter();

  // Reset form and validation state
  taskForm.reset();
  const med = document.getElementById("p-med");
  if (med) med.checked = true;
  updateNameValidity();
});

// Delegated Done/Delete actions (parentNode navigation + confirm)
taskList.addEventListener("click", (event) => {
  const btn = event.target.closest("button");
  if (!btn) return;

  // explicit parent navigation
  const li = btn.parentNode;
  if (!li || !li.classList || !li.classList.contains("task")) return;

  if (btn.classList.contains("btn-delete")) {
    const ok = confirm("Delete this task?"); // [R12]
    if (!ok) return;
    li.remove();
    updateCounter();
    ensureEmptyState();
    showFlash("Task deleted");
    return;
  }

  if (btn.classList.contains("btn-done")) {
    const completed = li.classList.contains("completed");
    setCompletedState(li, !completed); // toggles class/aria/label + counter
    showFlash(!completed ? "Task completed" : "Task restored");
  }
});

// Filter change → iterate and show/hide
filter.addEventListener("change", () => {
  applyFilter();
});

// Name input → live validation
taskName.addEventListener("input", updateNameValidity);

setMinDateToday(); // sets date min to today
updateNameValidity(); // starts with button disabled + error hidden
ensureEmptyState(); // show empty message initially
applyFilter(); // respect current filter (defaults to All)
updateCounter(); // initialize counter
