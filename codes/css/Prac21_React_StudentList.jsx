import React from "react";

function App() {
  const students = ["Ali", "Mohd", "Ayaan", "Aman"];

  return (
    <div>
      <h2>Student List</h2>
      <ul>
        {students.map((name, index) => (
          <li key={index}>{name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
