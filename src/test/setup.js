import "@testing-library/jest-dom";
import { vi } from "vitest";
import React from "react";

const IconMock = () => null;

// Mockea todos los sub-paths: @mui/icons-material/Home, /Add, etc.
vi.mock("@mui/icons-material/Home", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/NavigateNext", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/Business", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/PeopleOutline", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/AssignmentInd", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/TrendingUp", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/FilterList", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/FilterListOff", () => ({ default: IconMock }));
vi.mock("@mui/icons-material/Clear", () => ({ default: IconMock }));

// Mockea el paquete base para named exports: import { Add } from '@mui/icons-material'
vi.mock("@mui/icons-material", () => ({
  Add: IconMock,
  FilterList: IconMock,
  FilterListOff: IconMock,
  Clear: IconMock,
  Home: IconMock,
  NavigateNext: IconMock,
  Business: IconMock,
  PeopleOutline: IconMock,
  AssignmentInd: IconMock,
  TrendingUp: IconMock,
  default: IconMock,
}));
