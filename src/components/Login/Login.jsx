import React from 'react';
import './Login.css'

import email_icon from '../../assets/email.png'
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
                <img src={email_icon} alt=""/>
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






//-------//

// LoginForm.js

// LoginForm.js
// home/index.js
// home/index.js
/*
import React from 'react';

const Login = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: '300px', padding: '20px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', margin: 'auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Login</h2>
        <div style={{ marginBottom: '15px' }}>
          <input
            type="email"
            placeholder="Email"
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '20px' }}>
          <input
            type="password"
            placeholder="Password"
            style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' }}
            required
          />
        </div>
        <button type="submit" style={{ width: '100%', padding: '10px', fontSize: '16px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Login
        </button>
      </div>
    </div>
  );
};


export default Login;
*/