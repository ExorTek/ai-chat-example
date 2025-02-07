import '@globalStyles';
import { useState } from 'react';

function ChatMessage({ message }) {
  return <div className={`my-2 p-2 rounded ${message.role === 'user' ? 'bg-blue-500 text-white self-end' : 'bg-gray-300 text-black self-start'}`}>{message.content}</div>;
}

function ChatWindow({ messages }) {
  return (
    <div className='p-4 min-h-[80vh] max-h-[80vh] overflow-y-auto bg-gray-100 border rounded-lg'>
      {messages.map((msg, index) => (
        <ChatMessage
          key={index}
          message={msg}
        />
      ))}
    </div>
  );
}

function ChatInput({ input, setInput, sendMessage, loading }) {
  return (
    <form
      onSubmit={sendMessage}
      className='flex gap-2 mt-4'>
      <input
        type='text'
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder='Type a message...'
        className='flex-1 p-2 border rounded-lg'
      />
      <button
        type='submit'
        disabled={loading}
        className='p-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-400'>
        {loading ? '' + 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
}

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async e => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setLoading(true);

    const aiMessage = { role: 'assistant', content: '' };
    setMessages(prevMessages => [...prevMessages, aiMessage]);

    try {
      const eventSource = new EventSource(`http://127.0.0.1:5001/groq?message=${encodeURIComponent(input)}`);

      eventSource.onmessage = event => {
        try {
          const parsedData = JSON.parse(event.data); // JSON olarak ayrıştır
          if (parsedData.event === 'message') {
            setMessages(prevMessages => {
              const updatedMessages = [...prevMessages];
              const lastMessage = updatedMessages[updatedMessages.length - 1];

              if (lastMessage.role === 'assistant') {
                lastMessage.content += parsedData.data; // Streaming içeriği ekliyoruz
              }

              return updatedMessages;
            });
          }
          if (parsedData.event === 'end') {
            eventSource.close();
            setLoading(false);
          }
        } catch (error) {
          console.error('JSON ayrıştırma hatası:', error, event.data);
        }
      };
      eventSource.onerror = error => {
        console.error('SSE Hatası:', error);
        eventSource.close();
        setLoading(false);
      };
    } catch (error) {
      console.error('Hata:', error);
      setLoading(false);
    }
  };

  return (
    <div className='w-full max-w-7xl  min-h-screen mx-auto p-4'>
      <ChatWindow messages={messages} />
      <ChatInput
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        loading={loading}
      />
    </div>
  );
}

export default App;
