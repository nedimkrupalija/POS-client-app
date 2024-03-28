import Login from './components/Login/Login.jsx'
import Home from './components/Home/Home.jsx'
import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const jwtToken = Cookies.get('jwt'); 
    setIsLoggedIn(!!jwtToken); 
  }, []);
  return (
      <div>
        {isLoggedIn ? <Home /> : <Login />}     </div>
  )
  }
export default App
