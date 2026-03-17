import { memo, useCallback, useState, useMemo } from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Button,
  IconButton,
  InputAdornment,
  Fade,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  Checkbox,
  Drawer,
  Box,
  Badge,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { es } from "date-fns/locale";
import { format, startOfMonth, endOfMonth } from "date-fns";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewDayIcon from "@mui/icons-material/ViewDay";
import TuneIcon from "@mui/icons-material/Tune";
import CloseIcon from "@mui/icons-material/Close";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { SafeSelect } from "../../common/SafeSelect";
import AttendanceExportButtons from "./AttendanceExportButtons";

const STATUS_OPTIONS = [
  //{ value: "", label: "Todos los estados" },
  { value: "on_time", label: "A tiempo" },
  { value: "late", label: "Tardanza" },
  { value: "early", label: "Temprano" },
  { value: "early_exit", label: "Salida temprana" },
  { value: "incomplete", label: "Incompleto" },
  { value: "absent", label: "Ausente" },
  { value: "justified", label: "Justificado" },
];

// ─── Mobile Action Bar ───────────────────────────────────────────────────────

const MobileActionBar = ({
  searchValue,
  onSearchChange,
  onHandleClearSearch,
  searchInputRef,
  activeFilterCount,
  onOpenDrawer,
  viewMode,
  onChangeViewMode,
  totalRecords,
  onOpenExport,
}) => {
  return (
    <Stack spacing={1.5}>
      {/* Row 1: Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nombre o DNI…"
        value={searchValue}
        onChange={onSearchChange}
        inputRef={searchInputRef}
        error={searchValue.length > 0 && searchValue.length < 3}
        helperText={
          searchValue.length > 0 && searchValue.length < 3
            ? "Mínimo 3 caracteres"
            : searchValue.length >= 3
              ? `Buscando: "${searchValue}"`
              : ""
        }
        slotProps={{
          input: {
            sx: { fontSize: "0.9rem", borderRadius: 2.5 },
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  fontSize="small"
                  color={searchValue.length >= 3 ? "primary" : "action"}
                />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <Fade in={Boolean(searchValue)}>
                <InputAdornment position="end">
                  <IconButton
                    onClick={onHandleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              </Fade>
            ),
          },
        }}
      />

      {/* Row 2: View toggle + Filter button + Export */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* View mode toggle */}
        <ToggleButtonGroup
          color="primary"
          value={viewMode}
          exclusive
          onChange={(e, val) => val !== null && onChangeViewMode(val)}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              px: 1.5,
              textTransform: "none",
              fontWeight: 500,
              fontSize: "0.78rem",
            },
          }}
        >
          <ToggleButton value="matrix" aria-label="vista matriz">
            <ViewModuleIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Matriz
          </ToggleButton>
          <ToggleButton value="table" aria-label="vista tabla">
            <ViewDayIcon sx={{ fontSize: 16, mr: 0.5 }} />
            Tabla
          </ToggleButton>
        </ToggleButtonGroup>

        {/* <Box sx={{ flex: 1 }} /> */}

        {/* Export button */}
        <IconButton
          size="small"
          disabled={totalRecords === 0}
          onClick={onOpenExport}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1.5,
            px: 1.2,
            py: 0.8,
            color: "text.secondary",
            "&:hover": { borderColor: "primary.main", color: "primary.main" },
          }}
        >
          <FileDownloadIcon fontSize="small" />
        </IconButton>

        {/* Filter button with active count badge */}
        <Badge
          badgeContent={activeFilterCount}
          color="secondary"
          overlap="circular"
        //   anchorOrigin={{
        //     vertical: "top",
        //     horizontal: "left",
        //   }}
        >
          <Button
            variant={activeFilterCount > 0 ? "contained" : "outlined"}
            size="small"
            startIcon={<TuneIcon />}
            onClick={onOpenDrawer}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 1.5,
              fontSize: "0.82rem",
              //px: 1.8,
            }}
          >
            Filtros
          </Button>
        </Badge>
      </Stack>
    </Stack>
  );
};

// ─── Active Filter Chips (mobile summary) ───────────────────────────────────

const ActiveFilterChips = ({
  search,
  scheduleId,
  schedules,
  status,
  dateFrom,
  dateTo,
  viewMode,
  onClearFilters,
}) => {
  const chips = useMemo(() => {
    const list = [];
    if (scheduleId) {
      const s = schedules.find((sc) => sc._id === scheduleId);
      if (s) list.push({ key: "schedule", label: `Turno: ${s.name}` });
    }
    if (status) {
      const opt = STATUS_OPTIONS.find((o) => o.value === status);
      if (opt) list.push({ key: "status", label: `Estado: ${opt.label}` });
    }
    if (dateFrom && dateTo && viewMode !== "matrix") {
      list.push({
        key: "dates",
        label: `${format(dateFrom, "dd/MM")} – ${format(dateTo, "dd/MM")}`,
      });
    }
    return list;
  }, [scheduleId, schedules, status, dateFrom, dateTo, viewMode]);

  if (chips.length === 0) return null;

  return (
    <Stack direction="row" spacing={0.75} sx={{ flexWrap: "wrap", gap: 0.75 }}>
      {chips.map((chip) => (
        <Chip
          key={chip.key}
          label={chip.label}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontSize: "0.72rem", height: 24 }}
        />
      ))}
      <Chip
        label="Limpiar"
        size="small"
        variant="filled"
        color="default"
        onClick={onClearFilters}
        onDelete={onClearFilters}
        sx={{ fontSize: "0.72rem", height: 24 }}
      />
    </Stack>
  );
};

// ─── Filters Drawer (mobile) ─────────────────────────────────────────────────

const FiltersDrawer = ({
  open,
  onClose,
  scheduleId,
  status,
  dateFrom,
  dateTo,
  schedules,
  onScheduleChange,
  onStatusChange,
  onDateFromChange,
  onDateToChange,
  onClearFilters,
  onChangeCheckboxUser,
  error,
  viewMode,
  activeFilterCount,
}) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          maxHeight: "88vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Drag handle */}
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: "action.disabled",
          }}
        />
      </Box>

      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <TuneIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem" }}>
            Filtros
          </Typography>
          {activeFilterCount > 0 && (
            <Chip
              label={`${activeFilterCount} activo${activeFilterCount > 1 ? "s" : ""}`}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Stack>
        <IconButton
          size="small"
          onClick={onClose}
          sx={{ color: "text.secondary" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider />

      {/* Scrollable content */}
      <Box sx={{ overflowY: "auto", flex: 1, px: 2.5, py: 2 }}>
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
          <Stack spacing={2.5}>
            {/* Turno */}
            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 1,
                  display: "block",
                }}
              >
                Turno
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.9rem" }}>
                  Seleccionar turno
                </InputLabel>
                <SafeSelect
                  value={scheduleId}
                  label="Seleccionar turno"
                  disabled={schedules.length === 0}
                  onChange={onScheduleChange}
                  MenuProps={{ disableScrollLock: true }}
                  sx={{ fontSize: "0.9rem", borderRadius: 2 }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                    <em>Todos los turnos</em>
                  </MenuItem>
                  {schedules.map((schedule) => (
                    <MenuItem
                      key={schedule._id}
                      value={schedule._id}
                      sx={{ fontSize: "0.9rem" }}
                    >
                      {schedule.name}
                    </MenuItem>
                  ))}
                </SafeSelect>
              </FormControl>
            </Box>

            {/* Estado */}
            <Box>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  mb: 1,
                  display: "block",
                }}
              >
                Estado
              </Typography>
              <FormControl fullWidth size="small">
                <InputLabel sx={{ fontSize: "0.9rem" }}>
                  Seleccionar estado
                </InputLabel>
                <SafeSelect
                  value={status}
                  label="Seleccionar estado"
                  onChange={onStatusChange}
                  sx={{ fontSize: "0.9rem", borderRadius: 2 }}
                >
                  <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                    <em>Todos los estados</em>
                  </MenuItem>
                  {STATUS_OPTIONS.map((option) => (
                    <MenuItem
                      key={option.value}
                      value={option.value}
                      sx={{ fontSize: "0.9rem" }}
                    >
                      {option.label}
                    </MenuItem>
                  ))}
                </SafeSelect>
              </FormControl>
            </Box>

            {/* Rango de fechas (solo en modo tabla) */}
            {viewMode !== "matrix" && (
              <Box>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  color="text.secondary"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    mb: 1,
                    display: "block",
                  }}
                >
                  Rango de fechas
                </Typography>
                <Stack spacing={1.5}>
                  <DatePicker
                    label="Desde"
                    value={dateFrom}
                    onChange={onDateFromChange}
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: error,
                        helperText: error ? "Rango inválido" : "",
                        sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                      },
                    }}
                  />
                  <DatePicker
                    label="Hasta"
                    value={dateTo}
                    onChange={onDateToChange}
                    minDate={dateFrom}
                    disableFuture
                    format="dd/MM/yyyy"
                    slotProps={{
                      textField: {
                        size: "small",
                        fullWidth: true,
                        error: error || (dateFrom && !dateTo),
                        helperText: error
                          ? "Debe ser posterior al inicio"
                          : dateFrom && !dateTo
                            ? "Completa el rango"
                            : "",
                        sx: { "& .MuiOutlinedInput-root": { borderRadius: 2 } },
                      },
                    }}
                  />
                </Stack>
              </Box>
            )}

            {/* Usuarios inactivos */}
            <Box
              sx={(theme) => ({
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                px: 2,
                py: 1.25,
                bgcolor: alpha(theme.palette.action.hover, 0.4),
              })}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    onChange={(e) => onChangeCheckboxUser(e.target.checked)}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    fontWeight={500}
                  >
                    Incluir usuarios inactivos
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>
          </Stack>
        </LocalizationProvider>
      </Box>

      {/* Footer actions */}
      <Divider />
      <Stack
        direction="row"
        spacing={1.5}
        sx={{ px: 2.5, py: 2, pb: "max(env(safe-area-inset-bottom), 16px)" }}
      >
        <Button
          variant="outlined"
          fullWidth
          startIcon={<ClearIcon />}
          onClick={() => {
            onClearFilters();
            onClose();
          }}
          disabled={!scheduleId && !status && !dateFrom && !dateTo}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
        >
          Limpiar
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={onClose}
          sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
        >
          Aplicar filtros
        </Button>
      </Stack>
    </Drawer>
  );
};

// ─── Export Drawer (mobile) ──────────────────────────────────────────────────

const ExportDrawer = ({
  open,
  onClose,
  viewMode,
  search,
  scheduleId,
  status,
  dateFrom,
  dateTo,
  currentMonth,
  page,
  totalRecords,
}) => {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
        <Box
          sx={{
            width: 40,
            height: 4,
            borderRadius: 2,
            bgcolor: "action.disabled",
          }}
        />
      </Box>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <FileDownloadIcon color="primary" fontSize="small" />
          <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem" }}>
            Exportar
          </Typography>
        </Stack>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Divider />

      <Box
        sx={{ px: 2.5, py: 2.5, pb: "max(env(safe-area-inset-bottom), 20px)" }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {totalRecords > 0
            ? `${totalRecords} registros disponibles`
            : "No hay registros para exportar"}
        </Typography>

        {viewMode === "matrix" ? (
          <AttendanceExportButtons
            viewType="matrix"
            dateRange={{
              dateFrom: format(startOfMonth(currentMonth), "yyyy-MM-dd"),
              dateTo: format(endOfMonth(currentMonth), "yyyy-MM-dd"),
            }}
            filters={{ search, scheduleId, status }}
            totalRecords={totalRecords || 0}
          />
        ) : (
          <AttendanceExportButtons
            viewType="table"
            filters={{ search, scheduleId, status }}
            dateRange={{ dateFrom, dateTo }}
            currentPage={page}
            totalRecords={totalRecords}
          />
        )}
      </Box>
    </Drawer>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

const FiltersCard = memo(
  ({
    search,
    searchValue,
    scheduleId,
    status,
    dateFrom,
    dateTo,
    schedules,
    onSearchChange,
    onHandleClearSearch,
    searchInputRef,
    onScheduleChange,
    onStatusChange,
    onDateFromChange,
    onDateToChange,
    onClearFilters,
    onChangeViewMode,
    onChangeCheckboxUser,
    viewMode,
    totalRecords,
    error,
    page,
    currentMonth,
  }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
    const [exportDrawerOpen, setExportDrawerOpen] = useState(false);

    const handleViewModeChange = useCallback(
      (event, newMode) => {
        if (newMode !== null) onChangeViewMode(newMode);
      },
      [onChangeViewMode],
    );

    const handleCheckboxUserChange = useCallback(
      (event) => {
        onChangeCheckboxUser(event.target.checked);
      },
      [onChangeCheckboxUser],
    );

    // Count active non-search filters for the badge
    const activeFilterCount = useMemo(() => {
      let count = 0;
      if (scheduleId) count++;
      if (status) count++;
      if (dateFrom && viewMode !== "matrix") count++;
      return count;
    }, [scheduleId, status, dateFrom, viewMode]);

    // ── Mobile layout ──────────────────────────────────────────────────────
    if (isMobile) {
      return (
        <>
          <Card
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <MobileActionBar
                searchValue={searchValue}
                onSearchChange={onSearchChange}
                onHandleClearSearch={onHandleClearSearch}
                searchInputRef={searchInputRef}
                activeFilterCount={activeFilterCount}
                onOpenDrawer={() => setFiltersDrawerOpen(true)}
                viewMode={viewMode}
                onChangeViewMode={onChangeViewMode}
                totalRecords={totalRecords}
                onOpenExport={() => setExportDrawerOpen(true)}
              />

              {/* Active filter chips summary */}
              {activeFilterCount > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  <ActiveFilterChips
                    search={search}
                    scheduleId={scheduleId}
                    schedules={schedules}
                    status={status}
                    dateFrom={dateFrom}
                    dateTo={dateTo}
                    viewMode={viewMode}
                    onClearFilters={onClearFilters}
                  />
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Filters Drawer */}
          <FiltersDrawer
            open={filtersDrawerOpen}
            onClose={() => setFiltersDrawerOpen(false)}
            scheduleId={scheduleId}
            status={status}
            dateFrom={dateFrom}
            dateTo={dateTo}
            schedules={schedules}
            onScheduleChange={onScheduleChange}
            onStatusChange={onStatusChange}
            onDateFromChange={onDateFromChange}
            onDateToChange={onDateToChange}
            onClearFilters={onClearFilters}
            onChangeCheckboxUser={onChangeCheckboxUser}
            error={error}
            viewMode={viewMode}
            activeFilterCount={activeFilterCount}
          />

          {/* Export Drawer */}
          <ExportDrawer
            open={exportDrawerOpen}
            onClose={() => setExportDrawerOpen(false)}
            viewMode={viewMode}
            search={search}
            scheduleId={scheduleId}
            status={status}
            dateFrom={dateFrom}
            dateTo={dateTo}
            currentMonth={currentMonth}
            page={page}
            totalRecords={totalRecords}
          />
        </>
      );
    }

    // ── Desktop layout (unchanged) ─────────────────────────────────────────
    return (
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ mb: 2.5 }}
          >
            <FilterListIcon color="primary" />
            <Typography variant="h6" fontWeight={600}>
              Filtros
            </Typography>
          </Stack>

          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
            <Grid container spacing={2}>
              {/* Búsqueda */}
              <Grid size={{ xs: 12, md: viewMode === "table" ? 3.5 : 6 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Buscar"
                  placeholder="Nombres, Apellidos o DNI"
                  value={searchValue}
                  onChange={onSearchChange}
                  inputRef={searchInputRef}
                  error={searchValue.length > 0 && searchValue.length < 3}
                  slotProps={{
                    input: {
                      style: { fontSize: "0.9rem" },
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon
                            color={
                              searchValue.length >= 3 ? "primary" : "action"
                            }
                          />
                        </InputAdornment>
                      ),
                      endAdornment: searchValue && (
                        <Fade in={Boolean(searchValue)}>
                          <InputAdornment position="end">
                            <IconButton
                              onClick={onHandleClearSearch}
                              edge="end"
                              size="small"
                              sx={{ padding: 0.5 }}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        </Fade>
                      ),
                    },
                  }}
                  helperText={
                    searchValue.length > 0 && searchValue.length < 3
                      ? "Mínimo 3 caracteres para buscar"
                      : searchValue.length >= 3
                        ? `Buscando: "${searchValue}"`
                        : ""
                  }
                />
              </Grid>

              {/* Filtro por turno */}
              <Grid
                size={{ xs: 12, sm: 6, md: viewMode === "table" ? 2.25 : 3 }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: "0.9rem" }}>Turno</InputLabel>
                  <SafeSelect
                    value={scheduleId}
                    label="Turno"
                    disabled={schedules.length === 0}
                    onChange={onScheduleChange}
                    MenuProps={{ disableScrollLock: true }}
                    sx={{ fontSize: "0.9rem" }}
                  >
                    <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                      <em>Todos los turnos</em>
                    </MenuItem>
                    {schedules.map((schedule) => (
                      <MenuItem
                        key={schedule._id}
                        value={schedule._id}
                        sx={{ fontSize: "0.9rem" }}
                      >
                        {schedule.name}
                      </MenuItem>
                    ))}
                  </SafeSelect>
                </FormControl>
              </Grid>

              {/* Filtro por estado */}
              <Grid
                size={{ xs: 12, sm: 6, md: viewMode === "table" ? 2.25 : 3 }}
              >
                <FormControl fullWidth size="small">
                  <InputLabel sx={{ fontSize: "0.9rem" }}>Estado</InputLabel>
                  <SafeSelect
                    value={status}
                    label="Estado"
                    onChange={onStatusChange}
                    sx={{ fontSize: "0.9rem" }}
                  >
                    <MenuItem value="" sx={{ fontSize: "0.9rem" }}>
                      <em>Todos los estados</em>
                    </MenuItem>
                    {STATUS_OPTIONS.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        sx={{ fontSize: "0.9rem" }}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </SafeSelect>
                </FormControl>
              </Grid>

              {viewMode !== "matrix" && (
                <>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <DatePicker
                      label="Desde"
                      value={dateFrom}
                      onChange={onDateFromChange}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: error,
                          helperText: error ? "Rango inválido" : "",
                        },
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                    <DatePicker
                      label="Hasta"
                      value={dateTo}
                      onChange={onDateToChange}
                      minDate={dateFrom}
                      disableFuture
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: error || (dateFrom && !dateTo),
                          helperText: error
                            ? "Debe ser posterior al inicio"
                            : dateFrom && !dateTo
                              ? "Completa el rango"
                              : "",
                        },
                      }}
                      format="dd/MM/yyyy"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </LocalizationProvider>

          {/* Desktop footer */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{
              mt: 2.5,
              pt: 2.5,
              borderTop: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1} direction="row">
              <ToggleButtonGroup
                color="primary"
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                size="small"
                sx={{
                  "& .MuiToggleButton-root": {
                    px: 2,
                    textTransform: "none",
                    fontWeight: 500,
                  },
                }}
              >
                <ToggleButton value="matrix" aria-label="vista diaria">
                  <ViewModuleIcon sx={{ mr: 1, fontSize: 20 }} />
                  Matriz
                </ToggleButton>
                <ToggleButton value="table" aria-label="vista semanal">
                  <ViewDayIcon sx={{ mr: 1, fontSize: 20 }} />
                  Tabla
                </ToggleButton>
              </ToggleButtonGroup>
              <FormControlLabel
                control={<Checkbox onChange={handleCheckboxUserChange} />}
                label="Incluir usuarios inactivos"
                sx={{
                  "& .MuiFormControlLabel-label": {
                    color: "text.secondary",
                    fontSize: "0.9rem",
                  },
                }}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={onClearFilters}
                disabled={
                  !search && !scheduleId && !status && !dateFrom && !dateTo
                }
              >
                Limpiar filtros
              </Button>

              {viewMode === "matrix" ? (
                <AttendanceExportButtons
                  viewType="matrix"
                  dateRange={{
                    dateFrom: format(startOfMonth(currentMonth), "yyyy-MM-dd"),
                    dateTo: format(endOfMonth(currentMonth), "yyyy-MM-dd"),
                  }}
                  filters={{ search, scheduleId, status }}
                  totalRecords={totalRecords || 0}
                />
              ) : (
                <AttendanceExportButtons
                  viewType="table"
                  filters={{ search, scheduleId, status }}
                  dateRange={{ dateFrom, dateTo }}
                  currentPage={page}
                  totalRecords={totalRecords}
                />
              )}
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    );
  },
);

export default FiltersCard;
