import React from 'react';
import './style.css';

function InlineStyle() {
  const headingstyle = {
    color: 'blue',
    backgroundColor: 'lightgray',
    padding: '10px',
    textAlign: 'center'
  };

  return (
    <div>
      <h1 style={headingstyle}>Inline Style</h1>
      <h2 className='External'>This is an example of inline styling in React.</h2>
    </div>
  );
}

export default InlineStyle;
