import React from 'react';

const AIChat = () => {
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = React.useState(false);
  const API_WORKER_URL = import.meta.env.VITE_API_WORKER_URL;

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessages([...messages, { role: 'user', content: input }]);
    setInput('');
    try {
      const response = await fetch(`${API_WORKER_URL}/api/ai/stream/context`, {
        method: 'POST',
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: input }] }),
        headers: {
          'Content-Type': 'application/json',
          Accept: 'text/event-stream',
        },
      });
      const reader = response.body?.getReader();
      if (!reader) {
        console.error('No reader available for the response body.');
        return;
      }
      const decoder = new TextDecoder('utf-8');
      let done = false;
      let message = '';
      let count = 0;
      while (!done) {
        const { done: streamDone, value } = (await reader.read()) || {};
        done = streamDone || false;
        if (done) {
          console.log('Stream finished:', done);
          break;
        }
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          console.log('Chunk:', chunk);

          //   LOG THE CHUNK NUMBER OF LINES :
          if (chunk.includes('data: [DONE]')) {
            console.log('Stream finished:', chunk);
            break;
          }
          const lines = chunk.split('\n').filter((line) => line.trim() !== '');
          console.log('Number of lines in chunk:', lines.length);

          if (lines.length > 1) {
            for (const line of lines) {
              if (line.includes('data: [DONE]')) {
                console.log('Stream finished:', line);
                break;
              }
              const json = JSON.parse(line.replace('data: ', ''));
              message += json?.response;
            }
          } else {
            const json = JSON.parse(chunk.replace('data: ', ''));
            message += json?.response;
          }
          if (count === 0) {
            setMessages((prevMessages) => [
              ...prevMessages,
              { role: 'assistant', content: message }, // Update the assistant message
            ]);
          } else {
            setMessages((prevMessages) => [
              ...prevMessages.slice(0, -1), // Remove the last assistant message
              { role: 'assistant', content: message }, // Update the assistant message
            ]);
          }

          count += 1;
        }
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: 'assistant', content: 'Error: Unable to fetch response.' },
      ]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className='chat-container'>
      <div className='messages'>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`message ${message.role}`}
            style={{
              backgroundColor: message.role === 'user' ? '#e0f7fa' : '#ffe0b2',
              padding: '10px',
              borderRadius: '5px',
              margin: '5px auto',
              width: 400,
              textAlign: message.role === 'user' ? 'right' : 'left',
            }}
          >
            <strong>{message.role === 'user' ? 'User' : 'Assistant'}:</strong> {message.content}
          </div>
        ))}
        {loading && <div className='loading'>Loading...</div>}
      </div>
      <form onSubmit={handleSubmit} className='input-form'>
        <input
          type='text'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type your message...'
          disabled={loading}
        />
        <button type='submit' disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
};

export default AIChat;
