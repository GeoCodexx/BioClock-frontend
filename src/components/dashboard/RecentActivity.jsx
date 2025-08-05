import { Card, CardContent, Typography, List, ListItem, ListItemText, ListItemAvatar, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const RecentActivity = () => {
  const activities = [
    {
      user: 'Juan Pérez',
      action: 'Registro entrada',
      time: new Date(2024, 2, 15, 8, 30)
    },
    {
      user: 'María García',
      action: 'Registro salida',
      time: new Date(2024, 2, 15, 17, 0)
    },
    {
      user: 'Carlos López',
      action: 'Registro entrada',
      time: new Date(2024, 2, 15, 9, 0)
    },
    {
      user: 'Ana Martínez',
      action: 'Registro entrada',
      time: new Date(2024, 2, 15, 8, 45)
    }
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Actividad Reciente
        </Typography>
        <List>
          {activities.map((activity, index) => (
            <ListItem key={index} divider={index !== activities.length - 1}>
              <ListItemAvatar>
                <Avatar>{activity.user.charAt(0)}</Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={activity.user}
                secondary={`${activity.action} - ${format(activity.time, 'HH:mm', { locale: es })}`}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;