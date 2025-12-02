import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { deepOrange } from '@mui/material/colors';
import LogoutIcon from '@mui/icons-material/Logout';
import apiClient from '../api/api';
import { useAuth } from '../auth/AuthContext';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [signoutLoading, setSignoutLoading] = useState(false);
  const navigate = useNavigate();

  // Get userId from localStorage (for fetching profile)
  const userId = localStorage.getItem('userId');
  const { logout } = useAuth();

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiClient.get(`/users/${userId}`);
        setProfile(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchProfile();
    else {
      setError('No user ID found.');
      setLoading(false);
    }
  }, [userId]);

  const handleSignOut = async () => {
    setSignoutLoading(true);
    setError('');
    await logout();
    navigate('/login');
    setSignoutLoading(false);
  };

  return (
    <Box
      sx={{
        // minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        sx={{
          width: 450,
          // bgcolor: 'background.paper',
          py: 3,
          px: 10,
          // borderRadius: 3,
          // boxShadow: 3,
        }}
      >
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          <>
            <Avatar sx={{ width: 60, height: 60, bgcolor: '#1976d2' }}>
              {profile.firstName?.[0] + profile.lastName?.[0] || ''}
            </Avatar>
            <TextField
              label="Username"
              value={profile.username}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              value={profile.email}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="First Name"
              value={profile.firstName}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Last Name"
              value={profile.lastName}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Street Name"
              value={profile.shippingAddress?.streetName || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Street Number"
              value={profile.shippingAddress?.streetNumber || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="City"
              value={profile.shippingAddress?.city || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Country"
              value={profile.shippingAddress?.country || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <TextField
              label="Postal Code"
              value={profile.shippingAddress?.postalCode || ''}
              InputProps={{ readOnly: true }}
              fullWidth
              size="small"
            />
            <Button
              variant="contained"
              color="error"
              endIcon={<LogoutIcon />}
              onClick={handleSignOut}
              sx={{ width: '50%', borderRadius: 2 }}
              disabled={signoutLoading}
            >
              Sign Out
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
};

export default Profile;
