import React, { useState } from 'react';

// MessagesPage - Real-time messaging interface
interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: Message[];
}

export default function MessagesPage() {
  const [conversations] = useState<Conversation[]>([
    {
      id: 'conv-1',
      otherUser: { id: 'user-2', name: 'Sarah Johnson' },
      lastMessage: 'Is the property still available?',
      lastMessageTime: '2 min ago',
      unreadCount: 2,
      messages: [
        { id: 'm1', senderId: 'user-2', content: 'Hi, I\'m interested in your property', timestamp: '10:30 AM', read: true },
        { id: 'm2', senderId: 'current', content: 'Great! Which one are you looking at?', timestamp: '10:32 AM', read: true },
        { id: 'm3', senderId: 'user-2', content: 'Is the property still available?', timestamp: '10:35 AM', read: false },
      ],
    },
    {
      id: 'conv-2',
      otherUser: { id: 'user-3', name: 'Michael Chen' },
      lastMessage: 'Thanks for the information',
      lastMessageTime: '1 hour ago',
      unreadCount: 0,
      messages: [
        { id: 'm4', senderId: 'user-3', content: 'Can you tell me more about the location?', timestamp: 'Yesterday', read: true },
        { id: 'm5', senderId: 'current', content: 'It\'s in downtown, close to transit', timestamp: 'Yesterday', read: true },
        { id: 'm6', senderId: 'user-3', content: 'Thanks for the information', timestamp: '1 hour ago', read: true },
      ],
    },
  ]);

  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    conversations[0]
  );
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    // TODO: Send message via API
    console.log('Sending message:', newMessage);
    setNewMessage('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex">
        {/* Conversations List */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
            <div className="mt-3">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                    {conv.otherUser.avatar ? (
                      <img src={conv.otherUser.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      conv.otherUser.name.charAt(0)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="font-semibold text-gray-900 truncate">
                        {conv.otherUser.name}
                      </p>
                      <span className="text-xs text-gray-500">{conv.lastMessageTime}</span>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    {conv.unreadCount > 0 && (
                      <span className="inline-block mt-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        {selectedConversation ? (
          <div className="flex-1 flex flex-col bg-gray-50">
            {/* Thread Header */}
            <div className="bg-white p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold">
                  {selectedConversation.otherUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {selectedConversation.otherUser.name}
                  </h3>
                  <p className="text-xs text-gray-500">Online</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === 'current' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.senderId === 'current'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === 'current' ? 'text-blue-100' : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="bg-white p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p>Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>
  );
}
