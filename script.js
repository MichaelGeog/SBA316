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
