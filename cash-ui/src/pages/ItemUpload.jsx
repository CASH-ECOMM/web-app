import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import IosShareIcon from '@mui/icons-material/IosShare';

const ItemUpload = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [duration, setDuration] = useState('');

  const [titleError, setTitleError] = useState(false);
  const [titleErrorMessage, setTitleErrorMessage] = useState('');

  const [descriptionError, setDescriptionError] = useState(false);
  const [descriptionErrorMessage, setDescriptionErrorMessage] = useState('');

  const [priceError, setPriceError] = useState(false);
  const [priceErrorMessage, setPriceErrorMessage] = useState('');

  const [durationError, setDurationError] = useState(false);
  const [durationErrorMessage, setDurationErrorMessage] = useState('');

  const validateTitle = (value) => {
    if (value.length === 0) {
      setTitleError(true);
      setTitleErrorMessage('Title is required');
      return false;
    }
    if (value.length > 50) {
      setTitleError(true);
      setTitleErrorMessage('Title must be less than 50 characters');
      return false;
    }
    setTitleError(false);
    setTitleErrorMessage('');
    return true;
  };

  const validateDescription = (value) => {
    if (value.length === 0) {
      setDescriptionError(true);
      setDescriptionErrorMessage('Description is required');
      return false;
    }
    if (value.length > 255) {
      setDescriptionError(true);
      setDescriptionErrorMessage(
        'Description must be less than 255 characters'
      );
      return false;
    }
    setDescriptionError(false);
    setDescriptionErrorMessage('');
    return true;
  };

  const validatePrice = (value) => {
    if (value.length === 0) {
      setPriceError(true);
      setPriceErrorMessage('Price is required');
      return false;
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      setPriceError(true);
      setPriceErrorMessage('Price must be at least $1');
      return false;
    }
    if (numValue > 999999999) {
      setPriceError(true);
      setPriceErrorMessage('Price must be less than $999,999,999');
      return false;
    }
    setPriceError(false);
    setPriceErrorMessage('');
    return true;
  };

  const validateDuration = (value) => {
    if (value.length === 0) {
      setDurationError(true);
      setDurationErrorMessage('Duration is required');
      return false;
    }
    const numValue = parseInt(value, 10);
    if (isNaN(numValue) || numValue < 1) {
      setDurationError(true);
      setDurationErrorMessage('Duration must be at least 1 hour');
      return false;
    }
    if (numValue > 336) {
      setDurationError(true);
      setDurationErrorMessage('Duration must be 336 hours (2 weeks) or less');
      return false;
    }
    setDurationError(false);
    setDurationErrorMessage('');
    return true;
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitle(value);
    validateTitle(value);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    validateDescription(value);
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    // Only allow digits (no commas, dots, or other characters)
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setPrice(value);
      validatePrice(value);
    }
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    // Only allow digits (no commas, dots, or other characters)
    if (value === '' || /^[1-9]\d*$/.test(value)) {
      setDuration(value);
      validateDuration(value);
    }
  };

  const handlePost = async () => {
    const isTitleValid = validateTitle(title);
    const isDescriptionValid = validateDescription(description);
    const isPriceValid = validatePrice(price);
    const isDurationValid = validateDuration(duration);

    if (
      !isTitleValid ||
      !isDescriptionValid ||
      !isPriceValid ||
      !isDurationValid
    ) {
      return;
    }

    try {
      const response = await fetch('/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          price: parseInt(price, 10),
          duration: parseInt(duration, 10),
        }),
      });
      if (response.ok) {
        window.location.href = '/catalogue';
      }
    } catch (err) {
      console.error('Error posting item:', err);
    }
  };

  return (
    <Box
      sx={{
        display: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: 3,
      }}
    >
      <Typography variant="h3" gutterBottom sx={{ mb: 4 }}>
        Item for auction
      </Typography>
      <Stack spacing={3} sx={{ maxWidth: 750, width: '100%' }}>
        {/* Title - Full Width */}
        <FormControl fullWidth>
          <TextField
            id="title"
            label="Title"
            variant="outlined"
            required
            value={title}
            onChange={handleTitleChange}
            error={titleError}
            helperText={titleErrorMessage}
            color={titleError ? 'error' : 'primary'}
            fullWidth
          />
        </FormControl>

        {/* Description - Full Width */}
        <FormControl fullWidth>
          <TextField
            id="description"
            label="Description"
            variant="outlined"
            required
            multiline
            rows={5}
            value={description}
            onChange={handleDescriptionChange}
            error={descriptionError}
            helperText={descriptionErrorMessage}
            color={descriptionError ? 'error' : 'primary'}
            fullWidth
          />
        </FormControl>

        {/* Price and Duration - Side by Side */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ flex: 1 }}>
            <TextField
              label="Starting Price"
              id="starting-price"
              required
              value={price}
              onChange={handlePriceChange}
              error={priceError}
              helperText={priceErrorMessage}
              color={priceError ? 'error' : 'primary'}
              inputMode="numeric"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                },
              }}
              fullWidth
            />
          </FormControl>
          <FormControl sx={{ flex: 1 }}>
            <TextField
              label="Duration"
              id="duration"
              required
              value={duration}
              onChange={handleDurationChange}
              error={durationError}
              helperText={durationErrorMessage}
              color={durationError ? 'error' : 'primary'}
              inputMode="numeric"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">hours</InputAdornment>
                  ),
                },
              }}
              fullWidth
            />
          </FormControl>
        </Box>

        {/* Post Button - Right Aligned */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            endIcon={<IosShareIcon />}
            onClick={handlePost}
          >
            Post
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default ItemUpload;
