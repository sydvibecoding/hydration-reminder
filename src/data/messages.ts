// Friendly hydration reminder messages in Spanish
export const NOTIFICATION_MESSAGES = [
  {
    title: 'Momento de hidratarte',
    body: 'Un vasito de agua te espera. Tu cuerpo te lo agradece.',
  },
  {
    title: 'Recordatorio suave',
    body: 'El agua es vida. Date un momento para tomar un poco.',
  },
  {
    title: 'Pausa para hidratarte',
    body: 'Tu cuerpo funciona mejor hidratado. Un traguito ayuda mucho.',
  },
  {
    title: 'Hola, es hora del agua',
    body: 'Sin prisa, sin presión. Solo un recordatorio amable.',
  },
  {
    title: 'Tu momento de agua',
    body: 'Pequeños sorbos hacen gran diferencia. Ve a tu ritmo.',
  },
  {
    title: 'Hidratación consciente',
    body: 'Escucha a tu cuerpo. Quizá le vendría bien un poco de agua.',
  },
  {
    title: 'Recordatorio gentil',
    body: 'El agua te ayuda a sentirte mejor. Date ese regalo.',
  },
  {
    title: 'Momento refrescante',
    body: 'Un vaso de agua puede cambiar cómo te sientes. Pruébalo.',
  },
  {
    title: 'Agua para tu bienestar',
    body: 'No hay metas, solo cuidado. Toma agua si te apetece.',
  },
  {
    title: 'Tu cuerpo te habla',
    body: 'A veces el cansancio es sed disfrazada. Hidrátate con calma.',
  },
];

export function getRandomMessage() {
  const index = Math.floor(Math.random() * NOTIFICATION_MESSAGES.length);
  return NOTIFICATION_MESSAGES[index];
}
