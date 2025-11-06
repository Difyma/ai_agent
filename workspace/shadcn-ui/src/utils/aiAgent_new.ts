import { openai, AI_CONFIG } from '@/config/openai';
import { Client } from '@/data/clients';
import { supplementsCatalog } from '@/data/supplements';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export interface ChatContext {
  client: Client;
  messages: ChatMessage[];
  stage: 'greeting' | 'collecting_info' | 'symptoms' | 'analysis' | 'solutions' | 'products' | 'objections';
  discoveredSymptoms: string[];
  collectedInfo?: {
    name?: string;
    age?: number;
    goal?: string;
    issues?: string;
  };
}

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// Динамические фразы для естественного общения
const greetings = [
  "Привет 👋",
  "Рад тебя видеть!",
  "Хэй, как настроение?",
  "Приветствую! 😊",
  "Здравствуй!"
];

const newUserGreetings = [
  "Привет 👋 Рад знакомству!",
  "Хэй! Приятно познакомиться 😊",
  "Привет! Помогу подобрать что-то полезное.",
  "Привет 👋 Как настроение?",
  "Хэй! Рад помочь 😊"
];

const empathyPhrases = [
  "Понимаю",
  "Понимаю, бывает 😕",
  "Знаю, каково это",
  "Да, непросто",
  "Понимаю, такое часто бывает",
  "Ох, понимаю 😌"
];

const positiveResponses = [
  "Отлично 😊 Рад, что всё в порядке!",
  "Здорово слышать 👍",
  "Замечательно!",
  "Прекрасно! 😊",
  "Супер!"
];

const agreementPhrases = [
  "Отлично 💪",
  "Супер! 😊",
  "Здорово!",
  "Прекрасно!",
  "Замечательно!",
  "Понял 😊"
];

const questionVariants = [
  "Что беспокоит?",
  "С чем помочь?",
  "Что хочешь улучшить?",
  "Какая проблема?",
  "Над чем работаем?"
];

const clarificationQuestions = [
  "Расскажи подробнее",
  "Когда именно это ощущаешь?",
  "Как давно началось?",
  "Насколько сильно беспокоит?",
  "В какое время суток хуже?",
  "Обычно утром или к вечеру?"
];

function getRandomPhrase(phrases: string[]): string {
  return phrases[Math.floor(Math.random() * phrases.length)];
}

const isNewUser = (client: Client): boolean => {
  return !client || !client.name || client.name === '' || client.name === 'Новый пользователь' || client.age === 0;
};

const getProductByGoal = (goal: string): string => {
  const lowerGoal = goal.toLowerCase();
  
  if (lowerGoal.includes('устал') || lowerGoal.includes('энерг') || lowerGoal.includes('бодр')) {
    return 'energy-plus';
  } else if (lowerGoal.includes('сон') || lowerGoal.includes('бессонн') || lowerGoal.includes('сплю')) {
    return 'sleep-well';
  } else if (lowerGoal.includes('иммун') || lowerGoal.includes('простуд') || lowerGoal.includes('болею')) {
    return 'immune-boost';
  } else if (lowerGoal.includes('сустав') || lowerGoal.includes('бол') || lowerGoal.includes('колен')) {
    return 'joint-flex';
  } else if (lowerGoal.includes('концентр') || lowerGoal.includes('памят') || lowerGoal.includes('внимани')) {
    return 'mind-focus';
  }
  
  return 'energy-plus';
};

export const detectProductCardTrigger = (response: string): { cleanResponse: string; showCard: boolean; productId?: string } => {
  const hasMarker = response.includes('{{SHOW_PRODUCT_CARD}}');
  
  if (hasMarker) {
    const cleanResponse = response.replace('{{SHOW_PRODUCT_CARD}}', '').trim();
    return { cleanResponse, showCard: true, productId: undefined };
  }
  
  return { cleanResponse: response, showCard: false };
};

// НОВЫЙ СИСТЕМНЫЙ ПРОМПТ с контекстным пониманием
const createSystemPrompt = (client: Client, collectedInfo: any, isFirstMessage: boolean, hasGreeted: boolean, turnsCount: number): string => {
  const firstName = client.name ? client.name.split(' ')[0] : '';
  const isNew = isNewUser(client);
  
  return `🤖 AI-продавец БАДов

Ты — живой, дружелюбный консультант-эксперт по здоровью и БАДам.
Говоришь естественно, по-человечески, с лёгким теплом и эмпатией.
Главная цель — **понять человека**, а не продать любой ценой.

## 🧩 Основные принципы

- Говори коротко (1–2 предложения максимум)
- Не используй шаблоны, канцелярит и рекламные фразы
- Пиши как в чате мессенджера
- Эмодзи допустимы, но не чаще чем через одно сообщение
- НЕ повторяй приветствия, вопросы и одинаковые формулировки
- Один вопрос за сообщение
- Каждый ответ должен нести новую смысловую ценность

## 🧠 Контекст и поведение при ответах пользователя

### 🎯 Контекстное восприятие
Ты должен **понимать смысл ответа пользователя**, а не просто реагировать по шаблону.
Прежде чем отвечать — **мысленно оцени**, что человек сказал:

- Если пользователь говорит **«всё хорошо»**, **«нормально»**, **«в порядке»** —
  НЕ выражай сочувствие или предполагай усталость.
  Вместо этого поддержи лёгкий позитивный тон:
  > «Отлично 😊 Рад, что всё в порядке!»
  > «Здорово слышать 👍 Как проходит день?»

- Если пользователь жалуется или описывает проблему — прояви эмпатию:
  > «Ох, понимаю 😌 Такое часто бывает.»
  > «Это неприятно, давай подумаем, что поможет.»

- Если пользователь отвечает вопросом — отвечай по сути

⚠️ Всегда **проверяй смысл последних сообщений**.
Если предыдущее сообщение пользователя содержит позитив или нейтральный ответ,
**не переходи к сочувствию** — это ошибка.

## 🚫 НЕ ПРОГОВАРИВАЙ ДАННЫЕ ПРОФИЛЯ

Ты можешь знать данные профиля (age, goal, issues),
но **НИКОГДА НЕ ВСТАВЛЯЙ ИХ В СООБЩЕНИЯ**.
Используй их только для выбора направления разговора.

❌ ЗАПРЕЩЕНО:
- "Вижу, тебе ${client.age} лет"
- "Твоя цель — ${client.goals?.[0]}"
- "Цель ${client.age} лет — ${client.goals?.[0]}"
- Любое упоминание возраста, целей, диагнозов

✅ ПРАВИЛЬНО:
- "Привет, ${firstName}! 👋 Как настроение?"
- "Как самочувствие?"
- "Что хочешь улучшить?"

## 🧭 Интеллектуальная логика поведения

1. **Прежде чем ответить**, оцени состояние пользователя:
   - Позитив: всё хорошо → лёгкий small-talk
   - Нейтрально: короткие ответы → короткие уточнения
   - Негатив: жалоба, усталость → эмпатия и уточнение

2. **Если человек явно не выражает проблемы**,
   не нужно пытаться продать — просто поддержи диалог.

3. **Переход к продаже** возможен только если:
   - пользователь упомянул усталость, боль, стресс, сон, энергию
   - и ты уже проявил эмпатию и задал хотя бы одно уточнение
   - и turnsCount >= 3

4. **Если человек отвечает односложно** ("да", "нет", "норм") —
   используй одну лёгкую фразу и не навязывай разговор.

## 💬 Структура диалога

1️⃣ ЭМПАТИЯ (только если есть проблема)
   "Понимаю, такое часто бывает 😌"

2️⃣ УТОЧНЕНИЕ
   "Когда сильнее чувствуешь усталость — утром или вечером?"

3️⃣ РЕШЕНИЕ (только при turnsCount >= 3 И наличии проблемы)
   "Хочешь, подскажу, как можно поддержать организм?"

4️⃣ ПРОДАЖА (только после согласия)
   "Советую Energy+ Active {{SHOW_PRODUCT_CARD}}"

## 🧠 ПАМЯТЬ

- Пользователь: ${isNew ? 'НОВЫЙ' : firstName}
- Уже поздоровался: ${hasGreeted ? 'ДА' : 'НЕТ'}
- Количество сообщений: ${turnsCount}
- ${turnsCount < 3 ? '❌ ЗАПРЕЩЕНО предлагать продукт!' : '✅ Можно предлагать при наличии проблемы'}

${isNew ? `
## СЦЕНАРИЙ: НОВЫЙ ПОЛЬЗОВАТЕЛЬ

${!hasGreeted ? `
1. Поздоровайся естественно (ОДИН РАЗ):
   "${getRandomPhrase(newUserGreetings)}"
` : ''}

2. Узнай имя (если не известно):
   "Как можно к тебе обращаться?"

3. Узнай больше в живом тоне:
   "Чего бы хотелось улучшить — энергию, сон, настроение?"

4. После 2–3 сообщений можно плавно перейти к подбору продукта.
` : `
## КЛИЕНТ: ${firstName}

${isFirstMessage && !hasGreeted ? `
ПЕРВОЕ СООБЩЕНИЕ:
- Поздоровайся ОДИН РАЗ: "${getRandomPhrase(greetings)} ${firstName}! Как дела?"
- НЕ упоминай возраст, цель, проблемы
- НЕ задавай конкретные вопросы в первом сообщении
` : `
НЕ ПЕРВОЕ СООБЩЕНИЕ:
- ЗАПРЕЩЕНО здороваться снова
- Реагируй на контекст последнего сообщения пользователя
- Если "всё хорошо" → позитивный ответ
- Если жалоба → эмпатия и уточнение
`}
`}

## 💊 ТОВАРЫ

- energy-plus: Energy+ Active (1490₽) - энергия и тонус
- sleep-well: SleepWell Calm (1290₽) - сон и расслабление
- immune-boost: Immune Boost (1590₽) - иммунитет
- joint-flex: Joint Flex Plus (1390₽) - суставы
- mind-focus: Mind Focus Pro (1690₽) - концентрация

## 💬 ПРИМЕРЫ

Пользователь: "Всё хорошо"
Бот: "Отлично 😊 Рад, что в порядке! Если будет нужно — подскажу, чем помочь."

Пользователь: "После работы болят суставы"
Бот: "Ох 😕 понимаю, после долгого дня такое часто. В каких именно суставах чувствуешь боль?"

Пользователь: "Привет"
Бот: "Привет 👋 Рад познакомиться! Что хочешь улучшить — энергию, сон, настроение?"

## ПРАВИЛА

1. НЕ произноси возраст, цель, диагнозы
2. Понимай смысл ответов ("всё хорошо" ≠ жалоба)
3. Различай эмоциональный контекст
4. Реагируй естественно, коротко, по-дружески
5. Не предлагай продукт при turnsCount < 3
6. При согласии И turnsCount >= 3: {{SHOW_PRODUCT_CARD}}`;
};

// Создание контекста сообщений для OpenAI (увеличено до 20 сообщений)
const createMessagesContext = (context: ChatContext, hasGreeted: boolean, turnsCount: number): OpenAIMessage[] => {
  const userMessagesCount = context.messages.filter(m => m.sender === 'user').length;
  const isFirstMessage = userMessagesCount === 0;
  
  const systemPrompt = createSystemPrompt(
    context.client,
    context.collectedInfo || {},
    isFirstMessage,
    hasGreeted,
    turnsCount
  );
  
  const systemMessage: OpenAIMessage = {
    role: 'system',
    content: systemPrompt
  };

  // Увеличено с 6 до 20 сообщений для полного контекста
  const recentMessages: OpenAIMessage[] = context.messages
    .slice(-20)
    .map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

  return [systemMessage, ...recentMessages];
};

const updateCollectedInfo = (message: string, collectedInfo: any): any => {
  const updated = { ...collectedInfo };
  
  if (!updated.name) {
    const nameMatch = message.match(/меня зовут (\w+)|я (\w+)|(\w+)/i);
    if (nameMatch) {
      updated.name = nameMatch[1] || nameMatch[2] || nameMatch[3];
    }
  } else if (!updated.age) {
    const ageMatch = message.match(/(\d+)/);
    if (ageMatch) {
      updated.age = parseInt(ageMatch[1]);
    }
  } else if (!updated.goal) {
    updated.goal = message;
  }
  
  return updated;
};

export const generateAgentResponse = async (
  message: string,
  context: ChatContext,
  hasGreeted: boolean = false,
  turnsCount: number = 0
): Promise<{ response: string; updatedContext: ChatContext; showCard?: boolean; productId?: string; hasGreeted?: boolean }> => {
  try {
    console.log('=== КОНТЕКСТ ДИАЛОГА ===');
    console.log('Новый пользователь:', isNewUser(context.client));
    console.log('Текущее сообщение:', message);
    console.log('Уже поздоровался:', hasGreeted);
    console.log('turnsCount:', turnsCount);
    
    let updatedCollectedInfo = context.collectedInfo || {};
    if (isNewUser(context.client)) {
      updatedCollectedInfo = updateCollectedInfo(message, updatedCollectedInfo);
    }
    
    const messages = createMessagesContext({
      ...context,
      collectedInfo: updatedCollectedInfo
    }, hasGreeted, turnsCount);
    
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      messages,
      max_tokens: AI_CONFIG.maxTokens,
      temperature: AI_CONFIG.temperature,
      top_p: AI_CONFIG.top_p,
      frequency_penalty: AI_CONFIG.frequency_penalty,
      presence_penalty: AI_CONFIG.presence_penalty,
    });

    let response = completion.choices[0]?.message?.content || 
      'Извините, произошла ошибка. Попробуйте еще раз.';

    console.log('Ответ от OpenAI:', response);

    const { cleanResponse, showCard, productId: detectedProductId } = detectProductCardTrigger(response);
    response = cleanResponse;
    
    let productId = detectedProductId;
    if (showCard && !productId) {
      const goal = updatedCollectedInfo.goal || context.client.goals?.[0] || '';
      productId = getProductByGoal(goal);
    }

    // ЗАЩИТА ОТ ПОВТОРЕНИЙ
    const lastBotMessages = context.messages
      .filter(m => m.sender === 'agent')
      .slice(-3)
      .map(m => m.text);

    const isDuplicate = lastBotMessages.some(lastMsg => {
      const responseStart = response.slice(0, 50).toLowerCase().trim();
      const lastMsgStart = lastMsg.slice(0, 50).toLowerCase().trim();
      return responseStart === lastMsgStart && responseStart.length > 10;
    });

    if (isDuplicate) {
      console.warn('⚠️ ПОВТОР ОБНАРУЖЕН!');
      response = `${getRandomPhrase(empathyPhrases)}! Что ещё важно?`;
    }

    const userMessages = context.messages.filter(m => m.sender === 'user').slice(-3).map(m => m.text.toLowerCase());
    const objectionCount = userMessages.filter(msg => 
      msg.includes('нет') || 
      msg.includes('не хочу') || 
      msg.includes('дорого') || 
      msg.includes('не верю')
    ).length;

    if (objectionCount >= 2) {
      console.warn('⚠️ ПОВТОРНЫЕ ВОЗРАЖЕНИЯ!');
      response = 'Всё понял! Обращайся 👋';
    }

    let newStage = context.stage;
    if (isNewUser(context.client) && updatedCollectedInfo.name && updatedCollectedInfo.age && updatedCollectedInfo.goal) {
      newStage = 'products';
    }

    const newHasGreeted = hasGreeted || context.messages.filter(m => m.sender === 'agent').length > 0;

    const finalContext = {
      ...context,
      stage: newStage,
      collectedInfo: updatedCollectedInfo,
      messages: [...context.messages, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'agent' as const,
        timestamp: new Date()
      }]
    };

    return { response, updatedContext: finalContext, showCard, productId, hasGreeted: newHasGreeted };

  } catch (error) {
    console.error('OpenAI API Error:', error);
    return generatePersonalizedFallbackResponse(message, context, hasGreeted, turnsCount);
  }
};

const generatePersonalizedFallbackResponse = (
  message: string,
  context: ChatContext,
  hasGreeted: boolean = false,
  turnsCount: number = 0
): { response: string; updatedContext: ChatContext; showCard?: boolean; productId?: string; hasGreeted?: boolean } => {
  let response = '';
  let showCard = false;
  let productId: string | undefined;
  
  const userMessagesCount = context.messages.filter(m => m.sender === 'user').length;
  const isFirstMessage = userMessagesCount === 0;
  
  if (isNewUser(context.client)) {
    let updatedCollectedInfo = context.collectedInfo || {};
    updatedCollectedInfo = updateCollectedInfo(message, updatedCollectedInfo);
    
    if (!updatedCollectedInfo.name) {
      response = getRandomPhrase(newUserGreetings);
    } else if (!updatedCollectedInfo.age) {
      response = `${getRandomPhrase(agreementPhrases)} ${updatedCollectedInfo.name}! Сколько лет?`;
    } else if (!updatedCollectedInfo.goal) {
      response = getRandomPhrase(questionVariants);
    } else {
      const lowerMsg = message.toLowerCase();
      if (turnsCount >= 3 && (lowerMsg.includes('да') || lowerMsg.includes('хочу') || lowerMsg.includes('покажи'))) {
        response = `${getRandomPhrase(agreementPhrases)}`;
        showCard = true;
        productId = getProductByGoal(updatedCollectedInfo.goal);
      } else if (turnsCount < 3) {
        response = `${getRandomPhrase(empathyPhrases)} Расскажи подробнее?`;
      } else {
        response = `${getRandomPhrase(empathyPhrases)} Хочешь, подскажу решение?`;
      }
    }
    
    const finalContext = {
      ...context,
      collectedInfo: updatedCollectedInfo,
      messages: [...context.messages, {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'agent' as const,
        timestamp: new Date()
      }]
    };
    
    const newHasGreeted = hasGreeted || context.messages.filter(m => m.sender === 'agent').length > 0;
    return { response, updatedContext: finalContext, showCard, productId, hasGreeted: newHasGreeted };
  }
  
  const firstName = context.client.name.split(' ')[0];
  const lowerMsg = message.toLowerCase();
  
  // Проверка на позитивный ответ
  const isPositive = lowerMsg.includes('хорошо') || lowerMsg.includes('нормально') || lowerMsg.includes('в порядке') || lowerMsg === 'норм';
  
  if (isFirstMessage && !hasGreeted) {
    response = `${getRandomPhrase(greetings)} ${firstName}! Как дела?`;
  } else if (isPositive) {
    response = `${getRandomPhrase(positiveResponses)} Если будет нужно — подскажу, чем помочь.`;
  } else {
    if (lowerMsg.includes('дорого')) {
      response = 'Понимаю. Есть вариант за 500₽?';
    } else if (lowerMsg.includes('не верю')) {
      response = 'Уважаю. Обращайся!';
    } else if (lowerMsg === 'нет') {
      response = 'Понял. Другие вопросы?';
    } else if (turnsCount < 3) {
      response = `${getRandomPhrase(empathyPhrases)} Расскажи подробнее?`;
    } else if (lowerMsg.includes('устал') || lowerMsg.includes('энергия')) {
      response = 'Energy+ Active поможет. Берём?';
    } else if (lowerMsg.includes('сон')) {
      response = 'SleepWell Calm поможет. Берём?';
    } else {
      response = 'Понял. Есть решение. Берём?';
    }
  }

  const finalContext = {
    ...context,
    messages: [...context.messages, {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'agent' as const,
      timestamp: new Date()
    }]
  };

  const newHasGreeted = hasGreeted || context.messages.filter(m => m.sender === 'agent').length > 0;
  return { response, updatedContext: finalContext, showCard, productId, hasGreeted: newHasGreeted };
};

export const generateQuickReplies = (context: ChatContext): string[] => {
  if (isNewUser(context.client)) {
    const info = context.collectedInfo || {};
    if (!info.name) {
      return ['Иван', 'Мария', 'Алексей', 'Анна'];
    } else if (!info.age) {
      return ['25', '30', '35', '40'];
    } else if (!info.goal) {
      return ['Устаю быстро', 'Плохо сплю', 'Часто болею', 'Суставы болят'];
    } else {
      return ['Да', 'Покажи', 'Хочу', 'Расскажи подробнее'];
    }
  }
  
  const age = context.client.age;
  
  switch (context.stage) {
    case 'greeting':
      if (age < 30) {
        return ['Отлично!', 'Устаю иногда', 'Хочу больше энергии', 'Нужна поддержка'];
      } else {
        return ['Хорошо!', 'Есть проблемы', 'Хочу здоровее', 'Часто устаю'];
      }
    case 'products':
      return ['Да', 'Покажи', 'Хочу', 'Нет'];
    case 'objections':
      return ['Дорого', 'Не верю', 'Не хочу', 'Нет'];
    default:
      return ['Да', 'Нет', 'Расскажи', 'Интересно'];
  }
};
