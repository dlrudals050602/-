import {supabase} from '../supabaseClient';
import { checkIsHoliday } from './holidayService';

export const LEAVES_TYPES = {
    VACATION: '휴가',
    OUTING: '외출',
    OVERNIGHT: '외박',
};

export const LEAVE_STATUS = {
    ACTIVE: 'active',
    PENDING: 'pending',
};

const MAX_VACATION_PER_DAY = 3;
const MAX_TOTAL_LEAVE_PER_DAY = 5;

const cleanDateStr = (str) => (str ? String(str).substring(0, 10) : '');

const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  let curr = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  while (curr <= end) {
    dates.push(formatDate(curr));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

//색 만들기
export const getLeaveColor = (name = '', leaveType) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const goldenRatio = 0.618033988749895;
  const hueVariation = Math.floor(((hash * goldenRatio) % 1) * 70); // 70도 범위로 폭넓게 변형
  const lightness = 72 + (hash % 16); // 72% ~ 88% 밝기 차이 부여

  if (leaveType === LEAVES_TYPES.VACATION) {
    // 붉은/주황/분홍 계열 (330도 ~ 40도)
    const h = (330 + hueVariation) % 360;
    return `hsl(${h}, 85%, ${lightness}%)`;
  } else if (leaveType === LEAVES_TYPES.OUTING) {
    // 하늘/파랑/보라 계열 (180도 ~ 250도)
    const h = 180 + hueVariation;
    return `hsl(${h}, 80%, ${lightness}%)`;
  } else {
    // 연두/초록/민트 계열 (80도 ~ 150도)
    const h = 80 + hueVariation;
    return `hsl(${h}, 75%, ${lightness}%)`;
  }
};

//출타 룰 및 트랙 검증
const isVacation = (type) => {
  if (!type) return false;
  return type === LEAVES_TYPES.VACATION || type.includes('휴가');
};

const isPass = (type) => {
  if (!type) return false;
  return type === LEAVES_TYPES.OUTING || type === LEAVES_TYPES.OVERNIGHT;
};

export const checkAvailability = (newLeave, existingLeaves = [], cachedHolidays = []) => {
  const startDate = cleanDateStr(newLeave.startDate);
  const endDate = cleanDateStr(newLeave.endDate);
  const dates = getDatesInRange(startDate, endDate);

  // 1. [추가 2] 외박 자격조건 검증 (1박 2일 & 주말/공휴일 필수)
  if (newLeave.leaveType === LEAVES_TYPES.OVERNIGHT) {
    if (dates.length !== 2) {
      return { available: false, reason: '⚠️ 외박은 반드시 1박 2일(연속 2일) 기간으로만 신청 가능합니다.' };
    }
    const isAllHolidays = dates.every(d => checkIsHoliday(d, cachedHolidays));
    if (!isAllHolidays) {
      return { available: false, reason: '⚠️ 외박은 시작일과 종료일이 모두 주말 또는 공휴일이어야 합니다.' };
    }
  }

  // 2. 일자별 정원 체크
  let requiresForceConfirm = false;
  let overflowDates = [];

for (const d of dates) {
    const activeOnDay = existingLeaves.filter((leave) => {
      const lStatus = leave.status || LEAVE_STATUS.ACTIVE;
      const lStart = cleanDateStr(leave.startDate);
      const lEnd = cleanDateStr(leave.endDate);

      return lStatus === LEAVE_STATUS.ACTIVE && d >= lStart && d <= lEnd;
    });

    const vacationsCount = activeOnDay.filter((l) => isVacation(l.leaveType)).length;
    const totalCount = activeOnDay.length;

    // A. 휴가 정원 체크 (3명 초과 시 무조건 차단)
    if (isVacation(newLeave.leaveType)) {
      if (vacationsCount + 1 > MAX_VACATION_PER_DAY) {
        return { 
          available: false, 
          reason: `⚠️ ${d}에 휴가 정원(최대 ${MAX_VACATION_PER_DAY}명)이 초과되어 대기 상태로 등록됩니다.` 
        };
      }
    }

    // B. 총원 체크 (5명 초과 시)
    if (totalCount + 1 > MAX_TOTAL_LEAVE_PER_DAY) {
      if (isVacation(newLeave.leaveType)) {
        // 휴가 3명 미만인데 총원 5명이 찬 경우: 기존 외출/외박자를 대기 전환하도록 알림 플래그 설정
        requiresForceConfirm = true;
        overflowDates.push(d);
      } else {
        return { 
          available: false, 
          reason: `⚠️ ${d}에 총 출타 정원(최대 ${MAX_TOTAL_LEAVE_PER_DAY}명)이 초과되어 대기 상태로 등록됩니다.` 
        };
      }
    }
  }

  if (requiresForceConfirm) {
    return {
      available: true,
      requiresConfirm: true,
      reason: `⚠️ ${overflowDates.join(', ')}일의 총 정원(5명)이 찼습니다. 그래도 휴가를 신청하시겠습니까?\n(가장 최근 신청된 외출/외박자가 대기 상태로 전환됩니다.)`
    };
  }

  // 3. 가장 아래 빈 트랙 탐색 (0 ~ 4)
  for (let track = 0; track < MAX_TOTAL_LEAVE_PER_DAY; track++) {
    const isTrackFree = !dates.some((d) =>
      existingLeaves.some((leave) => {
        const lStatus = leave.status || LEAVE_STATUS.ACTIVE;
        const lStart = cleanDateStr(leave.startDate);
        const lEnd = cleanDateStr(leave.endDate);

        return (
          lStatus === LEAVE_STATUS.ACTIVE &&
          leave.trackIndex === track &&
          d >= lStart &&
          d <= lEnd
        );
      })
    );

    if (isTrackFree) {
      return { available: true, trackIndex: track };
    }
  }

  return { available: false, reason: '⚠️ 선택하신 일정 중에 빈 트랙 자리가 없어 대기 상태로 등록됩니다.' };
};

// DB Snake_case -> JS CamelCase 매핑
const mapLeaveFromDB = (item) => ({
  id: item.id,
  name: item.name,
  rank: item.rank,
  leaveType: item.leave_type,
  startDate: cleanDateStr(item.start_date),
  endDate: cleanDateStr(item.end_date),
  trackIndex: item.track_index ?? 0,
  status: item.status || LEAVE_STATUS.ACTIVE,
  createdAt: item.created_at,
  color: getLeaveColor(item.name, item.leave_type),
});

// ==========================================
// 💾 DB CRUD 및 대기자 자동 승격
// ==========================================
export const fetchLeaves = async () => {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data.map(mapLeaveFromDB);
};

export const applyLeave = async (newLeave, existingLeaves, cachedHolidays = [], userConfirmed = false, forcePending = false) => {
  if (forcePending) {
    const { data, error } = await supabase
      .from('leaves')
      .insert([{
        name: newLeave.name,
        rank: newLeave.rank,
        leave_type: newLeave.leaveType,
        start_date: cleanDateStr(newLeave.startDate),
        end_date: cleanDateStr(newLeave.endDate),
        track_index: -1,
        status: LEAVE_STATUS.PENDING
      }])
      .select();

    if (error) throw error;
    return { status: LEAVE_STATUS.PENDING, data: mapLeaveFromDB(data[0]) };
  }

  const check = checkAvailability(newLeave, existingLeaves, cachedHolidays);

  if (!check.available) {
    return { status: 'full', reason: check.reason };
  }

  if (check.requiresConfirm && !userConfirmed) {
    return { status: 'REQUIRES_CONFIRM', reason: check.reason };
  }

  let assignedTrack = check.trackIndex;

  // 총원 5명 초과 시 외출/외박자를 Pending으로 전환 후 트랙 확보
  if (check.requiresConfirm && userConfirmed) {
    const dates = getDatesInRange(newLeave.startDate, newLeave.endDate);
    
    const activePasses = existingLeaves
      .filter(l => (l.status || LEAVE_STATUS.ACTIVE) === LEAVE_STATUS.ACTIVE && 
                   isPass(l.leaveType) && 
                   dates.some(d => d >= cleanDateStr(l.startDate) && d <= cleanDateStr(l.endDate)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (activePasses.length > 0) {
      const targetToDemote = activePasses[0];
      assignedTrack = targetToDemote.trackIndex;

      await supabase
        .from('leaves')
        .update({ status: LEAVE_STATUS.PENDING, track_index: -1 })
        .eq('id', targetToDemote.id);
    }
  }

  const { data, error } = await supabase
    .from('leaves')
    .insert([{
      name: newLeave.name,
      rank: newLeave.rank,
      leave_type: newLeave.leaveType,
      start_date: cleanDateStr(newLeave.startDate),
      end_date: cleanDateStr(newLeave.endDate),
      track_index: assignedTrack !== undefined ? assignedTrack : 0,
      status: LEAVE_STATUS.ACTIVE
    }])
    .select();

  if (error) throw error;
  return { status: LEAVE_STATUS.ACTIVE, data: mapLeaveFromDB(data[0]) };
};

export const deleteLeave = async (id, cachedHolidays = []) => {
  const { error } = await supabase.from('leaves').delete().eq('id', id);
  if (error) throw error;

  await autoPromotePendingLeaves(cachedHolidays);
};

export const autoPromotePendingLeaves = async (cachedHolidays = []) => {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const allLeaves = data.map(mapLeaveFromDB);
  const currentActive = allLeaves.filter(l => l.status === LEAVE_STATUS.ACTIVE);
  const pendingLeaves = allLeaves.filter(l => l.status === LEAVE_STATUS.PENDING);

  for (const pending of pendingLeaves) {
    const check = checkAvailability(pending, currentActive, cachedHolidays);
    
    if (check.available && !check.requiresConfirm) {
      const { error: updateError } = await supabase
        .from('leaves')
        .update({
          status: LEAVE_STATUS.ACTIVE,
          track_index: check.trackIndex
        })
        .eq('id', pending.id);

      if (!updateError) {
        currentActive.push({
          ...pending,
          status: LEAVE_STATUS.ACTIVE,
          trackIndex: check.trackIndex
        });
      }
    }
  }
};

// ==========================================
// 🗓️ 달력 렌더링용 날짜별 그룹화 유틸리티
// ==========================================
export const groupLeavesByDate = (leaves = []) => {
  const map = {};
  leaves.forEach((leave) => {
    const dates = getDatesInRange(leave.startDate, leave.endDate);
    dates.forEach((dateStr) => {
      if (!map[dateStr]) map[dateStr] = [];
      map[dateStr].push(leave);
    });
  });
  return map;
};