import { ChatMessage } from '../types';
import { useTypingEffect } from '../hooks/useTypingEffect';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';
import { supplementsCatalog } from '../data/supplements';

interface MessageBubbleProps {
  message: ChatMessage;
  isLatest?: boolean;
}

export const MessageBubble = ({ message, isLatest = false }: MessageBubbleProps) => {
  const { displayedText, isComplete } = useTypingEffect(
    message.sender === 'ai' && isLatest ? message.content : message.content,
    message.sender === 'ai' && isLatest ? 20 : 0
  );
  
  const content = message.sender === 'ai' && isLatest ? displayedText : message.content;
  const isAI = message.sender === 'ai';

  return (
    <div className={`flex gap-3 ${isAI ? 'justify-start' : 'justify-end'} mb-6`}>
      {isAI && (
        <Avatar className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500">
          <AvatarFallback>
            <Bot className="w-4 h-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`max-w-[70%] ${isAI ? 'order-2' : 'order-1'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAI
              ? 'bg-white border border-gray-200 shadow-sm'
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
          }`}
        >
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {content}
            {message.sender === 'ai' && isLatest && !isComplete && (
              <span className="inline-block w-2 h-4 bg-blue-500 ml-1 animate-pulse" />
            )}
          </div>
          
          {message.supplementRecommendations && message.supplementRecommendations.length > 0 && isComplete && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Рекомендованные БАДы:</p>
              <div className="flex flex-wrap gap-2">
                {message.supplementRecommendations.map((suppId) => {
                  const supplement = supplementsCatalog.find(s => s.id === suppId);
                  return supplement ? (
                    <Badge key={suppId} variant="outline" className="text-xs">
                      {supplement.name} - {supplement.price}₽
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
        
        <div className={`text-xs text-gray-500 mt-1 ${isAI ? 'text-left' : 'text-right'}`}>
          {message.timestamp.toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
      
      {!isAI && (
        <Avatar className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600">
          <AvatarFallback>
            <User className="w-4 h-4 text-white" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};