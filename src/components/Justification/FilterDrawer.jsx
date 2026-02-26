import {
  Drawer,
  Box,
  Typography,
  Button,
  Stack,
  Divider,
} from "@mui/material";

export default function JustificationFilterDrawer({
  open,
  onClose,
  children,
  onApply,
}) {
  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          p: 2,
          maxHeight: "85vh",
        },
      }}
    >
      <Box>
        <Typography variant="h6" mb={2}>
          Filtros
        </Typography>

        <Stack spacing={2}>
          {children}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Button
          variant="contained"
          fullWidth
          onClick={onApply}
        >
          Aplicar Filtros
        </Button>
      </Box>
    </Drawer>
  );
}