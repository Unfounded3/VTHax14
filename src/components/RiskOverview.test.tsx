import { beforeEach, describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { API_BASE_URL } from "../api/client";
import type { AnalyzeRequest, AnalyzeResponse, Section } from "../api/types";
import { server } from "../test/msw/server";
import { analyzeFixture } from "../test/fixtures";
import { ScheduleProvider, useSchedule } from "../context/ScheduleContext";
import RiskOverview from "./RiskOverview";

function makeSection(crn: string): Section {
  return { ...analyzeFixture.sections[0]!, crn, course_id: `CS ${crn}` };
}
function Seed() {
  const { registerSections } = useSchedule();
  useEffect(() => { registerSections([makeSection("90001"), makeSection("90002")]); }, [registerSections]);
  return null;
}
let posts: AnalyzeRequest[] = [];
function renderRisk(entry: string, response: AnalyzeResponse = analyzeFixture) {
  server.use(http.post(`${API_BASE_URL}/analyze`, async ({ request }) => {
    posts.push((await request.json()) as AnalyzeRequest);
    return HttpResponse.json(response);
  }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter initialEntries={[entry]}><ScheduleProvider><Seed /><RiskOverview /></ScheduleProvider></MemoryRouter></QueryClientProvider>);
}
beforeEach(() => { posts = []; });
describe("RiskOverview", () => {
  it("renders only the compact overall backend risk and no removed factor/data-note surfaces", async () => {
    renderRisk("/?crns=90001,90002");
    await waitFor(() => expect(posts).toHaveLength(1));
    expect(await screen.findByTestId("risk-score")).toHaveTextContent("41");
    expect(screen.queryByText("Factor breakdown")).toBeNull();
    expect(screen.queryByText("Data notes")).toBeNull();
    expect(screen.queryByText(/synthetic/i)).toBeNull();
    expect(screen.queryByText(/Contributes to schedule risk/)).toBeNull();
  });
  it("makes no analyze request for one selected section", async () => {
    renderRisk("/?crns=90001");
    expect(await screen.findByText("Add at least one more section to calculate schedule risk.")).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(posts).toHaveLength(0);
  });
});
