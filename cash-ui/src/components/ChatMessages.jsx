import Markdown from 'react-markdown';
import useAutoScroll from '../hooks/useAutoScroll';
import Spinner from './Spinner';
import WarningIcon from '@mui/icons-material/Warning';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const USER_BUBBLE_COLOR = '#007aff';
const ASSISTANT_BUBBLE_COLOR = '#8f8f8fff';

function ChatMessages({ messages, isLoading }) {
  const scrollContentRef = useAutoScroll(isLoading);

  return (
    <Box
      ref={scrollContentRef}
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        pr: 1,
      }}
    >
      {messages.map(({ role, content, loading, error }, idx) => {
        const isUser = role === 'user';
        return (
          <Box
            key={idx}
            sx={{
              display: 'flex',
              justifyContent: isUser ? 'flex-end' : 'flex-start',
            }}
          >
            <Paper
              elevation={0}
              sx={{
                px: 2,
                py: 1.5,
                maxWidth: '80%',
                bgcolor: isUser ? USER_BUBBLE_COLOR : ASSISTANT_BUBBLE_COLOR,
                color: isUser ? 'common.white' : 'text.primary',
                borderRadius: isUser
                  ? '18px 18px 4px 18px'
                  : '18px 18px 18px 4px',
                boxShadow: isUser ? 3 : 1,
              }}
            >
              <Box>
                {loading && !content ? (
                  <Spinner />
                ) : role === 'assistant' ? (
                  <Markdown>{content}</Markdown>
                ) : (
                  <Typography component="div" sx={{ whiteSpace: 'pre-line' }}>
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
                    mt: 1,
                  }}
                >
                  <WarningIcon sx={{ width: 18, height: 18 }} />
                  <Typography variant="caption" color="inherit">
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
