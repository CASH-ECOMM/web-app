import React, {useEffect, useState} from 'react';
import {Button, TextField, Typography, Box, Alert, Stack, Grid, Divider} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from "../api/api.js";

const Payment = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({ cardNum: '', expDate: '', cvv: '', fullName: '' });
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
                setError(err.response?.data?.message || 'Failed to retrieve catalogue item info');
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
                const res = await apiClient.post(`/payments/total-cost`, {item_id: catalogueId, shipping_type: expeditedShipping? "EXPEDITED" : "REGULAR"});
                setTotalCost(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to retrieve total cost');
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
            }
        };

        try {
            const res = await apiClient.post('/payments/process', info);

            if (!res.data) {
                setError(res?.data?.message || 'Invalid payment credentials.');
            }
            if (res.data.success === false) {
                setError(res?.data?.message || 'Payment failed. Please check your details and try again.');
            }
            else {
                setTimeout(() => navigate('/confirmation', {state: {payment_id: res.data.payment_id}}), 1500); // Navigates to the receipt page with state for paymentId
            }
        } catch (err) {
            console.error(err);
            setError('Could not connect to the server. Please try again.');
        }
    };

    return (
        <Grid container direction="row" alignItems="center" justifyContent="center" width="100%" height="100%">
            {loading ? (
                <Typography>Loading...</Typography>
            ) : error ? (
                <Typography color="error">{error}</Typography>
            ) : (
                <>
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '75%'
                        }}
                    >

                        <Typography component="h1" variant="h2">
                            Payment
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
                                label="Card Number"
                                name="cardNum"
                                value={form.cardNum}
                                onChange={handleChange}
                            />
                            <Stack direction='row' spacing={10}>
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="Expiry Date (MM/YY)"
                                    name="expDate"
                                    value={form.expDate}
                                    onChange={handleChange}
                                />
                                <TextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    label="CVV"
                                    name="cvv"
                                    value={form.cvv}
                                    onChange={handleChange}
                                />
                            </Stack>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                label="Cardholder Full Name"
                                name="fullName"
                                value={form.fullName}
                                onChange={handleChange}
                            />

                            <Button fullWidth variant="contained" type="submit" sx={{ mt: 3 }}>
                                Complete Payment
                            </Button>

                        </Box>
                    </Box>
                    <Box
                        sx={{
                            marginTop: 8,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            width: '25%',
                            bgcolor: '#F5F5F5'
                        }}
                        >
                        <Stack spacing={2} width="100%" alignItems="center">
                            <Typography variant="h3">{catalogueInfo.title}</Typography>
                            <Divider sx={{ width: '100%' }} />
                            <Stack direction="row" spacing={30}>
                                <Typography variant="h6" sx={{ width: '75%' }}>Subtotal</Typography>
                                <Typography variant="h6" sx={{ width: '25%' }}>${totalCost.item_cost}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={30}>
                                <Typography variant="h6" sx={{ width: '75%' }}>Shipping</Typography>
                                <Typography variant="h6" sx={{ width: '25%' }}>${totalCost.shipping_cost}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={30}>
                                <Typography variant="h6" sx={{ width: '75%' }}>Tax</Typography>
                                <Typography variant="h6" sx={{ width: '25%' }}>${totalCost.hst_amount}</Typography>
                            </Stack>
                            <Divider sx={{ width: '100%' }} />
                            <Stack direction="row" spacing={30}>
                                <Typography variant="h5" fontWeight="bold" sx={{ width: '75%' }}>Total</Typography>
                                <Typography variant="h5" fontWeight="bold" sx={{ width: '25%' }}>${totalCost.total_cost}</Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </>
            )}
        </Grid>
    );
};

export default Payment;