import { useState, useCallback } from 'react';
import { useImmer } from 'use-immer';
import Chatbot from './Chatbot';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RefreshIcon from '@mui/icons-material/Refresh';

function getInitialMessage() {
  const userName = localStorage.getItem('firstName') || 'there';
  return [
    {
      role: 'assistant',
      content: `Hey, ${userName}! How can I assist you today?`,
    },
  ];
}

export default function ChatPopup() {
  const [open, setOpen] = useState(false);

  // Lift chat state up so it persists across page navigations
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useImmer(getInitialMessage);

  // Reset chat to initial state
  const handleResetChat = useCallback(() => {
    setChatId(null);
    setMessages(getInitialMessage());
  }, [setMessages]);

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
            // border: 1,
            borderColor: 'divider',
            boxShadow: 6,
            borderRadius: 4,
            width: 500,
            height: 600,
            zIndex: 9999,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'primary.main',
              color: 'primary.contrastText',
              py: 1,
              px: 2,
            }}
          >
            <Box sx={{ width: 32 }} /> {/* Spacer for centering */}
            <Typography variant="h6">CashBot</Typography>
            <Tooltip title="Reset chat">
              <IconButton
                size="small"
                onClick={handleResetChat}
                sx={{ color: 'white' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Box
            sx={{
              flexGrow: 1,
              minHeight: 0,
              // overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <Chatbot
              chatId={chatId}
              setChatId={setChatId}
              messages={messages}
              setMessages={setMessages}
            />
          </Box>
        </Box>
      )}
    </>
  );
}
