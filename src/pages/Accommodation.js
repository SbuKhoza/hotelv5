import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../service/firebase';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Grid,
  Chip,
  Container,
  Badge,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import {
  Wifi as WifiIcon,
  Pool as PoolIcon,
  LocalParking as ParkingIcon,
  FreeBreakfast as BreakfastIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

function Accommodation() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAccommodation, setEditAccommodation] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'accommodation'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const accommodationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccommodations(accommodationList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleEditClick = (accommodation) => {
    setEditAccommodation(accommodation);
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditAccommodation(null);
    setEditDialogOpen(false);
  };

  const handleEditSave = async () => {
    try {
      const docRef = doc(db, 'accommodation', editAccommodation.id);
      await updateDoc(docRef, {
        ...editAccommodation,
        updatedAt: new Date()
      });
      setEditDialogOpen(false);
      setEditAccommodation(null);
    } catch (error) {
      console.error('Error updating accommodation:', error);
      alert('Error updating accommodation. Please try again.');
    }
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm('Are you sure you want to delete this accommodation?')) {
      try {
        await deleteDoc(doc(db, 'accommodation', id));
      } catch (error) {
        console.error('Error deleting accommodation:', error);
        alert('Error deleting accommodation. Please try again.');
      }
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('amenities.')) {
      const amenityName = name.split('.')[1];
      setEditAccommodation({
        ...editAccommodation,
        amenities: {
          ...editAccommodation.amenities,
          [amenityName]: checked
        }
      });
    } else {
      setEditAccommodation({
        ...editAccommodation,
        [name]: type === 'number' ? parseInt(value) : value
      });
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <Box sx={{ flexGrow: 1, pt: '2rem', justifyContent: 'center',}}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4 }}>
            Available Accommodations
          </Typography>

          {loading ? (
            <Typography>Loading accommodations...</Typography>
          ) : (
            <Grid container spacing={3}>
              {accommodations.map((accommodation) => (
                <Grid item xs={12} sm={6} md={4} key={accommodation.id}>
                  <Card>
                    <CardContent>
                      <Box>
                        <Typography variant="h5">{accommodation.name}</Typography>
                        <img 
                          src={accommodation.imageUrl} 
                          alt={accommodation.name} 
                          style={{ width: '100%', height: 'auto' }} 
                        />
                        <Typography>{accommodation.description}</Typography>
                      </Box>
                      <Typography variant="h6" color="primary" gutterBottom>
                        {accommodation.price}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="body2">
                          Max Guests: {accommodation.guests}
                        </Typography>
                        <Chip
                          icon={<InventoryIcon />}
                          label={`${accommodation.availability || 0} units available`}
                          color={accommodation.availability > 0 ? "success" : "error"}
                          size="small"
                        />
                      </Box>
                      <Box sx={{ mt: 2 }}>
                        {accommodation.amenities.wifi && (
                          <Chip icon={<WifiIcon />} label="WiFi" sx={{ m: 0.5 }} />
                        )}
                        {accommodation.amenities.pool && (
                          <Chip icon={<PoolIcon />} label="Pool" sx={{ m: 0.5 }} />
                        )}
                        {accommodation.amenities.parking && (
                          <Chip icon={<ParkingIcon />} label="Parking" sx={{ m: 0.5 }} />
                        )}
                        {accommodation.amenities.breakfast && (
                          <Chip icon={<BreakfastIcon />} label="Breakfast" sx={{ m: 0.5 }} />
                        )}
                      </Box>
                      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                        <Button
                          startIcon={<EditIcon />}
                          onClick={() => handleEditClick(accommodation)}
                        >
                          Edit
                        </Button>
                        <Button
                          startIcon={<DeleteIcon />}
                          color="error"
                          onClick={() => handleDeleteClick(accommodation.id)}
                        >
                          Delete
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>

      <Dialog open={editDialogOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Accommodation</DialogTitle>
        <DialogContent>
          {editAccommodation && (
            <form>
              <TextField
                margin="dense"
                name="name"
                label="Accommodation Name"
                fullWidth
                variant="outlined"
                value={editAccommodation.name}
                onChange={handleEditChange}
                required
              />
              <TextField
                margin="dense"
                name="description"
                label="Description"
                fullWidth
                variant="outlined"
                value={editAccommodation.description}
                onChange={handleEditChange}
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
                value={editAccommodation.guests}
                onChange={handleEditChange}
                required
                inputProps={{ min: 1 }}
              />
              <TextField
                margin="dense"
                name="price"
                label="Price (R)"
                fullWidth
                variant="outlined"
                value={editAccommodation.price.replace('R ', '')}
                onChange={handleEditChange}
                required
              />
              <TextField
                margin="dense"
                name="availability"
                label="Availability"
                type="number"
                fullWidth
                variant="outlined"
                value={editAccommodation.availability}
                onChange={handleEditChange}
                required
                inputProps={{ min: 0 }}
              />
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle1">Amenities:</Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities.wifi}
                      onChange={handleEditChange}
                      name="amenities.wifi"
                    />
                  }
                  label="Wi-Fi"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities.pool}
                      onChange={handleEditChange}
                      name="amenities.pool"
                    />
                  }
                  label="Pool"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities.parking}
                      onChange={handleEditChange}
                      name="amenities.parking"
                    />
                  }
                  label="Parking"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities.breakfast}
                      onChange={handleEditChange}
                      name="amenities.breakfast"
                    />
                  }
                  label="Breakfast"
                />
              </Box>
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleEditSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Accommodation;