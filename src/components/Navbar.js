import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
import { signOut } from "firebase/auth"; // Import signOut from Firebase auth
import { auth } from '../service/firebase'; // Import your Firebase auth instance

const drawerWidth = 240;

function Navbar() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true); // Assume user is logged in initially
  const [logoutOpen, setLogoutOpen] = useState(false); // State for logout confirmation dialog
  const [formValues, setFormValues] = useState({
    name: '',
    description: '',
    guests: '',
    price: '',
    amenities: {
      wifi: false,
      pool: false,
      parking: false,
      breakfast: false,
    },
    image: null,
  });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('name', formValues.name);
    formData.append('description', formValues.description);
    formData.append('guests', formValues.guests);
    formData.append('price', formValues.price);
    formData.append('wifi', formValues.amenities.wifi);
    formData.append('pool', formValues.amenities.pool);
    formData.append('parking', formValues.amenities.parking);
    formData.append('breakfast', formValues.amenities.breakfast);
    if (formValues.image) {
      formData.append('image', formValues.image);
    }

    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      alert('Accommodation Created!');
      console.log('Form Submitted', formData);
    }, 2000);
  };

  // Handle click to open logout confirmation dialog
  const handleLogoutClick = () => {
    setLogoutOpen(true);
  };

  // Handle close of logout confirmation dialog
  const handleLogoutClose = () => {
    setLogoutOpen(false);
  };

  // Handle confirmation of logout
  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth); // Sign out the user
      console.log("User logged out successfully.");
      setLoggedIn(false); // Update state to reflect user is logged out
    } catch (error) {
      console.error("Logout error:", error);
    }
    setLogoutOpen(false); // Close confirmation dialog after logout
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
            pointerEvents: loggedIn ? 'auto' : 'none', // Disable if logged out
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Dashboard" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>
          
          <ListItem button component={Link} to="/accommodation" sx={{ 
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none', // Disable if logged out
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}>
            <ListItemIcon>
              <AccommodationIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Accommodation" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>
          
          <ListItem button component={Link} to="/users" sx={{ 
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none', // Disable if logged out
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}>
            <ListItemIcon>
              <UsersIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Users" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>
          
          <ListItem button component={Link} to="/gallery" sx={{ 
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none', // Disable if logged out
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          }}>
            <ListItemIcon>
              <GalleryIcon sx={{ color: 'white' }} />
            </ListItemIcon>
            <ListItemText primary="Gallery" primaryTypographyProps={{ style: { color: 'white' } }} />
          </ListItem>
          
          <ListItem button component={Link} to="/profile" sx={{ 
            color: 'white',
            pointerEvents: loggedIn ? 'auto' : 'none', // Disable if logged out
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
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
            disabled={!loggedIn} // Disable if logged out
          >
            Create Accommodation
          </Button>
          
          <Button
            variant="contained"
            startIcon={<BookingIcon />}
            fullWidth
            sx={{ mb: 1 }}
            disabled={!loggedIn} // Disable if logged out
          >
            New Booking
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={handleLogoutClick} // Use the logout click handler
            fullWidth
            sx={{ color: 'white', borderColor: 'white', '&:hover': {
              borderColor: 'rgba(255, 255, 255, 0.8)',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            } }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        {/* Your main content goes here */}
      </Box>

      {/* Popup Form Dialog */}
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
            />
            <TextField
              margin="dense"
              name="description"
              label="Description"
              fullWidth
              variant="outlined"
              value={formValues.description}
              onChange={handleChange}
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
            />
            <TextField
              margin="dense"
              name="price"
              label="Price"
              type="number"
              fullWidth
              variant="outlined"
              value={formValues.price}
              onChange={handleChange}
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
