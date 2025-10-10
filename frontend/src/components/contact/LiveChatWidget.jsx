

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';

// Hooks
import useWebSocket from '../../hooks/useWebSocket';
import useLocalStorage from '../../hooks/useLocalStorage';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';

// Utils
import { trackEvent } from '../../utils/analytics';
import { validateEmail } from '../../utils/validation';

// Constants
const CHAT_STATUS = {
  OFFLINE: 'offline',
  CONNECTING: 'connecting',
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy'
};

const MESSAGE_TYPES = {
  USER: 'user',
  AGENT: 'agent',
  SYSTEM: 'system',
  BOT: 'bot'
};

const QUICK_REPLIES = [
  'Hello! I need help with an order',
  'What are your return policies?',
  'Do you have size guides?',
  'When will my order arrive?',
  'I want to make a return',
  'Can you help me find a product?'
];

const SUGGESTED_TOPICS = [
  { icon: 'fas fa-shopping-cart', title: 'Order Status', description: 'Track your orders' },
  { icon: 'fas fa-undo', title: 'Returns & Exchanges', description: 'Easy return process' },
  { icon: 'fas fa-ruler', title: 'Size Guide', description: 'Find your perfect fit' },
  { icon: 'fas fa-shipping-fast', title: 'Shipping Info', description: 'Delivery details' },
  { icon: 'fas fa-credit-card', title: 'Payment Help', description: 'Payment support' },
  { icon: 'fas fa-headset', title: 'General Support', description: 'Other questions' }
];

const LiveChatWidget = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector(state => state.auth);

  // Local state
  const [isOpen, setIsOpen] = useLocalStorage('liveChatOpen', false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentStep, setCurrentStep] = useState('welcome'); // welcome, form, chat, ended
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [agentTyping, setAgentTyping] = useState(false);
  const [chatSession, setChatSession] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Form state for non-authenticated users
  const [guestInfo, setGuestInfo] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry'
  });

  // Chat status
  const [agentStatus, setAgentStatus] = useState(CHAT_STATUS.CONNECTING);
  const [estimatedWaitTime, setEstimatedWaitTime] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);

  // Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // WebSocket connection
  const { 
    isConnected, 
    sendMessage: sendWebSocketMessage,
    lastMessage 
  } = useWebSocket('/chat', {
    enabled: isOpen && (currentStep === 'chat' || chatSession),
    onConnect: () => {
      console.log('Chat connected');
      setAgentStatus(CHAT_STATUS.ONLINE);
    },
    onDisconnect: () => {
      console.log('Chat disconnected');
      setAgentStatus(CHAT_STATUS.OFFLINE);
    },
    onMessage: handleWebSocketMessage
  });

  // Keyboard shortcuts
  useKeyboardShortcuts({
    'ctrl+enter': () => handleSendMessage(),
    'escape': () => setIsOpen(false),
    'ctrl+shift+c': () => setIsOpen(!isOpen)
  });

  // Handle WebSocket messages
  function handleWebSocketMessage(message) {
    if (message.type === 'chat_message') {
      const newMsg = {
        id: Date.now(),
        type: MESSAGE_TYPES.AGENT,
        content: message.content,
        timestamp: new Date(),
        agent: message.agent
      };
      setMessages(prev => [...prev, newMsg]);
      
      if (!isOpen || isMinimized) {
        setUnreadCount(prev => prev + 1);
      }
    } else if (message.type === 'agent_typing') {
      setAgentTyping(message.typing);
    } else if (message.type === 'queue_update') {
      setQueuePosition(message.position);
      setEstimatedWaitTime(message.estimatedWait);
    } else if (message.type === 'session_started') {
      setChatSession(message.sessionId);
      addSystemMessage('Connected to support agent');
    } else if (message.type === 'session_ended') {
      addSystemMessage('Chat session ended');
      setCurrentStep('ended');
    }
  }

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  // Initialize welcome message
  useEffect(() => {
    if (messages.length === 0 && currentStep === 'welcome') {
      const welcomeMsg = {
        id: 'welcome',
        type: MESSAGE_TYPES.SYSTEM,
        content: `👋 Welcome to ShoeMarkNet Support! ${isAuthenticated ? user.name : 'How'} can we help you today?`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
    }
  }, [currentStep, messages.length, isAuthenticated, user]);

  // Add system message
  const addSystemMessage = useCallback((content) => {
    const systemMsg = {
      id: Date.now(),
      type: MESSAGE_TYPES.SYSTEM,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMsg]);
  }, []);

  // Handle chat start
  const handleStartChat = useCallback(async () => {
    try {
      if (!isAuthenticated) {
        // Validate guest form
        if (!guestInfo.name.trim() || !guestInfo.email.trim()) {
          toast.error('Please fill in all required fields');
          return;
        }
        if (!validateEmail(guestInfo.email)) {
          toast.error('Please enter a valid email address');
          return;
        }
      }

      setCurrentStep('chat');
      
      // Send initial message to server
      const initMessage = {
        type: 'start_chat',
        user: isAuthenticated ? user : guestInfo,
        timestamp: new Date().toISOString()
      };
      
      sendWebSocketMessage(initMessage);
      
      addSystemMessage('Connecting you to a support agent...');
      
      trackEvent('live_chat_started', {
        user_authenticated: isAuthenticated,
        user_id: user?._id,
        subject: guestInfo.subject
      });

    } catch (error) {
      console.error('Failed to start chat:', error);
      toast.error('Failed to start chat. Please try again.');
    }
  }, [isAuthenticated, guestInfo, user, sendWebSocketMessage, addSystemMessage]);

  // Handle send message
  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: MESSAGE_TYPES.USER,
      content: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Send to server
    if (isConnected && chatSession) {
      sendWebSocketMessage({
        type: 'chat_message',
        sessionId: chatSession,
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      });
    }

    setNewMessage('');
    setShowQuickReplies(false);
    
    // Handle typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setIsTyping(false);

    trackEvent('live_chat_message_sent', {
      session_id: chatSession,
      message_length: newMessage.trim().length
    });

  }, [newMessage, isConnected, chatSession, sendWebSocketMessage]);

  // Handle typing
  const handleTyping = useCallback((e) => {
    setNewMessage(e.target.value);
    
    if (!isTyping && isConnected && chatSession) {
      setIsTyping(true);
      sendWebSocketMessage({
        type: 'user_typing',
        sessionId: chatSession,
        typing: true
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      if (isConnected && chatSession) {
        sendWebSocketMessage({
          type: 'user_typing',
          sessionId: chatSession,
          typing: false
        });
      }
    }, 1000);

  }, [isTyping, isConnected, chatSession, sendWebSocketMessage]);

  // Handle quick reply
  const handleQuickReply = useCallback((reply) => {
    setNewMessage(reply);
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  }, [handleSendMessage]);

  // Handle end chat
  const handleEndChat = useCallback(() => {
    if (chatSession && isConnected) {
      sendWebSocketMessage({
        type: 'end_chat',
        sessionId: chatSession
      });
    }
    
    setCurrentStep('ended');
    setChatSession(null);
    
    trackEvent('live_chat_ended', {
      session_id: chatSession,
      messages_count: messages.length
    });
  }, [chatSession, isConnected, sendWebSocketMessage, messages.length]);

  // Format timestamp
  const formatTime = useCallback((timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }, []);

  // Chat status indicator
  const getStatusIndicator = useMemo(() => {
    switch (agentStatus) {
      case CHAT_STATUS.ONLINE:
        return { color: 'bg-green-400', text: 'Online' };
      case CHAT_STATUS.AWAY:
        return { color: 'bg-yellow-400', text: 'Away' };
      case CHAT_STATUS.BUSY:
        return { color: 'bg-red-400', text: 'Busy' };
      case CHAT_STATUS.CONNECTING:
        return { color: 'bg-blue-400 animate-pulse', text: 'Connecting...' };
      default:
        return { color: 'bg-gray-400', text: 'Offline' };
    }
  }, [agentStatus]);

  // Render welcome step
  const renderWelcomeStep = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="fas fa-comments text-white text-2xl"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          How can we help you?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Choose a topic or start a conversation with our support team
        </p>
      </div>

      {/* Suggested Topics */}
      <div className="grid grid-cols-2 gap-3">
        {SUGGESTED_TOPICS.map((topic, index) => (
          <button
            key={index}
            onClick={() => {
              setGuestInfo(prev => ({ ...prev, subject: topic.title }));
              if (isAuthenticated) {
                handleStartChat();
              } else {
                setCurrentStep('form');
              }
            }}
            className="p-4 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-200 text-left group hover:scale-105"
          >
            <div className="flex items-start space-x-3">
              <i className={`${topic.icon} text-blue-500 group-hover:text-purple-500 transition-colors`}></i>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {topic.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 text-xs">
                  {topic.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pt-4 border-t border-white/20">
        <button
          onClick={() => isAuthenticated ? handleStartChat() : setCurrentStep('form')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200 transform hover:scale-105"
        >
          <i className="fas fa-comment-dots mr-2"></i>
          Start Live Chat
        </button>
      </div>
    </div>
  );

  // Render guest form step
  const renderFormStep = () => (
    <div className="p-6 space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Let's get you connected
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Please provide your information to start the chat
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Name *
          </label>
          <input
            type="text"
            value={guestInfo.name}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Your name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={guestInfo.email}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="your@email.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Subject
          </label>
          <select
            value={guestInfo.subject}
            onChange={(e) => setGuestInfo(prev => ({ ...prev, subject: e.target.value }))}
            className="w-full px-4 py-3 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="General Inquiry">General Inquiry</option>
            <option value="Order Status">Order Status</option>
            <option value="Returns & Exchanges">Returns & Exchanges</option>
            <option value="Size Guide">Size Guide</option>
            <option value="Shipping Info">Shipping Info</option>
            <option value="Payment Help">Payment Help</option>
            <option value="Product Question">Product Question</option>
            <option value="Technical Support">Technical Support</option>
          </select>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setCurrentStep('welcome')}
          className="flex-1 bg-white/10 backdrop-blur-lg border border-white/20 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-2xl hover:bg-white/20 transition-all duration-200"
        >
          Back
        </button>
        <button
          onClick={handleStartChat}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200"
        >
          Start Chat
        </button>
      </div>
    </div>
  );

  // Render chat step
  const renderChatStep = () => (
    <div className="flex flex-col h-96">
      {/* Chat Header */}
      <div className="p-4 border-b border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${getStatusIndicator.color}`}></div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                Support Agent
              </h4>
              <p className="text-gray-600 dark:text-gray-400 text-xs">
                {getStatusIndicator.text}
              </p>
            </div>
          </div>
          <button
            onClick={handleEndChat}
            className="text-gray-500 hover:text-red-500 transition-colors"
            title="End Chat"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === MESSAGE_TYPES.USER ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-sm px-4 py-2 rounded-2xl ${
                message.type === MESSAGE_TYPES.USER
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : message.type === MESSAGE_TYPES.SYSTEM
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-center text-sm'
                  : 'bg-white/20 backdrop-blur-lg border border-white/30 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{message.content}</p>
              <p className={`text-xs mt-1 opacity-70 ${
                message.type === MESSAGE_TYPES.SYSTEM ? 'text-center' : ''
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {agentTyping && (
          <div className="flex justify-start">
            <div className="bg-white/20 backdrop-blur-lg border border-white/30 px-4 py-2 rounded-2xl">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      {showQuickReplies && messages.length <= 2 && (
        <div className="p-4 border-t border-white/20">
          <div className="flex flex-wrap gap-2">
            {QUICK_REPLIES.slice(0, 3).map((reply, index) => (
              <button
                key={index}
                onClick={() => handleQuickReply(reply)}
                className="px-3 py-1 bg-white/10 backdrop-blur-lg border border-white/20 rounded-full text-xs text-gray-700 dark:text-gray-300 hover:bg-white/20 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/20">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={handleTyping}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-2xl transition-all duration-200"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );

  // Render ended step
  const renderEndedStep = () => (
    <div className="p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
        <i className="fas fa-check text-white text-2xl"></i>
      </div>
      <div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          Chat Ended
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Thank you for contacting us! Was this helpful?
        </p>
      </div>
      
      <div className="flex space-x-2 justify-center">
        <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-2xl transition-colors text-sm">
          <i className="fas fa-thumbs-up mr-2"></i>
          Yes
        </button>
        <button className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-2xl transition-colors text-sm">
          <i className="fas fa-thumbs-down mr-2"></i>
          No
        </button>
      </div>

      <button
        onClick={() => {
          setCurrentStep('welcome');
          setMessages([]);
          setChatSession(null);
        }}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-2xl transition-all duration-200"
      >
        <i className="fas fa-plus mr-2"></i>
        Start New Chat
      </button>
    </div>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl hover:scale-110 transition-all duration-200 flex items-center justify-center group"
          title="Open Live Chat (Ctrl+Shift+C)"
        >
          <i className="fas fa-comments text-xl"></i>
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}

          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full animate-ping opacity-20"></div>
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'transform translate-y-8' : ''
    }`}>
      <div className="w-96 bg-white/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-headset text-white"></i>
              </div>
              <div>
                <h3 className="font-bold text-theme">Live Support</h3>
                <p className="text-muted-theme text-sm">
                  {agentStatus === CHAT_STATUS.ONLINE ? 'We\'re here to help!' : 'Currently offline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title={isMinimized ? 'Restore' : 'Minimize'}
              >
                <i className={`fas ${isMinimized ? 'fa-window-restore' : 'fa-minus'} text-sm`}></i>
              </button>
              
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                title="Close Chat"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="animate-fade-in">
            {currentStep === 'welcome' && renderWelcomeStep()}
            {currentStep === 'form' && renderFormStep()}
            {currentStep === 'chat' && renderChatStep()}
            {currentStep === 'ended' && renderEndedStep()}
          </div>
        )}

        {/* Minimized State */}
        {isMinimized && unreadCount > 0 && (
          <div className="p-4 text-center">
            <div className="w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center mx-auto animate-bounce">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">New messages</p>
          </div>
        )}
      </div>

      {/* Custom Styles */}
    </div>
  );
};

export default LiveChatWidget;
