import React from 'react';
import './Home.css';
import Login from '../Login/Login';


const Home = () => {
        const [loggedIn, setLoggedIn] = useState(true);

    const handleLogout = () => {
    Cookies.remove('jwt');
    setLoggedIn(false);

};
if (!loggedIn) {
    return <Login />;
}
  return (
    <header id="meni">
        <div id='linkoviDiv'>
            <ul id="logolinkoviut">
                <li><a href='/'>Home</a></li>
            </ul>
        </div>
        <div id='logoutDiv'>
            <ul id="logout">
                <li><button onClick={handleLogout}>Logout</button></li>
            </ul>
        </div>
    </header>
  );
};

export default Home;