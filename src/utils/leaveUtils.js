import { LEAVES_TYPES, LEAVE_STATUS, MAX_VACATION_PER_DAY, MAX_TOTAL_LEAVE_PER_DAY } from '../data/leave';
import { cleanDateStr, getDatesInRange } from './dateUtils';

export const isVacation = (type) => {
  if (!type) return false;
  return type === LEAVES_TYPES.VACATION || type.includes('휴가');
};

export const isPass = (type) => {
  if (!type) return false;
  return type === LEAVES_TYPES.OUTING || type === LEAVES_TYPES.OVERNIGHT;
};

/**
 * 신규 출타 신청 정원 및 빈 트랙 검증
 */
export const checkAvailability = (newLeave, existingLeaves = []) => {
  const startDate = cleanDateStr(newLeave.startDate);
  const endDate = cleanDateStr(newLeave.endDate);
  const dates = getDatesInRange(startDate, endDate);

  // 1. 외박 조건 검증 (1박 2일 제한)
  if (newLeave.leaveType === LEAVES_TYPES.OVERNIGHT && dates.length !== 2) {
    return { available: false, reason: '⚠️ 외박은 반드시 1박 2일(연속 2일) 기간으로만 신청 가능합니다.' };
  }

  // 2. 일자별 정원 체크
  let requiresForceConfirm = false;
  const overflowDates = [];

  for (const d of dates) {
    const activeOnDay = existingLeaves.filter((leave) => {
      const lStatus = leave.status || LEAVE_STATUS.ACTIVE;
      const lStart = cleanDateStr(leave.startDate);
      const lEnd = cleanDateStr(leave.endDate);

      return lStatus === LEAVE_STATUS.ACTIVE && d >= lStart && d <= lEnd;
    });

    const vacationsCount = activeOnDay.filter((l) => isVacation(l.leaveType)).length;
    const totalCount = activeOnDay.length;

    // A. 휴가 정원 체크
    if (isVacation(newLeave.leaveType) && vacationsCount + 1 > MAX_VACATION_PER_DAY) {
      return { 
        available: false, 
        reason: `⚠️ ${d}에 휴가 정원(최대 ${MAX_VACATION_PER_DAY}명)이 초과되어 대기 상태로 등록됩니다.` 
      };
    }

    // B. 총원 체크
    if (totalCount + 1 > MAX_TOTAL_LEAVE_PER_DAY) {
      if (isVacation(newLeave.leaveType)) {
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
      reason: `⚠️ ${overflowDates.join(', ')}일의 총 정원(${MAX_TOTAL_LEAVE_PER_DAY}명)이 찼습니다. 그래도 휴가를 신청하시겠습니까?\n(가장 최근 신청된 외출/외박자가 대기 상태로 전환됩니다.)`
    };
  }

  // 3. 빈 트랙 탐색
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

/**
 * 달력 렌더링용 날짜별 그룹화 유틸리티
 */
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