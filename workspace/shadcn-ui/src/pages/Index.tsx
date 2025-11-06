import { useState } from 'react';
import ChatInterface from '@/components/ChatInterface';
import { clients } from '@/data/clients';

export default function Index() {
  const [selectedClient, setSelectedClient] = useState<typeof clients[0] | null>(null);

  return (
    <div className="min-h-screen h-[calc(100vh-var(--header-height,0px))]">
      {selectedClient ? (
        <ChatInterface
          client={selectedClient}
          onBack={() => setSelectedClient(null)}
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 p-6">
          <div className="max-w-2xl w-full space-y-4">
            <h1 className="text-3xl font-bold text-center mb-6">Выберите клиента</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {clients.map((client) => {
                // Извлекаем ключевую проблему из анализов крови
                const keyIssue = client.bloodTests?.keyIssues?.[0] || '';
                // Извлекаем первую цель
                const primaryGoal = client.goals?.[0] || '';
                
                return (
                  <button
                    key={client.id}
                    className="rounded-lg border bg-white/80 px-4 py-4 text-left shadow-sm transition hover:bg-white hover:shadow-md"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="flex items-baseline gap-2 mb-2">
                      <div className="font-semibold text-lg">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.age} лет</div>
                    </div>
                    {keyIssue && (
                      <div className="text-sm text-muted-foreground mb-1">
                        🩺 {keyIssue}
                      </div>
                    )}
                    {primaryGoal && (
                      <div className="text-sm text-muted-foreground">
                        🎯 {primaryGoal}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}