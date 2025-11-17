import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';

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
    if (isNaN(numValue) || numValue < 0) {
      setPriceError(true);
      setPriceErrorMessage('Price must be a positive integer');
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
    if (value === '' || /^\d+$/.test(value)) {
      setPrice(value);
      validatePrice(value);
    }
  };

  const handleDurationChange = (e) => {
    const value = e.target.value;
    // Only allow digits (no commas, dots, or other characters)
    if (value === '' || /^\d+$/.test(value)) {
      setDuration(value);
      validateDuration(value);
    }
  };

  return (
    <>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: '600px' }}>
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
              inputProps={{
                pattern: '[0-9]*',
              }}
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
              inputProps={{
                pattern: '[0-9]*',
              }}
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
      </Stack>
    </>
  );
};

export default ItemUpload;
