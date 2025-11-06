import { Client } from '../types';

export const clients: Client[] = [
  // НОВЫЙ ПОЛЬЗОВАТЕЛЬ с пустым профилем
  {
    id: '0',
    name: 'Новый пользователь',
    age: 0,
    gender: 'unknown',
    goals: [],
    workouts: {
      frequency: 0,
      type: [],
      intensity: 'low'
    },
    nutrition: {
      diet: '',
      restrictions: [],
      preferences: []
    },
    healthData: {
      weight: 0,
      height: 0,
      bmi: 0,
      bloodTests: {},
      issues: []
    },
    purchaseHistory: []
  },
  {
    id: '1',
    name: 'Анна Петрова',
    age: 28,
    gender: 'female',
    goals: ['похудение', 'повышение энергии', 'улучшение кожи'],
    workouts: {
      frequency: 4,
      type: ['кардио', 'йога', 'силовые'],
      intensity: 'medium'
    },
    nutrition: {
      diet: 'сбалансированная',
      restrictions: ['лактоза'],
      preferences: ['органические продукты', 'растительные белки']
    },
    healthData: {
      weight: 65,
      height: 168,
      bmi: 23.0,
      bloodTests: {
        vitamin_d: 18, // КРИТИЧЕСКИ низкий - нужен D3
        b12: 280,      // Низкий - нужен B12
        iron: 8.5,     // ОЧЕНЬ низкое железо - анемия
        magnesium: 0.65 // Низкий магний - стресс и сон
      },
      issues: ['низкий витамин D', 'усталость', 'анемия', 'выпадение волос']
    },
    purchaseHistory: ['мультивитамины', 'омега-3']
  },
  {
    id: '2',
    name: 'Михаил Иванов',
    age: 35,
    gender: 'male',
    goals: ['набор мышечной массы', 'повышение силы', 'восстановление'],
    workouts: {
      frequency: 5,
      type: ['силовые', 'кроссфит'],
      intensity: 'high'
    },
    nutrition: {
      diet: 'высокобелковая',
      restrictions: [],
      preferences: ['спортивное питание', 'быстрые углеводы']
    },
    healthData: {
      weight: 82,
      height: 180,
      bmi: 25.3,
      bloodTests: {
        vitamin_d: 45,  // Нормальный
        b12: 420,       // Нормальный
        iron: 85,       // Нормальное
        magnesium: 0.60 // НИЗКИЙ магний - нужен для мышц и восстановления
      },
      issues: ['боли в суставах после тренировок', 'медленное восстановление', 'судороги в мышцах']
    },
    purchaseHistory: ['протеин', 'креатин', 'BCAA']
  },
  {
    id: '3',
    name: 'Елена Смирнова',
    age: 42,
    gender: 'female',
    goals: ['поддержание здоровья', 'антиэйдж', 'улучшение сна'],
    workouts: {
      frequency: 3,
      type: ['пилатес', 'плавание', 'ходьба'],
      intensity: 'low'
    },
    nutrition: {
      diet: 'средиземноморская',
      restrictions: ['глютен'],
      preferences: ['антиоксиданты', 'натуральные добавки']
    },
    healthData: {
      weight: 58,
      height: 165,
      bmi: 21.3,
      bloodTests: {
        vitamin_d: 35,  // Нормальный
        b12: 250,       // НИЗКИЙ B12 - проблемы с памятью и энергией
        iron: 55,       // Нормальное
        magnesium: 0.70 // Низкий магний - проблемы со сном
      },
      issues: ['проблемы со сном', 'стресс', 'забывчивость', 'раздражительность']
    },
    purchaseHistory: ['коллаген', 'магний']
  },
  {
    id: '4',
    name: 'Дмитрий Козлов',
    age: 24,
    gender: 'male',
    goals: ['повышение выносливости', 'энергия', 'концентрация'],
    workouts: {
      frequency: 6,
      type: ['бег', 'велоспорт', 'плавание'],
      intensity: 'high'
    },
    nutrition: {
      diet: 'спортивная',
      restrictions: [],
      preferences: ['энергетические добавки', 'быстрое восстановление']
    },
    healthData: {
      weight: 75,
      height: 178,
      bmi: 23.7,
      bloodTests: {
        vitamin_d: 40,  // Нормальный
        b12: 180,       // КРИТИЧЕСКИ низкий B12 - влияет на энергию
        iron: 70,       // Нормальное
        magnesium: 0.55 // ОЧЕНЬ низкий магний - нужен для выносливости
      },
      issues: ['быстрая утомляемость', 'плохая концентрация', 'мышечные спазмы']
    },
    purchaseHistory: ['изотоники', 'витамин C']
  },
  {
    id: '5',
    name: 'Ольга Васильева',
    age: 31,
    gender: 'female',
    goals: ['планирование беременности', 'укрепление иммунитета'],
    workouts: {
      frequency: 3,
      type: ['йога', 'легкие кардио'],
      intensity: 'low'
    },
    nutrition: {
      diet: 'сбалансированная',
      restrictions: ['алкоголь', 'кофеин'],
      preferences: ['фолиевая кислота', 'натуральные витамины']
    },
    healthData: {
      weight: 62,
      height: 170,
      bmi: 21.5,
      bloodTests: {
        vitamin_d: 30,  // Нижняя граница нормы
        b12: 320,       // Нормальный
        iron: 9.0,      // НИЗКОЕ железо - критично для беременности
        magnesium: 0.75 // Нормальный
      },
      issues: ['низкое железо', 'планирование беременности', 'частые простуды', 'слабые ногти']
    },
    purchaseHistory: ['фолиевая кислота', 'железо']
  },
  {
    id: '6',
    name: 'Сергей Николаев',
    age: 48,
    gender: 'male',
    goals: ['поддержание здоровья сердца', 'снижение холестерина', 'контроль веса'],
    workouts: {
      frequency: 2,
      type: ['ходьба', 'легкие силовые'],
      intensity: 'low'
    },
    nutrition: {
      diet: 'низкожировая',
      restrictions: ['сахар', 'соль'],
      preferences: ['омега-3', 'клетчатка']
    },
    healthData: {
      weight: 88,
      height: 175,
      bmi: 28.7,
      bloodTests: {
        vitamin_d: 25,  // Низкий
        b12: 380,       // Нормальный
        iron: 75,       // Нормальное
        magnesium: 0.80 // Нормальный
      },
      issues: ['повышенный холестерин', 'лишний вес', 'гипертония', 'одышка']
    },
    purchaseHistory: ['омега-3', 'коэнзим Q10']
  }
];

// Сохраняем старый экспорт для обратной совместимости
export const demoClients = clients;