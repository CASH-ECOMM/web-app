import React from 'react';
import { motion } from 'framer-motion';
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
} from '@mui/material';
import { useAuth } from '../auth/AuthContext';

const rotatingPhrases = [
  'Cool Auctions Start Here',
  'Cheap And Student-Friendly Hub',
  'Can’t Afford Stuff? Help!',
  'Come And Sell Here',
  'Completely Average Student Hustle',
];

export default function HomePage() {
  // Rotating text state
  const [phraseIndex, setPhraseIndex] = React.useState(0);
  const { isAuthenticated } = useAuth();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % rotatingPhrases.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        // minHeight: '100vh',
        // bgcolor: '#f5f7fa',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          py: 12,
          px: 4,
          textAlign: 'center',
          color: 'white',
          background: 'linear-gradient(180deg, #1976d2, #aed1eeff)',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h2" fontWeight={800} sx={{ mb: 2 }}>
            CASH — {rotatingPhrases[phraseIndex]}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <Typography
            variant="h6"
            sx={{ maxWidth: 700, mx: 'auto', mb: 4, lineHeight: 1.6 }}
          >
            A simple, secure, and fun auction platform built by students — for
            students. List items, bid competitively, and win auctions once
            you're signed in.
          </Typography>
        </motion.div>
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}
          >
            <Button
              variant="contained"
              color="primary"
              size="medium"
              href="/login"
              sx={{ borderRadius: 3, px: 4, py: 2 }}
            >
              Post an Item
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}
          >
            <Button
              variant="contained"
              color="primary"
              size="medium"
              href="/login"
              sx={{ borderRadius: 3, px: 4, py: 2 }}
            >
              Log In
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="medium"
              href="/signup"
              sx={{ borderRadius: 3, px: 4, py: 2 }}
            >
              Sign Up
            </Button>
          </motion.div>
        )}
      </Box>

      {/* Feature Cards with AI box */}
      <Box
        sx={{
          pt: 8,
          px: 4,
          maxWidth: 1400,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr 1fr' },
          gap: 4,
        }}
      >
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Easy Listings
            </Typography>
            <Typography color="text.secondary">
              Create auction items quickly with a clean and simple interface.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Competitive Bidding
            </Typography>
            <Typography color="text.secondary">
              Live and fair bidding once you’re inside the platform.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Student‑First Marketplace
            </Typography>
            <Typography color="text.secondary">
              Built for your campus — safe, simple, and transparent.
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent sx={{ textAlign: 'center', p: 5 }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              AI-Powered
            </Typography>
            <Typography color="text.secondary">
              Search, sell, place bids, in a conversational manner.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
