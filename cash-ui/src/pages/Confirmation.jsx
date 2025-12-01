import React, {useEffect, useState} from 'react';
import {Button, Typography, Box, Stack, Paper} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from "../api/api.js";

const Confirmation = () => {
    const navigate = useNavigate();

    const [receiptInfo, setReceiptInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get catalogueId and finalPrice from AuctionsWon page via state
    const paymentId = useLocation().state.payment_id;

    useEffect(() => {

        const fetchReceiptInfo = async () => {
            setError('');
            try {
                const res = await apiClient.get(`/payments/${paymentId}`);
                setReceiptInfo(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to retrieve receipt info');
                setLoading(false);
            }
            finally {
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
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100vh',
            }}
        >
            <Stack
                spacing={10}
                alignItems="center"
                justifyContent="center"
                direction="row"
                sx={{
                    width: '90%',
                    height: '80%',
                    py: 3,
                    px: 10,
                }}
            >
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <>
                        <Paper elevation={3} sx={{ p: 2, width: '100%', height: '100%' }}>
                            <Typography variant="h2" align="center" justifyContent="center" fontWeight="bold" paddingBottom="50px" sx={{textDecoration: "underline"}}>Receipt</Typography>
                            <Stack direction="row" spacing={2} padding="30px">
                                <Typography variant="h6">Payment ID:</Typography>
                                <Typography variant="h6">{receiptInfo.payment_id}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} padding="30px">
                                <Typography variant="h6">Receipt ID:</Typography>
                                <Typography variant="h6">{receiptInfo.receipt.receipt_id}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} padding="30px">
                                <Typography variant="h6">Name:</Typography>
                                <Typography variant="h6">{receiptInfo.receipt.first_name} {receiptInfo.receipt.last_name}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} padding="30px">
                                <Typography variant="h6">Address:</Typography>
                                <Typography variant="h6">{receiptInfo.receipt.address}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} padding="30px">
                                <Typography variant="h6">Total:</Typography>
                                <Typography variant="h6">${receiptInfo.receipt.total_paid}</Typography>
                            </Stack>
                            <Stack direction="row" spacing={2} padding="30px">
                                <Typography variant="h6">Item ID:</Typography>
                                <Typography variant="h6">#{receiptInfo.receipt.item_id}</Typography>
                            </Stack>
                        </Paper>
                        <Paper elevation={3} sx={{ p: 2, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Typography variant="h2" align="center" justifyContent="center" fontWeight="bold" paddingBottom="50px" sx={{textDecoration: "underline"}}>Shipping Details</Typography>
                            <Stack direction="row" spacing={2} padding="30px" sx={{ flexGrow: 1 }}>
                                <Typography variant="h4">{receiptInfo.shipping_message}</Typography>
                            </Stack>
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    padding: '50px',
                                }}
                            >
                                <Button
                                    variant="contained"
                                    onClick={() => navigate('/catalogue')}
                                    sx={{ width: '50%', borderRadius: 2 }}
                                >
                                    Back to Catalogue
                                </Button>
                            </Box>
                        </Paper>
                    </>
                )}
            </Stack>
        </Box>
    );
};
export default Confirmation;