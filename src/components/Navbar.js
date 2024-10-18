import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Add this at the top
import { storage } from '../service/firebase'; // Add this to import storage
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as UsersIcon,
  Collections as GalleryIcon,
  Person as ProfileIcon,
  Logout as LogoutIcon,
  Add as AddIcon,
  BedOutlined as AccommodationIcon,
  BookOnline as BookingIcon,
} from '@mui/icons-material';
import { signOut } from "firebase/auth";
import { auth, db } from '../service/firebase';

const drawerWidth = 240;

function Navbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    guests: '',
    price: '',
    availability: '', //added
    amenities: {
      wifi: false,
      pool: false,
      parking: false,
      breakfast: false,
    },
    image: null,
  });

  // Booking Form States
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingValues, setBookingValues] = useState({
    accommodation: '',
    user: '',
    checkInDate: '',
    checkOutDate: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  const handleLogoutClick = () => {
    if (loggedIn) {
      setLogoutOpen(true);
    } else {
      navigate('/');
    }
  };

  const handleLogoutClose = () => {
    setLogoutOpen(false);
  };

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth);
      console.log("User logged out successfully.");
      setLoggedIn(false);
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
    }
    setLogoutOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handleAmenityChange = (e) => {
    const { name, checked } = e.target;
    setFormValues({
      ...formValues,
      amenities: {
        ...formValues.amenities,
        [name]: checked,
      },
    });
  };

  const handleImageChange = (e) => {
    setFormValues({ ...formValues, image: e.target.files[0] });
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      if (!formValues.name || !formValues.description || !formValues.guests || !formValues.price) {
        throw new Error('Please fill in all required fields');
      }
  
      // Upload image to Firebase Storage if image is selected
      let imageUrl = '';
      if (formValues.image) {
        const imageRef = ref(storage, `accommodations/${Date.now()}_${formValues.image.name}`);
        const snapshot = await uploadBytes(imageRef, formValues.image);
        imageUrl = await getDownloadURL(snapshot.ref);
      }
  
      const accommodationData = {
        name: formValues.name,
        description: formValues.description,
        guests: parseInt(formValues.guests),
        availability: parseInt(formValues.availability), // Added
        price: `R ${parseFloat(formValues.price).toFixed(2)}`,
        amenities: formValues.amenities,
        imageUrl: imageUrl, // Save the image URL in Firestore
        createdAt: new Date(),
        updatedAt: new Date(),
      };
  
      // Add data to Firestore
      const docRef = await addDoc(collection(db, 'accommodation'), accommodationData);
      console.log('Accommodation created with ID:', docRef.id);
      
      setFormValues({
        name: '',
        description: '',
        guests: '',
        price: '',
        availability: '', // Added
        amenities: {
          wifi: false,
          pool: false,
          parking: false,
          breakfast: false,
        },
        image: null,
      });
      setLoading(false);
      setOpen(false);
      alert('Accommodation Created Successfully!');
    } catch (error) {
      console.error('Error creating accommodation:', error);
      setLoading(false);
      alert(error.message || 'Error creating accommodation. Please try again.');
    }
  };
  

  // Booking form handlers
  const handleBookingClickOpen = () => {
    setBookingOpen(true);
  };

  const handleBookingClose = () => {
    setBookingOpen(false);
  };

  const handleBookingChange = (e) => {
    const { name, value } = e.target;
    setBookingValues({ ...bookingValues, [name]: value });
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!bookingValues.accommodation || !bookingValues.user || !bookingValues.checkInDate || !bookingValues.checkOutDate) {
        throw new Error('Please fill in all required fields');
      }

      const bookingData = {
        accommodation: bookingValues.accommodation,
        user: bookingValues.user,
        checkInDate: bookingValues.checkInDate,
        checkOutDate: bookingValues.checkOutDate,
        createdAt: new Date(),
      };

      await addDoc(collection(db, 'bookings'), bookingData);
      setLoading(false);
      setBookingOpen(false);
      alert('Booking Created Successfully!');
    } catch (error) {
      console.error('Error creating booking:', error);
      setLoading(false);
      alert(error.message || 'Error creating booking. Please try again.');
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'black',
            color: 'white',
          },
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Typography variant="h6" component="div" sx={{ color: 'white', fontWeight: 'bold' }}>
            Steady Hotel
          </Typography>
        </Box>

        <List>
          <ListItem button component={Link} to="/dashboard" sx={{
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>

          <ListItem button component={Link} to="/accommodation" sx={{
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}>
            <ListItemIcon>
              <AccommodationIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Accommodation" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>

          <ListItem button component={Link} to="/users" sx={{
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}>
            <ListItemIcon>
              <UsersIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Users" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>

          <ListItem button component={Link} to="/gallery" sx={{
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}>
            <ListItemIcon>
              <GalleryIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Gallery" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>

          <ListItem button component={Link} to="/profile" sx={{
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
          }}>
            <ListItemIcon>
              <ProfileIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Profile" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>
        </List>

        <Box sx={{ mt: 'auto', p: 2, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleClickOpen}
            fullWidth
            sx={{ mb: 1 }}
            disabled={!loggedIn}
          >
            Create Accommodation
          </Button>

          <Button
            variant="contained"
            startIcon={<BookingIcon />}
            onClick={handleBookingClickOpen}
            fullWidth
            sx={{ mb: 1 }}
            disabled={!loggedIn}
          >
            New Booking
          </Button>

          <Button
            variant="outlined"
            startIcon={loggedIn ? <LogoutIcon /> : null}
            onClick={handleLogoutClick}
            fullWidth
            sx={{ 
              color: 'white', 
              borderColor: 'white', 
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.8)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
              } 
            }}
          >
            {loggedIn ? 'Logout' : 'Login'}
          </Button>
        </Box>
      </Drawer>

      {/* Create Accommodation Dialog */}
      <Dialog open={open} onClose={handleClose}>
  <DialogTitle>Create Accommodation</DialogTitle>
  <DialogContent>
    <form onSubmit={handleSubmit}>
      <TextField
        margin="dense"
        name="name"
        label="Accommodation Name"
        fullWidth
        variant="outlined"
        value={formValues.name}
        onChange={handleChange}
        required
      />
      <TextField
        margin="dense"
        name="description"
        label="Description"
        fullWidth
        variant="outlined"
        value={formValues.description}
        onChange={handleChange}
        required
        multiline
        rows={3}
      />
      <TextField
        margin="dense"
        name="guests"
        label="Number of Guests"
        type="number"
        fullWidth
        variant="outlined"
        value={formValues.guests}
        onChange={handleChange}
        required
        inputProps={{ min: 1 }}
      />
      <TextField
        margin="dense"
        name="price"
        label="Price (R)"
        type="number"
        fullWidth
        variant="outlined"
        value={formValues.price}
        onChange={handleChange}
        required
        inputProps={{ min: 0, step: "0.01" }}
      />

      {/* New Availability Field */}
      <TextField
        margin="dense"
        name="availability"
        label="Availability"
        type="number"
        fullWidth
        variant="outlined"
        value={formValues.availability}
        onChange={handleChange}
        required
        inputProps={{ min: 0 }}
      />

      <Box sx={{ mt: 2, mb: 1 }}>
        <Typography variant="subtitle1">Amenities:</Typography>
        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.amenities.wifi}
              onChange={handleAmenityChange}
              name="wifi"
            />
          }
          label="Wi-Fi"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.amenities.pool}
              onChange={handleAmenityChange}
              name="pool"
            />
          }
          label="Pool"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.amenities.parking}
              onChange={handleAmenityChange}
              name="parking"
            />
          }
          label="Parking"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={formValues.amenities.breakfast}
              onChange={handleAmenityChange}
              name="breakfast"
            />
          }
          label="Breakfast"
        />
      </Box>

      <Box sx={{ mt: 2 }}>
        <Button
          variant="contained"
          component="label"
          fullWidth
        >
          Upload Image
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleImageChange}
          />
        </Button>
      </Box>
    </form>
  </DialogContent>
  <DialogActions>
    <Button onClick={handleClose}>Cancel</Button>
    <Button onClick={handleSubmit} disabled={loading}>
      {loading ? <CircularProgress size={24} /> : 'Create'}
    </Button>
  </DialogActions>
</Dialog>

      {/* Booking Dialog */}
      <Dialog open={bookingOpen} onClose={handleBookingClose}>
        <DialogTitle>Create Booking</DialogTitle>
        <DialogContent>
          <form onSubmit={handleBookingSubmit}>
            <TextField
              margin="dense"
              name="accommodation"
              label="Accommodation"
              fullWidth
              select
              value={bookingValues.accommodation}
              onChange={handleBookingChange}
              required
            >
              {/* Sample accommodations, replace with real data */}
              <MenuItem value="accommodation_1">Accommodation 1</MenuItem>
              <MenuItem value="accommodation_2">Accommodation 2</MenuItem>
            </TextField>

            <TextField
              margin="dense"
              name="user"
              label="User"
              fullWidth
              value={bookingValues.user}
              onChange={handleBookingChange}
              required
            />

            <TextField
              margin="dense"
              name="checkInDate"
              label="Check-In Date"
              type="date"
              fullWidth
              value={bookingValues.checkInDate}
              onChange={handleBookingChange}
              InputLabelProps={{ shrink: true }}
              required
            />

            <TextField
              margin="dense"
              name="checkOutDate"
              label="Check-Out Date"
              type="date"
              fullWidth
              value={bookingValues.checkOutDate}
              onChange={handleBookingChange}
              InputLabelProps={{ shrink: true }}
              required
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBookingClose}>Cancel</Button>
          <Button onClick={handleBookingSubmit} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutOpen} onClose={handleLogoutClose}>
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to log out?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLogoutClose}>Cancel</Button>
          <Button onClick={handleLogoutConfirm} color="primary">
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Navbar;