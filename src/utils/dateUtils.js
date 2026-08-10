/**
 * YYYY-MM-DD 포맷 규격화
 */
export const cleanDateStr = (str) => (str ? String(str).substring(0, 10) : '');

/**
 * 타임존 세이프 날짜 파싱 (로컬 타임존 기준)
 */
export const parseDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Date 객체를 YYYY-MM-DD 문자열로 변환
 */
export const formatDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * 시작일~종료일 사이의 날짜 배열 생성
 */
export const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  let curr = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  
  while (curr <= end) {
    dates.push(formatDate(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};