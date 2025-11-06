import { Button } from '@/components/ui/button';

type ShoppingCartProps = {
  onClose: () => void;
};

/**
 * Минимальный компонент корзины для предотвращения ошибки сборки.
 * Включает затемнение фона, правую панель с заголовком, контентом и футером.
 * Поддерживает закрытие по клику на фон и кнопку "Закрыть".
 */
export default function ShoppingCartComponent({ onClose }: ShoppingCartProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Right Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[380px] max-w-[100vw] bg-background border-l shadow-xl flex flex-col"
        role="dialog"
        aria-label="Корзина"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold">Корзина</h2>
          <Button
            variant="outline"
            onClick={onClose}
            className="!bg-transparent !hover:bg-transparent"
            aria-label="Закрыть корзину"
          >
            Закрыть
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-4 py-3">
          <p className="text-sm text-muted-foreground">
            Демо-корзина. Здесь отобразите выбранные БАДы, управление количеством и итоги.
          </p>
        </div>

        {/* Footer */}
        <div className="border-t px-4 py-3 flex items-center justify-between gap-2">
          <Button
            variant="outline"
            className="!bg-transparent !hover:bg-transparent"
            onClick={onClose}
          >
            Очистить
          </Button>
          <Button>Оформить заказ</Button>
        </div>
      </aside>
    </>
  );
}