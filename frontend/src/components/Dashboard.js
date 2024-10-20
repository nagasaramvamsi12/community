import React from 'react';
import Chat from './Chat';  // Import the Chat component

function Dashboard() {
  return (
    <div>
      <h1>Community Dashboard</h1>
      <Chat />  {/* Include the Chat component */}
    </div>
  );
}

export default Dashboard;
