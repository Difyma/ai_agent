import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import useChat from '@/hooks/useChat';
import ShoppingCartComponent from './ShoppingCartComponent';
import { ProductCardInChat } from './ProductCardInChat';
import { useCart } from '@/hooks/useCart';
import { supplementsCatalog } from '@/data/supplements';

type ChatInterfaceProps = {
  client?: { id?: string; name?: string };
  onBack?: () => void;
};

/**
 * ChatInterface
 * - Внешний контейнер: flex h-screen max-h-screen flex-col
 * - Список сообщений: отдельный скроллируемый контейнер (сосед поля ввода)
 * - Поле ввода: вынесено из overflow-контейнера, зафиксировано снизу
 * - MessageBubble: переносы текста
 * - Добавлен индикатор печати (typing indicator) для имитации живого диалога
 * - Показ карточки товара при согласии пользователя ({{SHOW_PRODUCT_CARD}})
 * - Поддержка нового пользователя (узнавание имени, возраста, целей)
 */
export default function ChatInterface({ client, onBack }: ChatInterfaceProps) {
  const [cartOpen, setCartOpen] = useState(false);
  const { messages, input, setInput, sendMessage, scrollRef, onScroll, isTyping, showProductCard, productId } = useChat(client?.id);
  const { addItem, isInCart } = useCart();
  const addedProductsRef = useRef<Set<string>>(new Set());

  // Автоматическое добавление товара в корзину при показе карточки
  useEffect(() => {
    if (showProductCard && productId && !addedProductsRef.current.has(productId)) {
      const product = supplementsCatalog.find(p => p.id === productId);
      if (product && !isInCart(productId)) {
        addItem(product);
        addedProductsRef.current.add(productId);
      }
    }
  }, [showProductCard, productId, addItem, isInCart]);

  // Сброс отслеживания при смене клиента
  useEffect(() => {
    addedProductsRef.current.clear();
  }, [client?.id]);

  return (
    <div className="flex h-screen max-h-screen flex-col">
      {/* Верхняя панель */}
      <div className="flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-sm"
          aria-label="Назад к клиентам"
        >
          ← Назад к клиентам
        </Button>
        <div className="text-sm">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-1">
            Знакомство
          </span>
        </div>
        <Button
          variant="outline"
          onClick={() => setCartOpen(true)}
          className="!bg-transparent !hover:bg-transparent"
          aria-label="Открыть корзину"
        >
          Корзина
        </Button>
      </div>

      {/* Список сообщений — отдельный скроллируемый контейнер */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain scroll-smooth px-4 pt-2 pb-4 sm:pb-6"
        ref={scrollRef}
        id="chat-scroll"
        onScroll={onScroll}
      >
        {messages.map((m, idx) => {
          const isUser = m.role === 'user';
          return (
            <div key={idx} className={`mb-2 flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap ${
                  isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        
        {/* Индикатор печати */}
        {isTyping && (
          <div className="mb-2 flex justify-start">
            <div className="max-w-[75%] rounded-2xl px-3 py-2 bg-muted">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
        
        {/* Карточка товара */}
        {showProductCard && productId && (
          <div className="mb-2 flex justify-start">
            <ProductCardInChat productId={productId} />
          </div>
        )}
      </div>

      {/* Поле ввода — зафиксировано внизу (сосед скролл-контейнера) */}
      <div className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2">
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Введите сообщение..."
            aria-label="Поле ввода сообщения"
            disabled={isTyping}
          />
          <Button type="submit" disabled={isTyping}>Отправить</Button>
        </form>
      </div>

      {/* Слайд-панель корзины */}
      {cartOpen ? (
        <ShoppingCartComponent onClose={() => setCartOpen(false)} />
      ) : null}
    </div>
  );
}