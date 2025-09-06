import api from './api';

export const getPaginatedDevices = async ({ search = '', page = 1, limit = 10 } = {}) => {
    const res = await api.get('/devices/paginated', { params: { search, page, limit } });
    return res.data;
};

export const createDevice = async (deviceData) => {
    const res = await api.post('/devices', deviceData);
    return res.data;
};

export const updateDevice = async (id, deviceData) => {
    const res = await api.put(`/devices/${id}`, deviceData);
    return res.data;
};

export const deleteDevice = async (id) => {
    const res = await api.delete(`/devices/${id}`);
    return res.data;
};

export const getDeviceById = async (id) => {
    const res = await api.get(`/devices/${id}`);
    return res.data;
};

export const getDevices = async () => {
    const res = await api.get('/devices');
    return res.data;
};