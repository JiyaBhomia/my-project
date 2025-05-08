import React, { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc, addDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import "./ValidateConcessions.css";

const ValidateConcessions = () => {
  const [concessions, setConcessions] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({}); // store temporary selections

  useEffect(() => {
    const fetchConcessions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "concessions"));
        const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setConcessions(docs);

        // initialize selected statuses
        const statusMap = {};
        docs.forEach(doc => {
          statusMap[doc.id] = doc.status || "under verification";
        });
        setSelectedStatuses(statusMap);
      } catch (error) {
        console.error("Error fetching concession data:", error);
      }
    };

    fetchConcessions();
  }, []);

  const handleSelectChange = (id, newStatus) => {
    setSelectedStatuses(prev => ({
      ...prev,
      [id]: newStatus
    }));
  };

  const addNotification = async (studentId, message) => {
    try {
      const notificationsRef = collection(db, 'notifications');

      let status = 'Under Verification';
      if (message.includes('Approved')) {
        status = 'Approved';
      } else if (message.includes('Rejected')) {
        status = 'Rejected';
      }

      await addDoc(notificationsRef, {
        studentId,
        message,
        timestamp: new Date(),
        status,
      });
    } catch (error) {
      console.error('Error adding notification: ', error);
    }
  };

  const handleConfirm = async (id) => {
    const newStatus = selectedStatuses[id];
    try {
      const docRef = doc(db, "concessions", id);
      await updateDoc(docRef, { status: newStatus });
      setConcessions(prev =>
        prev.map(c => (c.id === id ? { ...c, status: newStatus } : c))
      );
      
      //notif
      const message = `Your concession request has been ${newStatus}.`;
      await addNotification(id, message); // use 'id' as studentId

      alert(`Status updated to "${newStatus}"`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status.");
    }
  };

  const handleOpenImageInNewWindow = (imageSrc) => {
    // Open the image in a new window
    const imageWindow = window.open("", "_blank");
    imageWindow.document.write(`<img src="${imageSrc}" style="max-width: 100%;"/>`);
  };

  return (
    <div className="validate-container">
      <h2>Validate Concessions</h2>
      {concessions.map((c) => (
        <div key={c.id} className="concession-card">
          <div className="concession-info">
            <strong>Name:</strong> {c.firstName} {c.middleName} {c.lastName}
          </div>

          <div className="status-select">
            <select
              value={selectedStatuses[c.id] || "under verification"}
              onChange={(e) => handleSelectChange(c.id, e.target.value)}
            >
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
              <option value="Under Verification">Under Verification</option>
            </select>
          </div>

          <button className="confirm-btn" onClick={() => handleConfirm(c.id)}>
            Confirm
          </button>

          {c.uploadedDocument && c.uploadedDocument.startsWith("data:image/") && (
            <button
              className="view-image-btn"
              onClick={() => handleOpenImageInNewWindow(c.uploadedDocument)}
            >
              View Document
            </button>
          )}
        </div>     
      ))}
    </div>
  );
};

export default ValidateConcessions;
