import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig"; // Import Firebase auth & Firestore
import "./Login.css";
import { FaUser, FaLock } from "react-icons/fa";
import { Link } from "react-router-dom";
// import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export const Login = () => {
    const [text, setText] = useState("");
    const [isAdmin, setIsAdmin] = useState(false);
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const welcome = "Teerna Railway Concession Portal";
    const speed = 100;

    useEffect(() => {
        let index = 0;
        setText("");
        const interval = setInterval(() => {
            if (index < welcome.length) {
                setText((prev) => prev + welcome.charAt(index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, []);

    // Toggle between Admin and Student login
    const toggleRole = () => {
        setIsAdmin((prev) => !prev);
    };

    // Handle login
    const handleLogin = async (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
    
        try {
            // Authenticate user with Firebase Auth
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Fetch user role from Firestore
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
    
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.role === "admin") {
                    navigate("/admin"); // Redirect Admin to /admin
                } else {
                    navigate("/student"); // Redirect Student to /student
                }
            } else {
                setError("No user data found. Please contact support.");
            }
        } catch (error) {
            setError("Invalid email or password. Please try again.");
        }
    };

    // const handleGoogleSignIn = async () => {
    //     const provider = new GoogleAuthProvider();
    //     try {
    //         const result = await signInWithPopup(auth, provider);
    //         const user = result.user;
    
    //         // Optional: Fetch user role from Firestore, or create if new
    //         const userDocRef = doc(db, "users", user.uid);
    //         const userDocSnap = await getDoc(userDocRef);
    
    //         if (userDocSnap.exists()) {
    //             const userData = userDocSnap.data();
    //             if (userData.role === "admin") {
    //                 navigate("/admin");
    //             } else {
    //                 navigate("/student");
    //             }
    //         } else {
    //             // If no role exists, assume student by default or prompt role setup
    //             navigate("/student");
    //         }
    //     } catch (error) {
    //         console.error("Google sign-in error:", error.message);
    //         setError("Google sign-in failed. Try again.");
    //     }
    // };
    

    //Handle forgotpass
   /* const handleForgotPassword = async () => {
        if (!email) {
            alert("⚠️ Please enter your email address.");
            return;
        }
    
        try {
            await sendPasswordResetEmail(auth, email);
            alert("✅ Password reset email sent! Check your inbox.");
        } catch (error) {
            alert("⚠️ " + error.message);
        }
    };*/

    return (
        <div className="login-container">
            <h2 className="welcome-text">{text}</h2>

            <div className="wrapper">
                <div className="form-box login">
                    <form onSubmit={handleLogin}>
                        <h1>{isAdmin ? "Admin Login" : "Student Login"}</h1>

                        <div className="toggle-box">
                            <button type="button" className="toggle-btn" onClick={toggleRole}>
                                Switch to {isAdmin ? "Student" : "Admin"}
                            </button>
                        </div>

                        <div className="input-box">
                            <input
                                type="email"
                                placeholder="Email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <FaUser className="icon" />
                        </div>

                        <div className="input-box">
                            <input
                                type="password"
                                placeholder="Password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <FaLock className="icon" />
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        {/* <div className="remember-forgot">
                            <p onClick={handleForgotPassword} className="forgot-link">
                                Forgot password?
                            </p>
                        </div> */}

                        <div className="remember-forgot">
                            <Link to="/forgot-password">Forgot password?</Link>
                        </div>

                        <button type="submit">Login as {isAdmin ? "Admin" : "Student"}</button>
                        {/* <button type="button" onClick={handleGoogleSignIn} className="google-login-btn">
                             Sign in with Google
                        </button> */}

                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
