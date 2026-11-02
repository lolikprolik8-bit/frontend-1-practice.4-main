import React, { useState, useEffect } from 'react';
import { fetchToday, fetchSlots } from './api';
import './index.css';

export default function App() {
  // --- Состояния для инициализации страницы ("Сегодня" и Календарь) ---
  const [today, setToday] = useState(null);
  const [isTodayLoading, setIsTodayLoading] = useState(true);
  const [todayError, setTodayError] = useState(null);

  // --- Состояния для выбранного дня и его слотов ---
  const [selectedDate, setSelectedDate] = useState(null); // { day, month, year }
  const [slots, setSlots] = useState([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState(null);

  // Шаг 1. Загрузка «сегодня» при открытии страницы
  useEffect(() => {
    setIsTodayLoading(true);
    setTodayError(null);
    
    fetchToday()
      .then((data) => {
        setToday(data);
        setSelectedDate(data); // Сразу делаем «сегодня» выбранным днем
        setIsTodayLoading(false);
      })
      .catch((err) => {
        setTodayError(err.message);
        setIsTodayLoading(false);
      });
  }, []);

  // Шаг 2 и 3. Загрузка слотов при смене выбранного дня
  useEffect(() => {
    if (!selectedDate) return;

    let isCurrentRequest = true; // Защита от состояния гонки (Race Condition)
    setIsSlotsLoading(true);
    setSlotsError(null);
    setSlots([]); // Очищаем старые слоты перед новой загрузкой

    fetchSlots(selectedDate)
      .then((data) => {
        if (isCurrentRequest) {
          // Проверяем, совпадает ли вернувшаяся дата с тем, что сейчас выбрано
          setSlots(data.slots);
          setIsSlotsLoading(false);
        }
      })
      .catch((err) => {
        if (isCurrentRequest) {
          setSlotsError(err.message);
          setIsSlotsLoading(false);
        }
      });

    // Функция очистки (cleanup) отменит обновление стейта, если пользователь кликнул на другой день раньше, чем пришел ответ
    return () => {
      isCurrentRequest = false;
    };
  }, [selectedDate]);

  // Сценарий 1. Глобальная загрузка/ошибка инициализации страницы
  if (isTodayLoading) {
    return <div className="spinner">Загрузка календаря...</div>;
  }

  if (todayError) {
    return <div className="error-message">Ошибка: {todayError}</div>;
  }

  return (
    <div className="booking-container">
      <h1>Выбор даты и времени</h1>
      
      {/* Компонент Календаря */}
      <div className="calendar-section">
        <p>Сегодняшняя дата: {today?.day}.{today?.month + 1}.{today?.year}</p>
        
        {/* Интерактивный интефейс дней (пример переключения) */}
        <div className="days-picker">
          {/* Здесь отрисовываются ваши дни месяца. При клике вызывается:
              setSelectedDate({ day: X, month: Y, year: Z }) 
          */}
          <button 
            className={selectedDate?.day === today?.day ? 'active' : ''}
            onClick={() => setSelectedDate(today)}
          >
            {today?.day} (Сегодня)
          </button>
          
          {/* Пример кнопки для другого дня для проверки */}
          <button 
            className={selectedDate?.day === today?.day + 1 ? 'active' : ''}
            onClick={() => setSelectedDate({ ...today, day: today.day + 1 })}
          >
            {today?.day + 1}
          </button>
        </div>
      </div>

      {/* Раздел Слотов (Сценарии 2 и 3) */}
      <div className="slots-section">
        <h3>Доступное время на {selectedDate?.day}.{selectedDate?.month + 1}:</h3>
        
        {isSlotsLoading && <div className="slots-loading">Загрузка слотов…</div>}
        
        {slotsError && <div className="slots-error-message">Не удалось загрузить слоты: {slotsError}</div>}
        
        {!isSlotsLoading && !slotsError && slots.length === 0 && (
          <p>Нет доступных слотов на этот день.</p>
        )}

        {!isSlotsLoading && !slotsError && slots.length > 0 && (
          <div className="slots-grid">
            {slots.map((slot, index) => (
              <button 
                key={index} 
                disabled={!slot.available}
                className={`slot-btn ${slot.available ? 'available' : 'booked'}`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
