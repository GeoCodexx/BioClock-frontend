import { Stack, Chip } from "@mui/material";

export default function ActiveFilterChips({
  filters,
  onRemove,
}) {
  const active = Object.entries(filters).filter(
    ([, value]) => value
  );

  if (!active.length) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        overflowX: "auto",
        py: 1,
      }}
    >
      {active.map(([key, value]) => (
        <Chip
          key={key}
          variant="outlined"
          color="primary"
          label={`${key}: ${value}`}
          onDelete={() => onRemove(key)}
          size="small"
        />
      ))}
    </Stack>
  );
}