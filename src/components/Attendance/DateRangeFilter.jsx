import { Box, Button, Stack } from "@mui/material";
import { DateTimePicker, LocalizationProvider } from "@mui/x-date-pickers";
//import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useEffect, useState } from "react";

/*export default function DateRangeFilter({ startDate, endDate, onChange }) {*/
export default function DateRangeFilter({
  startDate, // dayjs | null (value actual del padre)
  endDate, // dayjs | null
  onApply, // fn({ startDate, endDate }) -> se llama solo cuando el usuario aplica
  onClear, // fn() -> opcional, para limpiar en el padre
  allowSingle = false, // si true aplica incluso si sólo hay start o sólo end
}) {
  // estado local para no molestar al padre hasta Apply
  const [localStart, setLocalStart] = useState(
    startDate ? format(startDate, "dd/MM/yyyy HH:mm") : null
  );
  const [localEnd, setLocalEnd] = useState(
    endDate ? format(endDate, "dd/MM/yyyy HH:mm") : null
  );

  // sincronizar si el padre cambia externamente
  useEffect(() => {
    setLocalStart(startDate ? format(startDate, "dd/MM/yyyy HH:mm") : null);
  }, [startDate]);

  useEffect(() => {
    setLocalEnd(endDate ? format(endDate, "dd/MM/yyyy HH:mm") : null);
  }, [endDate]);

  const handleApply = () => {
    // Si no está permitido aplicar con uno solo, requerimos ambos
    if (!allowSingle && (!localStart || !localEnd)) {
      // podrías mostrar un toast/alert aquí, pero por simplicidad salimos sin aplicar
      return;
    }
    onApply?.({ startDate: localStart, endDate: localEnd });
  };

  const handleClear = () => {
    setLocalStart(null);
    setLocalEnd(null);
    onClear?.();
  };

  /*const handleStartChange = (newValue) => {
    onChange({ startDate: newValue, endDate });
  };

  const handleEndChange = (newValue) => {
    onChange({ startDate, endDate: newValue });
  };

  const handleClear = () => {
    onChange({ startDate: null, endDate: null });
  };*/

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
      {/* <Box display="flex" gap={2} alignItems="center">
        <DateTimePicker
          label="Desde"
          value={startDate}
          onChange={handleStartChange}
          slotProps={{
            textField: {
              size: "small",
              sx: { minWidth: 200 },
            },
          }}
        />

        <DateTimePicker
          label="Hasta"
          value={endDate}
          onChange={handleEndChange}
          slotProps={{
            textField: {
              size: "small",
              sx: { minWidth: 200 },
            },
          }}
        />

        {(startDate || endDate) && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClear}
            sx={{ textTransform: "none" }}
          >
            Limpiar
          </Button>
        )}
      </Box> */}
      <Stack direction="row" spacing={1} alignItems="center">
        <DateTimePicker
          label="Desde"
          value={localStart}
          onChange={(val) => setLocalStart(val)}
          slotProps={{ textField: { size: "small", sx: { minWidth: 200 } } }}
        />

        <DateTimePicker
          label="Hasta"
          value={localEnd}
          onChange={(val) => setLocalEnd(val)}
          slotProps={{ textField: { size: "small", sx: { minWidth: 200 } } }}
        />

        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            onClick={handleApply}
            sx={{ textTransform: "none" }}
            size="small"
          >
            Aplicar
          </Button>

          {(localStart || localEnd) && (
            <Button
              variant="text"
              onClick={handleClear}
              sx={{ textTransform: "none" }}
              size="small"
            >
              Limpiar
            </Button>
          )}
        </Box>
      </Stack>
    </LocalizationProvider>
  );
}
