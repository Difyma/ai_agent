import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { Supplement } from '@/data/supplements';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  supplement: Supplement;
  compact?: boolean;
  showAddButton?: boolean;
}

export const ProductCard = ({ supplement, compact = false, showAddButton = true }: ProductCardProps) => {
  const { addItem, isInCart, getItemQuantity, updateQuantity } = useCart();
  const quantity = getItemQuantity(supplement.id);
  const inCart = isInCart(supplement.id);

  const handleAddToCart = () => {
    addItem(supplement);
  };

  const handleIncrement = () => {
    updateQuantity(supplement.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      updateQuantity(supplement.id, quantity - 1);
    }
  };

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">{supplement.name}</h4>
              <p className="text-xs text-muted-foreground mb-2">{supplement.volume}</p>
              <div className="flex items-center justify-between">
                <span className="font-bold text-lg text-primary">{supplement.price} ₽</span>
                {showAddButton && (
                  <div className="flex items-center gap-2">
                    {inCart ? (
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" onClick={handleDecrement}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[20px] text-center">{quantity}</span>
                        <Button size="sm" variant="outline" onClick={handleIncrement}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" onClick={handleAddToCart}>
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Купить
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant="secondary" className="mb-2">{supplement.category}</Badge>
          {inCart && <Check className="h-5 w-5 text-green-600" />}
        </div>
        <CardTitle className="text-lg">{supplement.name}</CardTitle>
        <CardDescription className="text-sm">{supplement.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Объем:</p>
            <p className="text-sm font-medium">{supplement.volume}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Применение:</p>
            <p className="text-sm">{supplement.dosage}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Эффект:</p>
            <p className="text-sm text-green-600">{supplement.effect}</p>
          </div>
          
          {supplement.benefits.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">Преимущества:</p>
              <div className="flex flex-wrap gap-1">
                {supplement.benefits.slice(0, 3).map((benefit, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {benefit}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <div className="text-right">
          <p className="text-2xl font-bold text-primary">{supplement.price} ₽</p>
        </div>
        
        {showAddButton && (
          <div className="flex items-center gap-2">
            {inCart ? (
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={handleDecrement}>
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium min-w-[30px] text-center">{quantity}</span>
                <Button size="sm" variant="outline" onClick={handleIncrement}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={handleAddToCart}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                В корзину
              </Button>
            )}
          </div>
        )}
      </CardFooter>
    </Card>
  );
};