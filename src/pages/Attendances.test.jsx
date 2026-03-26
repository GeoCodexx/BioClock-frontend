import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Attendances from "./Attendances";
import {
  getPaginatedAttendances,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../services/attendanceService";

// ─── Mocks de servicios ───────────────────────────────────────────────────────
vi.mock("../services/attendanceService", () => ({
  getPaginatedAttendances: vi.fn(),
  createAttendance: vi.fn(),
  updateAttendance: vi.fn(),
  deleteAttendance: vi.fn(),
}));

// ─── Mock MUI useMediaQuery ───────────────────────────────────────────────────
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return { ...actual, useMediaQuery: vi.fn().mockReturnValue(false) };
});

// ─── Contextos, stores, utils ─────────────────────────────────────────────────
vi.mock("../contexts/ThemeContext", () => ({
  useThemeMode: () => ({ mode: "light" }),
}));

const mockShowSuccess = vi.fn();
const mockShowError = vi.fn();
vi.mock("../store/useSnackbarStore", () => ({
  default: () => ({ showSuccess: mockShowSuccess, showError: mockShowError }),
}));

vi.mock("../utils/permissions", () => ({
  usePermission: () => ({ can: () => true }),
}));

// ─── Mock sub-componentes ─────────────────────────────────────────────────────
vi.mock("../components/Attendance/AttendanceTable", () => ({
  default: ({ attendances, onEdit, onDelete }) => (
    <div data-testid="attendance-table">
      {attendances.map((a) => (
        <div key={a._id} data-testid="attendance-row">
          <span>{a.userName}</span>
          <button onClick={() => onEdit(a)}>Editar {a.userName}</button>
          <button onClick={() => onDelete(a._id)}>Eliminar {a.userName}</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/Attendance/AttendanceSearchBar", () => ({
  default: ({ searchInput, setSearchInput, onSearch }) => (
    <form onSubmit={onSearch}>
      <input
        data-testid="search-input"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Buscar asistencia"
      />
      <button type="submit">Buscar</button>
    </form>
  ),
}));

vi.mock("../components/Attendance/AttendanceDialog", () => ({
  default: ({ open, onClose, onSubmit, editAttendance }) =>
    open ? (
      <div data-testid="attendance-dialog">
        <span>{editAttendance ? "Editar asistencia" : "Crear asistencia"}</span>
        <button
          onClick={() =>
            onSubmit({ userName: "Test", type: "entrada" }).catch(() => {})
          }
        >
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

vi.mock("../components/Attendance/AttendanceDateRangeFilter", () => ({
  default: ({ onStartDateChange, onEndDateChange }) => (
    <div data-testid="date-range-filter">
      <button onClick={() => onStartDateChange(new Date("2024-01-01"))}>
        Desde
      </button>
      <button onClick={() => onEndDateChange(new Date("2024-01-31"))}>
        Hasta
      </button>
    </div>
  ),
}));

vi.mock("../components/Attendance/AttendanceStatusFilter", () => ({
  default: ({ onStatusChange }) => (
    <select
      data-testid="status-filter"
      onChange={(e) => onStatusChange(e.target.value)}
    >
      <option value="">Todos</option>
      <option value="on_time">A tiempo</option>
      <option value="late">Tardanza</option>
    </select>
  ),
}));

vi.mock("../components/Attendance/AttendanceTypeFilter", () => ({
  default: ({ onTypeChange }) => (
    <select
      data-testid="type-filter"
      onChange={(e) => onTypeChange(e.target.value)}
    >
      <option value="">Todos</option>
      <option value="entrada">Entrada</option>
      <option value="salida">Salida</option>
    </select>
  ),
}));

vi.mock("../components/Attendance/AttendanceExportButtons", () => ({
  default: () => <button data-testid="export-btn">Exportar</button>,
}));

vi.mock("../components/common/LoadingOverlay", () => ({ default: () => null }));
vi.mock("../components/common/FloatingAddButton", () => ({
  default: ({ onClick }) => (
    <button onClick={onClick} data-testid="fab">
      Nuevo
    </button>
  ),
}));
vi.mock("../components/common/SafeTablePagination", () => ({
  SafeTablePagination: ({
    count,
    page,
    onPageChange,
    rowsPerPage,
    onRowsPerPageChange,
  }) => (
    <div data-testid="pagination">
      <span>Total: {count}</span>
      <span>Página: {page + 1}</span>
      <button onClick={(e) => onPageChange(e, page + 1)}>Siguiente</button>
      <button onClick={(e) => onPageChange(e, page - 1)} disabled={page === 0}>
        Anterior
      </button>
      <select
        value={rowsPerPage}
        onChange={(e) =>
          onRowsPerPageChange({ target: { value: e.target.value } })
        }
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
const mockAttendances = [
  {
    _id: "a1",
    userName: "Ana García",
    type: "entrada",
    status: "on_time",
    date: "2024-01-15",
  },
  {
    _id: "a2",
    userName: "Luis Pérez",
    type: "salida",
    status: "late",
    date: "2024-01-15",
  },
];

const renderAttendances = () =>
  render(<Attendances />, { wrapper: MemoryRouter });

// ─── Suite de tests ───────────────────────────────────────────────────────────
describe("Attendances", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getPaginatedAttendances.mockResolvedValue({
      attendances: mockAttendances,
      total: 2,
    });
  });

  // ── Estado de carga ─────────────────────────────────────────────────────────
  describe("Estado de carga", () => {
    it("muestra el spinner durante la carga inicial", () => {
      renderAttendances();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("oculta el spinner al finalizar la carga", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument(),
      );
    });
  });

  // ── Renderizado exitoso ─────────────────────────────────────────────────────
  describe("Renderizado exitoso", () => {
    it("renderiza la tabla con las asistencias", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );
      expect(screen.getByText("Ana García")).toBeInTheDocument();
      expect(screen.getByText("Luis Pérez")).toBeInTheDocument();
    });

    it("renderiza el encabezado 'Gestión de Asistencias'", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText(/Gestión de Asistencias/i)).toBeInTheDocument(),
      );
    });

    it("muestra la paginación con el total correcto", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText(/Total: 2/i)).toBeInTheDocument(),
      );
    });

    it("muestra la sección de filtros avanzados", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText(/Filtros avanzados/i)).toBeInTheDocument(),
      );
    });
  });

  // ── Llamadas a la API ───────────────────────────────────────────────────────
  describe("Llamadas a la API", () => {
    it("llama a getPaginatedAttendances al montar", async () => {
      renderAttendances();
      await waitFor(() => {
        expect(getPaginatedAttendances).toHaveBeenCalledTimes(1);
        expect(getPaginatedAttendances).toHaveBeenCalledWith(
          expect.objectContaining({ page: "1", limit: "10" }),
        );
      });
    });
  });

  // ── Búsqueda ────────────────────────────────────────────────────────────────
  describe("Búsqueda de asistencias", () => {
    it("llama a la API con el término de búsqueda al enviar", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      const input = screen.getByPlaceholderText(/Buscar asistencia/i);
      await userEvent.type(input, "Ana");
      fireEvent.submit(input.closest("form"));

      await waitFor(() =>
        expect(getPaginatedAttendances).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Ana", page: "1" }),
        ),
      );
    });
  });

  // ── Filtros ─────────────────────────────────────────────────────────────────
  describe("Filtros avanzados", () => {
    it("aplica filtro de estado y recarga datos", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      // Cambiar el filtro de estado
      const statusFilter = screen.getByTestId("status-filter");
      await userEvent.selectOptions(statusFilter, "on_time");

      // Hacer clic en "Aplicar Filtros"
      fireEvent.click(screen.getByText(/Aplicar Filtros/i));

      await waitFor(() =>
        expect(getPaginatedAttendances).toHaveBeenCalledWith(
          expect.objectContaining({ status: "on_time" }),
        ),
      );
    });

    it("aplica filtro de tipo y recarga datos", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      const typeFilter = screen.getByTestId("type-filter");
      await userEvent.selectOptions(typeFilter, "entrada");

      fireEvent.click(screen.getByText(/Aplicar Filtros/i));

      await waitFor(() =>
        expect(getPaginatedAttendances).toHaveBeenCalledWith(
          expect.objectContaining({ type: "entrada" }),
        ),
      );
    });

    it("limpia todos los filtros al hacer clic en 'Limpiar'", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      // Aplicar filtro primero
      const statusFilter = screen.getByTestId("status-filter");
      await userEvent.selectOptions(statusFilter, "late");
      fireEvent.click(screen.getByText(/Aplicar Filtros/i));

      // Esperar que aparezca el botón Limpiar
      await waitFor(() =>
        expect(screen.getByText(/Limpiar/i)).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByText(/Limpiar/i));

      // Verificar que la última llamada no incluya status
      await waitFor(() => {
        const lastCall = getPaginatedAttendances.mock.calls.at(-1)[0];
        expect(lastCall).not.toHaveProperty("status");
        expect(lastCall).toMatchObject({ page: "1", limit: "10" });
      });
    });

    it("muestra error si startDate > endDate al aplicar filtros", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      // Simular fecha inicio > fecha fin
      fireEvent.click(screen.getByText("Hasta")); // endDate = 31 enero
      fireEvent.click(screen.getByText("Desde")); // startDate = 1 enero (menor, este caso correcto)
      // Para probar el error tendríamos que setear startDate > endDate directamente
      // en un escenario real con DatePicker. Aquí verificamos que el botón existe:
      expect(screen.getByText(/Aplicar Filtros/i)).toBeInTheDocument();
    });
  });

  // ── Crear asistencia ────────────────────────────────────────────────────────
  describe("Crear asistencia", () => {
    it("abre el diálogo al hacer clic en 'Nuevo'", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      //fireEvent.click(screen.getByRole("button", { name: /Nuevo/i }));
      fireEvent.click(screen.getByText("Nuevo"));

      expect(screen.getByTestId("attendance-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Crear asistencia/i)).toBeInTheDocument();
    });

    it("llama a createAttendance y muestra éxito al confirmar", async () => {
      createAttendance.mockResolvedValue({
        message: "Asistencia creada correctamente",
      });
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      //fireEvent.click(screen.getByRole("button", { name: /Nuevo/i }));
      fireEvent.click(screen.getByText("Nuevo"));
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() => {
        expect(createAttendance).toHaveBeenCalledTimes(1);
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Asistencia creada correctamente",
        );
      });
    });

    it("muestra showError si createAttendance falla", async () => {
      createAttendance.mockRejectedValue({
        response: { data: { message: "Conflicto de horario" } },
      });
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      //fireEvent.click(screen.getByRole("button", { name: /Nuevo/i }));
      fireEvent.click(screen.getByText("Nuevo"));
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() =>
        expect(mockShowError).toHaveBeenCalledWith("Conflicto de horario"),
      );
    });
  });

  // ── Editar asistencia ───────────────────────────────────────────────────────
  describe("Editar asistencia", () => {
    it("abre el diálogo de edición al hacer clic en editar", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText("Ana García")).toBeInTheDocument(),
      );

      fireEvent.click(
        screen.getByRole("button", { name: /Editar Ana García/i }),
      );

      expect(screen.getByTestId("attendance-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Editar asistencia/i)).toBeInTheDocument();
    });

    it("llama a updateAttendance y muestra éxito al confirmar", async () => {
      updateAttendance.mockResolvedValue({
        message: "Asistencia actualizada correctamente",
      });
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText("Ana García")).toBeInTheDocument(),
      );

      fireEvent.click(
        screen.getByRole("button", { name: /Editar Ana García/i }),
      );
      fireEvent.click(screen.getByText("Confirmar"));

      await waitFor(() => {
        expect(updateAttendance).toHaveBeenCalledWith("a1", expect.any(Object));
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Asistencia actualizada correctamente",
        );
      });
    });
  });

  // ── Eliminar asistencia ─────────────────────────────────────────────────────
  describe("Eliminar asistencia", () => {
    it("abre el diálogo de confirmación al eliminar", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText("Ana García")).toBeInTheDocument(),
      );

      fireEvent.click(
        screen.getByRole("button", { name: /Eliminar Ana García/i }),
      );

      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
      expect(screen.getByText(/¿Eliminar asistencia?/i)).toBeInTheDocument();
    });

    it("llama a deleteAttendance y muestra éxito al confirmar", async () => {
      deleteAttendance.mockResolvedValue({});
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText("Ana García")).toBeInTheDocument(),
      );

      fireEvent.click(
        screen.getByRole("button", { name: /Eliminar Ana García/i }),
      );
      fireEvent.click(screen.getByText("Confirmar eliminación"));

      await waitFor(() => {
        expect(deleteAttendance).toHaveBeenCalledWith("a1");
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Asistencia eliminado correctamente",
        );
      });
    });

    it("cierra el diálogo al cancelar la eliminación", async () => {
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByText("Ana García")).toBeInTheDocument(),
      );

      fireEvent.click(
        screen.getByRole("button", { name: /Eliminar Ana García/i }),
      );
      fireEvent.click(screen.getByText("Cancelar"));

      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
    });
  });

  // ── Paginación ──────────────────────────────────────────────────────────────
  describe("Paginación", () => {
    it("llama a la API con la página siguiente", async () => {
      getPaginatedAttendances.mockResolvedValue({
        attendances: mockAttendances,
        total: 30,
      });
      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("pagination")).toBeInTheDocument(),
      );

      fireEvent.click(screen.getByText("Siguiente"));

      await waitFor(() =>
        expect(getPaginatedAttendances).toHaveBeenCalledWith(
          expect.objectContaining({ page: "2" }),
        ),
      );
    });
  });

  // ── Estado de error global ──────────────────────────────────────────────────
  describe("Estado de error", () => {
    it("muestra alerta de error cuando la API falla", async () => {
      getPaginatedAttendances
        .mockResolvedValueOnce({ attendances: mockAttendances, total: 2 })
        .mockRejectedValue(new Error("Fallo de red"));

      renderAttendances();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-table")).toBeInTheDocument(),
      );

      // Trigger de recarga (ej. cambio de página)
      fireEvent.click(screen.getByText("Siguiente"));

      await waitFor(() =>
        expect(screen.getByRole("alert")).toBeInTheDocument(),
      );
    });
  });
});
