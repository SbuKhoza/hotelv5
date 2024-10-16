import React, { useState } from 'react';
import { TextField, Button, Box, Typography, CircularProgress } from '@mui/material';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../service/firebase';
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate(); // Initialize navigate function

  // Handle login function
  const handleLogin = async () => {
    setLoading(true); // Set loading to true when login starts
    setError(''); // Reset error message before login attempt

    try {
      // Authenticate admin with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if the user exists in the "admin" collection
      const adminRef = doc(db, 'admin', user.uid); // Assuming the document ID in "admin" collection is the user's UID
      const adminSnap = await getDoc(adminRef);
      
      if (adminSnap.exists()) {
        // User is an admin
        console.log('Login successful:', user);
        // Navigate to dashboard
        navigate('/dashboard'); // Adjust the path to your dashboard route
      } else {
        // User is not an admin
        setError('Access denied. You are not authorized to log in.');
        console.error('Access denied: User is not an admin');
      }
    } catch (err) {
      // Handle login errors
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('Login failed. Please try again later.');
      }
      console.error('Login error:', err);
    } finally {
      setLoading(false); // Reset loading state regardless of outcome
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={2}
      sx={{
        width: 320,
        position: 'absolute',
        left: '55%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      <Typography variant="h5">Admin Login</Typography>
      {error && <Typography color="error">{error}</Typography>}
      <TextField
        label="Email"
        type="email"
        placeholder="Enter Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        placeholder="Enter Password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button 
        variant="contained" 
        color="primary" 
        fullWidth 
        onClick={handleLogin} 
        disabled={loading} // Disable button while loading
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
      </Button>
    </Box>
  );
}

export default Login;
