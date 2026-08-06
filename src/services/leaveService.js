import {supabase} from '../supabaseClient';

export const fetchLeaves = async() => {
    const {data, error} = await supabase
        .from('leaves')
        .select('*')
        .order('start_date', {ascending: true});
    
    if(error) throw error;

    return data.map((item) => ({
        id: item.id,
        name: item.name,
        rank: item.rank,
        leaveType: item.leave_type,
        startDate: item.start_date,
        endDate: item.end_date,
        trackIndex: item.track_index,
    }));
};

export const findAvailableTrack = (startDate, endDate, existingLeaves) => {
    //신청 휴가가 기존 휴가와 겹치는지 확인
    const overlappingLeaves = existingLeaves.filter((leave) => {
        return startDate <= leave.endDate && endDate >= leave.startDate;
    });

    const usedTracks = overlappingLeaves.map((leave) => leave.trackIndex);
    for(let i = 0; i < 5; i++){
        if(!usedTracks.includes(i)){
            return i;
        }
    }
    return -1; // 빈자리 없음
};

//DB 저장
export const applyLeave = async (newLeave, existingLeaves) => {
    const assignedTrack = findAvailableTrack(newLeave.startDate, newLeave.endDate, existingLeaves);

    if (assignedTrack === -1) {
        throw new Error('출타 인원 초과');
    }

    const { data, error } = await supabase
        .from('leaves')
        .insert([
        {
            name: newLeave.name,
            rank: newLeave.rank,
            leave_type: newLeave.leaveType,
            start_date: newLeave.startDate,
            end_date: newLeave.endDate,
            track_index: assignedTrack,
        },
        ]);

    if (error) throw error;
    return data;
};