import React from "react";

function App() {
  const fruits = ["apple", "Banana", "Mango", "Orange"];

  return (
    <div>
      <h2>Fruit List (Without Key)</h2>
      <ul>
        {fruits.map((fruit) => (
          <li>{fruit}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
