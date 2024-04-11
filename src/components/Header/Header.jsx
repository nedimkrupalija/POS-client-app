import React, { useState } from 'react';
import './Header.css';
import Cookies from 'js-cookie';
import Login from '../Login/Login';

const Header = () => {
    const [loggedIn, setLoggedIn] = useState(true);

    const handleLogout = () => {
        const assignedTableIds = localStorage.getItem('assignedTableIds');
        if (assignedTableIds) {
            const assignedTableIdsArray = JSON.parse(assignedTableIds);
            if (assignedTableIdsArray.length > 0) {
                const token = Cookies.get("jwt");
                const headers = {
                    Authorization: token,
                    'Content-Type': 'application/json'
                };
                const requestBody = {
                    tables: assignedTableIdsArray
                };
                fetch('http://localhost:3000/user/tables', {
                    method: 'DELETE',
                    headers: headers,
                    body: JSON.stringify(requestBody)
                })
                    .then(response => {
                        if (response.ok) {
                            localStorage.removeItem('assignedTableIds');
                        } else {
                            console.error('Error unassigning tables:', response.statusText);
                        }
                    })
                    .catch(error => {
                        console.error('Error unassigning tables:', error);
                    });
            }
        }

        Cookies.remove('jwt');
        setLoggedIn(false);
        window.location.reload();
    };
    if (!loggedIn) {
        return <Login />;
    }
  return (
<div className="button-container">
            <button onClick={handleLogout}>Log out</button>
        </div>       
  )
}

export default Header