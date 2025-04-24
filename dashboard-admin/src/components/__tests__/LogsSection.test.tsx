import { render, screen, waitFor } from "@testing-library/react";
import { LogsSection } from "../LogsSection";

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve([
        {
          id: 1,
          timestamp: "2025-04-23T14:33:00Z",
          event_type: "Messaggio non compreso",
          details: "Come posso parlare con un operatore?",
        },
      ]),
  })
) as jest.Mock;

describe("LogsSection", () => {
  it("renders logs", async () => {
    render(<LogsSection />);
    await waitFor(() => screen.getByText(/Messaggio non compreso/));
    expect(screen.getByText(/Come posso parlare con un operatore/)).toBeInTheDocument();
  });
});
