import React from "react";
import { useNavigate } from "react-router-dom";
import "./Admin.css";

const Admin = () => {
    const navigate = useNavigate();

    return (
        <div className="admin-container">
            <h1>Admin Dashboard</h1>
            <div className="admin-boxes">
                <div className="admin-box" onClick={() => navigate("/admin/add-student")}>
                    <h2>Add New Students</h2>
                </div>
                <div className="admin-box" onClick={() => navigate("/admin/verify-forms")}>
                    <h2>Verify Pending Forms</h2>
                </div>
                <div className="admin-box" onClick={() => navigate("/admin/list-students")}>
                    <h2>List of Students</h2>
                </div>
            </div>
        </div>
    );
};

export default Admin;
