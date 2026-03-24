// AITMS/client/src/components/StudentAIChatButton.jsx
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import axios from 'axios';

const StudentAIChatButton = ({ userInfo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timetable, setTimetable] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
  const messagesEndRef = useRef(null);

  // Fetch timetable for student's department and semester
  useEffect(() => {
    const fetchTimetable = async () => {
      if (!userInfo?.department || !userInfo?.semester) {
        console.log('⏸️ No department or semester info');
        return;
      }

      console.log('📚 Fetching timetable for:', userInfo.department, 'Semester:', userInfo.semester);
      
      try {
        const response = await axios.get(
          `http://localhost:5000/api/public/timetable/department/${userInfo.department}/semester/${userInfo.semester}`
        );

        if (response.data.success) {
          console.log('✅ Timetable fetched:', response.data.data);
          setTimetable(response.data.data.entries || []);
        }
      } catch (error) {
        console.error('❌ Error fetching timetable:', error.message);
        setTimetable([]);
      } finally {
        setDataLoaded(true);
      }
    };

    if (userInfo) {
      fetchTimetable();
    }
  }, [userInfo]);

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

  // Get current day
  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  // Get current time in minutes
  const getCurrentTimeInMinutes = () => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  };

  // Get current class
  const getCurrentClass = () => {
    const currentDay = getCurrentDay();
    const currentTime = getCurrentTimeInMinutes();
    
    return timetable.find(entry => {
      if (entry.day !== currentDay) return false;
      
      const [startTimeStr, endTimeStr] = entry.timeSlot.split(' - ');
      const startMinutes = convertTimeToMinutes(startTimeStr);
      const endMinutes = convertTimeToMinutes(endTimeStr);
      
      return currentTime >= startMinutes && currentTime <= endMinutes;
    });
  };

  // Get today's classes
  const getTodayClasses = () => {
    const currentDay = getCurrentDay();
    return timetable.filter(entry => entry.day === currentDay)
      .sort((a, b) => {
        const [aStart] = a.timeSlot.split(' - ');
        const [bStart] = b.timeSlot.split(' - ');
        return convertTimeToMinutes(aStart) - convertTimeToMinutes(bStart);
      });
  };

  // Get classes for a specific day
  const getClassesForDay = (day) => {
    return timetable.filter(entry => entry.day === day)
      .sort((a, b) => {
        const [aStart] = a.timeSlot.split(' - ');
        const [bStart] = b.timeSlot.split(' - ');
        return convertTimeToMinutes(aStart) - convertTimeToMinutes(bStart);
      });
  };

  // Initialize chat with simple welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const studentName = userInfo?.name?.split(' ')[0] || 'Student';
      
      setMessages([{ 
        role: 'assistant', 
        content: `Hello ${studentName}! How can I help you today?` 
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
        response = `You're welcome! Feel free to ask if you need anything else.`;
      }
      // Check for greetings
      else if (['hi', 'hello', 'hey', 'greetings'].includes(userMessage)) {
        response = `Hello! How can I help you with your studies today?`;
      }
      // Check for current class
      else if (userMessage.includes('current') || userMessage.includes('now')) {
        const currentClass = getCurrentClass();
        
        if (currentClass) {
          response = `Your current class is:\n\n`;
          response += `Subject: ${currentClass.subject}\n`;
          response += `Time: ${currentClass.timeSlot}\n`;
          response += `Faculty: ${currentClass.facultyName}\n`;
          response += `Room: ${currentClass.room}`;
        } else {
          response = `You don't have any class right now.`;
          
          const todayClasses = getTodayClasses();
          if (todayClasses.length > 0) {
            const nextClass = todayClasses.find(c => {
              const [startTimeStr] = c.timeSlot.split(' - ');
              return convertTimeToMinutes(startTimeStr) > getCurrentTimeInMinutes();
            });
            
            if (nextClass) {
              response += `\n\nYour next class is ${nextClass.subject} at ${nextClass.timeSlot}.`;
            }
          }
        }
      }
      // Check for today's classes
      else if (userMessage.includes('today') || userMessage.includes('schedule')) {
        const todayClasses = getTodayClasses();
        const currentDay = getCurrentDay();
        
        if (todayClasses.length > 0) {
          response = `Your classes for ${currentDay}:\n\n`;
          todayClasses.forEach((cls, index) => {
            response += `${index + 1}. ${cls.timeSlot} - ${cls.subject}\n`;
            response += `   Room: ${cls.room}, Faculty: ${cls.facultyName}\n`;
          });
        } else {
          response = `You have no classes scheduled for ${currentDay}.`;
        }
      }
      // Check for specific day with time range
      else if (userMessage.includes('monday') || userMessage.includes('tuesday') || 
               userMessage.includes('wednesday') || userMessage.includes('thursday') ||
               userMessage.includes('friday') || userMessage.includes('saturday')) {
        
        let day = '';
        if (userMessage.includes('monday')) day = 'Monday';
        else if (userMessage.includes('tuesday')) day = 'Tuesday';
        else if (userMessage.includes('wednesday')) day = 'Wednesday';
        else if (userMessage.includes('thursday')) day = 'Thursday';
        else if (userMessage.includes('friday')) day = 'Friday';
        else if (userMessage.includes('saturday')) day = 'Saturday';
        
        // Check if the query includes a time range like "8 to 9"
        const timeRangeMatch = userMessage.match(/(\d{1,2})\s*(?:to|-)\s*(\d{1,2})/);
        
        if (timeRangeMatch) {
          const startHour = parseInt(timeRangeMatch[1]);
          const endHour = parseInt(timeRangeMatch[2]);
          
          // Find class that matches this time range
          const matchingClass = timetable.find(cls => {
            if (cls.day !== day) return false;
            
            const [startTimeStr] = cls.timeSlot.split(' - ');
            const classStartHour = parseInt(startTimeStr.split(':')[0]);
            
            // Handle PM conversion if needed
            let classHour = classStartHour;
            if (startTimeStr.includes('PM') && classStartHour !== 12) {
              classHour = classStartHour + 12;
            }
            if (startTimeStr.includes('AM') && classStartHour === 12) {
              classHour = 0;
            }
            
            // Check if this class starts at the requested hour
            return classHour === startHour;
          });
          
          if (matchingClass) {
            response = `On ${day} from ${startHour}:00 to ${endHour}:00, you have:\n\n`;
            response += `Subject: ${matchingClass.subject}\n`;
            response += `Time: ${matchingClass.timeSlot}\n`;
            response += `Faculty: ${matchingClass.facultyName}\n`;
            response += `Room: ${matchingClass.room}`;
          } else {
            response = `No class found on ${day} from ${startHour}:00 to ${endHour}:00.`;
            
            // Show all classes on that day for reference
            const dayClasses = getClassesForDay(day);
            if (dayClasses.length > 0) {
              response += `\n\nClasses on ${day}:\n`;
              dayClasses.forEach(cls => {
                response += `• ${cls.timeSlot}: ${cls.subject}\n`;
              });
            }
          }
        } else {
          // No time range specified, show all classes for the day
          const dayClasses = getClassesForDay(day);
          
          if (dayClasses.length > 0) {
            response = `Your classes on ${day}:\n\n`;
            dayClasses.forEach((cls, index) => {
              response += `${index + 1}. ${cls.timeSlot} - ${cls.subject}\n`;
              response += `   Room: ${cls.room}, Faculty: ${cls.facultyName}\n`;
            });
          } else {
            response = `You have no classes scheduled on ${day}.`;
          }
        }
      }
      // Help
      else if (userMessage.includes('help') || userMessage.includes('what can you do')) {
        response = `I can help you with:\n\n` +
          `• "What's my current class?"\n` +
          `• "What's my today's schedule?"\n` +
          `• "Monday classes"\n` +
          `• "Monday 8 to 9 class?"\n` +
          `• "Tuesday 10 AM class?"\n\n` +
          `Just ask me about your classes!`;
      }
      // Unknown query
      else {
        response = `I can help you with your class schedule. Try asking:\n` +
          `• "What's my current class?"\n` +
          `• "Today's schedule"\n` +
          `• "Monday classes"\n` +
          `• "Monday 8 to 9 class?"`;
      }

      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
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
            <span className="font-semibold text-sm sm:text-base">Student Assistant</span>
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

          {/* Data Loading Indicator */}
          {!dataLoaded && !isMinimized && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 p-2 text-xs text-blue-600 dark:text-blue-300">
              Loading your timetable...
            </div>
          )}

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
                      <span className="text-sm">Thinking...</span>
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
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default StudentAIChatButton;