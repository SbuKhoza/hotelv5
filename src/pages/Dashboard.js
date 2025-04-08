import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../service/firebase';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Home as HomeIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Inventory as InventoryIcon,
  HotelOutlined as RoomIcon
} from '@mui/icons-material';
import Navbar from '../components/Navbar';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAccommodations: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    availableUnits: 0,
    occupancyRate: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [popularAccommodations, setPopularAccommodations] = useState([]);
  const [accommodationTypes, setAccommodationTypes] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch accommodations
        const accommodationsRef = collection(db, 'accommodation');
        const accommodationsSnapshot = await getDocs(accommodationsRef);
        const accommodations = accommodationsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch users
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const users = usersSnapshot.docs.length;
        
        // Fetch bookings (assuming you have a bookings collection)
        const bookingsRef = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);
        const bookings = bookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate stats
        const totalAccommodations = accommodations.length;
        const availableUnits = accommodations.reduce((sum, acc) => sum + (acc.availability || 0), 0);
        const totalCapacity = accommodations.reduce((sum, acc) => sum + (acc.guests || 0) * (acc.totalUnits || 1), 0);
        const occupiedCapacity = totalCapacity - availableUnits;
        const occupancyRate = totalCapacity > 0 ? (occupiedCapacity / totalCapacity) * 100 : 0;
        
        // Calculate total revenue from bookings
        const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
        
        // Get recent bookings
        const recentBookingsQuery = query(
          collection(db, 'bookings'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const recentBookingsSnapshot = await getDocs(recentBookingsQuery);
        const recentBookingsList = recentBookingsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Get popular accommodations based on booking count
        const accommodationBookingCounts = {};
        bookings.forEach(booking => {
          if (booking.accommodationId) {
            accommodationBookingCounts[booking.accommodationId] = (accommodationBookingCounts[booking.accommodationId] || 0) + 1;
          }
        });
        
        const popularAccommodationsList = accommodations
          .map(acc => ({
            ...acc,
            bookingCount: accommodationBookingCounts[acc.id] || 0
          }))
          .sort((a, b) => b.bookingCount - a.bookingCount)
          .slice(0, 5);
        
        // Accommodation types distribution for pie chart
        const typeDistribution = {};
        accommodations.forEach(acc => {
          const type = acc.type || 'Standard';
          typeDistribution[type] = (typeDistribution[type] || 0) + 1;
        });
        
        const accommodationTypeData = Object.keys(typeDistribution).map(type => ({
          name: type,
          value: typeDistribution[type]
        }));
        
        // Generate mock revenue data for last 6 months
        const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];
        const revenueByMonth = months.map(month => ({
          name: month,
          revenue: Math.floor(Math.random() * 50000) + 10000
        }));
        
        setStats({
          totalAccommodations,
          totalUsers: users,
          totalBookings: bookings.length,
          totalRevenue,
          availableUnits,
          occupancyRate: occupancyRate.toFixed(1)
        });
        
        setRecentBookings(recentBookingsList);
        setPopularAccommodations(popularAccommodationsList);
        setAccommodationTypes(accommodationTypeData);
        setRevenueData(revenueByMonth);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  if (loading) {
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
          Dashboard
        </Typography>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <HomeIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                {stats.totalAccommodations}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Accommodations
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <PeopleIcon color="secondary" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                {stats.totalUsers}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Users
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <CalendarIcon color="error" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                {stats.totalBookings}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Bookings
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <MoneyIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                R {stats.totalRevenue.toLocaleString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Revenue
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <InventoryIcon color="info" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                {stats.availableUnits}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Available Units
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={2}>
            <Paper elevation={3} sx={{ p: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
              <RoomIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h6" component="div">
                {stats.occupancyRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Occupancy Rate
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts and Lists */}
        <Grid container spacing={3}>
          {/* Revenue Chart */}
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Revenue (Last 6 Months)
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={revenueData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R ${value}`, 'Revenue']} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#8884d8" name="Revenue (R)" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Accommodation Types Pie Chart */}
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Accommodation Types
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={accommodationTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {accommodationTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, props) => [value, props.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          
          {/* Popular Accommodations */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardHeader title="Popular Accommodations" />
              <CardContent>
                <List>
                  {popularAccommodations.map((accommodation, index) => (
                    <React.Fragment key={accommodation.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS[index % COLORS.length] }}>
                            <HomeIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={accommodation.name}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {accommodation.price}
                              </Typography>
                              {` — ${accommodation.bookingCount} bookings`}
                            </React.Fragment>
                          }
                        />
                        <Chip 
                          label={`${accommodation.availability || 0} available`}
                          color={accommodation.availability > 0 ? "success" : "error"}
                          size="small"
                        />
                      </ListItem>
                      {index < popularAccommodations.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
          
          {/* Recent Bookings */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ height: '100%' }}>
              <CardHeader title="Recent Bookings" />
              <CardContent>
                <List>
                  {recentBookings.map((booking, index) => (
                    <React.Fragment key={booking.id}>
                      <ListItem>
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: COLORS[(index + 2) % COLORS.length] }}>
                            <CalendarIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={booking.userName || 'Guest'}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="text.primary">
                                {booking.accommodationName || 'Accommodation'}
                              </Typography>
                              {booking.checkIn && booking.checkOut && 
                                ` — ${new Date(booking.checkIn.toDate()).toLocaleDateString()} to 
                                ${new Date(booking.checkOut.toDate()).toLocaleDateString()}`
                              }
                            </React.Fragment>
                          }
                        />
                        <Typography variant="body2" color="primary">
                          R {booking.totalAmount?.toLocaleString() || 0}
                        </Typography>
                      </ListItem>
                      {index < recentBookings.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}

export default Dashboard;