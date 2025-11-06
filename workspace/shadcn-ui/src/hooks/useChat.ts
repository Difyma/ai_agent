import { useCallback, useEffect, useRef, useState } from 'react';
import { clients } from '@/data/clients';
import { generateAgentResponse, ChatContext } from '@/utils/aiAgent';

export type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type UseChatReturn = {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  sendMessage: () => void;
  scrollRef: React.MutableRefObject<HTMLDivElement | null>;
  isAutoScroll: boolean;
  onScroll: () => void;
  scrollToBottom: (behavior?: ScrollBehavior) => void;
  resetForClient: (clientId?: string) => void;
  messageCount: number;
  isTyping: boolean;
  showProductCard: boolean;
  productId?: string;
};

/**
 * useChat
 * - Управляет сообщениями, вводом и автоскроллом.
 * - Использует OpenAI API для понимания контекста диалога.
 * - Поддержка нового пользователя (узнавание имени, возраста, целей).
 * - Показ карточки товара при согласии пользователя.
 * - Добавлена ЖЁСТКАЯ защита от повторений на уровне кода.
 * - Добавлен индикатор печати (isTyping) для имитации живого диалога.
 * - Увеличен контекстный буфер до 6 сообщений.
 * - Добавлен флаг hasGreeted для предотвращения повторных приветствий.
 * - Добавлен счетчик turnsCount для правила задержки продаж.
 */
export function useChat(initialClientId?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [clientId, setClientId] = useState<string | undefined>(initialClientId);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showProductCard, setShowProductCard] = useState(false);
  const [productId, setProductId] = useState<string | undefined>();
  const [hasGreeted, setHasGreeted] = useState(false);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior });
  }, []);

  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAutoScroll(distanceToBottom <= 120);
  }, []);

  // Генерация персонализированного приветствия
  const generateGreeting = useCallback((cId: string): string => {
    const client = clients.find(c => c.id === cId);
    if (!client) return 'Привет! 👋 Рад помочь с подбором БАДов.';

    // Проверка на нового пользователя
    if (!client.name || client.name === '' || client.name === 'Новый пользователь' || client.age === 0) {
      return 'Привет! 👋 Как тебя зовут?';
    }

    const firstName = client.name.split(' ')[0];

    const greetingVariants = [
      `Привет, ${firstName}! 👋 Как дела?`,
      `Хэй, ${firstName}! Как самочувствие?`,
      `Приветствую, ${firstName}! 😊 Как себя чувствуешь?`
    ];

    return greetingVariants[Math.floor(Math.random() * greetingVariants.length)];
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text) return;
    
    // Пользовательское сообщение
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    
    const newCount = messageCount + 1;
    setMessageCount(newCount);

    // Получаем клиента
    const client = clients.find(c => c.id === clientId);
    if (!client) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: 'Извините, произошла ошибка. Попробуйте выбрать клиента заново.' }
        ]);
      }, 500);
      return;
    }

    // Показываем индикатор печати
    setIsTyping(true);

    // Создаём контекст для OpenAI с увеличенным буфером (последние 6 сообщений)
    const recentMessages = messages.slice(-6);
    
    // Подсчитываем количество сообщений пользователя (turnsCount)
    const turnsCount = messages.filter(m => m.role === 'user').length + 1; // +1 для текущего сообщения
    
    const context: ChatContext = {
      client,
      messages: recentMessages.map((m, idx) => ({
        id: idx.toString(),
        text: m.content,
        sender: m.role === 'user' ? 'user' : 'agent',
        timestamp: new Date()
      })),
      stage: newCount <= 2 ? 'greeting' : newCount <= 4 ? 'symptoms' : 'products',
      discoveredSymptoms: [],
      collectedInfo: {}
    };

    try {
      // Используем OpenAI для генерации ответа с флагом hasGreeted и turnsCount
      const result = await generateAgentResponse(text, context, hasGreeted, turnsCount);
      const { response, showCard, productId: responseProductId, hasGreeted: newHasGreeted } = result;
      
      // Обновляем флаг hasGreeted
      if (newHasGreeted !== undefined) {
        setHasGreeted(newHasGreeted);
      }
      
      // Задержка на основе длины ответа (имитация печати)
      const typingDelay = Math.min(response.length * 30, 2000);
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: response }
        ]);
        setIsTyping(false);
        
        // Показываем карточку товара, если нужно
        if (showCard && responseProductId) {
          setShowProductCard(true);
          setProductId(responseProductId);
        }
      }, typingDelay);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Улучшенный fallback с использованием динамических фраз
      const userMsgs = messages.filter(m => m.role === 'user').slice(-3).map(m => m.content.toLowerCase());
      
      const empathyPhrases = [
        'Понимаю тебя',
        'Сочувствую',
        'Знаю, каково это'
      ];
      
      let fallbackResponse = 'Извините, возникла проблема. Попробуйте еще раз.';
      
      const noCount = userMsgs.filter(msg => msg.trim() === 'нет').length;
      
      if (noCount >= 2) {
        fallbackResponse = 'Понял! Обращайся 👋';
      } else if (userMsgs.some(msg => msg.includes('я же'))) {
        fallbackResponse = `${empathyPhrases[Math.floor(Math.random() * empathyPhrases.length)]}! Что важно?`;
      } else if (text.toLowerCase().trim() === 'нет') {
        fallbackResponse = 'Понял. Другие вопросы?';
      }
      
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: fallbackResponse }
        ]);
        setIsTyping(false);
      }, 1000);
    }
  }, [input, messages, messageCount, clientId, hasGreeted]);

  // Автоскролл при добавлении новых сообщений
  useEffect(() => {
    if (isAutoScroll) {
      scrollToBottom();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length, isAutoScroll, isTyping]);

  // Сброс при смене клиента
  const resetForClient = useCallback((nextClientId?: string) => {
    setClientId(nextClientId);
    setInput('');
    setIsAutoScroll(true);
    setMessageCount(0);
    setIsTyping(false);
    setShowProductCard(false);
    setProductId(undefined);
    setHasGreeted(false); // Сбрасываем флаг приветствия
    
    const el = scrollRef.current;
    if (el) el.scrollTop = 0;

    // Персонализированное приветствие
    if (nextClientId) {
      const greeting = generateGreeting(nextClientId);
      setMessages([{ role: 'assistant', content: greeting }]);
      setHasGreeted(true); // Устанавливаем флаг после первого приветствия
    } else {
      setMessages([]);
    }
  }, [generateGreeting]);

  useEffect(() => {
    // Инициализация при первом клиенте
    if (initialClientId) {
      resetForClient(initialClientId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    messages,
    input,
    setInput,
    sendMessage,
    scrollRef,
    isAutoScroll,
    onScroll,
    scrollToBottom,
    resetForClient,
    messageCount,
    isTyping,
    showProductCard,
    productId,
  };
}

export default useChat;