import React, { useState, useEffect } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import "./ListStudents.css";
import { FaTrash } from "react-icons/fa";  // Import the trash bin icon


const ListStudents = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch students from Firestore
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const studentsCollection = await getDocs(collection(db, "users"));
                const studentList = studentsCollection.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.role === "student"); // Only fetch students

                setStudents(studentList);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };

        fetchStudents();
    }, []);

    // Handle student deletion
    const handleDelete = async (id) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this student?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "users", id));
                setStudents(students.filter(student => student.id !== id));
                alert("Student deleted successfully!");
            } catch (error) {
                console.error("Error deleting student:", error);
                alert("Failed to delete student. Try again.");
            }
        }
    };

    // Filter students based on search
    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="list-container">
            <h1>List of Students</h1>

            <input
                type="text"
                placeholder="Search by name..."
                className="search-box"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            <table className="student-table">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredStudents.length > 0 ? (
                        filteredStudents.map((student) => (
                            <tr key={student.id}>
                                <td>{student.name}</td>
                                <td>{student.email}</td>
                                <td>
                                    <button className="delete-btn" onClick={() => handleDelete(student.id)}>
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3">No students found</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default ListStudents;
