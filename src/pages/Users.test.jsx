import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Users from "./Users";
import {
  getPaginatedUsers,
  createUser,
  updateUser,
  deleteUser,
  updateUserStatus,
} from "../services/userService";

// ─── Mocks de servicios ───────────────────────────────────────────────────────
vi.mock("../services/userService", () => ({
  getPaginatedUsers: vi.fn(),
  createUser: vi.fn(),
  updateUser: vi.fn(),
  deleteUser: vi.fn(),
  updateUserStatus: vi.fn(),
}));

// ─── Mock MUI useMediaQuery (desktop) ────────────────────────────────────────
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return { ...actual, useMediaQuery: vi.fn().mockReturnValue(false) };
});

// ─── Mock contextos, stores y utils ──────────────────────────────────────────
vi.mock("../contexts/ThemeContext", () => ({
  useThemeMode: () => ({ mode: "light" }),
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock("../store/useSnackbarStore", () => ({
  default: () => ({
    showSuccess: mockShowSuccess,
    showError: mockShowError,
  }),
}));

vi.mock("../utils/permissions", () => ({
  usePermission: () => ({ can: () => true }),
}));

// ─── Mock sub-componentes ─────────────────────────────────────────────────────
vi.mock("../components/User/UserTable", () => ({
  default: ({ users, onEdit, onDelete, onChangeStatus }) => (
    <div data-testid="user-table">
      {users.map((u) => (
        <div key={u._id} data-testid="user-row">
          <span>{u.name}</span>
          <button onClick={() => onEdit(u)}>Editar {u.name}</button>
          <button onClick={() => onDelete(u._id)}>Eliminar {u.name}</button>
          <button onClick={() => onChangeStatus(u)}>Estado {u.name}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/User/UserSearchBar", () => ({
  default: ({ searchInput, setSearchInput, onSearch }) => (
    <form onSubmit={onSearch}>
      <input
        data-testid="search-input"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Buscar usuario"
      />
      <button type="submit">Buscar</button>
    </form>
  ),
}));

vi.mock("../components/User/UserDialog", () => ({
  default: ({ open, onClose, onSubmit, editUser }) =>
    open ? (
      <div data-testid="user-dialog">
        <span>{editUser ? "Editar usuario" : "Crear usuario"}</span>
        <button onClick={() => onSubmit({ name: "Nuevo Usuario", email: "test@test.com" })}>
          Confirmar
        </button>
        <button onClick={onClose}>Cerrar</button>
      </div>
    ) : null,
}));

vi.mock("../components/common/DeleteConfirmDialog", () => ({
  default: ({ open, onClose, onConfirm, itemName }) =>
    open ? (
      <div data-testid="delete-dialog">
        <span>¿Eliminar {itemName}?</span>
        <button onClick={onConfirm}>Confirmar eliminación</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
}));

vi.mock("../components/User/ToggleStatusDialog", () => ({
  default: ({ open, onClose, onConfirm, user }) =>
    open ? (
      <div data-testid="toggle-status-dialog">
        <span>Cambiar estado de {user?.name}</span>
        <button onClick={onConfirm}>Confirmar cambio</button>
        <button onClick={onClose}>Cancelar</button>
      </div>
    ) : null,
}));

vi.mock("../components/User/UserExportButtons", () => ({
  default: () => <button data-testid="export-btn">Exportar</button>,
}));

vi.mock("../components/common/LoadingOverlay", () => ({
  default: () => null,
}));

vi.mock("../components/common/FloatingAddButton", () => ({
  default: ({ onClick }) => <button onClick={onClick} data-testid="fab">+</button>,
}));

vi.mock("../components/common/SafeTablePagination", () => ({
  SafeTablePagination: ({ count, page, onPageChange, rowsPerPage, onRowsPerPageChange }) => (
    <div data-testid="pagination">
      <span>Total: {count}</span>
      <span>Página: {page + 1}</span>
      <button onClick={(e) => onPageChange(e, page + 1)}>Siguiente</button>
      <button onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0}>
        Anterior
      </button>
      <select
        value={rowsPerPage}
        onChange={(e) => onRowsPerPageChange({ target: { value: e.target.value } })}
        data-testid="rows-per-page"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={25}>25</option>
      </select>
    </div>
  ),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockUsers = [
  { _id: "1", name: "Ana García", email: "ana@test.com", role: "Empleado", status: "active" },
  { _id: "2", name: "Luis Pérez", email: "luis@test.com", role: "Administrador", status: "inactive" },
];

const mockPaginatedResponse = { users: mockUsers, total: 2 };

const renderUsers = () => render(<Users />, { wrapper: MemoryRouter });

// ─── Suite de tests ───────────────────────────────────────────────────────────
describe("Users", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPaginatedUsers.mockResolvedValue(mockPaginatedResponse);
  });

  // ── Estado de carga ─────────────────────────────────────────────────────────
  describe("Estado de carga", () => {
    it("muestra el spinner inicialmente", () => {
      renderUsers();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("oculta el spinner después de cargar", async () => {
      renderUsers();
      await waitFor(() =>
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
      );
    });
  });

  // ── Renderizado exitoso ─────────────────────────────────────────────────────
  describe("Renderizado exitoso", () => {
    it("renderiza la tabla con los usuarios", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByTestId("user-table")).toBeInTheDocument());
      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
    });

    it("renderiza el encabezado 'Gestión de Usuarios'", async () => {
      renderUsers();
      await waitFor(() =>
        expect(screen.getByText(/Gestión de Usuarios/i)).toBeInTheDocument()
      );
    });

    it("muestra el total de registros en la paginación", async () => {
      renderUsers();
      await waitFor(() =>
        expect(screen.getByText(/Total: 2/i)).toBeInTheDocument()
      );
    });

    it("muestra un error global si la carga falla", async () => {
      getPaginatedUsers.mockRejectedValue(new Error("Error de servidor"));
      renderUsers();

      // Precarga datos vacíos para saltear el spinner
      getPaginatedUsers.mockResolvedValue({ users: [], total: 0 });
      renderUsers();

      await waitFor(() => {
        // El error del primer render sigue visible en el DOM
        const errors = screen.queryAllByText(/Error de servidor/i);
        // Al menos una instancia del error
        expect(errors.length).toBeGreaterThan(0);
      });
    });
  });

  // ── Búsqueda ────────────────────────────────────────────────────────────────
  describe("Búsqueda de usuarios", () => {
    it("llama a la API con el término de búsqueda al enviar el formulario", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByTestId("user-table")).toBeInTheDocument());

      const input = screen.getByPlaceholderText(/Buscar usuario/i);
      await userEvent.type(input, "Ana");
      fireEvent.submit(input.closest("form"));

      await waitFor(() =>
        expect(getPaginatedUsers).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Ana", page: "1" })
        )
      );
    });
  });

  // ── Crear usuario ───────────────────────────────────────────────────────────
  describe("Crear usuario", () => {
    it("abre el diálogo al hacer clic en 'Nuevo'", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByTestId("user-table")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Nuevo/i }));

      expect(screen.getByTestId("user-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Crear usuario/i)).toBeInTheDocument();
    });

    it("llama a createUser y muestra éxito al confirmar", async () => {
      createUser.mockResolvedValue({});
      renderUsers();
      await waitFor(() => expect(screen.getByTestId("user-table")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Nuevo/i }));
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() => {
        expect(createUser).toHaveBeenCalledTimes(1);
        expect(mockShowSuccess).toHaveBeenCalledWith("Usuario creado correctamente");
      });
    });

    it("cierra el diálogo al hacer clic en 'Cerrar'", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByTestId("user-table")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Nuevo/i }));
      expect(screen.getByTestId("user-dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Cerrar"));
      expect(screen.queryByTestId("user-dialog")).not.toBeInTheDocument();
    });
  });

  // ── Editar usuario ──────────────────────────────────────────────────────────
  describe("Editar usuario", () => {
    it("abre el diálogo de edición con datos del usuario", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Editar Ana García/i }));

      expect(screen.getByTestId("user-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Editar usuario/i)).toBeInTheDocument();
    });

    it("llama a updateUser y muestra éxito al confirmar", async () => {
      updateUser.mockResolvedValue({});
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Editar Ana García/i }));
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith("1", expect.any(Object));
        expect(mockShowSuccess).toHaveBeenCalledWith("Usuario actualizado correctamente");
      });
    });
  });

  // ── Eliminar usuario ────────────────────────────────────────────────────────
  describe("Eliminar usuario", () => {
    it("abre el diálogo de confirmación al eliminar", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Ana García/i }));

      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
      expect(screen.getByText(/¿Eliminar usuario?/i)).toBeInTheDocument();
    });

    it("llama a deleteUser y muestra éxito al confirmar", async () => {
      deleteUser.mockResolvedValue({});
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Ana García/i }));
      fireEvent.click(screen.getByText("Confirmar eliminación"));

      await waitFor(() => {
        expect(deleteUser).toHaveBeenCalledWith("1");
        expect(mockShowSuccess).toHaveBeenCalledWith("Usuario eliminado correctamente");
      });
    });

    it("cierra el diálogo al cancelar", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Ana García/i }));
      fireEvent.click(screen.getByText("Cancelar"));

      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
    });
  });

  // ── Cambio de estado ────────────────────────────────────────────────────────
  describe("Cambio de estado de usuario", () => {
    it("abre el diálogo de cambio de estado", async () => {
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Estado Ana García/i }));

      expect(screen.getByTestId("toggle-status-dialog")).toBeInTheDocument();
    });

    it("llama a updateUserStatus y muestra éxito al confirmar", async () => {
      updateUserStatus.mockResolvedValue({});
      renderUsers();
      await waitFor(() => expect(screen.getByText("Ana García")).toBeInTheDocument());

      fireEvent.click(screen.getByRole("button", { name: /Estado Ana García/i }));
      fireEvent.click(screen.getByText("Confirmar cambio"));

      await waitFor(() => {
        expect(updateUserStatus).toHaveBeenCalledWith("1", { status: "inactive" });
        expect(mockShowSuccess).toHaveBeenCalledWith("Estado actualizado correctamente");
      });
    });
  });

  // ── Paginación ──────────────────────────────────────────────────────────────
  describe("Paginación", () => {
    it("avanza de página correctamente", async () => {
      getPaginatedUsers.mockResolvedValue({ users: mockUsers, total: 20 });
      renderUsers();
      await waitFor(() => expect(screen.getByTestId("pagination")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Siguiente"));

      await waitFor(() =>
        expect(getPaginatedUsers).toHaveBeenCalledWith(
          expect.objectContaining({ page: "2" })
        )
      );
    });
  });
});
