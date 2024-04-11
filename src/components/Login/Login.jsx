import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Home from '../Home/Home';
import personIcon from '../../assets/person.png';
import passIcon from '../../assets/password.png';
import errorIcon from '../../assets/error-icon-32.png';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const LOGIN_URL= 'http://localhost:3000/auth/login';
    const ROLE="user";
    const [loggedIn, setLoggedIn] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        
           fetch(LOGIN_URL,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body : JSON.stringify({
                username: username,
                password: pin,
                role: ROLE
           }
           )}
               
                
            ).then(response=>{
                if(response.ok){
                    return response.json();
                }
                else{
                    return response.json().then(data=>{
                        throw new Error(data.message);
                    });
                }
            }).then(data => {
                if (data.location && data.location.id) {
                    localStorage.setItem('locationId', data.location.id);
                }
                if (data.userId) {
                    localStorage.setItem('userId', data.userId);
                }
                const endOfToday = new Date();
                endOfToday.setHours(23, 59, 59, 999); 
                const expiresIn = Math.ceil((endOfToday.getTime() - Date.now()) / 1000); 
                   const token = data.token;

                    Cookies.set('jwt', token,{ expires: expiresIn,path: '/' });
                setLoggedIn(true);
            }).catch(error => {
                console.log(error);
                setErrorMessage(error.message);
            });
        
         
        
    };
if(loggedIn){
return <Home />;
}

const handleManagerApp = () => {
    Cookies.remove('jwt');
    window.location.href = "https://pos-staff-app-tim56.vercel.app/";
}

    return (
        <div className="container">
            <div className="header">
                <div className="text">Login</div>
                <div className="underline"></div>
            </div>

            {errorMessage && (
                <div className="error-message">
                    <img src={errorIcon} alt="error" className="error-icon" />
                    <span>{errorMessage}</span>
                </div>
            )}

            <div className="inputs">
                <div className="input">
                    <img src={personIcon} alt="" />
                    <input
                        type="email"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                </div>

                <div className="input">
                    <img src={passIcon} alt="" />
                    <input
                        type="password"
                        placeholder="PIN"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                    />
                </div>
            </div>

            <div className="submit-container">
                <div className="submit" onClick={handleLogin}>Log in</div>
            </div>

            <div className='admin'> 
            <span onClick={handleManagerApp}>Log in as admin </span> 
            </div>
            
        </div>
    );
};

export default Login;
