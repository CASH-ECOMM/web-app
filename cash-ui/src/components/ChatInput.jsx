import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

function ChatInput({ newMessage, isLoading, setNewMessage, submitNewMessage }) {
  const trimmedMessage = newMessage.trim();

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!trimmedMessage || isLoading) return;
    submitNewMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.paper' }}>
      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={3}
        sx={{
          display: 'flex',
          alignItems: 'center',
          // borderRadius: 999,
          px: 2,
          py: 1,
          gap: 1,
        }}
      >
        <InputBase
          multiline
          minRows={1}
          maxRows={6}
          placeholder="Type your message"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          inputProps={{ maxLength: 500 }}
          sx={{
            flexGrow: 1,
            fontSize: 16,
            lineHeight: 1.4,
            pr: 1,
          }}
        />
        <IconButton
          type="submit"
          disabled={!trimmedMessage || isLoading}
          sx={{
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            width: 40,
            height: 40,
            '&:hover': { bgcolor: 'primary.dark' },
            '&:disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'text.disabled',
            },
          }}
        >
          <SendIcon />
        </IconButton>
      </Paper>
    </Box>
  );
}

export default ChatInput;
