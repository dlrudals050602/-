import { supabase } from '../api/supabaseClient';
import { LEAVE_STATUS } from '../data/leave.js';
import { cleanDateStr, getDatesInRange } from '../utils/dateUtils.js';
import { getLeaveColor } from '../utils/colorUtils.js';
import { isVacation, isPass, checkAvailability } from '../utils/leaveUtils.js';

export {groupLeavesByDate, checkAvailability} from '../utils/leaveUtils.js';
export {getLeaveColor} from '../utils/colorUtils.js';
/**
 * DB 레코드를 CamelCase 객체로 매핑
 */
const mapLeaveFromDB = (item) => ({
  id: item.id,
  userId: item.user_id,
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

/**
 * 사용자 연가 일수 차감/환불
 */
const adjustVacationDays = async (userId, daysDelta) => {
  if (!userId || !daysDelta) return;

  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('vacation_days')
    .eq('id', userId)
    .maybeSingle();

  if (fetchError) throw fetchError;

  if (profile) {
    const currentDays = profile.vacation_days ?? 0;
    const updatedDays = Math.max(0, currentDays + daysDelta);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ vacation_days: updatedDays })
      .eq('id', userId);

    if (updateError) throw updateError;
  }
};

/**
 * 전체 출타 목록 조회
 */
export const fetchLeaves = async () => {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('start_date', { ascending: true });

  if (error) throw error;
  return data.map(mapLeaveFromDB);
};

/**
 * 신규 출타 신청
 */
export const applyLeave = async (
  newLeave, 
  existingLeaves = [], 
  options = { userConfirmed: false, forcePending: false }
) => {
  const { userConfirmed, forcePending } = options;
  const startDate = cleanDateStr(newLeave.startDate);
  const endDate = cleanDateStr(newLeave.endDate);
  const usedDays = getDatesInRange(startDate, endDate).length;

  // 1. 강제 대기(Pending) 신청 처리
  if (forcePending) {
    const { data, error } = await supabase
      .from('leaves')
      .insert([{
        user_id: newLeave.userId || null,
        name: newLeave.name,
        rank: newLeave.rank,
        leave_type: newLeave.leaveType,
        start_date: startDate,
        end_date: endDate,
        track_index: -1,
        status: LEAVE_STATUS.PENDING
      }])
      .select();

    if (error) throw error;
    return { status: LEAVE_STATUS.PENDING, data: mapLeaveFromDB(data[0]) };
  }

  // 2. 가용 정원 체크
  const check = checkAvailability(newLeave, existingLeaves);

  if (!check.available) {
    return { status: 'full', reason: check.reason };
  }

  if (check.requiresConfirm && !userConfirmed) {
    return { status: 'REQUIRES_CONFIRM', reason: check.reason };
  }

  let assignedTrack = check.trackIndex;

  // 3. 휴가로 인한 외출/외박자 대기(PENDING) 강등 처리
  if (check.requiresConfirm && userConfirmed) {
    const dates = getDatesInRange(startDate, endDate);
    
    const activePasses = existingLeaves
      .filter(l => (l.status || LEAVE_STATUS.ACTIVE) === LEAVE_STATUS.ACTIVE && 
                   isPass(l.leaveType) && 
                   dates.some(d => d >= cleanDateStr(l.startDate) && d <= cleanDateStr(l.endDate)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (activePasses.length > 0) {
      const targetToDemote = activePasses[0];
      assignedTrack = targetToDemote.trackIndex;

      const { error: demoteError } = await supabase
        .from('leaves')
        .update({ status: LEAVE_STATUS.PENDING, track_index: -1 })
        .eq('id', targetToDemote.id);

      if (demoteError) throw demoteError;
    }
  }

  // 4. 출타 신청 레코드 생성
  const { data, error } = await supabase
    .from('leaves')
    .insert([{
      user_id: newLeave.userId || null,
      name: newLeave.name,
      rank: newLeave.rank,
      leave_type: newLeave.leaveType,
      start_date: startDate,
      end_date: endDate,
      track_index: assignedTrack !== undefined ? assignedTrack : 0,
      status: LEAVE_STATUS.ACTIVE
    }])
    .select();

  if (error) throw error;

  // 5. '휴가' 승인 시 연가 일수 차감
  if (isVacation(newLeave.leaveType) && newLeave.userId) {
    await adjustVacationDays(newLeave.userId, -usedDays);
  }

  return { status: LEAVE_STATUS.ACTIVE, data: mapLeaveFromDB(data[0]) };
};

/**
 * 대기자 자동 승격 검사 및 승인
 */
export const autoPromotePendingLeaves = async () => {
  const { data, error } = await supabase
    .from('leaves')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) throw error;

  const allLeaves = data.map(mapLeaveFromDB);
  const currentActive = allLeaves.filter(l => l.status === LEAVE_STATUS.ACTIVE);
  const pendingLeaves = allLeaves.filter(l => l.status === LEAVE_STATUS.PENDING);

  for (const pending of pendingLeaves) {
    const check = checkAvailability(pending, currentActive);
    
    if (check.available && !check.requiresConfirm) {
      const { error: updateError } = await supabase
        .from('leaves')
        .update({
          status: LEAVE_STATUS.ACTIVE,
          track_index: check.trackIndex
        })
        .eq('id', pending.id);

      if (!updateError) {
        if (isVacation(pending.leaveType) && pending.userId) {
          const usedDays = getDatesInRange(pending.startDate, pending.endDate).length;
          await adjustVacationDays(pending.userId, -usedDays);
        }

        currentActive.push({
          ...pending,
          status: LEAVE_STATUS.ACTIVE,
          trackIndex: check.trackIndex
        });
      }
    }
  }
};

/**
 * 출타 신청 삭제 및 환불/자동 승격
 */
export const deleteLeave = async (id) => {
  const { data: targetLeave, error: fetchError } = await supabase
    .from('leaves')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (fetchError) throw fetchError;

  const { error: deleteError } = await supabase.from('leaves').delete().eq('id', id);
  if (deleteError) throw deleteError;

  // 삭제된 건이 승인 상태인 '휴가'였을 경우 연가 환불
  if (targetLeave && targetLeave.status === LEAVE_STATUS.ACTIVE && isVacation(targetLeave.leave_type) && targetLeave.user_id) {
    const usedDays = getDatesInRange(cleanDateStr(targetLeave.start_date), cleanDateStr(targetLeave.end_date)).length;
    await adjustVacationDays(targetLeave.user_id, usedDays);
  }

  // 자리가 비었으므로 대기자 승격 시도
  await autoPromotePendingLeaves();
};

//위시리스트 저장
export const saveWishLeave = async (newLeave) => {
  const startDate = cleanDateStr(newLeave.startDate);
  const endDate = cleanDateStr(newLeave.endDate);

  const { data, error } = await supabase
    .from('leaves')
    .insert([{
      user_id: newLeave.userId || null,
      name: newLeave.name,
      rank: newLeave.rank,
      leave_type: newLeave.leaveType,
      start_date: startDate,
      end_date: endDate,
      track_index: -1,
      status: LEAVE_STATUS.WISH
    }])
    .select();

  if (error) throw error;
  return mapLeaveFromDB(data[0]);
};

// 위시 -> 정식 출타 전환 (기존 위시 삭제 후 정원/휴가일수 검증 적용하여 정식 신청)
export const promoteWishToActive = async (wishLeave, existingLeaves) => {
  const { error: deleteError } = await supabase
    .from('leaves')
    .delete()
    .eq('id', wishLeave.id);
    
  if (deleteError) throw deleteError;

  return await applyLeave(wishLeave, existingLeaves);
};