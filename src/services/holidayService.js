// src/services/holidayService.js
import { supabase } from '../supabaseClient';

const API_KEY = process.env.REACT_APP_GOV_HOLIDAY_API_KEY;

/**
 * 1. 공공데이터포털 API에서 특정 연도의 공휴일을 수집하여 Supabase DB에 저장(캐싱)
 */
export const syncAndFetchHolidaysFromGov = async (year) => {
  if (!API_KEY) {
    console.warn("⚠️ .env 파일에 REACT_APP_GOV_HOLIDAY_API_KEY가 설정되지 않았습니다.");
    return [];
  }

  try {
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
    
    // API 키 인코딩 안전 처리 (이미 인코딩된 키일 경우를 고려해 decode 후 필요시 처리)
    const rawApiKey = API_KEY.includes('%') ? decodeURIComponent(API_KEY) : API_KEY;

    const monthlyResults = await Promise.all(
      months.map(async (month) => {
        // 한국천문연구원 특일 정보 API 엔드포인트
        const targetUrl = `http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getHoliDeInfo?serviceKey=${encodeURIComponent(rawApiKey)}&solYear=${year}&solMonth=${month}&_type=json&numOfRows=100`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;

        const response = await fetch(proxyUrl);
        if (!response.ok) return [];

        const resData = await response.json();
        const items = resData.response?.body?.items?.item;

        if (!items) return [];

        const itemList = Array.isArray(items) ? items : [items];

        // 유효성 검사 및 실제 휴일(isHoliday === 'Y')만 추출
        return itemList
          .filter(item => item && item.locdate && item.isHoliday === 'Y')
          .map(item => {
            const locdateStr = String(item.locdate);
            return {
              date: `${locdateStr.substring(0, 4)}-${locdateStr.substring(4, 6)}-${locdateStr.substring(6, 8)}`,
              name: item.dateName
            };
          });
      })
    );

    // 2차원 배열을 1차원 배열로 병합
    const holidaysToInsert = monthlyResults.flat();

    if (holidaysToInsert.length > 0) {
      const { data, error } = await supabase
        .from('holidays')
        .upsert(holidaysToInsert, { onConflict: 'date' })
        .select();

      if (error) throw error;
      console.log(`🎉 [${year}년] 공휴일 DB 자동 동기화 완료 (${data.length}개)`);
      return data;
    }
  } catch (err) {
    console.error(`⚠️ 공휴일 API 동기화 실패:`, err.message);
  }
  return [];
};

/**
 * 2. Supabase DB 혹은 공공 API로부터 연도별 공휴일 목록 조회
 */
export const fetchHolidays = async (year) => {
  try {
    const { data, error } = await supabase
      .from('holidays')
      .select('*')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);

    if (error) throw error;

    // 만약 DB에 해당 연도 데이터가 없다면 자동으로 API 동기화 가동
    if (!data || data.length === 0) {
      return await syncAndFetchHolidaysFromGov(year);
    }

    return data;
  } catch (err) {
    console.error("공휴일 조회 오류:", err.message);
    return [];
  }
};

/**
 * 3. 주말 및 공휴일 여부를 판정하는 유틸 함수
 * @param {string} dateStr 'YYYY-MM-DD'
 * @param {Array|Set} cachedHolidays 공휴일 데이터 (배열 또는 Set<string>)
 */
export const checkIsHoliday = (dateStr, cachedHolidays = []) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const dayOfWeek = date.getDay(); // 0: 일요일, 6: 토요일
  
  // 토요일(6) 또는 일요일(0)인 경우
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return true;
  }

  // Set 인스턴스인 경우 O(1) 탐색
  if (cachedHolidays instanceof Set) {
    return cachedHolidays.has(dateStr);
  }

  // 배열 형태일 때 (문자열 배열 또는 객체 배열 지원)
  return cachedHolidays.some(h => (typeof h === 'string' ? h === dateStr : h.date === dateStr));
};