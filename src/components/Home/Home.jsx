import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <header id="meni">
        <div id='linkoviDiv'>
            <ul id="logolinkoviut">
                <li><a href='/'>Home</a></li>
            </ul>
        </div>
        <div id='logoutDiv'>
            <ul id="logout">
                <li><button>Logout</button></li>
            </ul>
        </div>
    </header>
  );
};

export default Home;