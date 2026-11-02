const BASE_URL = '/api';

export async function fetchToday() {
  const response = await fetch(`${BASE_URL}/booking/today`);
  if (!response.ok) {
    throw new Error('Не удалось загрузить текущую дату');
  }
  return response.json(); // Возвращает { day, month, year }
}

export async function fetchSlots({ day, month, year }) {
  const response = await fetch(`${BASE_URL}/slots?day=${day}&month=${month}&year=${year}`);
  if (!response.ok) {
    throw new Error('Не удалось загрузить доступные слоты');
  }
  return response.json(); // Возвращает { date, slots }
}
