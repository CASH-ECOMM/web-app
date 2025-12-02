import React, { useEffect, useState } from 'react';
import {
  Button,
  Typography,
  Box,
  Stack,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import apiClient from '../api/api.js';

const Confirmation = () => {
  const navigate = useNavigate();

  const [receiptInfo, setReceiptInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Get catalogueId and finalPrice from AuctionsWon page via state
  const paymentId = useLocation().state?.payment_id;

  useEffect(() => {
    const fetchReceiptInfo = async () => {
      setError('');
      try {
        const res = await apiClient.get(`/payments/${paymentId}`);
        setReceiptInfo(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || 'Failed to retrieve receipt info'
        );
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    if (paymentId) fetchReceiptInfo();
    else {
      setError('No payment ID found.');
      setLoading(false);
    }
  }, [paymentId]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        // justifyContent: 'center',
        width: '100%',
        minHeight: '100vh',
        py: 4,
        bgcolor: 'background.default',
      }}
    >
      {loading ? (
        <Typography>Loading...</Typography>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <>
          {/* Success Header */}
          <Stack alignItems="center" spacing={2} sx={{ mb: 4 }}>
            <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
            <Typography variant="h4" fontWeight="bold" color="success.main">
              Order Confirmed!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Thank you for your purchase. Your order has been successfully
              processed.
            </Typography>
          </Stack>

          <Stack
            spacing={4}
            direction={{ xs: 'column', md: 'row' }}
            sx={{
              width: '100%',
              maxWidth: 1000,
              px: 3,
            }}
          >
            {/* Receipt Section */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                flex: 1,
                borderRadius: 3,
                bgcolor: 'background.paper',
              }}
            >
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ mb: 3, textAlign: 'center' }}
              >
                Receipt
              </Typography>
              <Divider sx={{ mb: 3 }} />

              <Stack spacing={2.5}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Payment ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{receiptInfo.payment_id}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Receipt ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{receiptInfo.receipt.receipt_id}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Name
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {receiptInfo.receipt.first_name}{' '}
                    {receiptInfo.receipt.last_name}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Address
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight="medium"
                    sx={{ textAlign: 'right', maxWidth: '60%' }}
                  >
                    {receiptInfo.receipt.address}
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Item ID
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    #{receiptInfo.receipt.item_id}
                  </Typography>
                </Stack>

                <Divider sx={{ my: 1 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="h6" fontWeight="bold">
                    Total Paid
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    ${receiptInfo.receipt.total_paid}
                  </Typography>
                </Stack>
              </Stack>
            </Paper>

            {/* Shipping Details Section */}
            <Paper
              elevation={3}
              sx={{
                p: 4,
                flex: 1,
                borderRadius: 3,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Stack alignItems="center" spacing={1} sx={{ mb: 3 }}>
                <LocalShippingIcon
                  sx={{ fontSize: 40, color: 'primary.main' }}
                />
                <Typography variant="h5" fontWeight="bold" textAlign="center">
                  Shipping Details
                </Typography>
              </Stack>
              <Divider sx={{ mb: 3 }} />

              <Box
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  mb: 3,
                }}
              >
                <Typography
                  variant="body1"
                  textAlign="center"
                  color="text.secondary"
                >
                  {receiptInfo.shipping_message}
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/catalogue')}
                sx={{
                  borderRadius: 2,
                  py: 1.5,
                  textTransform: 'none',
                  fontSize: '1rem',
                }}
              >
                Continue Shopping
              </Button>
            </Paper>
          </Stack>
        </>
      )}
    </Box>
  );
};

export default Confirmation;
