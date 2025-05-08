import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, collection, query, where, getDocs, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import jsPDF from 'jspdf';
import emailjs from 'emailjs-com';
import './Notification.css';

const Notification = () => {
  const [notifications, setNotifications] = useState([]);
  const [concessionData, setConcessionData] = useState(null);
  const [error, setError] = useState('');
  const auth = getAuth();
  const db = getFirestore();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = auth.currentUser;
      if (!user) {
        setError('You need to be logged in to view notifications.');
        return;
      }

      try {
        const q = query(collection(db, 'notifications'), where('studentId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const notificationsList = querySnapshot.docs.map(doc => doc.data());

        notificationsList.sort((a, b) => b.timestamp.seconds - a.timestamp.seconds);

        setNotifications(notificationsList);
      } catch (err) {
        console.error('Error fetching notifications: ', err);
        setError('Failed to fetch notifications.');
      }
    };

    const fetchConcessionData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, 'concessions', user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setConcessionData(docSnap.data());
          } else {
            console.log('No concession data found');
          }
        } catch (err) {
          console.error('Error fetching concession data: ', err);
        }
      }
    };

    fetchNotifications();
    fetchConcessionData();
  }, [auth, db]);

  const handleDownloadReceipt = () => {
    if (!concessionData) {
      alert("Concession data not available yet");
      return;
    }

    const currentDate = new Date();
    const expiryDate = new Date(currentDate.setDate(currentDate.getDate() + 3));
    const formattedExpiryDate = expiryDate.toISOString().split('T')[0];

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Concession Receipt", 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${concessionData.firstName || 'N/A'} ${concessionData.middleName || ''} ${concessionData.lastName || 'N/A'}`, 20, 30);
    doc.text(`From Station: ${concessionData.destinationFrom || 'N/A'}`, 20, 40);
    doc.text(`To Station: ${concessionData.destinationTo || 'N/A'}`, 20, 50);
    doc.text(`Class: ${concessionData.ticketType || 'N/A'}`, 20, 60);
    doc.text(`Concession Expiry Date: ${formattedExpiryDate}`, 20, 70);
    doc.text(`Previous Concession No: ${concessionData.previousConcessionNo || 'N/A'}`, 20, 80);
    doc.text("Declaration by Principal: This concession is valid until the expiry date mentioned above.", 20, 90);
    doc.addPage();
    doc.text("Thank you for using the concession system.", 20, 20);

    doc.save("concession_receipt.pdf");
  };

  const sendApprovalEmail = (studentEmail) => {
    // Using EmailJS to send email when concession is approved
    emailjs.send(
      'service_d5skf1h',  // EmailJS Service ID
      'template_ds57vvo',  // EmailJS Template ID
      {
        to_email: studentEmail,
        subject: 'Concession Approved',
        message: `Dear student, \n\nYour concession has been approved. \n\nThank you for using the concession system.`,
      },
      'LJC6WQCWD9Ba80APL'  // EmailJS User ID
    )
      .then((response) => {
        console.log('Email sent successfully:', response);
      })
      .catch((err) => {
        console.error('Error sending email:', err); 
      });
  };

  const handleReapply = () => {
    navigate('/student/apply');
  };

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="notification-container">
      <h1>Your Notifications</h1>
      {notifications.length === 0 ? (
        <p>No notifications available.</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((notif, index) => {
            const isLatest = index === 0;
            if (isLatest && notif.status === 'Approved' && concessionData) {
              // Send an email when the concession is approved
              sendApprovalEmail(concessionData.email);
            }

            return (
              <li key={index} className={`notification-item ${notif.status.toLowerCase().replace(" ", "-")}`}>
                <p>{notif.message}</p>
                <p><strong>Timestamp:</strong> {new Date(notif.timestamp.seconds * 1000).toLocaleString()}</p>

                {/* Only for the latest notification, show the respective button */}
                {isLatest && notif.status === 'Approved' && (
                  <button className="download-btn" onClick={handleDownloadReceipt}>
                    Download Concession Receipt
                  </button>
                )}

                {isLatest && notif.status === 'Rejected' && (
                  <button className="reapply-btn" onClick={handleReapply}>
                    Reapply for Concession
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default Notification;
