import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  memo,
  useEffect,
} from "react";
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
  Drawer,
  Divider,
} from "@mui/material";
import { ChevronLeft, ChevronRight, Close } from "@mui/icons-material";
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

/* ─────────────────────────────────────────────
   Layout constants
───────────────────────────────────────────── */
const D = { ROW_H: 42, COL_W: 85, NAME_W: 240, HEADER_H: 54 }; // desktop
const M = { ROW_H: 36, COL_W: 36, NAME_W: 108, HEADER_H: 44 }; // mobile
const OVERSCAN = 4; // extra rows rendered above/below viewport
const CONTAINER_HEIGHT = 620;

/* ─────────────────────────────────────────────
   STATUS CONFIG
───────────────────────────────────────────── */
const STATUS_CONFIG = {
  on_time: {
    light: { bg: alpha("#2E7D32", 0.12), border: "#2E7D32", text: "#1B5E20" },
    dark: { bg: alpha("#66BB6A", 0.25), border: "#66BB6A", text: "#A5D6A7" },
    label: "A Tiempo",
    icon: "✓",
    text: "AT",
  },
  late: {
    light: { bg: alpha("#ED6C02", 0.12), border: "#ED6C02", text: "#E65100" },
    dark: { bg: alpha("#FF9800", 0.25), border: "#FF9800", text: "#FFB74D" },
    label: "Tardanza",
    icon: "⏱",
    text: "T",
  },
  early_exit: {
    light: { bg: alpha("#7B1FA2", 0.12), border: "#7B1FA2", text: "#6A1B9A" },
    dark: { bg: alpha("#BA68C8", 0.25), border: "#BA68C8", text: "#CE93D8" },
    label: "Salida Anticipada",
    icon: "⏰",
    text: "SA",
  },
  incomplete: {
    light: { bg: alpha("#757575", 0.08), border: "#757575", text: "#616161" },
    dark: { bg: alpha("#BDBDBD", 0.15), border: "#BDBDBD", text: "#E0E0E0" },
    label: "Incompleto",
    icon: "◐",
    text: "I",
  },
  absent: {
    light: { bg: alpha("#D32F2F", 0.12), border: "#D32F2F", text: "#C62828" },
    dark: { bg: alpha("#EF5350", 0.25), border: "#EF5350", text: "#E57373" },
    label: "Ausente",
    icon: "✕",
    text: "A",
  },
  justified: {
    light: { bg: alpha("#0288D1", 0.12), border: "#0288D1", text: "#01579B" },
    dark: { bg: alpha("#29B6F6", 0.25), border: "#29B6F6", text: "#4FC3F7" },
    label: "Justificado",
    icon: "📋",
    text: "J",
  },
};

/* ─────────────────────────────────────────────
   Pre-computed style maps
   Built ONCE at module load — zero work per render
───────────────────────────────────────────── */
const BADGE_STYLES = { light: {}, dark: {} };
const DOT_COLORS = { light: {}, dark: {} }; // for mobile dots

Object.entries(STATUS_CONFIG).forEach(([key, cfg]) => {
  BADGE_STYLES.light[key] = {
    wrapper: {
      backgroundColor: cfg.light.bg,
      border: `1.5px solid ${cfg.light.border}`,
    },
    text: { color: cfg.light.text },
  };
  BADGE_STYLES.dark[key] = {
    wrapper: {
      backgroundColor: cfg.dark.bg,
      border: `1.5px solid ${cfg.dark.border}`,
    },
    text: { color: cfg.dark.text },
  };
  DOT_COLORS.light[key] = cfg.light.border;
  DOT_COLORS.dark[key] = cfg.dark.border;
});

/* ─────────────────────────────────────────────
   Static cell styles (plain objects, not sx)
───────────────────────────────────────────── */
const CELL_BASE = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  gap: 3,
  padding: "0 4px",
  cursor: "pointer",
  transition: "background-color 0.15s",
};

/* ─────────────────────────────────────────────
   useVirtualRows — custom virtualization hook
───────────────────────────────────────────── */
function useVirtualRows({ count, rowHeight, containerHeight, overscan = 4 }) {
  const [scrollTop, setScrollTop] = useState(0);

  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const end = Math.min(
      count - 1,
      Math.ceil((scrollTop + containerHeight) / rowHeight) + overscan,
    );
    return { start, end };
  }, [scrollTop, count, rowHeight, containerHeight, overscan]);

  const onScroll = useCallback((e) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const totalHeight = count * rowHeight;
  const paddingTop = range.start * rowHeight;
  const paddingBot = Math.max(0, totalHeight - (range.end + 1) * rowHeight);

  return { range, onScroll, paddingTop, paddingBot, totalHeight };
}

/* ─────────────────────────────────────────────
   Desktop Badge Cell (no Tooltip — moved to click)
   Uses plain div + pre-computed styles → zero MUI overhead
───────────────────────────────────────────── */
const DesktopBadge = memo(({ shift, isDark, onInfo }) => {
  const styles = isDark ? BADGE_STYLES.dark : BADGE_STYLES.light;
  const s = styles[shift.shiftStatus];
  const cfg = STATUS_CONFIG[shift.shiftStatus];
  if (!s) return null;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onInfo(shift);
      }}
      style={{
        ...s.wrapper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        minWidth: 24,
        height: 20,
        borderRadius: 4,
        cursor: "pointer",
        transition: "transform 0.15s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "scale(1.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "scale(1)";
      }}
    >
      <span
        style={{
          ...s.text,
          fontSize: "0.72rem",
          fontWeight: 700,
          lineHeight: 1,
        }}
      >
        {cfg?.text ?? "?"}
      </span>
    </div>
  );
});
DesktopBadge.displayName = "DesktopBadge";

/* ─────────────────────────────────────────────
   Mobile Dot Cell — ultra-lightweight
   Renders colored circles only, no text
───────────────────────────────────────────── */
const MobileDot = memo(({ shift, isDark, onInfo }) => {
  const color = isDark
    ? DOT_COLORS.dark[shift.shiftStatus]
    : DOT_COLORS.light[shift.shiftStatus];

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onInfo(shift);
      }}
      style={{
        width: 10,
        height: 10,
        borderRadius: "50%",
        backgroundColor: color || "#999",
        flexShrink: 0,
        cursor: "pointer",
      }}
    />
  );
});
MobileDot.displayName = "MobileDot";

/* ─────────────────────────────────────────────
   MatrixCell — pure div, no MUI, no Tooltip
───────────────────────────────────────────── */
const MatrixCell = memo(
  ({
    shifts,
    isDark,
    onInfo,
    isWeekendDay,
    isMobile,
    borderColor,
    weekendBg,
    hoverBg,
  }) => {
    const [hovered, setHovered] = useState(false);

    const bgStyle = isWeekendDay ? weekendBg : "transparent";

    return (
      <div
        style={{
          ...CELL_BASE,
          borderRight: `1px solid ${borderColor}`,
          borderBottom: `1px solid ${borderColor}`,
          cursor: shifts.length > 0 ? "pointer" : "default",
          backgroundColor: hovered && shifts.length > 0 ? hoverBg : bgStyle,
          flexWrap: "wrap",
          gap: isMobile ? 2 : 3,
          padding: isMobile ? "0 3px" : "0 5px",
        }}
        onMouseEnter={() => shifts.length > 0 && setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {shifts.length === 0 ? (
          <span style={{ color: "#bbb", fontSize: "0.65rem", fontWeight: 300 }}>
            —
          </span>
        ) : isMobile ? (
          shifts.map((shift, i) => (
            <MobileDot key={i} shift={shift} isDark={isDark} onInfo={onInfo} />
          ))
        ) : (
          shifts.map((shift, i) => (
            <DesktopBadge
              key={i}
              shift={shift}
              isDark={isDark}
              onInfo={onInfo}
            />
          ))
        )}
      </div>
    );
  },
  (prev, next) =>
    prev.shifts === next.shifts &&
    prev.isDark === next.isDark &&
    prev.isWeekendDay === next.isWeekendDay,
);
MatrixCell.displayName = "MatrixCell";

/* ─────────────────────────────────────────────
   ShiftInfoPanel — shown on click (replaces Tooltip)
   Desktop: Popover  |  Mobile: bottom Drawer
───────────────────────────────────────────── */
// const ShiftInfoPanel = memo(({ info, onClose, isMobile, isDark }) => {
//   if (!info) return null;

//   const { shift, anchorEl } = info;
//   const cfg = STATUS_CONFIG[shift?.shiftStatus];
//   const styles = isDark ? BADGE_STYLES.dark : BADGE_STYLES.light;
//   const s = styles[shift?.shiftStatus];

//   const content = shift ? (
//     <Box sx={{ p: 2, minWidth: 200 }}>
//       <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
//         <Typography variant="subtitle2" fontWeight={700}>{shift.scheduleName}</Typography>
//         <IconButton size="small" onClick={onClose} sx={{ p: 0.5 }}><Close fontSize="small" /></IconButton>
//       </Stack>
//       <Divider sx={{ mb: 1.5 }} />
//       <Stack spacing={0.75}>
//         <Stack direction="row" alignItems="center" spacing={1}>
//           <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: s?.wrapper?.border ?? "grey.400" }} />
//           <Typography variant="body2" fontWeight={600}>{cfg?.label ?? shift.shiftStatus}</Typography>
//         </Stack>
//         {shift.checkIn  && <Typography variant="caption" color="text.secondary">Entrada: <strong>{shift.checkIn}</strong></Typography>}
//         {shift.checkOut && <Typography variant="caption" color="text.secondary">Salida: <strong>{shift.checkOut}</strong></Typography>}
//         {shift.date     && <Typography variant="caption" color="text.secondary">Fecha: <strong>{shift.date}</strong></Typography>}
//       </Stack>
//     </Box>
//   ) : null;

//   if (isMobile) {
//     return (
//       <Drawer
//         anchor="bottom"
//         open={Boolean(info)}
//         onClose={onClose}
//         PaperProps={{ sx: { borderTopLeftRadius: 16, borderTopRightRadius: 16, pb: "env(safe-area-inset-bottom)" } }}
//       >
//         {content}
//       </Drawer>
//     );
//   }

//   return (
//     <Popover
//       open={Boolean(info)}
//       anchorEl={anchorEl}
//       onClose={onClose}
//       anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
//       transformOrigin={{ vertical: "top", horizontal: "center" }}
//       disableScrollLock
//       slotProps={{ paper: { elevation: 4, sx: { borderRadius: 2 } } }}
//     >
//       {content}
//     </Popover>
//   );
// });
// ShiftInfoPanel.displayName = "ShiftInfoPanel";

/* ─────────────────────────────────────────────
   Mobile Legend Drawer — on-demand only
───────────────────────────────────────────── */
const MobileLegendDrawer = memo(({ open, onClose, isDark }) => (
  <Drawer
    anchor="bottom"
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        pb: "env(safe-area-inset-bottom)",
      },
    }}
  >
    <Box sx={{ p: 2.5 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          Leyenda
        </Typography>
        <IconButton size="small" onClick={onClose}>
          <Close fontSize="small" />
        </IconButton>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Stack spacing={1.25}>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const mode = isDark ? cfg.dark : cfg.light;
          return (
            <Stack key={key} direction="row" alignItems="center" spacing={1.5}>
              <Box
                sx={{
                  width: 28,
                  height: 20,
                  borderRadius: 1,
                  bgcolor: mode.bg,
                  border: `1.5px solid ${mode.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{ fontSize: "0.7rem", fontWeight: 700, color: mode.text }}
                >
                  {cfg.text}
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: mode.border,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2">{cfg.label}</Typography>
            </Stack>
          );
        })}
      </Stack>
    </Box>
  </Drawer>
));
MobileLegendDrawer.displayName = "MobileLegendDrawer";

/* ─────────────────────────────────────────────
   MonthSelector
───────────────────────────────────────────── */
const MonthSelector = memo(({ currentMonth, onMonthChange, error }) => {
  const theme = useTheme();
  const [popoverOpen, setPopoverOpen] = useState(false);
  const buttonRef = useRef(null);

  const today = new Date();
  const isCurrentMonth = isSameMonth(currentMonth, today);
  const formattedDate = format(currentMonth, "MMMM yyyy", { locale: es });

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
  const years = [
    today.getFullYear() - 2,
    today.getFullYear() - 1,
    today.getFullYear(),
  ];

  return (
    <>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Tooltip title="Mes anterior">
          <IconButton
            onClick={() => !error && onMonthChange(subMonths(currentMonth, 1))}
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
            fontWeight: 600,
            minWidth: "auto",
            px: 2,
            py: 0.5,
            textTransform: "capitalize",
            borderColor: "divider",
            color: "text.primary",
            fontSize: "0.8rem",
            "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" },
          }}
        >
          {formattedDate}
        </Button>

        <Tooltip
          title={isCurrentMonth ? "Ya estás en el mes actual" : "Mes siguiente"}
        >
          <span>
            <IconButton
              onClick={() =>
                !isCurrentMonth &&
                !error &&
                onMonthChange(addMonths(currentMonth, 1))
              }
              disabled={isCurrentMonth}
              size="small"
              sx={{
                width: 32,
                height: 32,
                bgcolor: isCurrentMonth
                  ? "action.disabledBackground"
                  : "action.hover",
                "&:hover": { bgcolor: "action.selected" },
                "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
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
        disableScrollLock
        slotProps={{
          paper: { sx: { borderRadius: 2, boxShadow: theme.shadows[8] } },
        }}
      >
        <Box sx={{ width: 340, maxHeight: 480, overflow: "auto" }}>
          {years.map((year, yi) => (
            <Box
              key={year}
              sx={{
                borderBottom: yi < years.length - 1 ? 1 : 0,
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
                }}
              >
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="primary"
                  textAlign="center"
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
                {months.map((m, idx) => {
                  const disabled = new Date(year, idx, 1) > today;
                  const selected = isSameMonth(
                    new Date(year, idx, 1),
                    currentMonth,
                  );
                  return (
                    <Button
                      key={idx}
                      onClick={() => {
                        if (!disabled) {
                          onMonthChange(
                            setYear(setMonth(currentMonth, idx), year),
                          );
                          setPopoverOpen(false);
                        }
                      }}
                      disabled={disabled}
                      size="small"
                      sx={{
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
                        "&:hover": {
                          bgcolor: selected
                            ? "primary.dark"
                            : alpha(theme.palette.primary.main, 0.1),
                          transform: !disabled ? "translateY(-1px)" : "none",
                        },
                        "&.Mui-disabled": { opacity: 0.4 },
                      }}
                    >
                      {m}
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
});
MonthSelector.displayName = "MonthSelector";

/* ─────────────────────────────────────────────
   MatrixSkeleton
───────────────────────────────────────────── */
const MatrixSkeleton = memo(({ isMobile }) => {
  const cols = isMobile ? 8 : 10;
  const nameW = isMobile ? M.NAME_W : D.NAME_W;
  const rowH = isMobile ? M.ROW_H : D.ROW_H;
  const colW = isMobile ? M.COL_W : D.COL_W;

  return (
    <Card elevation={0} sx={{ borderRadius: 2, width: "100%" }}>
      <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack spacing={1}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Box key={i} sx={{ display: "flex", gap: 1 }}>
              <Skeleton
                variant="rectangular"
                width={nameW}
                height={rowH}
                sx={{ borderRadius: 1, flexShrink: 0 }}
              />
              {Array.from({ length: cols }).map((_, j) => (
                <Skeleton
                  key={j}
                  variant="rectangular"
                  width={colW}
                  height={rowH}
                  sx={{ borderRadius: 1, flexShrink: 0 }}
                />
              ))}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
});
MatrixSkeleton.displayName = "MatrixSkeleton";

/* ─────────────────────────────────────────────
   VirtualMatrix — the main virtualized grid
───────────────────────────────────────────── */
const VirtualMatrix = memo(
  ({ users, visibleDates, matrix, isDark, isMobile, onShiftInfo }) => {
    const theme = useTheme();
    const C = isMobile ? M : D;
    const rowH = C.ROW_H;
    const colW = C.COL_W;
    const nameW = C.NAME_W;
    const headerH = C.HEADER_H;

    // Pre-compute static colors (only re-derived when theme changes)
    const colors = useMemo(
      () => ({
        divider: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        dividerStrong: theme.palette.divider,
        headerBg: alpha(theme.palette.primary.main, 0.08),
        weekendHBg: alpha(theme.palette.warning.main, 0.08),
        stickyBg: isDark
          ? alpha(theme.palette.background.paper, 0.96)
          : theme.palette.background.paper,
        primaryHover: alpha(theme.palette.primary.main, 0.08),
        weekendRowBg: alpha(theme.palette.primary.main, 0.025),
      }),
      [isDark, theme],
    );

    // Row virtualization
    const { range, onScroll, paddingTop, paddingBot } = useVirtualRows({
      count: users.length,
      rowHeight: rowH,
      containerHeight: CONTAINER_HEIGHT,
      overscan: OVERSCAN,
    });

    const totalWidth = nameW + visibleDates.length * colW;
    const colTemplate = `${nameW}px repeat(${visibleDates.length}, ${colW}px)`;

    // Row style — shared object template per row (avoids object creation in loop)
    const rowStyle = useMemo(
      () => ({
        display: "grid",
        gridTemplateColumns: colTemplate,
        height: rowH,
        minWidth: totalWidth,
      }),
      [colTemplate, rowH, totalWidth],
    );

    const headerStyle = useMemo(
      () => ({
        display: "grid",
        gridTemplateColumns: colTemplate,
        height: headerH,
        minWidth: totalWidth,
        position: "sticky",
        top: 0,
        zIndex: 20,
      }),
      [colTemplate, headerH, totalWidth],
    );

    return (
      <Box
        onScroll={onScroll}
        sx={{
          maxHeight: CONTAINER_HEIGHT,
          overflow: "auto",
          position: "relative",
          transform: "translateZ(0)", // GPU compositing layer
          willChange: "scroll-position",
          // Custom scrollbar
          "&::-webkit-scrollbar": { width: 10, height: 10 },
          "&::-webkit-scrollbar-track": {
            bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
            borderRadius: 2,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
            borderRadius: 2,
            border: `2px solid ${isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.8)"}`,
            "&:hover": {
              bgcolor: isDark ? "rgba(255,255,255,0.24)" : "rgba(0,0,0,0.24)",
            },
          },
          "&::-webkit-scrollbar-corner": { bgcolor: "transparent" },
        }}
      >
        {/* ── Header row ── */}
        <div style={headerStyle}>
          {/* Corner */}
          <div
            style={{
              position: "sticky",
              left: 0,
              zIndex: 30,
              backgroundColor: colors.stickyBg,
              borderRight: `2px solid ${colors.dividerStrong}`,
              borderBottom: `2px solid ${colors.dividerStrong}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: "4px 8px",
            }}
          >
            <span
              style={{
                alignSelf: "flex-end",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: theme.palette.text.secondary,
              }}
            >
              Día
            </span>
            <span
              style={{
                alignSelf: "flex-start",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: theme.palette.text.secondary,
                marginBottom: 6,
                marginLeft: 4,
              }}
            >
              Usuario
            </span>
          </div>

          {/* Date headers */}
          {visibleDates.map((dateInfo, ci) => {
            const isDay = dateInfo.type === "day";
            const dateObj = isDay ? parseISO(dateInfo.key) : null;
            const isWknd = isDay && isWeekend(dateObj);
            const dateStr = isDay
              ? format(dateObj, isMobile ? "dd" : "dd MMM", { locale: es })
              : dateInfo.key;
            const dayOfWeek = isDay
              ? format(dateObj, "EEE", { locale: es })
              : null;

            return (
              <div
                key={ci}
                style={{
                  backgroundColor: isWknd ? colors.weekendHBg : colors.headerBg,
                  borderRight: `1px solid ${colors.divider}`,
                  borderBottom: `2px solid ${colors.dividerStrong}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {dayOfWeek && !isMobile && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      opacity: 0.65,
                      textTransform: "capitalize",
                      fontWeight: isWknd ? 600 : 400,
                      color: isWknd
                        ? theme.palette.warning.main
                        : theme.palette.text.primary,
                    }}
                  >
                    {dayOfWeek}
                  </span>
                )}
                {dayOfWeek && isMobile && (
                  <span
                    style={{
                      fontSize: "0.55rem",
                      opacity: 0.65,
                      textTransform: "capitalize",
                      color: isWknd
                        ? theme.palette.warning.main
                        : theme.palette.text.secondary,
                    }}
                  >
                    {format(dateObj, "EEEEE", { locale: es })}{" "}
                    {/* single-letter day */}
                  </span>
                )}
                <span
                  style={{
                    fontSize: isMobile ? "0.68rem" : "0.78rem",
                    fontWeight: 600,
                    textTransform: "capitalize",
                    color: theme.palette.text.primary,
                  }}
                >
                  {dateStr}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Body with row virtualization ── */}
        <div style={{ minWidth: totalWidth }}>
          {/* Spacer top */}
          {paddingTop > 0 && <div style={{ height: paddingTop }} />}

          {/* Visible rows only */}
          {users.slice(range.start, range.end + 1).map((user, localIdx) => {
            const rowIdx = range.start + localIdx;
            return (
              <div key={user.id} style={rowStyle}>
                {/* Name cell */}
                <div
                  style={{
                    position: "sticky",
                    left: 0,
                    zIndex: 10,
                    backgroundColor: colors.stickyBg,
                    display: "flex",
                    alignItems: "center",
                    paddingLeft: isMobile ? 8 : 16,
                    paddingRight: isMobile ? 4 : 12,
                    borderRight: `2px solid ${colors.dividerStrong}`,
                    borderBottom: `1px solid ${colors.divider}`,
                    overflow: "hidden",
                  }}
                >
                  <Tooltip
                    title={user.fullName}
                    placement="right"
                    enterDelay={600}
                    disableFocusListener
                    disableTouchListener={isMobile}
                  >
                    <span
                      style={{
                        fontSize: isMobile ? "0.72rem" : "0.875rem",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: theme.palette.text.primary,
                        width: "100%",
                      }}
                    >
                      {isMobile
                        ? (user.shortName ?? user.fullName.split(" ")[0])
                        : user.fullName}
                    </span>
                  </Tooltip>
                </div>

                {/* Data cells */}
                {visibleDates.map((dateInfo, ci) => {
                  const shifts =
                    dateInfo.type === "day"
                      ? (matrix[user.id]?.[dateInfo.key] ?? [])
                      : dateInfo.values.flatMap(
                          (d) => matrix[user.id]?.[d] ?? [],
                        );

                  const isWknd =
                    dateInfo.type === "day" &&
                    isWeekend(parseISO(dateInfo.key));

                  return (
                    <MatrixCell
                      key={`${user.id}-${dateInfo.key}`}
                      shifts={shifts}
                      isDark={isDark}
                      isWeekendDay={isWknd}
                      isMobile={isMobile}
                      onInfo={(shift) => onShiftInfo(shift)}
                      borderColor={colors.divider}
                      weekendBg={colors.weekendRowBg}
                      hoverBg={colors.primaryHover}
                    />
                  );
                })}
              </div>
            );
          })}

          {/* Spacer bottom */}
          {paddingBot > 0 && <div style={{ height: paddingBot }} />}
        </div>
      </Box>
    );
  },
);
VirtualMatrix.displayName = "VirtualMatrix";

/* ─────────────────────────────────────────────
   Main Component
───────────────────────────────────────────── */
const TimelineMatrix = ({
  users = [],
  dates = [],
  matrix = {},
  granularity = "day",
  setSelectedShift,
  currentMonth,
  onMonthChange,
  loadingMatrix,
  isFromCache,
  fadeKey,
  error,
  isMobile,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [shiftInfo, setShiftInfo] = useState(null); // { shift, anchorEl }
  const [legendOpen, setLegendOpen] = useState(false);

  const showSkeleton = loadingMatrix && !isFromCache;
  const showEmpty = !loadingMatrix && (!users?.length || !dates?.length);

  /* Process visible dates */
  const visibleDates = useMemo(() => {
    if (!dates?.length) return [];
    return dates.map((d) => ({ key: d, type: "day" }));
    // Week grouping can be added here if granularity === "week"
  }, [dates]);

  /* Handle shift click — single entry point */
  const handleShiftInfo = useCallback(
    (shift) => {
      if (shift?.record) {
        const { record, ...rest } = shift;
        setSelectedShift?.({ ...record, ...rest });
      }
      setShiftInfo({ shift });
    },
    [setSelectedShift],
  );

  //const handleCloseInfo = useCallback(() => setShiftInfo(null), []);

  /* ── Skeleton ── */
  if (showSkeleton) return <MatrixSkeleton isMobile={isMobile} />;

  /* ── Error ── */
  if (error) {
    return (
      <Paper sx={{ p: 6, textAlign: "center", borderRadius: 2 }}>
        <Typography color="error">Error al cargar datos</Typography>
      </Paper>
    );
  }

  /* ── Empty ── */
  if (showEmpty) {
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

  /* ── Main render ── */
  return (
    <>
      {/* Controls header */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2 },
          mb: 0,
          borderRadius: 2,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          display: "flex",
          alignItems: "center",
          //justifyContent: { xs: "center", sm: "space-between" },
          gap: 1,
          flexWrap: "wrap",
          bgcolor: isDark
            ? alpha(theme.palette.background.paper, 0.6)
            : theme.palette.background.paper,
        }}
      >
        {/* Desktop: inline legend chips */}
        {!isMobile && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
              const mode = isDark ? cfg.dark : cfg.light;
              return (
                <Chip
                  key={key}
                  size="small"
                  label={`${cfg.text}: ${cfg.label}`}
                  sx={{
                    bgcolor: mode.bg,
                    color: mode.text,
                    border: `1px solid ${mode.border}`,
                    fontWeight: 500,
                    fontSize: "0.72rem",
                    "& .MuiChip-label": { px: 1.25 },
                  }}
                />
              );
            })}
          </Stack>
        )}

        {/* Mobile: compact legend trigger */}
        {isMobile && (
          <Button
            size="small"
            variant="outlined"
            onClick={() => setLegendOpen(true)}
            sx={{
              fontSize: "0.75rem",
              textTransform: "none",
              borderRadius: 1.5,
              px: 1,
              py: 0.5,
            }}
          >
            Ver leyenda
          </Button>
        )}

        <MonthSelector
          currentMonth={currentMonth}
          onMonthChange={onMonthChange}
          error={error}
        />
      </Paper>

      {/* Matrix */}
      <Fade in key={fadeKey} timeout={400}>
        <Paper
          sx={{
            borderRadius: 2,
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
            overflow: "hidden",
            boxShadow: isDark ? 4 : 2,
            bgcolor: isDark
              ? alpha(theme.palette.background.paper, 0.8)
              : theme.palette.background.paper,
          }}
        >
          <VirtualMatrix
            users={users}
            visibleDates={visibleDates}
            matrix={matrix}
            isDark={isDark}
            isMobile={isMobile}
            onShiftInfo={handleShiftInfo}
          />
        </Paper>
      </Fade>

      {/* Shift info panel (replaces Tooltip) */}
      {/* <ShiftInfoPanel
        info={shiftInfo}
        onClose={handleCloseInfo}
        isMobile={isMobile}
        isDark={isDark}
      /> */}

      {/* Mobile legend drawer */}
      {isMobile && (
        <MobileLegendDrawer
          open={legendOpen}
          onClose={() => setLegendOpen(false)}
          isDark={isDark}
        />
      )}
    </>
  );
};

export default memo(TimelineMatrix);
