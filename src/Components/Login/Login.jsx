import React from 'react'
import './Login.css'
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from 'react-router-dom'; 
export const Login = () => {
    console.log("Login component rendered");
  return (
    <div className='wrapper'>
        <div className="form-box login">
            <form action="">
                <h1>Login</h1>
                <div className="input-box">
                    <input type="text" 
                    placeholder='Username' required />
                    <FaUser className='icon'/>
                </div>
                <div className="input-box">
                    <input type="password" 
                    placeholder='Password' required />
                    <FaLock className='icon'/>
                </div>
                <div className="remember-forgot">
                    <label><input type="checkbox" />
                    Remember me 
                    </label>
                    <Link to="/forgot-password">Forgot password?</Link>

                </div>

                <button type="submit">Login</button>
            </form>
        </div>
    </div>
  )
}
