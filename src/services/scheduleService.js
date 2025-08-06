import api from './api';

export const getPaginatedSchedules = async ({ search = '', page = 1, limit = 10 } = {}) => {
    const res = await api.get('/schedules/paginated', { params: { search, page, limit } });
    return res.data;
};

export const createSchedule = async (scheduleData) => {
    const res = await api.post('/schedules', scheduleData);
    return res.data;
};

export const updateSchedule = async (id, scheduleData) => {
    const res = await api.put(`/schedules/${id}`, scheduleData);
    return res.data;
};

export const deleteSchedule = async (id) => {
    const res = await api.delete(`/schedules/${id}`);
    return res.data;
};

export const getScheduleById = async (id) => {
    const res = await api.get(`/schedules/${id}`);
    return res.data;
};

export const getSchedules = async () => {
    const res = await api.get('/schedules');
    return res.data;
};