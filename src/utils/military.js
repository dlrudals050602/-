export const calculateRankAndDays = (enlistmentDateStr, dischargeDateStr) => {
  if (!enlistmentDateStr) return { rank: '미설정', daysServed: 0, daysLeft: 0, totalDays: 0, percentage: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const enlistment = new Date(enlistmentDateStr);
  enlistment.setHours(0, 0, 0, 0);

  const discharge = dischargeDateStr ? new Date(dischargeDateStr) : null;
  if (discharge) discharge.setHours(0, 0, 0, 0);

  if (today < enlistment) {
    const daysUntil = Math.ceil((enlistment - today) / (1000 * 60 * 60 * 24));
    return { rank: '입대 예정', daysServed: 0, daysLeft: daysUntil, totalDays: 0, percentage: 0 };
  }

  const daysServed = Math.floor((today - enlistment) / (1000 * 60 * 60 * 24)) + 1;

  let daysLeft = 0;
  let totalDays = 0;
  let percentage = 0;

  if (discharge) {
    totalDays = Math.floor((discharge - enlistment) / (1000 * 60 * 60 * 24)) + 1;
    daysLeft = Math.max(0, Math.ceil((discharge - today) / (1000 * 60 * 60 * 24)));
    percentage = Math.min(100, Math.max(0, ((daysServed / totalDays) * 100).toFixed(1)));
  }

  if (discharge && today >= discharge) {
    return { rank: '전역', daysServed, daysLeft: 0, totalDays, percentage: 100 };
  }

  const serviceMonth = 
    (today.getFullYear() - enlistment.getFullYear()) * 12 + 
    (today.getMonth() - enlistment.getMonth()) + 1;

  let rank = '이병';
  if (serviceMonth >= 15) {
    rank = '병장';
  } else if (serviceMonth >= 9) {
    rank = '상병';
  } else if (serviceMonth >= 3) {
    rank = '일병';
  } else {
    rank = '이병';
  }

  return { rank, daysServed, daysLeft, totalDays, percentage };
};