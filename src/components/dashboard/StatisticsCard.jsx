import { Box, Card, Typography } from "@mui/material";

const StatisticsCard = ({ title, count, icon, color, trend = "+12%" }) => {
  return (
    <Card
      sx={{
        p: 3,
        height: "100%",
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
          inset: 0,
          background: `linear-gradient(135deg, ${color} 0%, transparent 100%)`,
          opacity: 0,
          transition: "opacity 0.4s ease",
          pointerEvents: "none",
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
      {/* Partículas flotantes */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          "& > div": {
            position: "absolute",
            width: "4px",
            height: "4px",
            background: `${color}80`,
            borderRadius: "50%",
            animation: "float 3s ease-in-out infinite",
            "@keyframes float": {
              "0%, 100%": {
                transform: "translateY(0) scale(1)",
                opacity: 0,
              },
              "50%": {
                transform: "translateY(-30px) scale(1.2)",
                opacity: 0.6,
              },
            },
          },
          "& > div:nth-of-type(1)": { left: "20%", animationDelay: "0s" },
          "& > div:nth-of-type(2)": { left: "50%", animationDelay: "0.5s" },
          "& > div:nth-of-type(3)": { left: "80%", animationDelay: "1s" },
        }}
      >
        <Box component="div" />
        <Box component="div" />
        <Box component="div" />
      </Box>

      <Box sx={{ position: "relative", zIndex: 1 }}>
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
              background: color,
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
                color: "white",
                position: "relative",
                zIndex: 1,
              },
            }}
          >
            {icon}
          </Box>
        </Box>

        {/* Contador */}
        <Typography
          variant="h2"
          align="center"
          sx={{
            fontWeight: 800,
            mb: 1.5,
            color: "text.primary",
            fontSize: { xs: "2.5rem", sm: "3rem" },
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
              textTransform: "uppercase",
              letterSpacing: "0.5px",
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
