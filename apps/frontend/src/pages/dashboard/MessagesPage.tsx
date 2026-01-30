import React, { useEffect, useState } from 'react';
import { messagesService, Message } from '../../services/messages-service';
import { useAuth } from '../../contexts/AuthContext';

export default function MessagesPage() {
  const { user } = useAuth();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load messages on mount
  const loadMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await messagesService.getMessages({ take: 50 });
      setMessages(data);
      if (data.length > 0 && !selectedThreadId) {
        setSelectedThreadId(data[0].threadId || data[0].id);
      }
    } catch (err) {
      console.error('[Messages] Failed to load messages:', err);
      const errorMsg = err instanceof Error ? err.message : 'Failed to load messages';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedThreadId) return;

    try {
      setSending(true);
      const messageData = await messagesService.sendMessage({
        recipientId: selectedThreadId.split('-')[1] || '',
        body: newMessage,
        messageType: 'response',
        threadId: selectedThreadId,
      });
      
      setMessages([...messages, messageData]);
      setNewMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const threadMessages = messages.filter(
    (msg) => !selectedThreadId || msg.threadId === selectedThreadId || msg.id === selectedThreadId
  );

  // Group messages by thread
  const threadGroups = messages.reduce(
    (acc, msg) => {
      const threadId = msg.threadId || msg.id;
      if (!acc[threadId]) {
        acc[threadId] = [];
      }
      acc[threadId].push(msg);
      return acc;
    },
    {} as Record<string, Message[]>
  );

  const threads = Object.entries(threadGroups).map(([threadId, msgs]) => ({
    threadId,
    lastMessage: msgs[msgs.length - 1],
    unreadCount: msgs.filter((m) => !m.isRead && m.recipientId === user?.id).length,
    messages: msgs,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Conversations List */}
      <div className="w-1/3 bg-white border-r border-gray-300">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <div className="overflow-y-auto h-full">
          {threads.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No messages yet</div>
          ) : (
            threads.map((thread) => (
              <div
                key={thread.threadId}
                onClick={() => setSelectedThreadId(thread.threadId)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedThreadId === thread.threadId ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">
                      {thread.lastMessage.sender?.email || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {thread.lastMessage.body}
                    </p>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                      {thread.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="w-2/3 bg-white flex flex-col">
        {selectedThreadId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {threadMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.senderId === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-lg max-w-xs ${
                      msg.senderId === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{msg.body}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="border-t p-4 bg-gray-50">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 border rounded-lg"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
              {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            Select a conversation to start messaging
          </div>
        )}
      </div>
    </div>
  );
}
