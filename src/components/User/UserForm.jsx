import { useEffect, useState } from "react";
import {
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { getRoles } from "../../services/roleService";
import { getDepartments } from "../../services/departmentService";

export default function UserForm({ onSubmit, defaultValues = {}, loading }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      reset(defaultValues);
    }
    // eslint-disable-next-line
  }, [JSON.stringify(defaultValues)]);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [rolesData, departmentsData] = await Promise.all([
          getRoles(),
          getDepartments(),
        ]);
        setRoles(rolesData);
        setDepartments(departmentsData);
      } catch (err) {
        setRoles([]);
        setDepartments([]);
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  return (
    <form id="user-form" onSubmit={handleSubmit(onSubmit)}>
      <TextField
        margin="normal"
        fullWidth
        label="Nombre"
        {...register("name", { required: "Nombre requerido" })}
        error={!!errors.name}
        helperText={errors.name?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Apellido Paterno"
        {...register("firstSurname", {
          required: "Apellido paterno requerido",
        })}
        error={!!errors.firstSurname}
        helperText={errors.firstSurname?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Apellido Materno"
        {...register("secondSurname", {
          required: "Apellido materno requerido",
        })}
        error={!!errors.secondSurname}
        helperText={errors.secondSurname?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="DNI"
        {...register("dni", { required: "DNI requerido" })}
        error={!!errors.dni}
        helperText={errors.dni?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Teléfono"
        {...register("phone", { required: "Teléfono requerido" })}
        error={!!errors.phone}
        helperText={errors.phone?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Email"
        type="email"
        {...register("email", { required: "Email requerido" })}
        error={!!errors.email}
        helperText={errors.email?.message}
      />
      <TextField
        margin="normal"
        fullWidth
        label="Contraseña"
        type="password"
        {...register("passwordHash", { required: "Contraseña requerida" })}
        error={!!errors.passwordHash}
        helperText={errors.passwordHash?.message}
      />
      {roles.length > 0 && (
        <FormControl fullWidth margin="normal" error={!!errors.roleId}>
          <InputLabel id="role-label">Rol</InputLabel>
          <Select
            labelId="role-label"
            label="Rol"
            value={defaultValues.roleId?._id||""}
            defaultValue={defaultValues.roleId?._id || ""}
            {...register("roleId", { required: "Rol requerido" })}
          >
            {loadingData ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              roles.map((role) => (
                <MenuItem key={role._id} value={role._id}>
                  {role.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}

      {departments.length > 0 && (
        <FormControl fullWidth margin="normal" error={!!errors.departmentId}>
          <InputLabel id="department-label">Departamento</InputLabel>
          <Select
            labelId="department-label"
            label="Departamento"
            value={defaultValues.departmentId?._id||""}
            defaultValue={defaultValues.departmentId?._id || ""}
            {...register("departmentId", {
              required: "Departamento requerido",
            })}
          >
            {loadingData ? (
              <MenuItem value="">
                <CircularProgress size={20} />
              </MenuItem>
            ) : (
              departments.map((dep) => (
                <MenuItem key={dep._id} value={dep._id}>
                  {dep.name}
                </MenuItem>
              ))
            )}
          </Select>
        </FormControl>
      )}
    </form>
  );
}
