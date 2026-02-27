import React, { useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  useTheme,
  Box,
  Typography,
  TableSortLabel,
  alpha,
  Stack,
  Collapse,
  useMediaQuery,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  MoreVert as MoreVertIcon,
  Inbox as InboxIcon,
  EditNote as EditNoteIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  EventAvailable as EventAvailableIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import ActionCell from "./ActionCell";
import { format, parse, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import JustificationDrawer from "./JustificationDrawer";
import {
  updateJustification,
  updateJustificationStatus,
} from "../../services/justificationService";

// ─── Helpers fuera del componente (no se recrean) ────────────────────────────

const STATUS_MAP = {
  approved: { label: "Aprobado", colorKey: "success" },
  pending: { label: "Pendiente", colorKey: "warning" },
  rejected: { label: "Rechazado", colorKey: "error" },
};

const COLUMNS = [
  {
    id: "userId",
    label: "Usuario",
    sortable: true,
    minWidth: 200,
    align: "left",
  },
  {
    id: "date",
    label: "Fecha",
    sortable: true,
    minWidth: 140,
    align: "center",
  },
  {
    id: "scheduleId",
    label: "Horario",
    sortable: false,
    minWidth: 160,
    align: "center",
  },
  {
    id: "reason",
    label: "Motivo",
    sortable: false,
    minWidth: 220,
    align: "left",
  },
  {
    id: "approvedBy",
    label: "Aprobado por",
    sortable: false,
    minWidth: 180,
    align: "left",
  },
  {
    id: "status",
    label: "Estado",
    sortable: true,
    minWidth: 130,
    align: "center",
  },
  {
    id: "actions",
    label: "Acciones",
    sortable: false,
    minWidth: 100,
    align: "center",
  },
];

const getFullName = (user) => {
  if (!user) return "—";
  return (
    [user.name, user.firstSurname, user.secondSurname]
      .filter(Boolean)
      .join(" ") || "—"
  );
};

const getInitials = (user) => {
  if (!user) return "?";
  return (
    ((user.name?.[0] ?? "") + (user.firstSurname?.[0] ?? "")).toUpperCase() ||
    "?"
  );
};

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  return format(parse(dateStr, "yyyy-MM-dd", new Date()), "dd/MM/yyyy", {
    locale: es,
  });
};

const formatUpdatedAt = (isoStr) => {
  if (!isoStr) return "—";
  try {
    return format(parseISO(isoStr), "dd/MM/yyyy", { locale: es });
  } catch {
    return "—";
  }
};

const descendingComparator = (a, b, orderBy) => {
  if (orderBy === "userId")
    return getFullName(b.userId).localeCompare(getFullName(a.userId));
  if (orderBy === "date") return new Date(b.date) - new Date(a.date);
  const av = a[orderBy],
    bv = b[orderBy];
  if (bv == null) return -1;
  if (av == null) return 1;
  if (typeof av === "string") return bv.localeCompare(av);
  return bv < av ? -1 : bv > av ? 1 : 0;
};

// ─── Sub-componentes ──────────────────────────────────────────────────────────

/** Chip de estado reutilizable */
const StatusChip = ({ status }) => {
  const theme = useTheme();
  const config = STATUS_MAP[status] ?? STATUS_MAP.pending;
  const color = theme.palette[config.colorKey].main;
  return (
    <Chip
      label={config.label}
      size="small"
      sx={{
        fontWeight: 700,
        fontSize: "0.7rem",
        letterSpacing: 0.3,
        height: 24,
        bgcolor: alpha(color, 0.12),
        color,
        border: `1px solid ${alpha(color, 0.35)}`,
        borderRadius: 1,
      }}
    />
  );
};

/** Avatar con iniciales */
const UserAvatar = ({ user }) => {
  const theme = useTheme();
  return (
    <Avatar
      sx={{
        width: 34,
        height: 34,
        bgcolor: alpha(theme.palette.primary.main, 0.12),
        color: theme.palette.primary.main,
        fontWeight: 700,
        fontSize: "0.78rem",
      }}
    >
      {getInitials(user)}
    </Avatar>
  );
};

/** Fila de detalle con icono + label + valor */
const DetailRow = ({ icon: Icon, label, value }) => {
  const theme = useTheme();
  return (
    <Stack direction="row" spacing={1} alignItems="flex-start">
      <Icon
        sx={{
          fontSize: 15,
          color: theme.palette.text.disabled,
          mt: "2px",
          flexShrink: 0,
        }}
      />
      <Typography
        variant="caption"
        color="text.secondary"
        fontWeight={700}
        sx={{ minWidth: 110 }}
      >
        {label}
      </Typography>
      <Typography variant="caption" color="text.primary">
        {value || "—"}
      </Typography>
    </Stack>
  );
};

// ─── Componente principal ─────────────────────────────────────────────────────

const JustificationTable = ({
  justifications = [],
  onRefresh,
  schedules,
  users,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [orderBy, setOrderBy] = useState("userId");
  const [order, setOrder] = useState("desc");
  const [openRowId, setOpenRowId] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedJustification, setSelectedJustification] = useState(null);
  const [drawer, setDrawer] = useState({ open: false, mode: "create" });

  // ── Handlers memorizados ──────────────────────────────────────────────────

  const openDrawer = useCallback((mode) => setDrawer({ open: true, mode }), []);
  const closeDrawer = useCallback(
    () => setDrawer((p) => ({ ...p, open: false })),
    [],
  );

  const handleRowToggle = useCallback((id) => {
    setOpenRowId((prev) => (prev === id ? null : id));
  }, []);

  const handleMenuOpen = useCallback((e, justification) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setSelectedJustification(justification);
  }, []);

  const handleMenuClose = useCallback(() => setAnchorEl(null), []);

  const handleRequestSort = useCallback(
    (property) => {
      setOrder((prev) =>
        orderBy === property && prev === "asc" ? "desc" : "asc",
      );
      setOrderBy(property);
    },
    [orderBy],
  );

  const handleSubmit = useCallback(
    async (payload, files) => {
      if (drawer.mode === "edit") {
        await updateJustification(selectedJustification._id, payload, files);
      } else if (drawer.mode === "approve" || drawer.mode === "reject") {
        await updateJustificationStatus(selectedJustification._id, payload);
      }
      onRefresh();
    },
    [drawer.mode, selectedJustification, onRefresh],
  );

  // ── Datos ordenados ───────────────────────────────────────────────────────

  const sortedJustifications = useMemo(() => {
    const comparator =
      order === "desc"
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
    return [...justifications].sort(comparator);
  }, [justifications, order, orderBy]);

  // ── Ítems del menú mobile (memoizados por justificación seleccionada) ──────

  const menuItems = useMemo(() => {
    const items = [];
    if (!selectedJustification) return items;

    if (selectedJustification.status === "pending") {
      items.push(
        <MenuItem
          key="edit"
          onClick={() => {
            handleMenuClose();
            openDrawer("edit");
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>,
        <Divider key="d1" />,
        <MenuItem
          key="approve"
          onClick={() => {
            handleMenuClose();
            openDrawer("approve");
          }}
        >
          <ListItemIcon>
            <CheckCircleOutlineIcon fontSize="small" color="success" />
          </ListItemIcon>
          <ListItemText>Aprobar</ListItemText>
        </MenuItem>,
        <Divider key="d2" />,
        <MenuItem
          key="reject"
          onClick={() => {
            handleMenuClose();
            openDrawer("reject");
          }}
        >
          <ListItemIcon>
            <CancelOutlinedIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Rechazar</ListItemText>
        </MenuItem>,
      );
    }

    if (selectedJustification.files?.length > 0) {
      items.push(
        <Divider key="d3" />,
        <MenuItem
          key="preview"
          onClick={() => {
            handleMenuClose();
            openDrawer("preview");
          }}
        >
          <ListItemIcon>
            <AttachFileIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText>
            Ver Archivos ({selectedJustification.files.length})
          </ListItemText>
        </MenuItem>,
      );
    }

    return items;
  }, [selectedJustification, handleMenuClose, openDrawer]);

  // ── Estado vacío ──────────────────────────────────────────────────────────

  if (justifications.length === 0 && !loading) {
    return (
      <Paper
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 2,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <InboxIcon
          sx={{ fontSize: 56, color: theme.palette.text.disabled, mb: 1.5 }}
        />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Sin registros de justificación
        </Typography>
        <Typography variant="body2" color="text.disabled">
          Los registros aparecerán aquí una vez creados
        </Typography>
      </Paper>
    );
  }

  // ── Drawer compartido (mobile + desktop) ──────────────────────────────────

  const sharedDrawer = (
    <JustificationDrawer
      open={drawer.open}
      onClose={closeDrawer}
      mode={drawer.mode}
      justification={selectedJustification}
      schedules={schedules ?? []}
      users={[]}
      onSubmit={handleSubmit}
    />
  );

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA MOBILE
  // ─────────────────────────────────────────────────────────────────────────

  if (isMobile) {
    return (
      <>
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 2, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.07),
                  "& th": {
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    borderBottom: `2px solid ${theme.palette.divider}`,
                    py: 1.5,
                  },
                }}
              >
                <TableCell sx={{ width: 40 }} />
                <TableCell>Justificación</TableCell>
                <TableCell align="right" sx={{ width: 44 }} />
              </TableRow>
            </TableHead>

            <TableBody>
              {sortedJustifications.map((j, index) => {
                const isOpen = openRowId === j._id;
                const canEdit = j.status === "pending";
                const hasMenu = canEdit || j.files?.length > 0;

                return (
                  <React.Fragment key={j._id}>
                    {/* Fila principal */}
                    <TableRow
                      sx={{
                        bgcolor:
                          index % 2 !== 0
                            ? alpha(theme.palette.grey[500], 0.03)
                            : "transparent",
                        "& td": { borderBottom: isOpen ? "none" : undefined },
                      }}
                    >
                      <TableCell sx={{ py: 1, pl: 1.5 }}>
                        <IconButton
                          size="small"
                          onClick={() => handleRowToggle(j._id)}
                          sx={{ color: theme.palette.primary.main }}
                        >
                          {isOpen ? (
                            <ArrowUpIcon fontSize="small" />
                          ) : (
                            <ArrowDownIcon fontSize="small" />
                          )}
                        </IconButton>
                      </TableCell>

                      <TableCell sx={{ py: 1.5 }}>
                        <Stack spacing={0.8}>
                          <Stack
                            direction="row"
                            spacing={1.2}
                            alignItems="center"
                          >
                            <UserAvatar user={j.userId} />
                            <Stack spacing={0.2}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                lineHeight={1.3}
                              >
                                {getFullName(j.userId)}
                              </Typography>
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                              >
                                <CalendarIcon
                                  sx={{
                                    fontSize: 11,
                                    color: theme.palette.text.disabled,
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDate(j.date)}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <StatusChip status={j.status} />
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell align="right" sx={{ py: 1, pr: 1.5 }}>
                        {hasMenu && (
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, j)}
                            sx={{ color: theme.palette.text.secondary }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>

                    {/* Fila colapsable */}
                    <TableRow>
                      <TableCell
                        colSpan={3}
                        sx={{
                          py: 0,
                          borderBottom: isOpen ? undefined : "none",
                          bgcolor:
                            index % 2 !== 0
                              ? alpha(theme.palette.grey[500], 0.05)
                              : alpha(theme.palette.primary.main, 0.02),
                        }}
                      >
                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                          <Box sx={{ py: 2, px: 2.5 }}>
                            <Stack spacing={1.2}>
                              <DetailRow
                                icon={ScheduleIcon}
                                label="Horario"
                                value={j.scheduleId?.name ?? "Sin horario"}
                              />
                              <DetailRow
                                icon={EditNoteIcon}
                                label="Motivo"
                                value={j.reason}
                              />
                              <DetailRow
                                icon={PersonIcon}
                                label="Revisado por"
                                value={getFullName(j.approvedBy)}
                              />
                              <DetailRow
                                icon={EventAvailableIcon}
                                label="Fecha de revisión"
                                value={formatUpdatedAt(j.updatedAt)}
                              />
                            </Stack>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Menú contextual */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          slotProps={{
            paper: {
              sx: {
                mt: 0.5,
                minWidth: 200,
                boxShadow: 2,
                border: (theme) =>
                  theme.palette.mode === "dark"
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "none",
              },
            },
          }}
        >
          {menuItems}
        </Menu>

        {sharedDrawer}
      </>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // VISTA DESKTOP
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <>
      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.07),
                "& th": {
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  letterSpacing: 0.2,
                  color: theme.palette.text.primary,
                  borderBottom: `2px solid ${theme.palette.divider}`,
                  py: 1.8,
                },
              }}
            >
              {COLUMNS.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{ minWidth: col.minWidth }}
                >
                  {col.sortable ? (
                    <TableSortLabel
                      active={orderBy === col.id}
                      direction={orderBy === col.id ? order : "asc"}
                      onClick={() => handleRequestSort(col.id)}
                      sx={{
                        "&:hover": { color: theme.palette.primary.main },
                        "&.Mui-active": {
                          color: theme.palette.primary.main,
                          fontWeight: 800,
                        },
                      }}
                    >
                      {col.label}
                    </TableSortLabel>
                  ) : (
                    col.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedJustifications.map((j, index) => (
              <TableRow
                key={j._id}
                hover
                sx={{
                  transition: "background 0.15s ease",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                  },
                  bgcolor:
                    index % 2 !== 0
                      ? alpha(theme.palette.grey[500], 0.025)
                      : "transparent",
                }}
              >
                {/* Usuario */}
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <UserAvatar user={j.userId} />
                    <Typography variant="body2" fontWeight={600}>
                      {getFullName(j.userId)}
                    </Typography>
                  </Stack>
                </TableCell>

                {/* Fecha */}
                <TableCell align="center">
                  <Typography variant="body2">{formatDate(j.date)}</Typography>
                </TableCell>

                {/* Horario */}
                <TableCell align="center">
                  <Typography variant="body2">
                    {j.scheduleId?.name ?? "—"}
                  </Typography>
                </TableCell>

                {/* Motivo */}
                <TableCell>
                  <Tooltip
                    title={j.reason}
                    placement="top"
                    disableHoverListener={!j.reason || j.reason.length < 35}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        maxWidth: 220,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {j.reason || "—"}
                    </Typography>
                  </Tooltip>
                </TableCell>

                {/* Aprobado por */}
                <TableCell>
                  <Typography variant="body2">
                    {getFullName(j.approvedBy)}
                  </Typography>
                </TableCell>

                {/* Estado */}
                <TableCell align="center">
                  <StatusChip status={j.status} />
                </TableCell>

                {/* Acciones */}
                <TableCell align="center">
                  <ActionCell
                    row={j}
                    onRefresh={onRefresh}
                    schedules={schedules}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {sharedDrawer}
    </>
  );
};

export default JustificationTable;
