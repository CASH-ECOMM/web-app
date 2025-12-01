import React, { useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Link as RouterLink, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';
import apiClient from '../api/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await apiClient.post('/users/signin', {
        username: form.username,
        password: form.password,
      });
      const data = res.data;

      if (!data.jwt) {
        setError('Login failed. No access token returned.');
        return;
      }

      localStorage.setItem('access_token', data.jwt);
      localStorage.setItem('userId', data.userId);

      const userRes = await apiClient.get(`/users/${data.userId}`);
      const userData = userRes.data;
      localStorage.setItem('username', userData.username);
      localStorage.setItem('email', userData.email);
      localStorage.setItem('firstName', userData.firstName);
      localStorage.setItem('lastName', userData.lastName);
      login();
      navigate('/catalogue');
    } catch (err) {
      console.error(err);
      const message =
        err.response?.data?.message ||
        err.response?.data ||
        'Could not connect to the server. Please try again.';
      setError(message);
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
        <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
          <LockOutlinedIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Sign In
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
          />

          <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>
            Login
          </Button>

          <Button
            component={RouterLink}
            to="/forgot-password"
            fullWidth
            sx={{ mt: 2 }}
          >
            Forgot password?
          </Button>

          <Button
            component={RouterLink}
            to="/signup"
            fullWidth
            sx={{ mt: 1 }}
          >
            Create an account
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
