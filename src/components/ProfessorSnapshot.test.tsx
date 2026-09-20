import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../api/client";
import { server } from "../test/msw/server";
import { vibesFixture } from "../test/fixtures";
import ProfessorSnapshot from "./ProfessorSnapshot";

function renderSnapshot(name = "Ada Lovelace") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><ProfessorSnapshot names={[name]} /></QueryClientProvider>);
}
describe("ProfessorSnapshot", () => {
  it("fetches only after explicit expansion and renders backend RMP values", async () => {
    let requests = 0;
    server.use(http.get(`${API_BASE_URL}/professors/:surname/vibes`, () => { requests += 1; return HttpResponse.json(vibesFixture); }));
    renderSnapshot();
    expect(requests).toBe(0);
    fireEvent.click(screen.getByRole("button", { name: "View professor snapshot" }));
    await waitFor(() => expect(requests).toBe(1));
    expect(await screen.findByText("4.2")).toBeTruthy();
    expect(screen.getByText("87")).toBeTruthy();
  });
  it("handles a backend 404 without fabricating a professor summary", async () => {
    server.use(http.get(`${API_BASE_URL}/professors/:surname/vibes`, () => new HttpResponse(null, { status: 404 })));
    renderSnapshot("Unknown Person");
    fireEvent.click(screen.getByRole("button", { name: "View professor snapshot" }));
    expect(await screen.findByText("No instructor data found.")).toBeTruthy();
  });
  it("truthfully reports a missing review summary", async () => {
    server.use(http.get(`${API_BASE_URL}/professors/:surname/vibes`, () => HttpResponse.json({ ...vibesFixture, rmp: null })));
    renderSnapshot();
    fireEvent.click(screen.getByRole("button", { name: "View professor snapshot" }));
    expect(await screen.findByText("No review summary available")).toBeTruthy();
  });
});
