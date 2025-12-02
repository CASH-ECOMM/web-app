import React, { useEffect, useState } from 'react';
import {
  Button,
  TextField,
  Typography,
  Box,
  Alert,
  Stack,
  Grid,
  Divider,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../api/api.js';

const Payment = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    cardNum: '',
    expDate: '',
    cvv: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [catalogueInfo, setCatalogueInfo] = useState(null);
  const [totalCost, setTotalCost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get catalogueId and finalPrice from AuctionsWon page via state
  const catalogueId = useLocation().state.catalogueId;
  const expeditedShipping = useLocation().state.expeditedShipping;

  useEffect(() => {
    const fetchCatalogueItem = async () => {
      setError('');
      try {
        const res = await apiClient.get(`/catalogue/items/${catalogueId}`);
        setCatalogueInfo(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Failed to retrieve catalogue item info'
        );
        setLoading(false);
      }
    };

    if (catalogueId) fetchCatalogueItem();
    else {
      setError('No catalogue ID found.');
      setLoading(false);
    }

    const fetchTotalCost = async () => {
      setError('');
      try {
        const res = await apiClient.post(`/payments/total-cost`, {
          item_id: catalogueId,
          shipping_type: expeditedShipping ? 'EXPEDITED' : 'REGULAR',
        });
        setTotalCost(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to retrieve total cost'
        );
      } finally {
        setLoading(false);
      }
    };
    if (catalogueId) fetchTotalCost();
    else {
      setError('Total cost not found.');
      setLoading(false);
    }
  }, [catalogueId, expeditedShipping]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const info = {
      itemId: catalogueId,
      shipping_type: 1,
      creditCard: {
        card_number: form.cardNum,
        name_on_card: form.fullName,
        expiry_date: form.expDate,
        security_code: form.cvv,
      },
    };

    try {
      const res = await apiClient.post('/payments/process', info);

      if (!res.data) {
        setError(res?.data?.message || 'Invalid payment credentials.');
      }
      if (res.data.success === false) {
        setError(
          res?.data?.message ||
            'Payment failed. Please check your details and try again.'
        );
      } else {
        setTimeout(
          () =>
            navigate('/confirmation', {
              state: { payment_id: res.data.payment_id },
            }),
          1500
        ); // Navigates to the receipt page with state for paymentId
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Payment processing failed.');
    }
  };

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', py: 4 }}>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <Typography>Loading...</Typography>
        </Box>
      ) : error && !catalogueInfo ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="50vh"
        >
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
          }}
        >
          <Grid
            container
            spacing={4}
            justifyContent="center"
            alignItems="flex-start"
            sx={{ maxWidth: 1000 }}
          >
            {/* Payment Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                }}
              >
                <Typography component="h1" variant="h4" gutterBottom>
                  Payment
                </Typography>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ marginTop: 2, width: '100%', maxWidth: 500 }}
                >
                  <Stack spacing={2}>
                    <TextField
                      required
                      fullWidth
                      label="Card Number"
                      name="cardNum"
                      value={form.cardNum}
                      onChange={handleChange}
                      inputProps={{ maxLength: 16, inputMode: 'numeric' }}
                    />
                    <Stack direction="row" spacing={2}>
                      <TextField
                        required
                        fullWidth
                        label="Expiry Date (MM/YY)"
                        name="expDate"
                        value={form.expDate}
                        onChange={handleChange}
                        inputProps={{ maxLength: 5, inputMode: 'numeric' }}
                      />
                      <TextField
                        required
                        fullWidth
                        label="CVV"
                        name="cvv"
                        value={form.cvv}
                        onChange={handleChange}
                        inputProps={{ maxLength: 3, inputMode: 'numeric' }}
                      />
                    </Stack>
                    <TextField
                      required
                      fullWidth
                      label="Cardholder Full Name"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                    />

                    {error && (
                      <Alert severity="error" sx={{ width: '100%' }}>
                        {error}
                      </Alert>
                    )}

                    <Button fullWidth variant="contained" type="submit">
                      Complete Payment
                    </Button>
                  </Stack>
                </Box>
              </Box>
            </Grid>

            {/* Subtotal Details Section */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: 3,
                }}
              >
                <Typography component="h1" variant="h4" gutterBottom>
                  Order Summary
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    marginTop: 2,
                    flexDirection: 'column',
                    alignItems: 'center',
                    p: 3,
                    bgcolor: 'action.hover',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 500,
                  }}
                >
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    {catalogueInfo.title}
                  </Typography>
                  <Divider sx={{ width: '100%', mb: 2 }} />
                  <Stack spacing={1.5} width="100%">
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1">Subtotal</Typography>
                      <Typography variant="body1">
                        ${parseFloat(totalCost.item_cost).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1">Shipping</Typography>
                      <Typography variant="body1">
                        ${parseFloat(totalCost.shipping_cost).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body1">Tax (HST)</Typography>
                      <Typography variant="body1">
                        ${parseFloat(totalCost.hst_amount).toFixed(2)}
                      </Typography>
                    </Stack>
                    <Divider sx={{ my: 1 }} />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="h6" fontWeight="bold">
                        Total
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        ${parseFloat(totalCost.total_cost).toFixed(2)}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default Payment;
