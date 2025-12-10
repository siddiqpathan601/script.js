// Toast Module (Closure)
const Toast = (() => {
  const t = document.getElementById("toast");

  const show = (msg) => {
    t.innerText = msg;
    t.style.opacity = "1";
    setTimeout(() => (t.style.opacity = "0"), 1800);
  };

  return { show };
})();


// Todo App Module (Closure)
const TodoApp = (() => {
  const input = document.getElementById("todoInput");
  const list = document.getElementById("todoList");
  const addBtn = document.getElementById("addBtn");
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");

  // ADD TASK
  const addTask = () => {
    const value = input.value.trim();
    if (!value) return Toast.show("Please enter a task!");

    const li = document.createElement("li");
    li.className =
      "p-4 bg-gray-100 border rounded-xl shadow-sm flex justify-between items-center hover:bg-gray-200 transition duration-200";

    li.innerHTML = `
      <div class="flex items-center gap-3">
        <input type="checkbox" class="checkBox w-5 h-5 accent-blue-600 cursor-pointer" />
        <span class="taskText text-gray-800 font-medium">${value}</span>
      </div>

      <button class="deleteBtn px-3 py-1 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
        Delete
      </button>
    `;

    list.appendChild(li);
    input.value = "";
    Toast.show("Task Added!");
    updateProgress();
  };

  // DELETE TASK
  const deleteTask = (e) => {
    if (e.target.classList.contains("deleteBtn")) {
      const item = e.target.closest("li");

      // Smooth animation
      item.style.transform = "scale(0.8)";
      item.style.opacity = "0";
      item.style.transition = "0.25s";

      setTimeout(() => item.remove(), 250);

      Toast.show("Task Deleted!");
      updateProgress();
    }
  };

  // COMPLETE TASK
  const completeTask = (e) => {
    if (e.target.classList.contains("checkBox")) {
      const text = e.target.closest("li").querySelector(".taskText");

      if (e.target.checked) {
        text.classList.add("line-through", "text-green-600");
        Toast.show("Task Completed!");
      } else {
        text.classList.remove("line-through", "text-green-600");
      }

      updateProgress();
    }
  };

  // UPDATE PROGRESS
  const updateProgress = () => {
    const tasks = document.querySelectorAll("#todoList li").length;
    const completed = document.querySelectorAll(".checkBox:checked").length;

    const percent = tasks === 0 ? 0 : Math.round((completed / tasks) * 100);

    progressText.textContent = percent + "%";
    progressBar.style.width = percent + "%";
  };

  // EVENT LISTENERS
  addBtn.addEventListener("click", addTask);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addTask();
  });

  list.addEventListener("click", deleteTask);
  list.addEventListener("change", completeTask);
})();
