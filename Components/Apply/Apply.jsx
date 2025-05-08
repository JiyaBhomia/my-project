import React, { useState } from 'react';
import './Apply.css';
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDocs, updateDoc} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { db, collection, addDoc } from '../../firebaseConfig'; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Add Firebase Storage

const RailwayConcessionForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    address: '',
    dateOfBirth: '',
    age: '',
    semester: '1',
    destinationFrom: '',
    destinationTo: '',
    travelClass: 'Second',
    ticketType: 'Monthly',
    railwayZone: 'Central',
    expiryDate: '',
    previousConcessionNo: '',
    issuedNo: '',
    ticketNumber: '',
    fromStation: '',
    toStation: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState("No image uploaded");
  const [error, setError] = useState("");
  const [pincodeResult, setPincodeResult] = useState(null);
  const [nameResult, setNameResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const convertImageToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onloadend = () => {
        resolve(reader.result); // This contains the Base64 string
      };
      
      reader.onerror = (error) => {
        reject(error);
      };
      
      reader.readAsDataURL(file); // Converts the file to Base64
    });
  };
  
  // const addNotification = async (studentId, message) => {
  //     try {
  //       const notificationsRef = collection(db, 'notifications');
  
  //       let status = 'Under Verification';
  //       if (message.includes('Approved')) {
  //         status = 'Approved';
  //       } else if (message.includes('Rejected')) {
  //         status = 'Rejected';
  //       }
  
  //       await addDoc(notificationsRef, {
  //         studentId,
  //         message,
  //         timestamp: new Date(),
  //         status,
  //       });
  //     } catch (error) {
  //       console.error('Error adding notification: ', error);
  //     }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setUploadStatus("No image uploaded");
      setSelectedFile(null);
      setPincodeResult(null);
      setNameResult(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please upload a valid image file (e.g., PNG, JPEG).");
      setUploadStatus("Invalid file type");
      setSelectedFile(null);
      setPincodeResult(null);
      setNameResult(null);
      return;
    }

    setSelectedFile(file);
    setUploadStatus(`Uploaded: ${file.name}`);
    setError("");
    verifyPincodeAndNameFromImage(file);
  };

  const verifyPincodeAndNameFromImage = async (file) => {
    setLoading(true);
    setPincodeResult(null);
    setNameResult(null);

    // Extract pincode from address
    const pincodeMatch = formData.address.match(/\b\d{6}\b/);
    const addressPincode = pincodeMatch ? pincodeMatch[0] : null;

    if (!addressPincode) {
      setError("No 6-digit pincode found in the address field.");
      setLoading(false);
      return;
    }

    // Validate names
    if (!formData.firstName.trim()) {
      setError("First name is required.");
      setLoading(false);
      return;
    }

    if (!formData.middleName.trim()) {
      setError("Middle name is required.");
      setLoading(false);
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required.");
      setLoading(false);
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append("image", file);
    const textsToVerify = {
      pincode: addressPincode,
      firstName: formData.firstName.trim(),
      middleName: formData.middleName.trim(),
      lastName: formData.lastName.trim(),
    };
    formDataToSend.append("texts", JSON.stringify(textsToVerify));

    try {
      const res = await fetch("http://127.0.0.1:5000/verify", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        throw new Error(`Failed to process the image: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      console.log("Backend Response:", data);

      const matches = data.matches || {};
      setPincodeResult({
        extractedWords: data.extracted_words || [],
        extractedPincode: matches.pincode ? addressPincode : "Not found in image",
        matchesAddress: !!matches.pincode,
      });

      setNameResult({
        firstName: matches.firstName ? formData.firstName : "Not found in image",
        middleName: matches.middleName ? formData.middleName : "Not found in image",
        lastName: matches.lastName ? formData.lastName : "Not found in image",
        matchesFirstName: !!matches.firstName,
        matchesMiddleName: !!matches.middleName,
        matchesLastName: !!matches.lastName,
      });
    } catch (error) {
      console.error("Fetch Error:", error);
      setError(error.message || "Error processing the image. Ensure the backend server is running.");
      setPincodeResult(null);
      setNameResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const auth = getAuth();
    const user = auth.currentUser;
  
    if (!user) {
      setError("You must be signed in to submit the form.");
      return;
    }
  
    // Get user data
    const userId = user.uid;  // Get the UID of the currently authenticated user
    const base64Image = selectedFile ? await convertImageToBase64(selectedFile) : null;
  
    // Prepare the form data
    const submissionData = {
      userId: userId,  // Store the user's UID
      firstName: formData.firstName,
      middleName: formData.middleName,
      lastName: formData.lastName,
      address: formData.address,
      destinationFrom: formData.destinationFrom,
      destinationTo: formData.destinationTo,
      travelClass: formData.travelClass,
      ticketType: formData.ticketType,
      railwayZone: formData.railwayZone,
      expiryDate: formData.expiryDate,
      previousConcessionNo: formData.previousConcessionNo,
      issuedNo: formData.issuedNo,
      ticketNumber: formData.ticketNumber,
      fromStation: formData.fromStation,
      toStation: formData.toStation,
      uploadedDocument: base64Image || "None",
      verifiedPincode: pincodeResult?.extractedPincode || "Not verified",
      pincodeMatchesAddress: pincodeResult?.matchesAddress || false,
      verifiedFirstName: nameResult?.firstName || "Not verified",
      verifiedMiddleName: nameResult?.middleName || "Not verified",
      verifiedLastName: nameResult?.lastName || "Not verified",
      namesMatch: nameResult
        ? nameResult.matchesFirstName && nameResult.matchesLastName && nameResult.matchesMiddleName
        : false,
    };
  
    try {
      const db = getFirestore();
      const concessionDocRef = doc(db, "concessions", userId); // Use UID as the document ID
  
      // Save the form data along with the user's UID to Firestore
      await setDoc(concessionDocRef, submissionData);
      console.log("Form data successfully saved to Firestore!");
      alert("Form submitted successfully!");
      navigate("/student");
    } catch (error) {
      console.error("Error saving data to Firestore:", error);
      setError("Error submitting the form.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      <h2 className="form-title">Railway Concession Application</h2>
      
      <div className="form-grid">
        <div className="form-group">
          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Middle Name</label>
          <input
            type="text"
            name="middleName"
            value={formData.middleName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Age</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Date of Birth</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Semester</label>
          <select
            name="semester"
            value={formData.semester}
            onChange={handleChange}
            required
          >
            {[...Array(8)].map((_, i) => (
              <option key={i + 1} value={i + 1}>Semester {i + 1}</option>
            ))}
          </select>
        </div>
        <div className="form-group full-width">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>From (Starting)</label>
          <input
            type="text"
            name="destinationFrom"
            value={formData.destinationFrom}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>To (Destination)</label>
          <input
            type="text"
            name="destinationTo"
            value={formData.destinationTo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Class</label>
          <select
            name="travelClass"
            value={formData.travelClass}
            onChange={handleChange}
            required
          >
            <option value="First">First</option>
            <option value="Second">Second</option>
          </select>
        </div>
        <div className="form-group">
          <label>Ticket Type</label>
          <select
            name="ticketType"
            value={formData.ticketType}
            onChange={handleChange}
            required
          >
            <option value="Monthly">Monthly</option>
            <option value="Quarterly">Quarterly</option>
          </select>
        </div>
        <div className="form-group">
          <label>Railway Zone</label>
          <select
            name="railwayZone"
            value={formData.railwayZone}
            onChange={handleChange}
            required
          >
            <option value="Central">Central</option>
            <option value="Western">Western</option>
          </select>
        </div>
        <div className="form-group">
          <label>Previous Expiry</label>
          <input
            type="date"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Prev. Concession No</label>
          <input
            type="text"
            name="previousConcessionNo"
            value={formData.previousConcessionNo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Issued No</label>
          <input
            type="text"
            name="issuedNo"
            value={formData.issuedNo}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Ticket No</label>
          <input
            type="text"
            name="ticketNumber"
            value={formData.ticketNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group upload-group">
          <label>Upload Image (for Pincode & Name Verification)</label>
          <div className="upload-box">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
              disabled={loading}
              required
            />
            <span className="upload-label">Choose File</span>
          </div>
          <div className="upload-status">
            <span className={selectedFile ? "success" : "error"}>{uploadStatus}</span>
          </div>
          {loading && <div className="loading">Processing...</div>}
          {error && <div className="error-message">{error}</div>}
          {pincodeResult && (
            <div className="pincode-result">
              <p><strong>Extracted Pincode:</strong> {pincodeResult.extractedPincode}</p>
              <p><strong>Matches Address:</strong> {pincodeResult.matchesAddress ? "Yes ✅" : "No ❌"}</p>
            </div>
          )}
          {nameResult && (
            <div className="name-result">
              <p><strong>First Name:</strong> {nameResult.firstName} {nameResult.matchesFirstName ? "✅" : "❌"}</p>
              <p><strong>Middle Name:</strong> {nameResult.middleName} {nameResult.matchesMiddleName ? "✅" : "❌"}</p>
              <p><strong>Last Name:</strong> {nameResult.lastName} {nameResult.matchesLastName ? "✅" : "❌"}</p>
            </div>
          )}
        </div>
        <div className="form-group">
          <label>From (Station)</label>
          <input
            type="text"
            name="fromStation"
            value={formData.fromStation}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>To (Station)</label>
          <input
            type="text"
            name="toStation"
            value={formData.toStation}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button type="submit" className="form-button" disabled={loading}>Submit Application</button>
    </form>
  );
};

export default RailwayConcessionForm;