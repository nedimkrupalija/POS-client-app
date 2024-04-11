import React, { useState,useEffect } from 'react';
import './Home.css';
import Cookies from 'js-cookie';
import Login from '../Login/Login';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
const Home = ({ children }) => {
    const [loggedIn, setLoggedIn] = useState(true);
    const [openSidebarToggle, setOpenSidebarToggle] = useState(false);

    const OpenSidebar = () => {
        setOpenSidebarToggle(!openSidebarToggle)
    }
    useEffect(() => {

        const jwtToken = Cookies.get('jwt');
        console.log(!!jwtToken);
    
        setLoggedIn(!!jwtToken);
      }, []);
      if(!loggedIn){
        return <Login/>
      }

    return (
        <div>
            <Header OpenSidebar={OpenSidebar}/>
            <Sidebar openSidebarToggle={openSidebarToggle} OpenSidebar={OpenSidebar}/>
            <div className="content">
                {children}
            </div>
        </div>
    );
};

export default Home;