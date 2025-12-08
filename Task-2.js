document.getElementById("userForm").addEventListener("submit", function (e) {
  e.preventDefault();

  let name = document.getElementById("name").value;
  let age = document.getElementById("age").value;
  let gender = document.getElementById("gender").value;

  alert("Welcome to the page, " + name + "!");

  console.log("User Details:");
  console.log("Name:", name);
  console.log("Age:", age);
  console.log("Gender:", gender);

  // Clear fields
  document.getElementById("userForm").reset();
});
