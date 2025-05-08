import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './History.css';  // Import the CSS

const History = () => {
  const [studentData, setStudentData] = useState(null); // To hold student data
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();

  useEffect(() => {
    const fetchStudentData = async () => {
      const user = auth.currentUser; 
      if (!user) {
        setError('You need to be logged in to view your history.');
        return;
      }

      try {
        const docRef = doc(db, 'concessions', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setStudentData(docSnap.data()); // Set student data if document exists

          let currentStatus = data.status;
          if (!currentStatus) {
            if (data.pincodeMatchesAddress === true && data.namesMatch === true) {
              currentStatus = 'Approved'; // If pincode and names match, set Approved
            } else {
              currentStatus = 'Under Verification'; // Otherwise, keep it under verification
            }

            // Update Firestore with the new status
            await updateDoc(docRef, { status: currentStatus });
          }
          
          // Always update local UI
          setStatus(currentStatus);
          
          // Update Firestore if status is missing or outdated
          if (!data.status) {
            await updateDoc(docRef, { status: currentStatus });
            data.status = currentStatus;
        }
          
          setStudentData(data); 

        } else {
          setError('No concession history found.');
        }
      } catch (err) {
        console.error('Error fetching data: ', err);
        setError('Failed to fetch data.');
      }
    };

    fetchStudentData();
  }, [auth, db]);

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!studentData) {
    return <div className="loading-message">Loading...</div>;
  }

  const isBase64 = studentData.uploadedDocument.startsWith('data:image/');
  const imageSrc = isBase64 ? studentData.uploadedDocument : null;

  return (
    <div className="history-container">
      <h1>Your Concession History</h1>
      <div>
        <p><strong>Name:</strong> {studentData.firstName} {studentData.middleName} {studentData.lastName}</p>
        <p><strong>Address:</strong> {studentData.address}</p>
        <p><strong>Destination:</strong> {studentData.destinationFrom} to {studentData.destinationTo}</p>
        <p><strong>Railway Zone:</strong> {studentData.railwayZone}</p>
        <p><strong>Ticket Type:</strong> {studentData.ticketType}</p>
        <p><strong>Issued No:</strong> {studentData.issuedNo}</p>
        <p><strong>Concession Expiry Date:</strong> {studentData.expiryDate}</p>
        <p><strong>Previous Concession No:</strong> {studentData.previousConcessionNo}</p>
        <p><strong>Verified Pincode:</strong> {studentData.verifiedPincode}</p>
        <p><strong>Pincode Matches Address:</strong> {studentData.pincodeMatchesAddress ? 'Yes' : 'No'}</p>
        <p><strong>Names Match:</strong> {studentData.namesMatch ? 'Yes' : 'No'}</p>

        <p><strong>Status:</strong> 
            <span 
                className={ 
                    status === 'Approved' ? 'status-approved' : 
                    status === 'Rejected' ? 'status-rejected' : 
                    'status-under-verification'
                }
            >
                {studentData.status}
            </span>
        </p>


        {imageSrc && (
          <div>
            <p><strong>Uploaded Document:</strong></p>
            <img src={imageSrc} alt="Uploaded Document" />
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
