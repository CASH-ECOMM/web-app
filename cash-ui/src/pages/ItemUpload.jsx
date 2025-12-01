import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import Alert from '@mui/material/Alert';
import IosShareIcon from '@mui/icons-material/IosShare';
import apiClient from '../api/api';

const ItemUpload = () => {
  const navigate = useNavigate();
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

  const [apiError, setApiError] = useState('');

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

  const handlePost = async (e) => {
    // Prevent default form submission if this is triggered by a form
    if (e) {
      e.preventDefault();
    }
    setApiError('');

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
      console.log('Validation failed');
      return;
    }

    try {
      const response = await apiClient.post('/catalogue/items', {
        title,
        description,
        startingPrice: parseInt(price, 10),
        durationHours: parseInt(duration, 10),
      });

      // Axios automatically parses JSON, so we can access response.data directly
      console.log('Item posted successfully:', response.data);

      // Only redirect on success
      navigate('/catalogue');
    } catch (err) {
      console.error('Error posting item:', err);

      // Set error message based on status code
      let errorMessage = 'Failed to post item. Please try again.';

      if (err.response?.status === 400) {
        errorMessage =
          err.response?.data?.message ||
          'Invalid item data. Please check your inputs.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }

      setApiError(errorMessage);
    }
  };

  return (
    <Box
      sx={{
        display: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
        padding: 3,
        ml: 6,
        mt: 4,
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

      {/* Error Alert - Fixed at bottom right */}
      {apiError && (
        <Alert
          severity="error"
          onClose={() => setApiError('')}
          sx={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            minWidth: 300,
            maxWidth: 500,
            zIndex: 9999,
            boxShadow: 3,
          }}
        >
          {apiError}
        </Alert>
      )}
    </Box>
  );
};

export default ItemUpload;
