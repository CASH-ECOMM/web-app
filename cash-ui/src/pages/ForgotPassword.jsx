import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import apiClient from '../api/api';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      await apiClient.post('/users/forgot-password', { username, email });
      setNotice(
        'If the username and email exist, a password reset link was sent.'
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to send reset link. Email may not exist.'
      );
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'warning.main' }}>
          <HelpOutlineIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Forgot Password
        </Typography>

        {notice && (
          <Alert severity="info" sx={{ width: '100%', mt: 2 }}>
            {notice}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: '100%' }}
        >
          <TextField
            margin="normal"
            fullWidth
            required
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            margin="normal"
            fullWidth
            required
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>
            Send Reset Link
          </Button>

          <Button fullWidth onClick={() => navigate('/login')} sx={{ mt: 2 }}>
            Back to Login
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
