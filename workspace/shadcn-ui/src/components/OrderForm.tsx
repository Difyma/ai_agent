import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, CheckCircle, Package, Truck, MapPin, CreditCard, Banknote, Smartphone } from 'lucide-react';
import { useCart } from '@/hooks/useCart';

interface OrderFormProps {
  onBack: () => void;
}

export const OrderForm = ({ onBack }: OrderFormProps) => {
  const { items, totalPrice, deliveryCost, finalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    deliveryMethod: 'courier',
    paymentMethod: 'card',
    comment: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Имитация отправки заказа
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSuccess(true);
    
    // Очищаем корзину после успешного заказа
    setTimeout(() => {
      clearCart();
    }, 3000);
  };

  const deliveryOptions = [
    { value: 'courier', label: 'Курьерская доставка', icon: Truck, cost: 300, description: 'Доставка в течение 1-2 дней' },
    { value: 'pickup', label: 'Самовывоз', icon: MapPin, cost: 0, description: 'Забрать в пункте выдачи' },
    { value: 'post', label: 'Почта России', icon: Package, cost: 250, description: 'Доставка 3-7 дней' }
  ];

  const paymentOptions = [
    { value: 'card', label: 'Банковской картой', icon: CreditCard, description: 'Visa, MasterCard, МИР' },
    { value: 'cash', label: 'Наличными курьеру', icon: Banknote, description: 'При получении заказа' },
    { value: 'online', label: 'Онлайн-оплата', icon: Smartphone, description: 'СБП, Яндекс.Деньги' }
  ];

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center py-8">
        <CheckCircle className="h-16 w-16 text-green-600 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Заказ оформлен!</h2>
        <p className="text-muted-foreground mb-4">
          Номер заказа: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
        </p>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          Мы свяжемся с вами в течение часа для подтверждения заказа. 
          Спасибо за покупку!
        </p>
        <Button onClick={onBack}>
          Продолжить покупки
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold">Оформление заказа</h2>
      </div>

      <form onSubmit={handleSubmit} className="flex-1 space-y-6 overflow-y-auto">
        {/* Контактная информация */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Контактная информация</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Имя и фамилия *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Иван Иванов"
                required
              />
            </div>
            <div>
              <Label htmlFor="phone">Телефон *</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+7 (999) 123-45-67"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="ivan@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* Способ доставки */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Способ доставки</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.deliveryMethod}
              onValueChange={(value) => handleInputChange('deliveryMethod', value)}
            >
              {deliveryOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-3 border rounded-lg p-3">
                    <RadioGroupItem value={option.value} id={option.value} />
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <Label htmlFor={option.value} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">
                          {option.cost === 0 ? 'Бесплатно' : `${option.cost} ₽`}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
            
            {formData.deliveryMethod !== 'pickup' && (
              <div className="mt-4">
                <Label htmlFor="address">Адрес доставки *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Город, улица, дом, квартира"
                  required
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Способ оплаты */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Способ оплаты</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={formData.paymentMethod}
              onValueChange={(value) => handleInputChange('paymentMethod', value)}
            >
              {paymentOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <div key={option.value} className="flex items-center space-x-3 border rounded-lg p-3">
                    <RadioGroupItem value={option.value} id={`payment-${option.value}`} />
                    <div className="flex items-center gap-3 flex-1">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor={`payment-${option.value}`} className="font-medium cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </RadioGroup>
          </CardContent>
        </Card>

        {/* Комментарий */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Комментарий к заказу</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.comment}
              onChange={(e) => handleInputChange('comment', e.target.value)}
              placeholder="Дополнительные пожелания к заказу..."
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Итоговая стоимость */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ваш заказ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.supplement.id} className="flex justify-between text-sm">
                  <span>{item.supplement.name} × {item.quantity}</span>
                  <span>{item.supplement.price * item.quantity} ₽</span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between text-sm">
                <span>Товары</span>
                <span>{totalPrice} ₽</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Доставка</span>
                <span>{deliveryCost === 0 ? 'Бесплатно' : `${deliveryCost} ₽`}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between font-medium text-lg">
                <span>Итого</span>
                <span>{finalPrice} ₽</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Оформляем заказ...' : `Оформить заказ на ${finalPrice} ₽`}
        </Button>
      </form>
    </div>
  );
};