import React, { useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  Typography,
  Container,
  Box,
  Alert,
  Grid,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/api';

export default function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    email: '',
    shippingAddress: {
      streetName: '',
      streetNumber: '',
      city: '',
      country: '',
      postalCode: '',
    },
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e) => {
    setForm({
      ...form,
      shippingAddress: {
        ...form.shippingAddress,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      username: form.username,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      shippingAddress: {
        streetName: form.shippingAddress.streetName,
        streetNumber: form.shippingAddress.streetNumber,
        city: form.shippingAddress.city,
        country: form.shippingAddress.country,
        postalCode: form.shippingAddress.postalCode,
      },
    };

    try {
      const res = await apiClient.post('/users/signup', payload);

      if (!res.data) {
        setError('Signup failed.');
        return;
      }

      setSuccess(res.data.message || 'Account created successfully!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Signup failed. Please try again.'
      );
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 6,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <PersonAddIcon />
        </Avatar>

        <Typography component="h1" variant="h5">
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            mt: 3,
            width: '100%',
            alignItems: 'center',
          }}
        >
          <Grid container spacing={2} sx={{ justifyContent: 'center' }}>
            {['firstName', 'lastName', 'username', 'email', 'password'].map(
              (field) => (
                <Grid item xs={12} key={field}>
                  <TextField
                    required
                    fullWidth
                    name={field}
                    type={field === 'password' ? 'password' : 'text'}
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    value={form[field]}
                    onChange={handleChange}
                  />
                </Grid>
              )
            )}

            {[
              'streetName',
              'streetNumber',
              'city',
              'country',
              'postalCode',
            ].map((field) => (
              <Grid item xs={12} key={field}>
                <TextField
                  required
                  fullWidth
                  name={field}
                  label={field
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/^./, (str) => str.toUpperCase())}
                  value={form.shippingAddress[field]}
                  onChange={handleAddressChange}
                />
              </Grid>
            ))}
          </Grid>

          <Button fullWidth type="submit" variant="contained" sx={{ mt: 4 }}>
            Sign Up
          </Button>

          <Button fullWidth sx={{ mt: 2 }} onClick={() => navigate('/login')}>
            Already have an account?
          </Button>
        </Box>
      </Box>
    </Container>
  );
}
