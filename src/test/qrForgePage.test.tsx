import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockUseQRCodes, mockUseQRForgeMutations } = vi.hoisted(() => ({
  mockUseQRCodes: vi.fn(() => ({
    data: [],
    isLoading: false,
  })),
  mockUseQRForgeMutations: vi.fn(() => ({
    addQRCode: { mutateAsync: vi.fn() },
    deleteQRCode: { mutateAsync: vi.fn() },
    clearAllQRCodes: { mutateAsync: vi.fn() },
  })),
}));

vi.mock("@/hooks/useQRForgeApi", () => ({
  useQRCodes: mockUseQRCodes,
  useQRForgeMutations: mockUseQRForgeMutations,
}));

vi.mock("@/stores/authStore", () => ({
  useAuthStore: (selector: (state: { user: { id: string; user_id: string } }) => unknown) =>
    selector({
      user: {
        id: "profile-row-id",
        user_id: "auth-user-id",
      },
    }),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {},
  isSupabaseConfigured: false,
  isUsingSupabaseMock: true,
}));

vi.mock("recharts", () => {
  const MockChart = ({ children }: { children?: React.ReactNode }) => <div>{children}</div>;
  return {
    ResponsiveContainer: MockChart,
    AreaChart: MockChart,
    Area: MockChart,
    XAxis: MockChart,
    YAxis: MockChart,
    CartesianGrid: MockChart,
    Tooltip: MockChart,
    PieChart: MockChart,
    Pie: MockChart,
    Cell: MockChart,
  };
});

import QRForgePage from "@/pages/dashboard/QRForgePage";

describe("QRForgePage", () => {
  beforeEach(() => {
    mockUseQRCodes.mockClear();
    mockUseQRForgeMutations.mockClear();
  });

  it("wires QR queries and mutations to the authenticated user id", async () => {
    render(<QRForgePage />);

    await waitFor(() => {
      expect(mockUseQRCodes).toHaveBeenCalledWith("auth-user-id");
      expect(mockUseQRForgeMutations).toHaveBeenCalledWith("auth-user-id");
    });
  });
});
