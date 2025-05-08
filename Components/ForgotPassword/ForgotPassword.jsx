import { sendPasswordResetEmail } from "firebase/auth";
import React from "react";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import "./ForgotPassword.css"

function ForgotPassword() {
    const history = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailVal = e.target.email.value;
        sendPasswordResetEmail(auth, emailVal)  // Use 'auth' here
            .then(() => {
                alert("Check your Gmail");
                history("/");
            })
            .catch((err) => {
                alert(err.code);
            });
    };

    return (
        <div className="App">
            <h1>Forgot Password</h1>
            <form onSubmit={handleSubmit}>
                <input name="email" placeholder="Enter your email" required /><br /><br />
                <button type="submit">Reset</button>
            </form>
        </div>
    );
}

export default ForgotPassword;