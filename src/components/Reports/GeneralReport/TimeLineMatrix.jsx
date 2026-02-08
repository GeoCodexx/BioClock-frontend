// components/TimelineMatrix.jsx
// SOLUCIÓN EXTREMA PARA SCROLL FLUIDO
import React, { useMemo, useRef, useState, useCallback, memo } from "react";
import {
  Box,
  Typography,
  useTheme,
  alpha,
  Paper,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Card,
  CardContent,
  Skeleton,
  Fade,
  // ToggleButtonGroup,
  // ToggleButton,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  // ViewDay,
  // ViewWeek,
} from "@mui/icons-material";
import { format, parseISO, isSameMonth } from "date-fns";
import { es } from "date-fns/locale";
//import AttendanceDrawer from "./AttendanceDrawer";

/* ---------------------------------------------
   Configuration
--------------------------------------------- */
const ROW_HEIGHT = 40;
const COLUMN_WIDTH = 80;
const NAME_COLUMN_WIDTH = 240;
const HEADER_HEIGHT = 50;

/*const STATUS_CONFIG = {
  on_time: { dark: "#2e7d32", light: "#66bb6a", label: "A Tiempo" },
  late: { dark: "#ed6c02", light: "#ffa726", label: "Tardanza" },
  early_exit: { dark: "#9c27b0", light: "#ba68c8", label: "Salida Anticipada" },
  incomplete: { dark: "#e65100", light: "#ff9800", label: "Incompleto" },
  absent: { dark: "#d32f2f", light: "#f44336", label: "Ausente" },
  justified: { dark: "#0288d1", light: "#29b6f6", label: "Justificado" },
};*/
const STATUS_CONFIG = {
  on_time: {
    light: "#E8F5E9", // Verde muy suave
    dark: "#2E7D32", // Verde corporativo
    label: "A Tiempo",
  },
  late: {
    light: "#FFF8E1", // Ámbar suave
    dark: "#ed6c02", // Naranja quemado/profundo
    label: "Tardanza",
  },
  early_exit: {
    light: "#F3E5F5", // Lavanda claro
    dark: "#7B1FA2", // Púrpura elegante
    label: "Salida Anticipada",
  },
  incomplete: {
    light: "#d6d6d6", // Naranja pastel
    dark: "#757575", // Terracota
    label: "Incompleto",
  },
  absent: {
    light: "#FFEBEE", // Rojo muy claro
    dark: "#C62828", // Rojo ladrillo profesional
    label: "Ausente",
  },
  justified: {
    light: "#E1F5FE", // Azul muy claro
    dark: "#0277BD", // Azul acero
    label: "Justificado",
  },
};

/* ---------------------------------------------
   Matrix Cell Component (Memoized)
--------------------------------------------- */
const MatrixCell = memo(
  ({ shifts, getStatusColor, onClick, rowIdx, colIdx }) => {
    return (
      <Box
        className={`matrix-cell row-${rowIdx} col-${colIdx}`}
        //onClick={() => shifts.length > 0 && onClick(shifts[0])}
        sx={{
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
          p: 0.5,
          px: 3,
          cursor: shifts.length > 0 ? "pointer" : "default",
          transition: "background-color 0.15s ease",
          "&:hover": {
            bgcolor: (theme) => `${theme.palette.primary.main}15`,
          },
        }}
      >
        {shifts.length === 0 ? (
          <Box
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.3,
            }}
          >
            <Typography variant="caption" color="text.disabled">
              -
            </Typography>
          </Box>
        ) : (
          shifts.map((shift, idx) => (
            <Tooltip
              key={idx}
              title={`${shift.scheduleName} - ${STATUS_CONFIG[shift.shiftStatus]?.label || shift.shiftStatus}`}
              placement="top"
              arrow
              enterDelay={500}
            >
              <Box
                onClick={() => shifts.length > 0 && onClick(shift)}
                sx={{
                  //width: 10,
                  height: 13.5,
                  flex: 1,
                  borderRadius: 3,
                  //border: `1px solid ${STATUS_CONFIG[shift.shiftStatus].dark}`,
                  //bgcolor: `${STATUS_CONFIG[shift.shiftStatus].dark}80`,
                  bgcolor: getStatusColor(shift.shiftStatus),
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  "&:hover": {
                    transform: "scale(1.3)",
                    boxShadow: 2,
                    zIndex: 2,
                  },
                }}
              />
            </Tooltip>
          ))
        )}
      </Box>
    );
  },
);

MatrixCell.displayName = "MatrixCell";

/* ---------------------------------------------
   Main Component
--------------------------------------------- */
const TimelineMatrix = ({
  users = [],
  dates = [],
  matrix = {},
  granularity = "day",
  //onJustify,
  setSelectedShift,
  currentMonth, // Nueva prop: fecha del mes actual
  onMonthChange, // Nueva prop: callback para cambiar mes
  loadingMatrix,
  fadeKey, // Nueva prop: para forzar re-render con fade al cambiar de mes
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  //const [selectedRecord, setSelectedRecord] = useState(null);
  //const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState(granularity);

  /* ---------------- Process Dates ---------------- */
  const visibleDates = useMemo(() => {
    if (!dates?.length) return [];
    if (viewMode === "day") return dates.map((d) => ({ key: d, type: "day" }));

    const map = new Map();
    dates.forEach((d) => {
      const date = parseISO(d);
      const key = `S${format(date, "w", { locale: es })} ${format(date, "MMM", { locale: es })}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(d);
    });
    return Array.from(map.entries()).map(([key, values]) => ({
      key,
      values,
      type: "week",
    }));
  }, [dates, viewMode]);

  /* ---------------- Get Status Color ---------------- */
  const getStatusColor = useCallback(
    (status) => {
      const config = STATUS_CONFIG[status];
      return config ? (isDark ? config.dark : `${config.dark}80`) : "#999";
    },
    [isDark],
  );

  /* ---------------- Handlers ---------------- */
  const handleShiftClick = useCallback((shift) => {
    if (shift?.record) {
      /*setSelectedRecord(shift.record);
      setDrawerOpen(true);*/
      const { record, ...rest } = shift;
      setSelectedShift({ ...record, ...rest });
    }
  }, []);

  /*const handleViewModeChange = useCallback((event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  }, []);*/

  const handlePreviousMonth = useCallback(() => {
    if (onMonthChange && currentMonth) {
      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      onMonthChange(prevMonth);
    }
  }, [currentMonth, onMonthChange]);

  const handleNextMonth = useCallback(() => {
    if (onMonthChange && currentMonth) {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      onMonthChange(nextMonth);
    }
  }, [currentMonth, onMonthChange]);

  /* ---------------- Month Navigation State ---------------- */
  const isCurrentMonth = useMemo(() => {
    if (!currentMonth) return true;
    return isSameMonth(currentMonth, new Date());
  }, [currentMonth]);

  const monthYearLabel = useMemo(() => {
    if (!currentMonth) return "";
    return format(currentMonth, "MMMM yyyy", { locale: es });
  }, [currentMonth]);

  /* --------------- Skeleton Loader ---------------- */
  const MatrixSkeleton = () => (
    <Card elevation={0} sx={{ borderRadius: 2, width: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          {[...Array(7)].map((_, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <Skeleton variant="rectangular" width={240} height={35} />
              {[...Array(10)].map((_, j) => (
                <Skeleton
                  key={j}
                  variant="rectangular"
                  width={80}
                  height={35}
                />
              ))}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );

  /* ---------------- Empty State ---------------- */
  if (!users?.length || !visibleDates?.length) {
    return (
      <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary">
          No hay datos disponibles
        </Typography>
        <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
          Selecciona otro mes o ajusta los filtros
        </Typography>
      </Paper>
    );
  }

  /* ---------------- Render ---------------- */
  return (
    <>
      {/* Controls Header */}
      <Paper
        sx={{
          p: 2,
          //mb: 2,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        {/* Legend */}
        <Paper sx={{ p: 2, borderRadius: 2 }}>
          {/* <Typography variant="subtitle2" gutterBottom fontWeight={600}>
            Leyenda de Estados:
          </Typography> */}
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <Chip
                key={key}
                label={config.label}
                size="small"
                sx={{
                  bgcolor:
                    theme.palette.mode === "dark" ? config.dark : config.light,
                  //color: alpha("#ffffff", 0.85),
                  color:
                    theme.palette.mode === "dark" ? config.light : config.dark,
                  //fontWeight: 500,
                }}
              />
            ))}
          </Stack>
        </Paper>
        {/* View Mode Toggle */}
        {/* <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              px: 2,
              py: 1,
              textTransform: "none",
              fontWeight: 500,
            },
          }}
        >
          <ToggleButton value="day" aria-label="vista diaria">
            <ViewDay sx={{ mr: 1, fontSize: 20 }} />
            Día
          </ToggleButton>
          <ToggleButton value="week" aria-label="vista semanal">
            <ViewWeek sx={{ mr: 1, fontSize: 20 }} />
            Semana
          </ToggleButton>
        </ToggleButtonGroup> */}

        {/* Month Navigation */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Tooltip title="Mes anterior">
            <span>
              <IconButton
                onClick={handlePreviousMonth}
                size="small"
                sx={{
                  bgcolor: "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <ChevronLeft />
              </IconButton>
            </span>
          </Tooltip>

          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              minWidth: 180,
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {monthYearLabel}
          </Typography>

          <Tooltip
            title={
              isCurrentMonth ? "Ya estás en el mes actual" : "Mes siguiente"
            }
          >
            <span>
              <IconButton
                onClick={handleNextMonth}
                disabled={isCurrentMonth}
                size="small"
                sx={{
                  bgcolor: isCurrentMonth
                    ? "action.disabledBackground"
                    : "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                }}
              >
                <ChevronRight />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Stats */}
        {/* <Stack
          direction="row"
          spacing={3}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Usuarios
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {users.length}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              {viewMode === "day" ? "Días" : "Semanas"}
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {visibleDates.length}
            </Typography>
          </Box>
        </Stack> */}
      </Paper>

      {/* Matrix Container */}
      {loadingMatrix ? (
        <MatrixSkeleton />
      ) : (
        <Fade in key={fadeKey} timeout={800}>
          <Paper sx={{ borderRadius: 2, overflow: "hidden", boxShadow: 2 }}>
            <Box
              className="matrix-container"
              sx={{
                //height: "calc(100vh - 380px)",
                maxHeight: 650,
                overflow: "auto",
                position: "relative",
                display: "grid",
                gridTemplateColumns: `${NAME_COLUMN_WIDTH}px repeat(${visibleDates.length}, ${COLUMN_WIDTH}px)`,
                gridTemplateRows: `${HEADER_HEIGHT}px repeat(${users.length}, ${ROW_HEIGHT}px)`,

                // GPU acceleration
                transform: "translateZ(0)",

                // Custom scrollbar
                "&::-webkit-scrollbar": {
                  width: 10,
                  height: 10,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: "transparent",
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                  borderRadius: 2,
                  "&:hover": {
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.3)"
                      : "rgba(0,0,0,0.3)",
                  },
                },

                // HOVER CRUZADO CON CSS PURO (sin estado)
                // Cuando haces hover en una celda, resalta su fila y columna
                "& .matrix-cell": {
                  position: "relative",
                },

                // Resaltar todas las celdas de la misma fila al hacer hover
                /*...Object.fromEntries(
              users.map((_, rowIdx) => [
                `&:has(.row-${rowIdx}:hover) .row-${rowIdx}`,
                {
                  bgcolor: `${theme.palette.primary.main}10`,
                },
              ]),
            ),*/

                // Resaltar todas las celdas de la misma columna al hacer hover
                /*...Object.fromEntries(
              visibleDates.map((_, colIdx) => [
                `&:has(.col-${colIdx}:hover) .col-${colIdx}`,
                {
                  bgcolor: `${theme.palette.primary.main}10`,
                },
              ]),
            ),*/

                // Resaltar el header de la columna cuando se hace hover en cualquier celda de esa columna
                ...Object.fromEntries(
                  visibleDates.map((_, colIdx) => [
                    `&:has(.col-${colIdx}:hover) .header-col-${colIdx}`,
                    {
                      bgcolor: `${theme.palette.primary.main}30`,
                      /*bgcolor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.1)",*/
                    },
                  ]),
                ),

                // Resaltar el nombre del usuario cuando se hace hover en cualquier celda de esa fila
                ...Object.fromEntries(
                  users.map((_, rowIdx) => [
                    `&:has(.row-${rowIdx}:hover) .user-row-${rowIdx}`,
                    {
                      /*bgcolor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",*/
                      //bgcolor: `${theme.palette.primary.main}14`,
                      color: "primary.main",
                    },
                  ]),
                ),
              }}
            >
              {/* Corner Cell (Sticky) */}
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 40,
                  bgcolor: theme.palette.background.paper, // Fondo sólido
                  color: theme.palette.text.primary,
                  // Eliminamos width/height fijos para que use el tamaño natural del contenido
                  /*minWidth: "120px", 
    minHeight: "60px",*/
                  borderRight: `2px solid ${theme.palette.divider}`,
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "8px",
                  // --- SOLUCIÓN A LA DIAGONAL ---
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1, // Para que el texto quede encima de la línea
                    background: `linear-gradient(to top right, transparent calc(50% - 1px), ${theme.palette.divider}, transparent calc(50% + 1px))`,
                  },
                }}
              >
                {/* Texto superior derecho */}
                <Typography
                  //variant="caption"
                  sx={{ alignSelf: "flex-end", fontWeight: 700 }}
                >
                  Día
                </Typography>

                {/* Texto inferior izquierdo */}
                <Typography
                  sx={{
                    alignSelf: "flex-start",
                    fontWeight: 700,
                    mb: "10px",
                    ml: "8px",
                    lineHeight: 0,
                  }}
                >
                  Usuario
                </Typography>
              </Box>

              {/* Date Headers (Sticky Top) */}
              {visibleDates.map((dateInfo, colIdx) => {
                const dateStr =
                  dateInfo.type === "day"
                    ? format(parseISO(dateInfo.key), "dd MMM", { locale: es })
                    : dateInfo.key;

                const dayOfWeek =
                  dateInfo.type === "day"
                    ? format(parseISO(dateInfo.key), "EEE", { locale: es })
                    : null;

                return (
                  <Box
                    key={colIdx}
                    className={`header-col-${colIdx}`}
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 20,
                      //bgcolor: "primary.main",
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      //color: "primary.contrastText",
                      color: theme.palette.text.primary,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      transition: "background-color 0.15s ease",
                      cursor: "default",
                    }}
                  >
                    {dayOfWeek && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          opacity: 0.85,
                          textTransform: "capitalize",
                        }}
                      >
                        {dayOfWeek}
                      </Typography>
                    )}
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{
                        fontSize: "0.8rem",
                        textTransform: "capitalize",
                      }}
                    >
                      {dateStr}
                    </Typography>
                  </Box>
                );
              })}

              {/* User Rows */}
              {users.map((user, rowIdx) => (
                <React.Fragment key={user.id}>
                  {/* User Name Cell (Sticky Left) */}
                  <Box
                    className={`user-row-${rowIdx}`}
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      bgcolor: "background.paper",
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      borderRight: `2px solid ${theme.palette.divider}`,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      transition:
                        "background-color 0.15s ease, color 0.15s ease",
                      cursor: "default",
                    }}
                  >
                    <Tooltip
                      title={user.fullName}
                      placement="right"
                      enterDelay={500}
                    >
                      <Typography
                        variant="body2"
                        fontWeight={500}
                        noWrap
                        sx={{
                          fontSize: "0.875rem",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {user.fullName}
                      </Typography>
                    </Tooltip>
                  </Box>

                  {/* Data Cells */}
                  {visibleDates.map((dateInfo, colIdx) => {
                    const shifts =
                      dateInfo.type === "day"
                        ? matrix[user.id]?.[dateInfo.key] || []
                        : dateInfo.values.flatMap(
                            (d) => matrix[user.id]?.[d] || [],
                          );

                    return (
                      <MatrixCell
                        key={`${user.id}-${dateInfo.key}`}
                        shifts={shifts}
                        getStatusColor={getStatusColor}
                        onClick={handleShiftClick}
                        rowIdx={rowIdx}
                        colIdx={colIdx}
                      />
                    );
                  })}
                </React.Fragment>
              ))}
            </Box>
          </Paper>
        </Fade>
      )}
    </>
  );
};

export default TimelineMatrix;
