// === Cache (getElementById) ===
const taskForm = document.getElementById("task-form");
const taskName = document.getElementById("task-name");
const taskCategory = document.getElementById("task-category");
const taskDue = document.getElementById("task-due");
const addBtn = document.getElementById("add-btn");
const taskList = document.getElementById("task-list");

const counterBadge = document.getElementById("counter-badge");
const totalCount = document.getElementById("total-count"); // NEW
const doneCount = document.getElementById("done-count"); // NEW

const flash = document.getElementById("flash");
const filter = document.getElementById("filter");

// === Cache (querySelector / querySelectorAll) ===
const taskTemplate = document.querySelector("#task-template"); // template element
const priorityRadios = document.querySelectorAll('input[name="priority"]');

// === Cache (nextElementSibling) which is the error because its after #task-name
const nameError = taskName.nextElementSibling;

(function setMinDate() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const iso = `${yyyy}-${mm}-${dd}`;
  if (taskDue) taskDue.min = iso;
})();

function updateNameValidity() {
  const value = taskName.value.trim();
  const hasText = value.length > 0;
  const isValid = value.length >= 3; // mirrors minlength="3"

  // Button state: enabled only when valid
  if (isValid) {
    addBtn.removeAttribute("disabled");
  } else {
    addBtn.setAttribute("disabled", "");
  }

  // Error visibility:
  // - Empty field => hide error (no nagging)
  // - Has text but <3 chars => show error
  // - Valid => hide error
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

taskName.addEventListener("input", updateNameValidity);

updateNameValidity();

function getCheckedPriority() {
  const el = document.querySelector('input[name="priority"]:checked');
  return el ? el.value : null;
}

function updateCounter() {
  const total = taskList.querySelectorAll("li.task").length;
  const done = taskList.querySelectorAll("li.task.completed").length;
  totalCount.textContent = String(total);
  doneCount.textContent = String(done);
}

function showFlash(message, ms = 1500) {
  flash.textContent = message;
  flash.hidden = false;
  setTimeout(() => {
    flash.hidden = true;
    flash.textContent = "";
  }, ms);
}

let emptyStateEl = null;

function ensureEmptyState() {
  const hasTasks = !!taskList.querySelector("li.task");

  // Create the element once
  if (!emptyStateEl) {
    emptyStateEl = document.createElement("li"); // keep it inside the <ul>
    emptyStateEl.id = "empty-state";
    emptyStateEl.className = "muted";
    emptyStateEl.textContent = "You have no tasks yet.";
  }

  if (!hasTasks) {
    // Show it if it's not in the DOM
    if (!taskList.querySelector("#empty-state")) {
      taskList.appendChild(emptyStateEl);
    }
  } else {
    // Remove it if tasks exist
    const existing = taskList.querySelector("#empty-state");
    if (existing) existing.remove();
  }
}

ensureEmptyState();

function setCompletedState(li, completed) {
  if (!li || !li.classList || !li.classList.contains("task")) return;

  // 1) Visual state
  li.classList.toggle("completed", Boolean(completed));

  // 2) Accessibility/state attribute (optional but nice)
  li.setAttribute("aria-checked", completed ? "true" : "false");

  // 3) Button label swap
  const btn = li.querySelector(".btn-done");
  if (btn) btn.textContent = completed ? "Undo" : "Done";

  // 4) Recompute counters
  updateCounter();
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // re-check name validity; if invalid, stop
  updateNameValidity();
  if (addBtn.hasAttribute("disabled")) {
    console.log("submit blocked: name invalid");
    return;
  }

  // 1) Collect values
  const name = taskName.value.trim();
  const category = taskCategory.value;
  const priority = getCheckedPriority() || "Med";
  const due = taskDue.value; // may be ""

  // 2) Clone template and get the <li>
  const frag = taskTemplate.content.cloneNode(true);
  const newTask = frag.querySelector(".task");

  // 3) Fill text
  frag.querySelector(".title").textContent = name;
  frag.querySelector(".badge.category").textContent = category;
  frag.querySelector(".badge.priority").textContent = priority;

  const dueSpan = frag.querySelector(".due");
  if (due) {
    dueSpan.textContent = `Due: ${due}`;
    // overdue check: ISO yyyy-mm-dd string compare is fine vs today's min
    if (taskDue.min && due < taskDue.min) {
      dueSpan.classList.add("overdue");
    }
  } else {
    dueSpan.textContent = ""; // no due date shown
  }

  // 4) Attributes for filtering / tooltip
  newTask.setAttribute("data-category", category);
  newTask.setAttribute("title", `${priority} priority`);

  setCompletedState(newTask, false);

  // 5) Insert at top
  taskList.prepend(newTask);

  // 6) Flash + Counter
  showFlash("Task added!");
  updateCounter();

  ensureEmptyState();

  // 7) Reset form and validation state
  taskForm.reset();
  const med = document.getElementById("p-med");
  if (med) med.checked = true;
  updateNameValidity();
});

// Fix the filter listener (just a placeholder for now; real filtering in Step 10)
filter.addEventListener("change", (event) => {
  console.log("filter change:", event.target.value);
});
