// hooks/useAttendanceMatrix.js
import { useMemo } from 'react';

/**
 * Hook para transformar datos de asistencia al formato matriz
 * Alternativa si no se puede hacer la transformación en el backend
 */
export const useAttendanceMatrix = (records, granularity = 'daily') => {
  return useMemo(() => {
    if (!records || records.length === 0) {
      return {
        users: [],
        dates: [],
        matrix: [],
        metadata: {
          totalUsers: 0,
          totalDates: 0,
          granularity
        }
      };
    }

    // 1. Extraer usuarios únicos
    const usersMap = new Map();
    records.forEach(record => {
      const userId = record.user._id;
      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          id: userId,
          name: record.user.name,
          firstSurname: record.user.firstSurname,
          secondSurname: record.user.secondSurname,
          dni: record.user.dni,
          fullName: `${record.user.name} ${record.user.firstSurname} ${record.user.secondSurname}`
        });
      }
    });

    // 2. Extraer fechas únicas y ordenarlas
    const datesSet = new Set();
    records.forEach(record => {
      datesSet.add(record.date);
    });
    const dates = Array.from(datesSet).sort();

    // 3. Crear matriz: Map de userId -> Map de date -> Array de shifts
    const matrixData = new Map();
    
    records.forEach(record => {
      const userId = record.user._id;
      const date = record.date;
      
      if (!matrixData.has(userId)) {
        matrixData.set(userId, new Map());
      }
      
      if (!matrixData.get(userId).has(date)) {
        matrixData.get(userId).set(date, []);
      }
      
      // Agregar shift a la celda
      matrixData.get(userId).get(date).push({
        scheduleId: record.schedule._id,
        scheduleName: record.schedule.name,
        shiftStatus: record.shiftStatus,
        checkIn: record.checkIn,
        checkOut: record.checkOut,
        hoursWorked: record.hoursWorked,
        minutesWorked: record.minutesWorked,
        justification: record.justification,
        _rawRecords: record._rawRecords,
        // Guardar el record completo para el drawer
        fullRecord: record
      });
    });

    // 4. Construir estructura final
    const users = Array.from(usersMap.values());
    const matrix = [];

    users.forEach(user => {
      const userRow = {
        user: user,
        cells: {}
      };

      dates.forEach(date => {
        const shifts = matrixData.get(user.id)?.get(date) || [];
        userRow.cells[date] = {
          date: date,
          shifts: shifts.length > 0 ? shifts : null,
          isEmpty: shifts.length === 0
        };
      });

      matrix.push(userRow);
    });

    return {
      users,
      dates,
      matrix,
      metadata: {
        totalUsers: users.length,
        totalDates: dates.length,
        granularity
      }
    };
  }, [records, granularity]);
};

export default useAttendanceMatrix;