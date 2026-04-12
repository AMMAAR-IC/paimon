import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>
        <h2>Counter Value: {count}</h2>
        <button onClick={() => setCount(count + 1)}>Increment</button>
        <button onClick={() => setCount(count - 1)}>Decrement</button>
      </div>
    </>
  );
}

export default App;
