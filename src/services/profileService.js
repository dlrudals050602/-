// src/services/profileService.js
import { supabase } from '../api/supabaseClient';
import { calculateRankAndDays } from '../utils/military';

// 1. 순수 프로필 조회
export const fetchUserProfile = async (userId) => {
  if (!userId) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('프로필 조회 실패:', error.message);
    return null;
  }

  return data;
};

// 2. 계급 계산 및 DB 동기화
export const syncUserRankIfNeeded = async (profile) => {
  if (!profile?.military_enlistment_date || !profile?.military_discharge_date) {
    return profile;
  }

  const { rank: calculatedRank } = calculateRankAndDays(
    profile.military_enlistment_date,
    profile.military_discharge_date
  );

  if (calculatedRank && profile.rank !== calculatedRank) {
    const { error } = await supabase
      .from('profiles')
      .update({ rank: calculatedRank })
      .eq('id', profile.id);

    if (!error) {
      return { ...profile, rank: calculatedRank };
    }
  }

  return profile;
};

// 3. 조회 + 동기화 통합 함수
export const loadAndSyncUserProfile = async (userId) => {
  const profile = await fetchUserProfile(userId);
  if (!profile) return null;

  return await syncUserRankIfNeeded(profile);
};