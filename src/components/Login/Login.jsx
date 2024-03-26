import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Home from '../Home/Home';
import personIcon from '../../assets/person.png';
import passIcon from '../../assets/password.png';
import errorIcon from '../../assets/error-icon-32.png';
import './Login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const LOGIN_URL= 'http://localhost:3000/auth/login';
    const ROLE="user";
    const [loggedIn, setLoggedIn] = useState(false);

    const handleLogin = async (event) => {
        event.preventDefault();
        if (!email || !password) {
            setErrorMessage('Molimo unesite email i lozinku.');
            return;
        }

        try {
           axios.post(
                LOGIN_URL,
                {
                    username: email,
                    password: password,
                    role: ROLE
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                }
            ).then(response=>{
                   const token = response.data.token;
            Cookies.set('jwt', token);
setLoggedIn(true);
            }).catch(error=>{
            setErrorMessage('Pogrešno korisničko ime ili lozinka.');
                
            });

         
        } catch (error) {
            //console.error(error);
            setErrorMessage('Pogrešno korisničko ime ili lozinka.');
        }
    };
if(loggedIn){
return <Home />;
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
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="input">
                    <img src={passIcon} alt="" />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
            </div>

            <div className="submit-container">
                <div className="submit" onClick={handleLogin}>Login</div>
            </div>
        </div>
    );
};

export default Login;
