import { LEAVES_TYPES } from '../data/leave';
import { isVacation } from './leaveUtils';

/**
 * 사용자 이름과 출타 종류에 따른 HSL 색상 생성
 */
export const getLeaveColor = (name = '', leaveType) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const goldenRatio = 0.618033988749895;
  const hueVariation = Math.floor(((hash * goldenRatio) % 1) * 70);
  const lightness = 72 + (hash % 16);

  if (isVacation(leaveType)) {
    // 휴가 계열: 붉은/주황/분홍
    const h = (330 + hueVariation) % 360;
    return `hsl(${h}, 85%, ${lightness}%)`;
  } else if (leaveType === LEAVES_TYPES.OUTING) {
    // 외출 계열: 하늘/파랑/보라
    const h = 180 + hueVariation;
    return `hsl(${h}, 80%, ${lightness}%)`;
  } else {
    // 외박 및 기타: 연두/초록/민트
    const h = 80 + hueVariation;
    return `hsl(${h}, 75%, ${lightness}%)`;
  }
};