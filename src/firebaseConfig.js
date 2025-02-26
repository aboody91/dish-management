// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAmXknYDyln70gzlDooYyEDXubgwaq6riM",
  authDomain: "dish-management-982e7.firebaseapp.com",
  projectId: "dish-management-982e7",
  storageBucket: "dish-management-982e7.firebasestorage.app",
  messagingSenderId: "779145520891",
  appId: "1:779145520891:web:348a7e66f2c0de4974325e",
  measurementId: "G-CJQ1M2EJ71"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

export const uploadFile = async (file, path) => {
  try {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    console.log("File uploaded successfully. Download URL:", downloadURL);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error; // Re-throw the error for handling in the component
  }
};

export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    console.log("File deleted successfully:", path);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error; // Re-throw the error for handling in the component
  }
};
