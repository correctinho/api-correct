import axios from 'axios';

export const taxiMachineApi = axios.create({
    baseURL: process.env.TAXIMACHINE_API_URL,
    headers: {
        'api-key': process.env.TAXIMACHINE_API_KEY,
        'Content-Type': 'application/json',
    },
    auth: {
        username: process.env.TAXIMACHINE_USER || '',
        password: process.env.TAXIMACHINE_PASSWORD || ''
    }
});
