import { useState } from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShoppingCart, Plus, Minus, Trash2, Package } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { OrderForm } from './OrderForm';

export const ShoppingCartComponent = () => {
  const { items, totalItems, totalPrice, deliveryCost, finalPrice, updateQuantity, removeItem, clearCart } = useCart();
  const [showOrderForm, setShowOrderForm] = useState(false);

  const handleQuantityChange = (supplementId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(supplementId);
    } else {
      updateQuantity(supplementId, newQuantity);
    }
  };

  if (showOrderForm) {
    return <OrderForm onBack={() => setShowOrderForm(false)} />;
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <ShoppingCart className="h-4 w-4" />
          {totalItems > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Корзина ({totalItems})
          </SheetTitle>
          <SheetDescription>
            Ваши выбранные БАДы и добавки
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Корзина пуста</h3>
              <p className="text-muted-foreground text-sm">
                Добавьте товары из каталога или по рекомендации консультанта
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="flex-1 mt-6">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.supplement.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.supplement.name}</h4>
                          <p className="text-xs text-muted-foreground mt-1">{item.supplement.volume}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {item.supplement.category}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.supplement.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.supplement.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[30px] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.supplement.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {item.supplement.price * item.quantity} ₽
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.supplement.price} ₽ за шт.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="border-t pt-4 mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Товары ({totalItems} шт.)</span>
                    <span>{totalPrice} ₽</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Доставка</span>
                    <span>
                      {deliveryCost === 0 ? (
                        <span className="text-green-600">Бесплатно</span>
                      ) : (
                        `${deliveryCost} ₽`
                      )}
                    </span>
                  </div>
                  
                  {totalPrice < 3000 && deliveryCost > 0 && (
                    <p className="text-xs text-muted-foreground">
                      Бесплатная доставка от 3000 ₽
                    </p>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-medium">
                    <span>Итого</span>
                    <span className="text-lg">{finalPrice} ₽</span>
                  </div>
                </div>
                
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={clearCart} className="flex-1">
                    Очистить
                  </Button>
                  <Button onClick={() => setShowOrderForm(true)} className="flex-2">
                    Оформить заказ
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};