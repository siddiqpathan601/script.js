const form = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
form.addEventListener("submit", function (e) {
  e.preventDefault();

  const taskText = taskInput.value.trim();
  if (taskText === "") return;

  addTask(taskText);
  taskInput.value = "";
});
function addTask(text) {
  const li = document.createElement("li");
  li.className =
    "flex justify-between items-center bg-gray-100 p-2 rounded-lg";

  li.innerHTML = `
    <span class="task-text">${text}</span>
    <button class="delete bg-red-600 text-white px-2 py-1 rounded hover:bg-red-600">
      Delete
    </button>
  `;

  taskList.appendChild(li);
}
taskList.addEventListener("click", function (e) {
  if (e.target.classList.contains("delete")) {
    e.target.parentElement.remove();
  } else if (e.target.classList.contains("task-text")) {
    e.target.classList.toggle("line-through");
    e.target.classList.toggle("text-gray-500");
  }
});
