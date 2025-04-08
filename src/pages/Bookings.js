import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../service/firebase';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Chip,
  Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentBooking, setCurrentBooking] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Form state for editing bookings
  const [formValues, setFormValues] = useState({
    accommodationId: '',
    accommodationName: '',
    userName: '',
    checkIn: '',
    checkOut: '',
    totalPrice: '',
    status: 'confirmed'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch accommodations first
      const accommodationsRef = collection(db, 'accommodation');
      const accommodationsSnapshot = await getDocs(accommodationsRef);
      const accommodationsData = accommodationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAccommodations(accommodationsData);
      
      // Fetch bookings
      const bookingsRef = collection(db, 'bookings');
      const bookingsSnapshot = await getDocs(bookingsRef);
      const bookingsData = bookingsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firebase timestamps to Date objects
        const checkIn = data.checkIn?.toDate ? data.checkIn.toDate() : new Date(data.checkIn || data.checkInDate);
        const checkOut = data.checkOut?.toDate ? data.checkOut.toDate() : new Date(data.checkOut || data.checkOutDate);
        
        // Find the accommodation name if accommodationId exists
        let accommodationName = data.accommodationName || 'Unknown';
        if (data.accommodationId) {
          const accommodation = accommodationsData.find(acc => acc.id === data.accommodationId);
          if (accommodation) {
            accommodationName = accommodation.name;
          }
        }
        
        return {
          id: doc.id,
          ...data,
          checkIn,
          checkOut,
          accommodationName,
          status: data.status || 'confirmed', // Default status if not specified
          // Use totalPrice from Firestore, fallback to totalAmount if totalPrice doesn't exist
          totalPrice: data.totalPrice !== undefined ? data.totalPrice : data.totalAmount
        };
      });
      
      setBookings(bookingsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (booking) => {
    // Format dates for the form
    const checkInDate = booking.checkIn instanceof Date 
      ? booking.checkIn.toISOString().split('T')[0]
      : '';
    const checkOutDate = booking.checkOut instanceof Date 
      ? booking.checkOut.toISOString().split('T')[0]
      : '';
    
    setCurrentBooking(booking);
    setFormValues({
      accommodationId: booking.accommodationId || '',
      accommodationName: booking.accommodationName || '',
      userName: booking.userName || booking.user || '',
      checkIn: checkInDate,
      checkOut: checkOutDate,
      totalPrice: booking.totalPrice?.toString() || '0',
      status: booking.status || 'confirmed'
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (booking) => {
    setCurrentBooking(booking);
    setDeleteDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleDeleteClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value
    });
  };

  const handleEditSubmit = async () => {
    if (!currentBooking) return;
    
    setLoading(true);
    try {
      const bookingRef = doc(db, 'bookings', currentBooking.id);
      
      // Calculate total price if possible
      let totalPrice = parseFloat(formValues.totalPrice);
      if (isNaN(totalPrice)) {
        totalPrice = 0;
      }
      
      await updateDoc(bookingRef, {
        accommodationId: formValues.accommodationId,
        accommodationName: formValues.accommodationName,
        userName: formValues.userName,
        checkIn: new Date(formValues.checkIn),
        checkOut: new Date(formValues.checkOut),
        totalPrice: totalPrice,
        status: formValues.status,
        updatedAt: new Date()
      });
      
      // Refresh the bookings
      await fetchData();
      setEditDialogOpen(false);
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("Failed to update booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!currentBooking) return;
    
    setLoading(true);
    try {
      const bookingRef = doc(db, 'bookings', currentBooking.id);
      await deleteDoc(bookingRef);
      
      // Refresh the bookings
      await fetchData();
      setDeleteDialogOpen(false);
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings based on status and search term
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = filterStatus === 'all' || booking.status === filterStatus;
    const matchesSearch = 
      searchTerm === '' || 
      booking.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.accommodationName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get status chip color
  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'cancelled':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && bookings.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" sx={{ mb: 4, mt: 2 }}>
          Bookings Management
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterIcon sx={{ mr: 1 }} />
            <TextField
              select
              label="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ minWidth: 150 }}
              size="small"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="confirmed">Confirmed</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </TextField>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SearchIcon sx={{ mr: 1 }} />
            <TextField
              label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              placeholder="Guest or Accommodation"
            />
          </Box>
        </Paper>

        {/* Bookings Table */}
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'black' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Guest</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Accommodation</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-In</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Check-Out</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total Price</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredBookings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">No bookings found</TableCell>
                </TableRow>
              ) : (
                filteredBookings.map((booking) => (
                  <TableRow key={booking.id} hover>
                    <TableCell>{booking.userName || booking.user || 'Guest'}</TableCell>
                    <TableCell>{booking.accommodationName}</TableCell>
                    <TableCell>
                      {booking.checkIn instanceof Date ? booking.checkIn.toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {booking.checkOut instanceof Date ? booking.checkOut.toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      {booking.totalPrice ? `R ${parseFloat(booking.totalPrice).toLocaleString()}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={booking.status || 'confirmed'} 
                        color={getStatusColor(booking.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton color="primary" onClick={() => handleEditClick(booking)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(booking)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Edit Booking Dialog */}
        <Dialog open={editDialogOpen} onClose={handleEditClose} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Booking</DialogTitle>
          <DialogContent>
            <TextField
              margin="dense"
              name="accommodationId"
              label="Accommodation"
              fullWidth
              select
              value={formValues.accommodationId}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            >
              {accommodations.map((accommodation) => (
                <MenuItem key={accommodation.id} value={accommodation.id}>
                  {accommodation.name}
                </MenuItem>
              ))}
            </TextField>
            
            <TextField
              margin="dense"
              name="userName"
              label="Guest Name"
              fullWidth
              value={formValues.userName}
              onChange={handleFormChange}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                margin="dense"
                name="checkIn"
                label="Check-In Date"
                type="date"
                fullWidth
                value={formValues.checkIn}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
              
              <TextField
                margin="dense"
                name="checkOut"
                label="Check-Out Date"
                type="date"
                fullWidth
                value={formValues.checkOut}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                margin="dense"
                name="totalPrice"
                label="Total Price (R)"
                type="number"
                fullWidth
                value={formValues.totalPrice}
                onChange={handleFormChange}
                InputProps={{ inputProps: { min: 0, step: 0.01 } }}
              />
              
              <TextField
                margin="dense"
                name="status"
                label="Status"
                select
                fullWidth
                value={formValues.status}
                onChange={handleFormChange}
              >
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button onClick={handleEditSubmit} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleDeleteClose}>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete the booking for {currentBooking?.userName || 'this guest'}?
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteClose}>Cancel</Button>
            <Button onClick={handleDeleteSubmit} color="error" disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}

export default Bookings;