// src/services/holidayService.js
import { HOLIDAYS_DATA } from '../data/holidaysData';
/**
 * 1. 특정 연도의 공휴일 목록 조회
 */
export const fetchHolidays = async (year) => {
  return HOLIDAYS_DATA[year] || [];
};

/**
 * 2. 주말 및 공휴일 여부를 판정하는 유틸 함수
 */
export const checkIsHoliday = (dateStr, cachedHolidays = []) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일

  // 주말(토, 일) 판정
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }

  if (cachedHolidays instanceof Set) {
    return cachedHolidays.has(dateStr);
  }

  if (Array.isArray(cachedHolidays)) {
    return cachedHolidays.some(h => {
      if (!h) return false;
      if (typeof h === 'object' && h.date) {
        return h.date === dateStr;
      }
      return h === dateStr;
    });
  }

  return false;
};