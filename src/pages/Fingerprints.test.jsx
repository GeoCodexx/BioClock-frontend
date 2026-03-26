import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Fingerprints from "./Fingerprints";
import {
  getFingerprintTemplates,
  deleteFingerprintTemplate,
  updateFingerprintStatus,
} from "../services/fingerprintService";

// ─── Mocks de servicios ───────────────────────────────────────────────────────
vi.mock("../services/fingerprintService", () => ({
  getFingerprintTemplates: vi.fn(),
  deleteFingerprintTemplate: vi.fn(),
  updateFingerprintStatus: vi.fn(),
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

const mockUser = { id: "admin-1", role: "Administrador" };
vi.mock("../store/useAuthStore", () => ({
  default: (selector) => selector({ user: mockUser }),
}));

vi.mock("../utils/permissions", () => ({
  usePermission: () => ({ can: () => true }),
}));

// ─── Mock sub-componentes ─────────────────────────────────────────────────────
vi.mock("../components/Fingerprint/FingerprintTable", () => ({
  default: ({ fingerprints, onDelete, onOpenValidationDialog }) => (
    <div data-testid="fingerprint-table">
      {fingerprints.map((f) => (
        <div key={f._id} data-testid="fingerprint-row">
          <span>{f.userName}</span>
          <span data-testid={`status-${f._id}`}>{f.status}</span>
          <button onClick={() => onOpenValidationDialog(f._id)}>
            Validar {f.userName}
          </button>
          <button onClick={() => onDelete(f._id)}>
            Eliminar {f.userName}
          </button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../components/Fingerprint/FingerprintSearchBar", () => ({
  default: ({ searchInput, setSearchInput, onSearch }) => (
    <form onSubmit={onSearch}>
      <input
        data-testid="search-input"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Buscar huella"
      />
      <button type="submit">Buscar</button>
    </form>
  ),
}));

vi.mock("../components/Fingerprint/StatusFilter", () => ({
  default: ({ value, onChange }) => (
    <select
      data-testid="status-filter"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">Todos</option>
      <option value="pending">Pendiente</option>
      <option value="approved">Aprobado</option>
      <option value="rejected">Rechazado</option>
    </select>
  ),
}));

vi.mock("../components/Fingerprint/BiometricValidationDialog", () => ({
  default: ({ open, onClose, templateId, onApprove, onReject }) =>
    open ? (
      <div data-testid="biometric-dialog">
        <span>Template: {templateId}</span>
        <button onClick={() => onApprove(templateId)}>Aprobar</button>
        <button onClick={() => onReject(templateId, "Imagen borrosa")}>
          Rechazar
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

vi.mock("../components/Fingerprint/FingerprintExportButtons", () => ({
  default: () => <button data-testid="export-btn">Exportar</button>,
}));

vi.mock("../components/common/LoadingOverlay", () => ({ default: () => null }));
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
const mockFingerprints = [
  { _id: "fp1", userName: "Carlos Ruiz", status: "pending", finger: "index" },
  { _id: "fp2", userName: "María López", status: "approved", finger: "thumb" },
];

const renderFingerprints = () =>
  render(<Fingerprints />, { wrapper: MemoryRouter });

// ─── Suite de tests ───────────────────────────────────────────────────────────
describe("Fingerprints", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getFingerprintTemplates.mockResolvedValue({
      fingerprints: mockFingerprints,
      total: 2,
    });
  });

  // ── Estado de carga ─────────────────────────────────────────────────────────
  describe("Estado de carga", () => {
    it("muestra el spinner durante la carga inicial", () => {
      renderFingerprints();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("oculta el spinner al finalizar la carga", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
      );
    });
  });

  // ── Renderizado exitoso ─────────────────────────────────────────────────────
  describe("Renderizado exitoso", () => {
    it("renderiza la tabla con los registros de huellas", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByTestId("fingerprint-table")).toBeInTheDocument()
      );
      expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument();
      expect(screen.getByText("María López")).toBeInTheDocument();
    });

    it("renderiza el encabezado 'Gestión de Huellas Dactilares'", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText(/Gestión de Huellas Dactilares/i)).toBeInTheDocument()
      );
    });

    it("muestra el total en la paginación", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText(/Total: 2/i)).toBeInTheDocument()
      );
    });

    it("muestra el filtro de estado", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByTestId("status-filter")).toBeInTheDocument()
      );
    });
  });

  // ── Llamadas a la API ───────────────────────────────────────────────────────
  describe("Llamadas a la API", () => {
    it("llama a getFingerprintTemplates al montar", async () => {
      renderFingerprints();
      await waitFor(() => {
        expect(getFingerprintTemplates).toHaveBeenCalledTimes(1);
        expect(getFingerprintTemplates).toHaveBeenCalledWith(
          expect.objectContaining({ page: 1, limit: 10 })
        );
      });
    });
  });

  // ── Búsqueda ────────────────────────────────────────────────────────────────
  describe("Búsqueda", () => {
    it("llama a la API con el término de búsqueda al enviar", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByTestId("fingerprint-table")).toBeInTheDocument()
      );

      const input = screen.getByPlaceholderText(/Buscar huella/i);
      await userEvent.type(input, "Carlos");
      fireEvent.submit(input.closest("form"));

      await waitFor(() =>
        expect(getFingerprintTemplates).toHaveBeenCalledWith(
          expect.objectContaining({ search: "Carlos", page: 1 })
        )
      );
    });
  });

  // ── Filtro por estado ───────────────────────────────────────────────────────
  describe("Filtro por estado", () => {
    it("filtra por estado 'pending' y recarga datos", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByTestId("fingerprint-table")).toBeInTheDocument()
      );

      const statusFilter = screen.getByTestId("status-filter");
      await userEvent.selectOptions(statusFilter, "pending");

      await waitFor(() =>
        expect(getFingerprintTemplates).toHaveBeenCalledWith(
          expect.objectContaining({ status: "pending", page: 1 })
        )
      );
    });

    it("filtra por estado 'approved'", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByTestId("fingerprint-table")).toBeInTheDocument()
      );

      const statusFilter = screen.getByTestId("status-filter");
      await userEvent.selectOptions(statusFilter, "approved");

      await waitFor(() =>
        expect(getFingerprintTemplates).toHaveBeenCalledWith(
          expect.objectContaining({ status: "approved" })
        )
      );
    });

    it("filtra por estado 'rejected'", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByTestId("fingerprint-table")).toBeInTheDocument()
      );

      const statusFilter = screen.getByTestId("status-filter");
      await userEvent.selectOptions(statusFilter, "rejected");

      await waitFor(() =>
        expect(getFingerprintTemplates).toHaveBeenCalledWith(
          expect.objectContaining({ status: "rejected" })
        )
      );
    });
  });

  // ── Validación biométrica (aprobar / rechazar) ───────────────────────────────
  describe("Validación biométrica", () => {
    it("abre el diálogo de validación al hacer clic en 'Validar'", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Validar Carlos Ruiz/i }));

      expect(screen.getByTestId("biometric-dialog")).toBeInTheDocument();
      expect(screen.getByText(/Template: fp1/i)).toBeInTheDocument();
    });

    it("llama a updateFingerprintStatus con 'approved' y muestra éxito", async () => {
      updateFingerprintStatus.mockResolvedValue({});
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Validar Carlos Ruiz/i }));
      fireEvent.click(screen.getByText("Aprobar"));

      await waitFor(() => {
        expect(updateFingerprintStatus).toHaveBeenCalledWith(
          "fp1",
          "approved",
          undefined,
          "admin-1"
        );
        expect(mockShowSuccess).toHaveBeenCalledWith("Datos actualizados correctamente");
      });
    });

    it("llama a updateFingerprintStatus con 'rejected' y muestra éxito", async () => {
      updateFingerprintStatus.mockResolvedValue({});
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Validar Carlos Ruiz/i }));
      fireEvent.click(screen.getByText("Rechazar"));

      await waitFor(() => {
        expect(updateFingerprintStatus).toHaveBeenCalledWith(
          "fp1",
          "rejected",
          "Imagen borrosa",
          "admin-1"
        );
        expect(mockShowSuccess).toHaveBeenCalledWith("Datos actualizados correctamente");
      });
    });

    it("muestra showError cuando la aprobación falla", async () => {
      updateFingerprintStatus.mockRejectedValue(new Error("Error"));
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Validar Carlos Ruiz/i }));
      fireEvent.click(screen.getByText("Aprobar"));

      await waitFor(() =>
        expect(mockShowError).toHaveBeenCalledWith(
          "Error interno en el servidor. Por favor intente nuevamente"
        )
      );
    });

    it("cierra el diálogo de validación al hacer clic en 'Cerrar'", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Validar Carlos Ruiz/i }));
      expect(screen.getByTestId("biometric-dialog")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Cerrar"));
      expect(screen.queryByTestId("biometric-dialog")).not.toBeInTheDocument();
    });
  });

  // ── Eliminar huella ─────────────────────────────────────────────────────────
  describe("Eliminar huella dactilar", () => {
    it("abre el diálogo de confirmación al eliminar", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Carlos Ruiz/i }));

      expect(screen.getByTestId("delete-dialog")).toBeInTheDocument();
      expect(screen.getByText(/¿Eliminar registro de huella dactilar?/i)).toBeInTheDocument();
    });

    it("llama a deleteFingerprintTemplate y muestra éxito al confirmar", async () => {
      deleteFingerprintTemplate.mockResolvedValue({});
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Carlos Ruiz/i }));
      fireEvent.click(screen.getByText("Confirmar eliminación"));

      await waitFor(() => {
        expect(deleteFingerprintTemplate).toHaveBeenCalledWith("fp1");
        expect(mockShowSuccess).toHaveBeenCalledWith(
          "Huella dactilar eliminada correctamente"
        );
      });
    });

    it("cierra el diálogo al cancelar", async () => {
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Carlos Ruiz/i }));
      fireEvent.click(screen.getByText("Cancelar"));

      expect(screen.queryByTestId("delete-dialog")).not.toBeInTheDocument();
    });

    it("muestra showError cuando la eliminación falla", async () => {
      deleteFingerprintTemplate.mockRejectedValue({
        response: { data: { message: "No se puede eliminar" } },
      });
      renderFingerprints();
      await waitFor(() =>
        expect(screen.getByText("Carlos Ruiz")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Eliminar Carlos Ruiz/i }));
      fireEvent.click(screen.getByText("Confirmar eliminación"));

      await waitFor(() =>
        expect(mockShowError).toHaveBeenCalledWith("No se puede eliminar")
      );
    });
  });

  // ── Paginación ──────────────────────────────────────────────────────────────
  describe("Paginación", () => {
    it("llama a la API con la siguiente página", async () => {
      getFingerprintTemplates.mockResolvedValue({
        fingerprints: mockFingerprints,
        total: 30,
      });
      renderFingerprints();
      await waitFor(() => expect(screen.getByTestId("pagination")).toBeInTheDocument());

      fireEvent.click(screen.getByText("Siguiente"));

      await waitFor(() =>
        expect(getFingerprintTemplates).toHaveBeenCalledWith(
          expect.objectContaining({ page: 2 })
        )
      );
    });
  });

  // ── Estado de error ─────────────────────────────────────────────────────────
  describe("Estado de error", () => {
    it("muestra alerta cuando la carga falla", async () => {
      getFingerprintTemplates.mockRejectedValue(
        new Error("Error al cargar huellas dactilares")
      );
      renderFingerprints();

      await waitFor(() =>
        expect(screen.getByRole("alert")).toBeInTheDocument()
      );
      expect(
        screen.getByText(/Error al cargar huellas dactilares/i)
      ).toBeInTheDocument();
    });
  });
});
