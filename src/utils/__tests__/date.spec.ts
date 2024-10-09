import { newDateF, calculateHourDifference, addDaysToDate } from '../date';

describe('newDateF', () => {
    it('should format the date correctly', () => {
        const date = new Date(2024, 9, 8, 14, 30, 0); // 8th October 2024, 14:30:00
        expect(newDateF(date)).toBe('2024-10-08T14:30:00');
    });

    it('should format the date correctly at midnight', () => {
        const date = new Date(2024, 9, 8, 0, 0, 0); // 8th October 2024, 00:00:00
        expect(newDateF(date)).toBe('2024-10-08T00:00:00');
    });

    it('should format the date correctly at the end of the day', () => {
        const date = new Date(2024, 9, 8, 23, 59, 59); // 8th October 2024, 23:59:59
        expect(newDateF(date)).toBe('2024-10-08T23:59:59');
    });

    it('should throw an error if date is not provided', () => {
        expect(() => newDateF(undefined as any)).toThrow('Date is required');
    });

    it('should throw an error if date is not a Date instance', () => {
        expect(() => newDateF("2024-10-08" as any)).toThrow('Date must be Date instance of');
    });
});

describe('calculateHourDifference', () => {
    it('should calculate the hour difference correctly', async () => {
        const olderDateString = '08/10/2024T14:00:00';
        const newestDateString = '08/10/2024T16:00:00';
        const difference = await calculateHourDifference(olderDateString, newestDateString);
        expect(difference).toBe(2);
    });

    it('should return a negative difference if the older date is actually newer', async () => {
        const olderDateString = '08/10/2024T16:00:00';
        const newestDateString = '08/10/2024T14:00:00';
        const difference = await calculateHourDifference(olderDateString, newestDateString);
        expect(difference).toBe(-2);
    });

    it('should handle the same date and time', async () => {
        const dateString = '08/10/2024T14:00:00';
        const difference = await calculateHourDifference(dateString, dateString);
        expect(difference).toBe(0);
    });
});

describe('addDaysToDate', () => {
    it('should add days to the date correctly', async () => {
        const dateString = '2024-10-08T14:30:00';
        const daysToAdd = 5;
        const newDateString = await addDaysToDate(dateString, daysToAdd);
        expect(newDateString).toBe('2024-10-13T14:30:00');
    });

    it('should handle adding days resulting in a month change', async () => {
        const dateString = '2024-10-28T14:30:00';
        const daysToAdd = 5;
        const newDateString = await addDaysToDate(dateString, daysToAdd);
        expect(newDateString).toBe('2024-11-02T14:30:00');
    });

    it('should handle adding days resulting in a year change', async () => {
        const dateString = '2024-12-28T14:30:00';
        const daysToAdd = 5;
        const newDateString = await addDaysToDate(dateString, daysToAdd);
        expect(newDateString).toBe('2025-01-02T14:30:00');
    });

    it('should handle negative day addition', async () => {
        const dateString = '2024-10-08T14:30:00';
        const daysToAdd = -5;
        const newDateString = await addDaysToDate(dateString, daysToAdd);
        expect(newDateString).toBe('2024-10-03T14:30:00');
    });
});
