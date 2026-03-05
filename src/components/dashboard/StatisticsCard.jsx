import { alpha, Box, Card, Typography } from "@mui/material";

const StatisticsCard = ({ title, count, icon, color, trend = "+12%" }) => {
  return (
    <Card
      sx={{
        p: { xs: 1, sm: 3 },
        //height: "100%",
        borderRadius: 4,
        backgroundColor: (theme) => theme.palette.background.paper,
        //background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: "blur(10px)",
        //border: '1px solid',
        borderColor: "rgba(255, 255, 255, 0.3)",
        position: "relative",
        overflow: "hidden", 
        transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        cursor: "pointer",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.08)",
        "&::after": {
          content: '""',
          position: "absolute",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          opacity: 0.5,
          background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
          pointerEvents: "none",
          top: "-125px",
          right: "-15px",
        },
        "&::before": {
          content: '""',
          position: "absolute",
          width: "180px",
          height: "180px",
          borderRadius: "50%",
          opacity: 0.5,
          background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
          pointerEvents: "none",
          top: "-85px",
          right: "-95px",
        },
        "&:hover": {
          transform: "translateY(-4px) scale(1.02)",
          borderColor: color,
          boxShadow: `0 20px 40px ${color}30, 0 0 0 2px ${color}50`,
        },
        "&:hover::after": {
          opacity: 0.08,
        },
      }}
    >
      <Box sx={{ /*position: "relative",*/ zIndex: 1 }}>
        {/* Header: Ícono y Badge de tendencia */}
        <Box
          /*sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',*/ sx={{
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 3,
              background: alpha(color, 0.2),
              //boxShadow: `0 8px 24px ${color}40`,
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s ease",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 100%)",
              },
              ".MuiCard-root:hover &": {
                transform: "rotate(-10deg) scale(1.1)",
                //boxShadow: `0 12px 32px ${color}60`,
              },
              "& .MuiSvgIcon-root": {
                fontSize: 32,
                color: color,
                position: "relative",
                zIndex: 1,
              },
            }}
          >
            {icon}
          </Box >
        </Box>

        {/* Contador */}
        <Typography
          variant="h6"
          align="center"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            color: "text.primary",
            fontSize: "2rem",
            lineHeight: 1,
            transition: "all 0.3s ease",
            ".MuiCard-root:hover &": {
              transform: "scale(1.05)",
              color: color,
            },
          }}
        >
          {count}
        </Typography>

        {/* Footer: Título y Progress Ring */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="body2"
            align="center"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              fontSize: "0.875rem",
              //textTransform: "uppercase",
              //letterSpacing: "0.5px",
            }}
          >
            {title}
          </Typography>

          {/* Progress Ring SVG */}
          {/* <Box
            component="svg"
            sx={{ width: 36, height: 36 }}
            viewBox="0 0 36 36"
          >
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke="rgba(0, 0, 0, 0.1)"
              strokeWidth="3"
              transform="rotate(-90 18 18)"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeDasharray="100.48"
              strokeDashoffset="25"
              strokeLinecap="round"
              transform="rotate(-90 18 18)"
              sx={{
                transition: 'stroke-dashoffset 0.5s ease',
              }}
            />
          </Box> */}
        </Box>
      </Box>
    </Card>
  );
};

export default StatisticsCard;
