import React, { memo } from "react";
import { Stack, useMediaQuery, useTheme } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";

const AttendanceDateRangeFilter = memo(
  ({ startDate, endDate, onStartDateChange, onEndDateChange }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    return (
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          sx={{ width: "100%" }}
        >
          <DatePicker
            label="Fecha inicio"
            value={startDate}
            onChange={onStartDateChange}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
            maxDate={endDate || undefined}
          />
          <DatePicker
            label="Fecha fin"
            value={endDate}
            onChange={onEndDateChange}
            slotProps={{
              textField: {
                size: "small",
                fullWidth: true,
              },
            }}
            minDate={startDate || undefined}
          />
        </Stack>
      </LocalizationProvider>
    );
  }
);

AttendanceDateRangeFilter.displayName = "AttendanceDateRangeFilter";

export default AttendanceDateRangeFilter;
