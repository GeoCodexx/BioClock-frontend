import { memo } from "react";
import { FormControl, InputLabel, MenuItem } from "@mui/material";
import { SafeSelect } from "../common/SafeSelect";
import { useState, useEffect } from "react";
import { getSchedules } from "../../services/scheduleService";

const JustificationScheduleFilter = memo(
  ({ scheduleId, onScheduleChange, schedules = [] }) => {
    /*const typeOptions = [
    //{ value: "", label: "Todos los tipos" },
    { value: "IN", label: "Entrada" },
    { value: "OUT", label: "Salida" },
    { value: 'break', label: 'Descanso' },
    { value: 'meeting', label: 'Reunión' },
  ];*/

    return (
      <FormControl fullWidth size="small">
        <InputLabel>Horario</InputLabel>
        <SafeSelect
          label="Tipo"
          value={scheduleId}
          onChange={(e) => onScheduleChange(e.target.value)}
        >
          <MenuItem value="">
            <em>Todo</em>
          </MenuItem>
          {Array.isArray(schedules) && schedules.length > 0 ? (
            schedules.map((option) => (
              <MenuItem key={option._id} value={option._id}>
                {option.name}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>
              <em>No hay horarios</em>
            </MenuItem>
          )}
        </SafeSelect>
      </FormControl>
    );
  },
);

JustificationScheduleFilter.displayName = "JustificationScheduleFilter";

export default JustificationScheduleFilter;
