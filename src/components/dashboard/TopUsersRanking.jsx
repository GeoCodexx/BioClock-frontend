import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  Grid,
  Card,
  CardHeader,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
  useTheme,
  Chip,
  Stack,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  CardContent,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import PersonOffIcon from "@mui/icons-material/PersonOff";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import HowToRegIcon from "@mui/icons-material/HowToReg";

// Componente: TopUsersRanking
// Props esperadas: `data` (objeto con { period, topUsers: { on_time, late, absent } })
// - El componente valida existencia de datos y muestra un estado "no data" si no hay información.

const getInitials = (user) => {
  if (!user) return "?";
  const parts = [user.name, user.firstSurname, user.secondSurname]
    .filter(Boolean)
    .map((p) => p.trim());
  if (!parts.length) return "?";
  return parts
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatFullName = (user) => {
  if (!user) return "-";
  return `${user.name || ""} ${user.firstSurname || ""} ${user.secondSurname || ""}`.trim();
};

const NoDataCard = ({ title }) => {
  const theme = useTheme();
  return (
    <Card elevation={1} sx={{ p: 3, minHeight: 180 }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        spacing={1}
        sx={{ height: "100%" }}
      >
        <PersonOffIcon
          sx={{ fontSize: 40, color: theme.palette.text.secondary }}
        />
        <Typography variant="subtitle1" color="text.secondary">
          No hay datos para mostrar
        </Typography>
        {title && (
          <Typography variant="caption" color="text.secondary">
            {title}
          </Typography>
        )}
      </Stack>
    </Card>
  );
};

/*const RankingSkeleton = () => (
  <Stack direction="row" spacing={2} width="100%">
    {[1, 2, 3].map((i) => (
      <Card
        key={i}
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 350,
          display: "flex",
          alignItems: "center",
        }}
      >
        <CardContent sx={{ width: "100%" }}>
          <Box
            sx={{
              width: "90%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              alignItems: "center",
            }}
          >
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="60%" />
          </Box>
        </CardContent>
      </Card>
    ))}
  </Stack>
);*/
const RankingSkeleton = () => {
  // Simulamos 3 ítems de carga
  const skeletonRows = [1, 2, 3];

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        /*'&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #2196F3 0%, #673AB7 50%, #F44336 100%)',
        }*/
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Grid container spacing={2}>
          <Box
            //size={12}
            sx={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              my: 2,
            }}
          >
            <Box mr={2}>
              <Skeleton
                variant="rounded"
                width={40}
                height={40}
                sx={{ borderRadius: 3 }}
              />
            </Box>
            <Box width={"100%"}>
              <Skeleton variant="text" width="10%" height={20} />
              <Skeleton variant="text" width="15%" height={20} />
            </Box>
          </Box>
          {[1, 2, 3].map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item}>
              <Card
                elevation={1}
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardHeader
                  title={<Skeleton variant="text" width="60%" height={24} />}
                  avatar={
                    <Skeleton
                      variant="rounded"
                      width={40}
                      height={24}
                      sx={{ borderRadius: 4 }}
                    />
                  }
                />

                <Box sx={{ px: 2, pb: 2, flex: 1 }}>
                  <List disablePadding>
                    {skeletonRows.map((_, idx) => (
                      <React.Fragment key={idx}>
                        <ListItem
                          alignItems="flex-start"
                          sx={{
                            px: 0,
                            py: 1.25,
                          }}
                        >
                          <ListItemAvatar>
                            <Skeleton
                              variant="circular"
                              width={40}
                              height={40}
                            />
                          </ListItemAvatar>

                          <ListItemText
                            primary={
                              <Box
                                component="span"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <Skeleton
                                  variant="text"
                                  width="40%"
                                  height={20}
                                />
                                <Skeleton
                                  variant="rounded"
                                  width={30}
                                  height={22}
                                />
                              </Box>
                            }
                            secondary={
                              <Box
                                component="span"
                                sx={{
                                  display: "flex",
                                  gap: 2,
                                  alignItems: "center",
                                  mt: 0.5,
                                }}
                              >
                                <Skeleton
                                  variant="text"
                                  width="30%"
                                  height={18}
                                />
                                <Skeleton
                                  variant="text"
                                  width="20%"
                                  height={18}
                                />
                              </Box>
                            }
                            sx={{ ml: 0 }}
                          />
                        </ListItem>
                        {idx < skeletonRows.length - 1 && (
                          <Divider component="li" />
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

const CategoryCard = ({ title, icon, color, items, emptyLabel }) => {
  const theme = useTheme();
  const chipBg =
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.06)"
      : "rgba(0,0,0,0.03)";

  return (
    <Card
      elevation={1}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.palette.background.card,
        borderRadius: 3,
      }}
    >
      <CardHeader
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        }
        avatar={
          <Chip
            icon={icon}
            label={items?.length ?? 0}
            size="small"
            sx={{
              bgcolor: chipBg,
              ml: 0,
              px: 1,
              fontWeight: 600,
            }}
          />
        }
      />

      <Box sx={{ px: 2, pb: 2, flex: 1 }}>
        {!items || items.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              height: 120,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography color="text.secondary">
              {emptyLabel || "Sin registros"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {items.map((it, idx) => (
              <React.Fragment key={String(it.user?._id || idx)}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 0,
                    py: 1.25,
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{
                        bgcolor: color[500] ? color[500] : color,
                        color: "common.white",
                      }}
                    >
                      {getInitials(it.user)}
                    </Avatar>
                  </ListItemAvatar>

                  <ListItemText
                    component="div"
                    slotProps={{
                      primary: {
                        component: "div",
                      },
                      secondary: {
                        component: "div",
                      },
                    }}
                    primary={
                      <Box
                        component="div"
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="subtitle2"
                          component="span"
                          sx={{ fontWeight: 700 }}
                        >
                          {formatFullName(it.user)}
                        </Typography>
                        <Chip
                          label={`#${idx + 1}`}
                          size="small"
                          sx={{ height: 22 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box
                        component="div"
                        sx={{
                          display: "flex",
                          gap: 2,
                          alignItems: "center",
                          mt: 0.5,
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                        >
                          {it.user?.departmentId?.name || "-"}
                        </Typography>

                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ fontWeight: 700 }}
                        >
                          {it.count} veces
                        </Typography>
                      </Box>
                    }
                    sx={{ ml: 0 }}
                  />
                </ListItem>
                {idx < items.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Card>
  );
};

CategoryCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.node,
  color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  items: PropTypes.array,
  emptyLabel: PropTypes.string,
};

export default function TopUsersRanking({
  data,
  loading,
  onSelectPeriod,
  period,
}) {
  const theme = useTheme();

  const onTime = data?.topUsers?.on_time ?? [];
  const late = data?.topUsers?.late ?? [];
  const absent = data?.topUsers?.absent ?? [];

  const hasAny = onTime.length || late.length || absent.length;

  // colores basados en el tema (se adaptan light/dark)
  const onTimeColor = theme.palette.success.main;
  const lateColor = theme.palette.warning.main;
  const absentColor = theme.palette.error.main;

  const handleChangePeriod = (event, value) => {
    onSelectPeriod(value);
  };

  if (loading) {
    return <RankingSkeleton />;
  }

  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        position: "relative",
        overflow: "hidden",
        height: "100%",
        /*'&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #2196F3 0%, #673AB7 50%, #F44336 100%)',
        }*/
      }}
    >
      <CardContent sx={{ p: 4 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                //background: 'linear-gradient(135deg, #673AB7 0%, #512DA8 100%)',
                background: theme.palette.warning.main,
                borderRadius: 2,
                color: "white",
                boxShadow: "0 4px 12px rgba(103, 58, 183, 0.3)",
              }}
            >
              <TableChartIcon sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Top de usuarios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {data?.period
                  ? `${data.period.from} — ${data.period.to}`
                  : "Período no disponible"}
              </Typography>
            </Box>
          </Box>
          <Box>
            <ToggleButtonGroup
              color="primary"
              size="small"
              value={period}
              exclusive
              onChange={handleChangePeriod}
              aria-label="Periodo del ranking"
            >
              <ToggleButton value="weekly">Semanal</ToggleButton>
              <ToggleButton value="monthly">Mensual</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>

        {!hasAny ? (
          <NoDataCard
            title={
              data?.period
                ? `${data.period.from} — ${data.period.to}`
                : undefined
            }
          />
        ) : (
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CategoryCard
                title="Más puntuales"
                icon={<HowToRegIcon />}
                color={onTimeColor}
                items={onTime}
                emptyLabel="Nadie puntual en este periodo"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CategoryCard
                title="Más tardíos"
                icon={<AccessTimeIcon />}
                color={lateColor}
                items={late}
                emptyLabel="Nadie llega tarde en este periodo"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <CategoryCard
                title="Más ausentes"
                icon={<PersonOffIcon />}
                color={absentColor}
                items={absent}
                emptyLabel="Sin ausencias en este periodo"
              />
            </Grid>
          </Grid>
        )}
      </CardContent>
    </Card>
  );
}

TopUsersRanking.propTypes = {
  data: PropTypes.shape({
    period: PropTypes.object,
    topUsers: PropTypes.shape({
      on_time: PropTypes.array,
      late: PropTypes.array,
      absent: PropTypes.array,
    }),
  }),
};
