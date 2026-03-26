import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "./Dashboard";
import dashboardService from "../services/dashboardService";

// ─── Mocks de servicios ───────────────────────────────────────────────────────
vi.mock("../services/dashboardService", () => ({
  default: {
    getGeneralStats: vi.fn(),
    getWeeklyAttendances: vi.fn(),
    getAttendanceByStatus: vi.fn(),
    getTopUsers: vi.fn(),
  },
}));

// ─── Mock MUI useMediaQuery (desktop por defecto) ─────────────────────────────
vi.mock("@mui/material", async () => {
  const actual = await vi.importActual("@mui/material");
  return { ...actual, useMediaQuery: vi.fn().mockReturnValue(false) };
});

// ─── Mock contextos y stores ──────────────────────────────────────────────────
vi.mock("../contexts/ThemeContext", () => ({
  useThemeMode: () => ({ themeMode: "light", mode: "light" }),
}));

// ─── Mock sub-componentes pesados ─────────────────────────────────────────────
vi.mock("../components/dashboard/StatisticsCard", () => ({
  default: ({ title, count }) => (
    <div data-testid="stats-card">
      {title}: {count}
    </div>
  ),
}));
vi.mock("../components/dashboard/AttendanceChart", () => ({
  default: () => <div data-testid="attendance-chart" />,
}));
vi.mock("../components/dashboard/DepartmentDistribution", () => ({
  default: () => <div data-testid="department-distribution" />,
}));
vi.mock("../components/dashboard/TopUsersRanking", () => ({
  default: ({ onSelectPeriod, period }) => (
    <div data-testid="top-users-ranking">
      <span data-testid="current-period">{period}</span>
      <button onClick={() => onSelectPeriod("weekly")}>Semanal</button>
      <button onClick={() => onSelectPeriod("monthly")}>Mensual</button>
    </div>
  ),
}));

// ─── Datos de prueba ──────────────────────────────────────────────────────────
const mockGeneralStats = {
  totalActiveUsers: 50,
  totalDepartments: 5,
  todayAttendances: 30,
  attendanceRate: 85,
};

const renderDashboard = () => render(<Dashboard />, { wrapper: MemoryRouter });

// ─── Suite de tests ───────────────────────────────────────────────────────────
describe("Dashboard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dashboardService.getGeneralStats.mockResolvedValue({ data: mockGeneralStats });
    dashboardService.getWeeklyAttendances.mockResolvedValue({ data: [] });
    dashboardService.getAttendanceByStatus.mockResolvedValue({});
    dashboardService.getTopUsers.mockResolvedValue({ users: [] });
  });

  // ── Estado de carga ─────────────────────────────────────────────────────────
  describe("Estado de carga", () => {
    it("muestra el spinner mientras carga los datos", () => {
      renderDashboard();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();
    });

    it("oculta el spinner tras cargar correctamente", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.queryByRole("progressbar")).not.toBeInTheDocument()
      );
    });
  });

  // ── Renderizado exitoso ─────────────────────────────────────────────────────
  describe("Renderizado exitoso", () => {
    it("renderiza las 4 tarjetas de estadísticas", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getAllByTestId("stats-card")).toHaveLength(4)
      );
    });

    it("muestra los valores correctos en las tarjetas", async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/Total Colaboradores: 50/i)).toBeInTheDocument();
        expect(screen.getByText(/Departamentos: 5/i)).toBeInTheDocument();
        expect(screen.getByText(/Asistencias Hoy: 30/i)).toBeInTheDocument();
        expect(screen.getByText(/Tasa Asistencia: 85%/i)).toBeInTheDocument();
      });
    });

    it("muestra 0 en tarjetas cuando no hay datos del servidor", async () => {
      dashboardService.getGeneralStats.mockResolvedValue({ data: {} });
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/Total Colaboradores: 0/i)).toBeInTheDocument();
      });
    });

    it("renderiza el gráfico de asistencia semanal", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("attendance-chart")).toBeInTheDocument()
      );
    });

    it("renderiza el gráfico de distribución por departamento", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("department-distribution")).toBeInTheDocument()
      );
    });

    it("renderiza el ranking de usuarios", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("top-users-ranking")).toBeInTheDocument()
      );
    });

    it("muestra el encabezado 'Panel Estadístico'", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByText(/Panel Estadístico/i)).toBeInTheDocument()
      );
    });
  });

  // ── Llamadas a la API ───────────────────────────────────────────────────────
  describe("Llamadas a la API", () => {
    it("llama a los 3 servicios en paralelo al montar", async () => {
      renderDashboard();
      await waitFor(() => {
        expect(dashboardService.getGeneralStats).toHaveBeenCalledTimes(1);
        expect(dashboardService.getWeeklyAttendances).toHaveBeenCalledTimes(1);
        expect(dashboardService.getAttendanceByStatus).toHaveBeenCalledTimes(1);
      });
    });

    it("carga el ranking con el período inicial 'monthly'", async () => {
      renderDashboard();
      await waitFor(() => {
        expect(dashboardService.getTopUsers).toHaveBeenCalledWith("monthly");
      });
    });
  });

  // ── Interacciones ───────────────────────────────────────────────────────────
  describe("Interacciones", () => {
    it("cambia el período al hacer clic en 'Semanal'", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("top-users-ranking")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Semanal"));

      await waitFor(() =>
        expect(dashboardService.getTopUsers).toHaveBeenCalledWith("weekly")
      );
    });

    it("vuelve al período mensual al hacer clic en 'Mensual'", async () => {
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByTestId("top-users-ranking")).toBeInTheDocument()
      );

      fireEvent.click(screen.getByText("Mensual"));

      await waitFor(() =>
        expect(dashboardService.getTopUsers).toHaveBeenCalledWith("monthly")
      );
    });
  });

  // ── Estado de error ─────────────────────────────────────────────────────────
  describe("Estado de error", () => {
    it("muestra mensaje de error cuando falla la carga", async () => {
      dashboardService.getGeneralStats.mockRejectedValue(
        new Error("Error de conexión")
      );
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByText(/Error de conexión/i)).toBeInTheDocument()
      );
    });

    it("muestra el botón 'Reintentar' en estado de error", async () => {
      dashboardService.getGeneralStats.mockRejectedValue(new Error("Fallo"));
      renderDashboard();
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument()
      );
    });

    it("reintenta la carga al hacer clic en 'Reintentar'", async () => {
      dashboardService.getGeneralStats.mockRejectedValueOnce(new Error("Fallo"));
      dashboardService.getGeneralStats.mockResolvedValue({ data: mockGeneralStats });

      renderDashboard();

      await waitFor(() =>
        expect(screen.getByRole("button", { name: /Reintentar/i })).toBeInTheDocument()
      );

      fireEvent.click(screen.getByRole("button", { name: /Reintentar/i }));

      await waitFor(() =>
        expect(dashboardService.getGeneralStats).toHaveBeenCalledTimes(2)
      );
    });
  });
});
