import { Client } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Target, Activity } from 'lucide-react';

interface ClientSelectorProps {
  clients: Client[];
  onSelectClient: (client: Client) => void;
  selectedClient: Client | null;
}

export const ClientSelector = ({ clients, onSelectClient, selectedClient }: ClientSelectorProps) => {
  if (selectedClient) return null;

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Демо-чат с ИИ консультантом по БАДам
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Выберите профиль клиента для демонстрации персонализированного общения с ИИ-агентом
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients.map((client) => (
            <Card 
              key={client.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
              onClick={() => onSelectClient(client)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{client.name}</CardTitle>
                    <CardDescription>{client.age} лет, {client.gender === 'male' ? 'мужчина' : 'женщина'}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-blue-500" />
                    <span className="font-medium text-sm">Цели:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {client.goals.slice(0, 2).map((goal) => (
                      <Badge key={goal} variant="secondary" className="text-xs">
                        {goal}
                      </Badge>
                    ))}
                    {client.goals.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{client.goals.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-green-500" />
                    <span className="font-medium text-sm">Тренировки:</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {client.workouts.frequency}x в неделю, {client.workouts.intensity}
                  </p>
                </div>
                
                {client.healthData.issues.length > 0 && (
                  <div>
                    <span className="font-medium text-sm text-orange-600">Проблемы:</span>
                    <p className="text-sm text-gray-600 mt-1">
                      {client.healthData.issues.slice(0, 2).join(', ')}
                    </p>
                  </div>
                )}
                
                <Button className="w-full mt-4" variant="default">
                  Начать чат с {client.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};