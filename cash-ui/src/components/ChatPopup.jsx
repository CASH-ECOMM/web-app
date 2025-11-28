import { useState } from 'react';
import Chatbot from './Chatbot';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

export default function ChatPopup() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
        }}
      >
        <IconButton
          color="primary"
          onClick={() => setOpen((prev) => !prev)}
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            width: 56,
            height: 56,
            borderRadius: '50%',
            boxShadow: 6,
            '&:hover': {
              bgcolor: 'primary.dark',
            },
          }}
        >
          <AutoAwesomeIcon fontSize="large" />
        </IconButton>
      </Box>
      {open && (
        <Box
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            bgcolor: 'background.paper',
            border: 1,
            borderColor: 'divider',
            boxShadow: 6,
            borderRadius: 3,
            width: 500,
            height: 600,
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{
              // mb: 1,
              backgroundColor: '#1976d2',
              color: 'white',
              py: 1,
            }}
          >
            CashBot
          </Typography>
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
              // overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Chatbot />
          </Box>
        </Box>
      )}
    </>
  );
}
