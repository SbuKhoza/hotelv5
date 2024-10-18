import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '../service/firebase';
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
  FormControlLabel,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  Wifi as WifiIcon,
  Pool as PoolIcon,
  LocalParking as ParkingIcon,
  FreeBreakfast as BreakfastIcon,
  Inventory as InventoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AddPhotoAlternate as AddPhotoIcon,
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

function Accommodation() {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editAccommodation, setEditAccommodation] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [savingChanges, setSavingChanges] = useState(false);

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
    setNewImages([]);
  };

  const handleEditClose = () => {
    setEditAccommodation(null);
    setEditDialogOpen(false);
    setNewImages([]);
  };

  const handleEditSave = async () => {
    setSavingChanges(true);
    try {
      const docRef = doc(db, 'accommodation', editAccommodation.id);
      const updatedImages = [...(editAccommodation.images || [])];

      // Upload new images
      for (const file of newImages) {
        const storageRef = ref(storage, `accommodations/${editAccommodation.id}/${file.name}`);
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        updatedImages.push(downloadURL);
      }

      await updateDoc(docRef, {
        ...editAccommodation,
        images: updatedImages,
        updatedAt: new Date()
      });

      setEditDialogOpen(false);
      setEditAccommodation(null);
      setNewImages([]);
    } catch (error) {
      console.error('Error updating accommodation:', error);
      alert('Error updating accommodation. Please try again.');
    } finally {
      setSavingChanges(false);
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setNewImages([...newImages, ...files]);
  };

  const handleImageDelete = async (index) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      try {
        const imageUrl = editAccommodation.images[index];
        const imageRef = ref(storage, imageUrl);
        await deleteObject(imageRef);

        const updatedImages = editAccommodation.images.filter((_, i) => i !== index);
        setEditAccommodation({
          ...editAccommodation,
          images: updatedImages
        });
      } catch (error) {
        console.error('Error deleting image:', error);
        alert('Error deleting image. Please try again.');
      }
    }
  };

  return (
    <div style={{ display: 'flex' }}>
      <Navbar />
      <Box sx={{ flexGrow: 1, pt: '2rem', justifyContent: 'center' }}>
        <Container maxWidth="lg">
          <Typography variant="h4" sx={{ mb: 4 }}>
            Available Accommodations
          </Typography>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              {accommodations.map((accommodation) => (
                <Grid item xs={12} sm={6} md={4} key={accommodation.id}>
                  <Card>
                    {accommodation.images && accommodation.images.length > 0 && (
                      <CardMedia
                        component="img"
                        height="140"
                        image={accommodation.images[0]}
                        alt={accommodation.name}
                      />
                    )}
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {accommodation.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {accommodation.description}
                      </Typography>
                      <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
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
                        {accommodation.amenities?.wifi && (
                          <Chip icon={<WifiIcon />} label="WiFi" sx={{ m: 0.5 }} />
                        )}
                        {accommodation.amenities?.pool && (
                          <Chip icon={<PoolIcon />} label="Pool" sx={{ m: 0.5 }} />
                        )}
                        {accommodation.amenities?.parking && (
                          <Chip icon={<ParkingIcon />} label="Parking" sx={{ m: 0.5 }} />
                        )}
                        {accommodation.amenities?.breakfast && (
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

      <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
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
                      checked={editAccommodation.amenities?.wifi || false}
                      onChange={handleEditChange}
                      name="amenities.wifi"
                    />
                  }
                  label="Wi-Fi"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities?.pool || false}
                      onChange={handleEditChange}
                      name="amenities.pool"
                    />
                  }
                  label="Pool"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities?.parking || false}
                      onChange={handleEditChange}
                      name="amenities.parking"
                    />
                  }
                  label="Parking"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={editAccommodation.amenities?.breakfast || false}
                      onChange={handleEditChange}
                      name="amenities.breakfast"
                    />
                  }
                  label="Breakfast"
                />
              </Box>
              <Box sx={{ mt: 2, mb: 1 }}>
                <Typography variant="subtitle1">Images:</Typography>
                <Grid container spacing={2}>
                  {editAccommodation.images && editAccommodation.images.map((image, index) => (
                    <Grid item xs={4} key={index}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={image} alt={`Accommodation ${index}`} style={{ width: '100%', height: 'auto' }} />
                        <IconButton
                          sx={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.7)' }}
                          onClick={() => handleImageDelete(index)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </Grid>
                  ))}
                  {newImages.map((file, index) => (
                    <Grid item xs={4} key={`new-${index}`}>
                      <Box sx={{ position: 'relative' }}>
                        <img src={URL.createObjectURL(file)} alt={`New upload ${index}`} style={{ width: '100%', height: 'auto' }} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Button
                  variant="contained"
                  component="label"
                  startIcon={<AddPhotoIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Images
                  <input
                    type="file"
                    hidden
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </Button>
              </Box>
            </form>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose} disabled={savingChanges}>Cancel</Button>
          <Button onClick={handleEditSave} disabled={savingChanges}>
            {savingChanges ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default Accommodation;