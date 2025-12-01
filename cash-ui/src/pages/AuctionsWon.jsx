import React, {useEffect, useState} from 'react';
import {useNavigate} from "react-router-dom";
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import apiClient from '../api/api';
import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

const AuctionsWon = () => {

    const navigate = useNavigate();

    const [wins, setWins] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expeditedShipping, setExpeditedShipping] = useState({});

    // Get userId from localStorage
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchAuctionWins = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await apiClient.get(`/auctions/${userId}/wins`);
                setWins(res.data);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to load auctions won');
            } finally {
                setLoading(false);
            }
        };
        if (userId) fetchAuctionWins();
        else {
            setError('Error finding auctions.');
            setLoading(false);
        }
    }, [userId]);

    const handleSwitchChange = (catalogueId) => (event) => {
        const checked = event.target.checked;
        setExpeditedShipping((prev) => ({
            ...prev,
            [catalogueId]: checked,
        }));
    };

    const handlePayNow = (item) => {
        const expedited = expeditedShipping[item.catalogueId] || false;
        navigate('/payment', {
            state: {
                catalogueId: item.catalogueId,
                expeditedShipping: expedited,
            },
        });
    };

    return (
        <Box
            sx={{
                // minHeight: '100vh',
                display: 'flex',
                boxSizing: 'border-box',
                padding: '24px',
                justifyContent: 'center'
            }}
        >
            <Stack
                spacing={3}
                width="100%"
            >
                <Typography variant="h4" fontWeight="bold">Auctions Won</Typography>
                {loading ? (
                    <Typography>Loading...</Typography>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    wins.map((item) => (
                        <Stack
                            key={item.catalogueId}
                            direction="row"
                            spacing={2}
                            alignItems="center"
                            sx={{
                                border: '1px solid #e0e0e0',
                                p: 2,
                                borderRadius: 2,
                                //backgroundColor: '#000000',
                            }}
                        >
                            <Typography sx={{ width: 80 }}>#{item.catalogueId}</Typography>
                            <Typography sx={{ flex: 1 }}>{item.itemName}</Typography>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={!!expeditedShipping[item.catalogueId]}
                                        onChange={handleSwitchChange(item.catalogueId)}
                                    />
                                }
                                label="Expedited Shipping"
                                sx={{ width: 400 }}
                            />
                            <Typography sx={{ width: 120, fontWeight: 'bold' }}>${item.finalPrice}</Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => handlePayNow(item)}
                            >
                                Pay Now
                            </Button>
                        </Stack>
                    ))
                )}
            </Stack>
        </Box>

    );
};

export default AuctionsWon;