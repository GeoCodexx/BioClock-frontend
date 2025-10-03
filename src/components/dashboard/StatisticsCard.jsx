import { Box, Card, Typography } from "@mui/material";

const StatisticsCard = ({ title, count, icon, color }) => {
  return (
    <Card
      sx={{
        p: 2.5,
        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box
        sx={{
          //width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            width: 45,
            height: 45,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 2,
            bgcolor: `${color}15`,
            color: color,
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Box sx={{pr:2}}>
          <Typography variant="h4" sx={{ mb: 0.5 }}>
            {count}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "end",
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatisticsCard;
