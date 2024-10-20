import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Community from './components/Dashboard';
import Chat from './components/Chat'; // Make sure to import the Chat component

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route that redirects to /register */}
        <Route path="/" element={<Navigate to="/register" />} />
        
        {/* Define the routes for your app */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/community" element={<Community />} />
        
        {/* Add the missing chat route */}
        <Route path="/chat" element={<Chat />} />
      </Routes>
    </Router>
  );
}

export default App;
