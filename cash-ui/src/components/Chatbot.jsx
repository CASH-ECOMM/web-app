import { useState } from 'react';
import { createChat, sendChatMessage } from '../api/api';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import Box from '@mui/material/Box';

function Chatbot({ chatId, setChatId, messages, setMessages }) {
  const [newMessage, setNewMessage] = useState('');

  const lastMessage = messages[messages.length - 1];
  const isLoading = Boolean(lastMessage?.loading);

  async function submitNewMessage() {
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || isLoading) return;

    setMessages((draft) => [
      ...draft,
      { role: 'user', content: trimmedMessage },
      { role: 'assistant', content: '', sources: [], loading: true },
    ]);
    setNewMessage('');

    let chatIdOrNew = chatId;
    try {
      if (!chatId) {
        const { chat_id } = await createChat();
        setChatId(chat_id);
        chatIdOrNew = chat_id;
      }

      const response = await sendChatMessage(chatIdOrNew, trimmedMessage);
      const assistantText =
        response?.reply || response?.message || response?.content || '';
      const assistantSources = response?.sources || [];

      setMessages((draft) => {
        const assistantMessage = draft[draft.length - 1];
        assistantMessage.content = assistantText;
        assistantMessage.sources = assistantSources;
        assistantMessage.loading = false;
      });
    } catch (err) {
      console.log(err);
      setMessages((draft) => {
        draft[draft.length - 1].loading = false;
        draft[draft.length - 1].error = true;
      });
    }
  }

  return (
    <Box
      sx={{
        position: 'relative',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        // gap: 2,
        // pt: 2,
        height: '100%',
      }}
    >
      <Box sx={{ flexGrow: 1, minHeight: 0 }}>
        <ChatMessages messages={messages} isLoading={isLoading} />
      </Box>
      <ChatInput
        newMessage={newMessage}
        isLoading={isLoading}
        setNewMessage={setNewMessage}
        submitNewMessage={submitNewMessage}
      />
    </Box>
  );
}

export default Chatbot;
