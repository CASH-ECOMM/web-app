import React, {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import apiClient from '../api/api';
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const AuctionsWon = () => {

    const [wins, setWins] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Get userId and jwt from localStorage (or your auth context)
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
                                backgroundColor: '#000000',
                            }}
                        >
                            <Typography sx={{ width: 80 }}>#{item.catalogueId}</Typography>
                            <Typography sx={{ flex: 1 }}>{item.itemName}</Typography>
                            <Typography sx={{ width: 120 }}>${item.finalPrice}</Typography>
                            <Button
                                variant="contained"
                                size="small"
                                onClick={() => null}
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