const form = document.getElementById("todoForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");

// When user submits a task
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = taskInput.value.trim();
  if (!text) return;

  addTask(text);
  taskInput.value = "";
});

// Add task to list
function addTask(text) {
  const li = document.createElement("li");
  li.className = "bg-gray-100 p-3 rounded flex justify-between items-center";

  // Current time
  const time = new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  li.innerHTML = `
    <div>
      <div class="font-medium">${text}</div>
      <div class="text-xs text-gray-500">Added at: ${time}</div>
    </div>

    <button class="delete bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
      Delete
    </button>
  `;

  // Delete button logic
  li.querySelector(".delete").addEventListener("click", () => {
    li.remove();
  });

  taskList.appendChild(li);
}
