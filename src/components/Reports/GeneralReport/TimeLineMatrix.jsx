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
  Button,
  Popover,
  Badge,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import {
  format,
  parseISO,
  isSameMonth,
  subMonths,
  addMonths,
  setMonth,
  setYear,
  isWeekend,
} from "date-fns";
import { es } from "date-fns/locale";

/* ---------------------------------------------
   Configuration
--------------------------------------------- */
const ROW_HEIGHT = 42;
const COLUMN_WIDTH = 85;
const NAME_COLUMN_WIDTH = 240;
const HEADER_HEIGHT = 54;

// Esquema de colores optimizado para light y dark mode
const STATUS_CONFIG = {
  on_time: {
    light: {
      bg: alpha("#2E7D32", 0.12),
      border: "#2E7D32",
      text: "#1B5E20",
    },
    dark: {
      bg: alpha("#66BB6A", 0.25),
      border: "#66BB6A",
      text: "#A5D6A7",
    },
    label: "A Tiempo",
    icon: "✓",
  },
  late: {
    light: {
      bg: alpha("#ED6C02", 0.12),
      border: "#ED6C02",
      text: "#E65100",
    },
    dark: {
      bg: alpha("#FF9800", 0.25),
      border: "#FF9800",
      text: "#FFB74D",
    },
    label: "Tardanza",
    icon: "⏱",
  },
  early_exit: {
    light: {
      bg: alpha("#7B1FA2", 0.12),
      border: "#7B1FA2",
      text: "#6A1B9A",
    },
    dark: {
      bg: alpha("#BA68C8", 0.25),
      border: "#BA68C8",
      text: "#CE93D8",
    },
    label: "Salida Anticipada",
    icon: "⏰",
  },
  incomplete: {
    light: {
      bg: alpha("#757575", 0.08),
      border: "#757575",
      text: "#616161",
    },
    dark: {
      bg: alpha("#BDBDBD", 0.15),
      border: "#BDBDBD",
      text: "#E0E0E0",
    },
    label: "Incompleto",
    icon: "◐",
  },
  absent: {
    light: {
      bg: alpha("#D32F2F", 0.12),
      border: "#D32F2F",
      text: "#C62828",
    },
    dark: {
      bg: alpha("#EF5350", 0.25),
      border: "#EF5350",
      text: "#E57373",
    },
    label: "Ausente",
    icon: "✕",
  },
  justified: {
    light: {
      bg: alpha("#0288D1", 0.12),
      border: "#0288D1",
      text: "#01579B",
    },
    dark: {
      bg: alpha("#29B6F6", 0.25),
      border: "#29B6F6",
      text: "#4FC3F7",
    },
    label: "Justificado",
    icon: "📋",
  },
};

/* ---------------------------------------------
   Matrix Cell Component (Optimizado)
--------------------------------------------- */
const MatrixCell = memo(
  ({ shifts, isDark, onClick, rowIdx, colIdx, isWeekendDay }) => {
    const theme = useTheme();

    const getCellStyle = (status) => {
      const config = STATUS_CONFIG[status];
      if (!config) return {};

      const mode = isDark ? config.dark : config.light;
      return {
        bg: mode.bg,
        border: mode.border,
        text: mode.text,
      };
    };

    const hasMultipleShifts = shifts.length > 1;

    return (
      <Box
        className={`matrix-cell row-${rowIdx} col-${colIdx}`}
        sx={{
          borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 0.5,
          p: 0.75,
          cursor: shifts.length > 0 ? "pointer" : "default",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          bgcolor: isWeekendDay
            ? alpha(theme.palette.primary.main, 0.02)
            : "transparent",
          "&:hover": {
            bgcolor:
              shifts.length > 0
                ? alpha(theme.palette.primary.main, 0.08)
                : isWeekendDay
                  ? alpha(theme.palette.primary.main, 0.04)
                  : "transparent",
            transform: shifts.length > 0 ? "scale(1.02)" : "none",
          },
        }}
      >
        {shifts.length === 0 ? (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.2,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "text.disabled",
                fontSize: "0.7rem",
                fontWeight: 300,
              }}
            >
              —
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              gap: 0.5,
              width: "100%",
              position: "relative",
            }}
          >
            {shifts.map((shift, idx) => {
              const style = getCellStyle(shift.shiftStatus);
              const config = STATUS_CONFIG[shift.shiftStatus];

              return (
                <Tooltip
                  key={idx}
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="caption" fontWeight={600}>
                        {config?.label || shift.shiftStatus}
                      </Typography>
                      <Typography
                        variant="caption"
                        display="block"
                        sx={{ mt: 0.5 }}
                      >
                        {shift.scheduleName}
                      </Typography>
                    </Box>
                  }
                  placement="top"
                  arrow
                  enterDelay={300}
                >
                  <Box
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick(shift);
                    }}
                    sx={{
                      flex: 1,
                      height: hasMultipleShifts ? 16 : 20,
                      minWidth: hasMultipleShifts ? 20 : 28,
                      borderRadius: 1,
                      bgcolor: style.bg,
                      border: `1.5px solid ${style.border}`,
                      position: "relative",
                      overflow: "hidden",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "scale(1.15)",
                        //boxShadow: `0 4px 12px ${alpha(style.border, 0.3)}`,
                        zIndex: 2,
                        //bgcolor: alpha(style.border, 0.2),
                      },
                      // Shine effect
                     /* "&::before": {
                        content: '""',
                        position: "absolute",
                        top: 0,
                        left: "-100%",
                        width: "100%",
                        height: "100%",
                        background: `linear-gradient(90deg, transparent, ${alpha("#fff", 0.3)}, transparent)`,
                        transition: "left 0.5s",
                      },
                      "&:hover::before": {
                        left: "100%",
                      },*/
                    }}
                  />
                </Tooltip>
              );
            })}
            {/*hasMultipleShifts && (
              <Box
                sx={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  boxShadow: 1,
                }}
              >
                {shifts.length}
              </Box>
            )*/}
          </Box>
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
  setSelectedShift,
  currentMonth,
  onMonthChange,
  loadingMatrix,
  fadeKey,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
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

  /* ---------------- Handlers ---------------- */
  const handleShiftClick = useCallback(
    (shift) => {
      if (shift?.record) {
        const { record, ...rest } = shift;
        setSelectedShift({ ...record, ...rest });
      }
    },
    [setSelectedShift],
  );

  /** MONTH SELECTOR */
  const MonthSelector = ({ currentMonth, onMonthChange }) => {
    const theme = useTheme();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const buttonRef = useRef(null);

    const today = new Date();
    const isCurrentMonth = isSameMonth(currentMonth, today);
    const formattedDate = format(currentMonth, "MMMM yyyy", { locale: es });

    const handlePreviousMonth = () => {
      onMonthChange(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
      if (!isCurrentMonth) {
        onMonthChange(addMonths(currentMonth, 1));
      }
    };

    const handleMonthSelect = (month, year) => {
      const newDate = setYear(setMonth(currentMonth, month), year);
      onMonthChange(newDate);
      setPopoverOpen(false);
    };

    const currentYear = today.getFullYear();
    const years = [currentYear - 2, currentYear - 1, currentYear];

    const months = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const isMonthDisabled = (monthIndex, year) => {
      const monthDate = new Date(year, monthIndex, 1);
      return monthDate > today;
    };

    const isMonthSelected = (monthIndex, year) => {
      return isSameMonth(new Date(year, monthIndex, 1), currentMonth);
    };

    return (
      <>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Mes anterior">
            <IconButton
              onClick={handlePreviousMonth}
              size="small"
              sx={{
                width: 32,
                height: 32,
                bgcolor: "action.hover",
                "&:hover": { bgcolor: "action.selected" },
              }}
            >
              <ChevronLeft fontSize="small" />
            </IconButton>
          </Tooltip>

          <Button
            ref={buttonRef}
            onClick={() => setPopoverOpen(true)}
            size="small"
            variant="outlined"
            sx={{
              color: "text.primary",
              fontWeight: 600,
              minWidth: "auto",
              px: 2,
              py: 0.5,
              textTransform: "capitalize",
              borderColor: "divider",
              fontSize: "0.875rem",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "primary.main",
              },
            }}
          >
            {formattedDate}
          </Button>

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
                  width: 32,
                  height: 32,
                  bgcolor: isCurrentMonth
                    ? "action.disabledBackground"
                    : "action.hover",
                  "&:hover": { bgcolor: "action.selected" },
                  "&.Mui-disabled": {
                    bgcolor: "action.disabledBackground",
                  },
                }}
              >
                <ChevronRight fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Box>

        <Popover
          open={popoverOpen}
          anchorEl={buttonRef.current}
          onClose={() => setPopoverOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          slotProps={{
            paper: {
              sx: {
                borderRadius: 2,
                boxShadow: theme.shadows[8],
                overflow: "hidden",
              },
            },
          }}
        >
          <Box sx={{ width: 360, maxHeight: 500, overflow: "auto" }}>
            {years.map((year) => (
              <Box
                key={year}
                sx={{
                  borderBottom: year !== years[years.length - 1] ? 1 : 0,
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    py: 1.5,
                    px: 2,
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    fontWeight={700}
                    sx={{
                      color: "primary.main",
                      textAlign: "center",
                      fontSize: "0.95rem",
                      letterSpacing: 0.5,
                    }}
                  >
                    {year}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 1,
                    p: 2,
                  }}
                >
                  {months.map((monthName, index) => {
                    const disabled = isMonthDisabled(index, year);
                    const selected = isMonthSelected(index, year);

                    return (
                      <Button
                        key={`${year}-${index}`}
                        onClick={() =>
                          !disabled && handleMonthSelect(index, year)
                        }
                        disabled={disabled}
                        size="small"
                        sx={{
                          minWidth: "auto",
                          py: 1,
                          px: 1.5,
                          borderRadius: 1.5,
                          fontSize: "0.813rem",
                          fontWeight: selected ? 700 : 500,
                          color: selected
                            ? "primary.contrastText"
                            : disabled
                              ? "text.disabled"
                              : "text.primary",
                          bgcolor: selected ? "primary.main" : "transparent",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          "&:hover": {
                            bgcolor: selected
                              ? "primary.dark"
                              : alpha(theme.palette.primary.main, 0.12),
                            transform: !disabled ? "translateY(-2px)" : "none",
                            boxShadow:
                              !disabled && !selected
                                ? `0 4px 8px ${alpha(theme.palette.primary.main, 0.15)}`
                                : selected
                                  ? theme.shadows[4]
                                  : "none",
                          },
                          "&.Mui-disabled": {
                            bgcolor: "transparent",
                            color: "text.disabled",
                            opacity: 0.4,
                          },
                        }}
                      >
                        {monthName}
                      </Button>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Popover>
      </>
    );
  };

  MonthSelector.displayName = "MonthSelector";

  /* --------------- Skeleton Loader ---------------- */
  const MatrixSkeleton = () => (
    <Card elevation={0} sx={{ borderRadius: 2, width: "100%" }}>
      <CardContent>
        <Stack spacing={1.5}>
          {[...Array(7)].map((_, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <Skeleton
                variant="rectangular"
                width={NAME_COLUMN_WIDTH}
                height={ROW_HEIGHT}
                sx={{ borderRadius: 1 }}
              />
              {[...Array(10)].map((_, j) => (
                <Skeleton
                  key={j}
                  variant="rectangular"
                  width={COLUMN_WIDTH}
                  height={ROW_HEIGHT}
                  sx={{ borderRadius: 1 }}
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
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No hay datos disponibles
        </Typography>
        <Typography variant="body2" color="text.disabled">
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
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
          flexWrap: "wrap",
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
          backdropFilter: "blur(10px)",
        }}
      >
        {/* Legend */}
        <Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => {
              const mode = isDark ? config.dark : config.light;
              return (
                <Chip
                  key={key}
                  label={config.label}
                  size="small"
                  sx={{
                    bgcolor: mode.bg,
                    color: mode.text,
                    border: `1px solid ${mode.border}`,
                    fontWeight: 500,
                    fontSize: "0.75rem",
                    "& .MuiChip-label": {
                      px: 1.5,
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* Selector del mes */}
        <MonthSelector
          currentMonth={currentMonth}
          onMonthChange={onMonthChange}
        />
      </Paper>

      {/* Matrix Container */}
      {loadingMatrix ? (
        <MatrixSkeleton />
      ) : (
        <Fade in key={fadeKey} timeout={600}>
          <Paper
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              boxShadow: isDark ? 4 : 2,
              bgcolor: isDark
                ? alpha(theme.palette.background.paper, 0.8)
                : theme.palette.background.paper,
            }}
          >
            <Box
              className="matrix-container"
              sx={{
                maxHeight: 650,
                overflow: "auto",
                position: "relative",
                display: "grid",
                gridTemplateColumns: `${NAME_COLUMN_WIDTH}px repeat(${visibleDates.length}, ${COLUMN_WIDTH}px)`,
                gridTemplateRows: `${HEADER_HEIGHT}px repeat(${users.length}, ${ROW_HEIGHT}px)`,
                transform: "translateZ(0)",

                // Custom scrollbar
                "&::-webkit-scrollbar": {
                  width: 12,
                  height: 12,
                },
                "&::-webkit-scrollbar-track": {
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.05)",
                  borderRadius: 2,
                },
                "&::-webkit-scrollbar-thumb": {
                  bgcolor: isDark
                    ? "rgba(255,255,255,0.15)"
                    : "rgba(0,0,0,0.15)",
                  borderRadius: 2,
                  border: `3px solid ${isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)"}`,
                  "&:hover": {
                    bgcolor: isDark
                      ? "rgba(255,255,255,0.25)"
                      : "rgba(0,0,0,0.25)",
                  },
                },
                "&::-webkit-scrollbar-corner": {
                  bgcolor: "transparent",
                },

                // Hover effects
                ...Object.fromEntries(
                  visibleDates.map((_, colIdx) => [
                    `&:has(.col-${colIdx}:hover) .header-col-${colIdx}`,
                    {
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      boxShadow: `inset 0 -3px 0 ${theme.palette.primary.main}`,
                    },
                  ]),
                ),

                ...Object.fromEntries(
                  users.map((_, rowIdx) => [
                    `&:has(.row-${rowIdx}:hover) .user-row-${rowIdx}`,
                    {
                      color: "primary.main",
                      fontWeight: 600,
                    },
                  ]),
                ),
              }}
            >
              {/* Corner Cell */}
              <Box
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 40,
                  bgcolor: isDark
                    ? alpha(theme.palette.background.paper, 0.95)
                    : theme.palette.background.paper,
                  borderRight: `2px solid ${theme.palette.divider}`,
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  p: 1,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    zIndex: -1,
                    background: `linear-gradient(to top right, transparent calc(50% - 1px), ${theme.palette.divider}, transparent calc(50% + 1px))`,
                  },
                }}
              >
                <Typography
                  sx={{
                    alignSelf: "flex-end",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    color: "text.secondary",
                  }}
                >
                  Día
                </Typography>
                <Typography
                  sx={{
                    alignSelf: "flex-start",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    mb: 1,
                    ml: 1,
                    lineHeight: 0,
                    color: "text.secondary",
                  }}
                >
                  Usuario
                </Typography>
              </Box>

              {/* Date Headers */}
              {visibleDates.map((dateInfo, colIdx) => {
                const isDay = dateInfo.type === "day";
                const dateObj = isDay ? parseISO(dateInfo.key) : null;
                const isWeekendDay = isDay && isWeekend(dateObj);
                const dateStr = isDay
                  ? format(dateObj, "dd MMM", { locale: es })
                  : dateInfo.key;
                const dayOfWeek = isDay
                  ? format(dateObj, "EEE", { locale: es })
                  : null;

                return (
                  <Box
                    key={colIdx}
                    className={`header-col-${colIdx}`}
                    sx={{
                      position: "sticky",
                      top: 0,
                      zIndex: 20,
                      bgcolor: isWeekendDay
                        ? alpha(theme.palette.warning.main, 0.08)
                        : alpha(theme.palette.primary.main, 0.08),
                      color: theme.palette.text.primary,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRight: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      borderBottom: `2px solid ${theme.palette.divider}`,
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "default",
                    }}
                  >
                    {dayOfWeek && (
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.65rem",
                          opacity: 0.7,
                          textTransform: "capitalize",
                          fontWeight: isWeekendDay ? 600 : 400,
                          color: isWeekendDay ? "warning.main" : "inherit",
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
                  {/* User Name Cell */}
                  <Box
                    className={`user-row-${rowIdx}`}
                    sx={{
                      position: "sticky",
                      left: 0,
                      zIndex: 10,
                      bgcolor: isDark
                        ? alpha(theme.palette.background.paper, 0.95)
                        : theme.palette.background.paper,
                      px: 2,
                      display: "flex",
                      alignItems: "center",
                      borderRight: `2px solid ${theme.palette.divider}`,
                      borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}`,
                      transition: "all 0.2s ease",
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
                          transition: "all 0.2s ease",
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

                    const isWeekendDay =
                      dateInfo.type === "day" &&
                      isWeekend(parseISO(dateInfo.key));

                    return (
                      <MatrixCell
                        key={`${user.id}-${dateInfo.key}`}
                        shifts={shifts}
                        isDark={isDark}
                        onClick={handleShiftClick}
                        rowIdx={rowIdx}
                        colIdx={colIdx}
                        isWeekendDay={isWeekendDay}
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
