import React from "react";
import { Card, CardContent, Grid, Typography } from "@mui/material";

const SummaryCards = ({ data }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 3 }}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Empleados
            </Typography>
            <Typography variant="h4">{data.pagination.totalRecords}</Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Completo y a tiempo
            </Typography>
            <Typography variant="h4" color="success.main">
              {data.records.filter((r) => r.shiftStatus === "complete").length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Tardanzas
            </Typography>
            <Typography variant="h4" color="warning.main">
              {data.records.filter((r) => r.shiftStatus === "late").length}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Incompleto
            </Typography>
            <Typography variant="h4" color="error.main">
              {
                data.records.filter(
                  (r) =>
                    r.shiftStatus === "incomplete_no_entry" ||
                    r.shiftStatus === "incomplete_no_exit"
                ).length
              }
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Más tarjetas de estadísticas */}
    </Grid>
  );
};

export default SummaryCards;
