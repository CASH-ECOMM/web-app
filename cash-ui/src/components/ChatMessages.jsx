import Markdown from 'react-markdown';
import WarningIcon from '@mui/icons-material/Warning';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { useEffect, useRef } from 'react';
import { useTheme } from '@mui/material/styles';

const USER_BUBBLE_COLOR = '#3c80daff';

function ChatMessages({ messages, isLoading }) {
  const scrollRef = useRef(null);
  const theme = useTheme();

  // Use theme-aware color for assistant bubble
  const assistantBubbleColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#E9E9EB';

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <Box
      ref={scrollRef}
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // gap: 2,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {messages.map(({ role, content, loading, error }, idx) => {
        const isUser = role === 'user';
        return (
          <Box
            key={idx}
            sx={{
              pt: 2,
              pb: 1,
              px: 2,
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                px: 1.5,
                maxWidth: '85%',
                bgcolor: isUser ? USER_BUBBLE_COLOR : assistantBubbleColor,
                color: isUser ? 'common.white' : 'text.primary',
                borderRadius: isUser
                  ? '18px 18px 2px 18px'
                  : '18px 18px 18px 2px',
              }}
            >
              <Box>
                {loading && !content ? (
                  <Typography
                    sx={{
                      fontStyle: 'italic',
                      color: 'inherit',
                      py: 1.5,
                    }}
                  >
                    Thinking...
                  </Typography>
                ) : role === 'assistant' ? (
                  <Markdown>{content}</Markdown>
                ) : (
                  <Typography
                    component="div"
                    sx={{ whiteSpace: 'pre-line', marginY: 1.6 }}
                  >
                    {content}
                  </Typography>
                )}
              </Box>
              {error && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: 'error.light',
                  }}
                >
                  <WarningIcon sx={{ width: 18, height: 18 }} />
                  <Typography
                    color="inherit"
                    component="div"
                    sx={{ whiteSpace: 'pre-line', marginY: 1.6 }}
                  >
                    Error generating the response
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        );
      })}
    </Box>
  );
}

export default ChatMessages;
