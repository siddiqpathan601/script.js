let conf = confirm("You must be 18 years old to view the content");

if (conf) {
  let myname = prompt("What is your name?", "");
  let age = Number(prompt("What is your age?", ""));

  if (age >= 60) {
    alert(`Sorry, ${myname}. You must be under 60`);
  } else if (age >= 18) {
    alert(`Welcome, ${myname}`);
  } else {
    alert(`Sorry, ${myname}. You must be 18 years old to see the content`);
  }
}
