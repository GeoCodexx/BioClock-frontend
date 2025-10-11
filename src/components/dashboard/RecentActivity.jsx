/*import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';*/
//import { format } from "date-fns";
//import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  //Box,
  Chip,
  Card,
  CardContent,
} from "@mui/material";

const RecentActivity = ({ topUsers }) => {
  const statusColors = {
    onTime: "success",
    late: "warning",
    absent: "error",
  };

  const activities = [
    {
      user: "Juan Pérez",
      action: "Registro entrada",
      time: new Date(2024, 2, 15, 8, 30),
    },
    {
      user: "María García",
      action: "Registro salida",
      time: new Date(2024, 2, 15, 17, 0),
    },
    {
      user: "Carlos López",
      action: "Registro entrada",
      time: new Date(2024, 2, 15, 9, 0),
    },
    {
      user: "Ana Martínez",
      action: "Registro entrada",
      time: new Date(2024, 2, 15, 8, 45),
    },
  ];

  return (
    // <Card>
    //   <CardContent>
    //     <Typography variant="h6" sx={{ mb: 2 }}>
    //       Actividad Reciente
    //     </Typography>
    //     <List>
    //       {activities.map((activity, index) => (
    //         <ListItem key={index} divider={index !== activities.length - 1}>
    //           <ListItemAvatar>
    //             <Avatar>{activity.user.charAt(0)}</Avatar>
    //           </ListItemAvatar>
    //           <ListItemText
    //             primary={activity.user}
    //             secondary={`${activity.action} - ${format(activity.time, 'HH:mm', { locale: es })}`}
    //           />
    //         </ListItem>
    //       ))}
    //     </List>
    //   </CardContent>
    // </Card>
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Top 5 usuarios del mes
        </Typography>

        <TableContainer
          component={Paper}
          elevation={3}
          sx={{ borderRadius: 3, overflow: "hidden" }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  #
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Nombre
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Departamento
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold" }}
                  align="center"
                >
                  A Tiempo
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold" }}
                  align="center"
                >
                  Tarde
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold" }}
                  align="center"
                >
                  Ausente
                </TableCell>
                <TableCell
                  sx={{ color: "white", fontWeight: "bold" }}
                  align="center"
                >
                  Total
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {topUsers.map((user, index) => (
                <TableRow
                  key={user.userId}
                  sx={{
                    "&:nth-of-type(odd)": { backgroundColor: "action.hover" },
                  }}
                >
                  <TableCell>{index + 1}</TableCell>
                  <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.onTimeCount}
                      color={statusColors.onTime}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.lateCount}
                      color={statusColors.late}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={user.absentCount}
                      color={statusColors.absent}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: "bold" }}>
                    {user.totalCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;
