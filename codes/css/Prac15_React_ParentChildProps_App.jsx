import React from 'react';
import Child from './Child';

function App() {
  function showMessage(message) {
    alert("Message from child: " + message);
  }

  return (
    <div>
      <h1>Parent Component</h1>
      <Child sendData={showMessage} />
    </div>
  );
}

export default App;
