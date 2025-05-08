import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig"; 
import { createUserWithEmailAndPassword } from "firebase/auth"; 
import { doc, setDoc } from "firebase/firestore"; 
import "./Reg.css";
import { FaUser, FaLock } from "react-icons/fa";

const Reg = () => {
    const [text, setText] = useState("");
    const [name, setName] = useState(""); // Student Name Field
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const navigate = useNavigate(); 
    const message = "Ennter Student Info";
    const speed = 100;

    // Typing Animation
    useEffect(() => {
        let index = 0;
        setText("");
        const interval = setInterval(() => {
            if (index < message.length) {
                setText((prev) => prev + message.charAt(index));
                index++;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, []);

    // Password Validation
    useEffect(() => {
        if (!password || !confirmPassword) {
            setError("");
            setIsDisabled(true);
        } else if (password !== confirmPassword) {
            setError("❌ Passwords do not match!");
            setIsDisabled(true);
        } else {
            setError("");
            setIsDisabled(false);
        }
    }, [password, confirmPassword]);

    // Handle Registration
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("⚠️ Please enter your name.");
            return;
        }

        if (password !== confirmPassword) {
            setError("❌ Passwords do not match!");
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: name.trim(),
                email: user.email,
                role: "student", 
            });

            setSuccess("✅ Registration successful!");
        } catch (error) {
            setError("⚠️ " + error.message);
        }
    };

    return (
        <div className="login-container">
            <h2 className="welcome-text">{text}</h2>
            <div className="wrapper">
                <div className="form-box reg">
                    <form onSubmit={handleSubmit}>
                        <h1>Student Registration</h1>

                        <div className="input-box">
                            <input
                                type="text"
                                placeholder="Full Name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <FaUser className="icon" />
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

                        <div className="input-box">
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                            <FaLock className="icon" />
                        </div>

                        {error && <p className="error-text">{error}</p>}
                        {success && <p className="success-text">{success}</p>}

                        <button type="submit" disabled={isDisabled}>Register</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Reg;
