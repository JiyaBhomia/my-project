import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import "./Student.css";

const Student = () => {
    const [studentName, setStudentName] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const fetchStudentData = async () => {
            const user = auth.currentUser;
            if (!user) {
                navigate("/login"); // Redirect if not logged in
                return;
            }

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                setStudentName(userDoc.data().name || "Student");
            } else {
                setStudentName("Student");
            }
        };

        fetchStudentData();
    }, [navigate]);

    return (
        <div className="student-container">
            <h1>Welcome, {studentName}</h1>
            <div className="student-boxes">
                <div className="student-box" onClick={() => navigate("/student/apply")}>
                    <h2>Apply for Concession</h2>
                </div>
                <div className="student-box" onClick={() => navigate("/student/history")}>
                    <h2>My Applied Concession History</h2>
                </div>
                <div className="student-box" onClick={() => navigate("/student/notifications")}>
                    <h2>Notification and Alerts</h2>
                </div>
            </div>
        </div>
    );
};

export default Student;
