import { supplementsCatalog } from '@/data/supplements';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ProductCardInChatProps {
  productId: string;
}

export function ProductCardInChat({ productId }: ProductCardInChatProps) {
  const product = supplementsCatalog.find(p => p.id === productId);

  if (!product) {
    return (
      <div className="my-4 p-4 border border-red-300 rounded-lg bg-red-50">
        <p className="text-red-600">Товар не найден</p>
      </div>
    );
  }

  const handlePay = () => {
    // Демо-функция оплаты
    alert(`Переход к оплате: ${product.name} - ${product.price}₽\n\nЭто демо-версия. В реальном приложении здесь будет интеграция с платежной системой.`);
  };

  return (
    <Card className="my-4 max-w-sm mx-auto shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader>
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-4">
          <div className="text-6xl">💊</div>
        </div>
        <CardTitle className="text-xl">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Объем:</span>
            <span className="font-medium">{product.volume}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Категория:</span>
            <span className="font-medium">{product.category}</span>
          </div>
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground mb-2">Преимущества:</p>
            <ul className="text-sm space-y-1">
              {product.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-2xl font-bold text-primary">{product.price} ₽</span>
          <span className="text-sm text-muted-foreground">{product.effect}</span>
        </div>
        <Button onClick={handlePay} className="w-full" size="lg">
          Оплатить
        </Button>
        <p className="text-xs text-center text-muted-foreground mt-2">
          Безопасная оплата • Доставка 1-3 дня
        </p>
      </CardFooter>
    </Card>
  );
}