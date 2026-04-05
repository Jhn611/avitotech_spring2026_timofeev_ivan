import axios from 'axios';

const GIGACHAT_OAUTH_URL = '/gigachat-oauth';
const GIGACHAT_CHAT_URL = '/gigachat-chat';

const AUTHORIZATION_KEY = import.meta.env.VITE_GIGACHAT_AUTH_KEY?.trim();

if (!AUTHORIZATION_KEY) {
  console.error('VITE_GIGACHAT_AUTH_KEY не найден или пустой в .env!');
}

let cachedToken: string | null = null;
let tokenExpiry: number = 0;

const getAccessToken = async (): Promise<string> => {
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  try {
    const response = await axios.post(
      GIGACHAT_OAUTH_URL,
      new URLSearchParams({
        scope: 'GIGACHAT_API_PERS',
        grant_type: 'client_credentials',
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${AUTHORIZATION_KEY}`,
          'RqUID': crypto.randomUUID(),
          'Accept': 'application/json',
        },
        timeout: 15000,
      }
    );

    console.log('✅ GigaChat OAuth успех. Status:', response.status);

    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + (response.data.expires_in - 60) * 1000;

    return cachedToken!;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('❌ GigaChat OAuth ОШИБКА:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Данные ответа:', err.response.data);   // ← вот что важно увидеть
      console.error('Headers:', err.response.headers);
    } else {
      console.error('Сообщение:', err.message);
    }
    throw new Error(`Ошибка получения токена: ${err.message}`);
  }
};

export const callGigaChat = async (
  prompt: string,
  systemPrompt: string = ''
): Promise<string> => {
  if (!AUTHORIZATION_KEY) {
    throw new Error('GigaChat API ключ не настроен');
  }

  const token = await getAccessToken();

  const messages: Array<{ role: string; content: string }> = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await axios.post(
      GIGACHAT_CHAT_URL,
      {
        model: 'GigaChat:latest',
        messages,
        temperature: 0.7,
        max_tokens: 1500,
        n: 1,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        timeout: 30000,
      }
    );

    return response.data.choices[0].message.content.trim();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error('❌ GigaChat Chat ОШИБКА:');
    if (err.response) console.error('Данные:', err.response.data);
    throw err;
  }
};

