// AITMS/client/src/components/AIChatButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

const AIChatButton = ({ userInfo, collegeInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [teacherData, setTeacherData] = useState({
    allEntries: [],
    timetables: [],
    facultyId: null,
    facultyName: ''
  });
  const [dataLoading, setDataLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Helper function to convert time string to minutes for comparison
  const convertTimeToMinutes = (timeStr) => {
    const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!match) return 0;
    
    let hours = parseInt(match[1]);
    const minutes = parseInt(match[2]);
    const period = match[3].toUpperCase();
    
    if (period === 'PM' && hours !== 12) hours += 12;
    if (period === 'AM' && hours === 12) hours = 0;
    
    return hours * 60 + minutes;
  };

  // Helper function to parse day and time from user query
  const parseDayAndTime = (query) => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const dayMap = {
      'mon': 'Monday', 'monday': 'Monday',
      'tue': 'Tuesday', 'tuesday': 'Tuesday',
      'wed': 'Wednesday', 'wednesday': 'Wednesday',
      'thu': 'Thursday', 'thursday': 'Thursday',
      'fri': 'Friday', 'friday': 'Friday',
      'sat': 'Saturday', 'saturday': 'Saturday',
      'sun': 'Sunday', 'sunday': 'Sunday'
    };

    let foundDay = null;
    for (const day of days) {
      if (query.includes(day)) {
        foundDay = dayMap[day];
        break;
      }
    }

    const timePatterns = [
      /(\d{1,2})(?:\s*)(?::(\d{2}))?\s*(?:am|pm)?\s*(?:to|-)\s*(\d{1,2})(?:\s*)(?::(\d{2}))?\s*(?:am|pm)?/i,
      /(\d{1,2})\s*(?:am|pm)\s*(?:to|-)\s*(\d{1,2})\s*(?:am|pm)/i,
      /(\d{1,2})(?::(\d{2}))?\s*(?:am|pm)?/
    ];

    for (const pattern of timePatterns) {
      const match = query.match(pattern);
      if (match) {
        if (match.length >= 3 && match[1] && match[3]) {
          return {
            day: foundDay,
            startHour: parseInt(match[1]),
            endHour: parseInt(match[3]),
            isRange: true
          };
        }
        else if (match[1]) {
          return {
            day: foundDay,
            hour: parseInt(match[1]),
            minute: parseInt(match[2]) || 0,
            isRange: false
          };
        }
      }
    }

    return { day: foundDay };
  };

  // Get current time in minutes
  const getCurrentTimeInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Get current day
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Find class for specific day and time
  const findClassForDayAndTime = (day, targetHour, targetMinute = 0) => {
    if (!day) return null;
    
    const targetTime = targetHour * 60 + targetMinute;
    
    return teacherData.allEntries.find(entry => {
      if (entry.day !== day) return false;
      
      const [startTimeStr, endTimeStr] = entry.timeSlot.split(' - ');
      const startMinutes = convertTimeToMinutes(startTimeStr);
      const endMinutes = convertTimeToMinutes(endTimeStr);
      
      return targetTime >= startMinutes && targetTime <= endMinutes;
    });
  };

  // Find class for specific day and time range
  const findClassForTimeRange = (day, startHour, endHour) => {
    if (!day) return null;
    
    const startTarget = startHour * 60;
    const endTarget = endHour * 60;
    
    return teacherData.allEntries.find(entry => {
      if (entry.day !== day) return false;
      
      const [startTimeStr, endTimeStr] = entry.timeSlot.split(' - ');
      const startMinutes = convertTimeToMinutes(startTimeStr);
      const endMinutes = convertTimeToMinutes(endTimeStr);
      
      return Math.abs(startMinutes - startTarget) < 30 && Math.abs(endMinutes - endTarget) < 30;
    });
  };

  // Filter classes happening now
  const getCurrentClasses = () => {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeInMinutes();
    
    return teacherData.allEntries.filter(entry => {
      if (entry.day !== currentDay) return false;
      
      const [startTimeStr, endTimeStr] = entry.timeSlot.split(' - ');
      const startMinutes = convertTimeToMinutes(startTimeStr);
      const endMinutes = convertTimeToMinutes(endTimeStr);
      
      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
  };

  // Get upcoming classes for today
  const getUpcomingClasses = () => {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeInMinutes();
    
    return teacherData.allEntries.filter(entry => {
      if (entry.day !== currentDay) return false;
      
      const [startTimeStr] = entry.timeSlot.split(' - ');
      const startMinutes = convertTimeToMinutes(startTimeStr);
      
      return startMinutes > currentTime;
    }).sort((a, b) => {
      const [aStart] = a.timeSlot.split(' - ');
      const [bStart] = b.timeSlot.split(' - ');
      return convertTimeToMinutes(aStart) - convertTimeToMinutes(bStart);
    });
  };

  // Get today's all classes
  const getTodayClasses = () => {
    const currentDay = getCurrentDay();
    return teacherData.allEntries.filter(entry => entry.day === currentDay)
      .sort((a, b) => {
        const [aStart] = a.timeSlot.split(' - ');
        const [bStart] = b.timeSlot.split(' - ');
        return convertTimeToMinutes(aStart) - convertTimeToMinutes(bStart);
      });
  };

  // Fetch ALL teacher data using public API
  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!userInfo?.email) return;
      
      setDataLoading(true);
      
      try {
        const facultyUrl = `http://localhost:5000/api/public/faculty/by-email/${encodeURIComponent(userInfo.email)}`;
        const facultyResponse = await axios.get(facultyUrl);

        if (!facultyResponse.data.success) {
          throw new Error('Faculty not found');
        }

        const facultyData = facultyResponse.data.data;
        const facultyId = facultyData._id;

        const timetableUrl = `http://localhost:5000/api/public/timetable/teacher/${facultyId}`;
        const timetableResponse = await axios.get(timetableUrl);

        if (timetableResponse.data.success) {
          const data = timetableResponse.data.data;
          
          setTeacherData({
            allEntries: data.allEntries || [],
            timetables: data.timetables || [],
            facultyId: data.facultyId,
            facultyName: data.facultyName
          });
        }
      } catch (error) {
        console.error('Error:', error.message);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchTeacherData();
  }, [userInfo]);

  // Initialize chat with simple welcome message - ONLY teacher name
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const teacherName = userInfo?.name?.split(' ')[0] || 'Teacher';
      
      setMessages([{ 
        role: 'assistant', 
        content: `👋 Hello Professor ${teacherName}! How can I help you today?` 
      }]);
    }
  }, [isOpen, userInfo]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setMessages([]);
    }
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim().toLowerCase();
    setInputMessage('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      let response = '';

      // Check for thank you messages
      if (userMessage.includes('thank') || userMessage.includes('thanks') || userMessage.includes('thx')) {
        response = `You're welcome! 😊 Feel free to ask me anything about your classes whenever you need help.`;
      }
      // Check for greetings
      else if (userMessage === 'hi' || userMessage === 'hello' || userMessage === 'hey' || userMessage === 'greetings') {
        response = `Hello! How can I assist you with your classes today?`;
      }
      else {
        // Parse day and time from query
        const parsed = parseDayAndTime(userMessage);
        
        // Check if asking about specific day and time
        if (parsed.day) {
          if (parsed.isRange && parsed.startHour && parsed.endHour) {
            const foundClass = findClassForTimeRange(parsed.day, parsed.startHour, parsed.endHour);
            
            if (foundClass) {
              response = `📅 **${parsed.day} ${parsed.startHour}:00 - ${parsed.endHour}:00**\n\n`;
              response += `• **Subject:** ${foundClass.subject}\n`;
              response += `• **Time:** ${foundClass.timeSlot}\n`;
              response += `• **Room:** ${foundClass.room}\n`;
              response += `• **Faculty:** ${foundClass.facultyName}`;
            } else {
              response = `No class found on ${parsed.day} from ${parsed.startHour}:00 to ${parsed.endHour}:00.`;
              
              const dayClasses = teacherData.allEntries.filter(e => e.day === parsed.day);
              if (dayClasses.length > 0) {
                response += `\n\n📋 **Classes on ${parsed.day}:**\n`;
                dayClasses.forEach(cls => {
                  response += `• ${cls.timeSlot}: ${cls.subject} (Room ${cls.room})\n`;
                });
              }
            }
          } 
          else if (parsed.hour) {
            const foundClass = findClassForDayAndTime(parsed.day, parsed.hour, parsed.minute || 0);
            
            if (foundClass) {
              response = `📅 **${parsed.day} at ${parsed.hour}:${parsed.minute.toString().padStart(2,'0')}**\n\n`;
              response += `• **Subject:** ${foundClass.subject}\n`;
              response += `• **Time:** ${foundClass.timeSlot}\n`;
              response += `• **Room:** ${foundClass.room}\n`;
              response += `• **Faculty:** ${foundClass.facultyName}`;
            } else {
              response = `No class found on ${parsed.day} at ${parsed.hour}:${parsed.minute.toString().padStart(2,'0')}.`;
            }
          }
          else {
            const dayClasses = teacherData.allEntries.filter(e => e.day === parsed.day);
            
            if (dayClasses.length > 0) {
              response = `📅 **${parsed.day}'s Schedule**\n\n`;
              dayClasses.forEach((cls, idx) => {
                response += `${idx + 1}. ${cls.timeSlot}: ${cls.subject} (Room ${cls.room})\n`;
              });
            } else {
              response = `You have no classes scheduled on ${parsed.day}.`;
            }
          }
        }
        else if (userMessage.includes('current') || userMessage.includes('now')) {
          const currentClasses = getCurrentClasses();
          
          if (currentClasses.length > 0) {
            response = `⏰ **Current Class**\n\n`;
            currentClasses.forEach(cls => {
              response += `• ${cls.subject} (${cls.timeSlot}) in Room ${cls.room}\n`;
            });
          } else {
            response = `No class is currently in session.`;
            
            const upcoming = getUpcomingClasses();
            if (upcoming.length > 0) {
              response += `\n\n⏳ **Next Class:** ${upcoming[0].subject} at ${upcoming[0].timeSlot} in Room ${upcoming[0].room}`;
            }
          }
        }
        else if (userMessage.includes('next') || userMessage.includes('upcoming')) {
          const upcoming = getUpcomingClasses();
          
          if (upcoming.length > 0) {
            response = `⏳ **Upcoming Classes Today**\n\n`;
            upcoming.forEach((cls, index) => {
              response += `${index + 1}. ${cls.subject} at ${cls.timeSlot} in Room ${cls.room}\n`;
            });
          } else {
            response = `No more classes scheduled for today.`;
          }
        }
        else if (userMessage.includes('today') || userMessage.includes('schedule')) {
          const todayClasses = getTodayClasses();
          const currentDay = getCurrentDay();
          
          if (todayClasses.length > 0) {
            response = `📅 **${currentDay}'s Schedule**\n\n`;
            todayClasses.forEach((cls, index) => {
              response += `${index + 1}. ${cls.timeSlot}: ${cls.subject} (Room ${cls.room})\n`;
            });
          } else {
            response = `You have no classes scheduled for ${currentDay}.`;
          }
        }
        else if (userMessage.includes('all') || userMessage.includes('list')) {
          if (teacherData.allEntries.length > 0) {
            response = `📚 **Your Complete Schedule**\n\n`;
            
            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            days.forEach(day => {
              const dayClasses = teacherData.allEntries.filter(e => e.day === day);
              if (dayClasses.length > 0) {
                response += `**${day}:**\n`;
                dayClasses.forEach(cls => {
                  response += `  • ${cls.timeSlot}: ${cls.subject} (Room ${cls.room})\n`;
                });
                response += `\n`;
              }
            });
          } else {
            response = "You don't have any classes scheduled.";
          }
        }
        else {
          response = `I can help you with your class schedule. Try asking:\n• "What's my current class?"\n• "Monday 8 to 9 class?"\n• "Tuesday 10 AM class?"\n• "Show today's schedule"`;
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-3 sm:p-4 shadow-lg z-50 transition-all duration-300 hover:scale-110"
        title="AI Assistant"
      >
        <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-white dark:bg-gray-800 rounded-lg shadow-2xl z-50 flex flex-col transition-all duration-300 ${
          isMinimized 
            ? 'w-64 sm:w-72 h-14' 
            : 'w-80 sm:w-96 h-[500px] sm:h-[600px]'
        }`}>
          
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">AI Assistant</span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button 
                onClick={toggleMinimize} 
                className="hover:bg-orange-400 p-1 rounded transition-colors"
              >
                {isMinimized ? 
                  <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : 
                  <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" />
                }
              </button>
              <button 
                onClick={toggleChat} 
                className="hover:bg-orange-400 p-1 rounded transition-colors"
              >
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-2 sm:p-3 text-sm sm:text-base ${
                        msg.role === 'user' 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your classes..."
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 dark:bg-gray-700 dark:text-white"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading || !inputMessage.trim()}
                    className="px-3 sm:px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Ask about your classes
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default AIChatButton;