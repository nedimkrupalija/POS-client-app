import React from 'react';
import './Login.css'

import person_icon from '../../assets/person.png'
import pass_icon from '../../assets/password.png' 

const Login = () => {
    return(
        <div className="container">
            <div className="header">
                <div className="text">Log in</div>
                <div className="underline"></div>
            </div>
             <div className="inputs">

                <div className="input">
                <img src={person_icon} alt=""/>
                <input type="email" placeholder='Email'/>
                </div> 

                <div className="input">
                <img src={pass_icon} alt=""/>
                <input type="password" placeholder='Password'/>
                </div> 
             </div>

            <div className="submit-container">
                <div className="submit">Login</div>
            </div>

        </div>
    )
}

export default Login