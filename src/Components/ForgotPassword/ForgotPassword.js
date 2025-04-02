import React from 'react'

export const ForgotPassword = () => {
  console.log("ForgotPassword component rendered");
  return (
    <div className='container'>
        <form>
            <h1>Forgot Password</h1>
    <div className='form-box'>
        <label>Email</label>
        <input type='email' placeholder='Enter your email' required/>
    </div>
    <button type='submit' className='login-button'>Submit</button>
        </form>

    </div>
  )
}
export default ForgotPassword;