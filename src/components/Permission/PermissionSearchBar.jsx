import { Box, TextField, Button } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

export default function PermissionSearchBar({ searchInput, setSearchInput, onSearch, onAdd }) {
  return (
    <Box component="form" onSubmit={onSearch} sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <TextField
        label="Buscar permiso"
        value={searchInput}
        onChange={e => setSearchInput(e.target.value)}
        size="small"
      />
      <Button type="submit" variant="outlined">Buscar</Button>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
        Registrar Permiso
      </Button>
    </Box>
  );
} 