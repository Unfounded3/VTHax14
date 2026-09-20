import { describe, expect, it } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { useEffect } from "react";
import { http, HttpResponse } from "msw";
import { MemoryRouter } from "react-router-dom";
import { API_BASE_URL } from "../api/client";
import { server } from "../test/msw/server";
import { analyzeFixture } from "../test/fixtures";
import { ScheduleProvider, useSchedule } from "../context/ScheduleContext";
import SelectedCourseWorkspace from "./SelectedCourseWorkspace";

function Seed() {
  const { registerSections } = useSchedule();
  useEffect(() => { registerSections(analyzeFixture.sections); }, [registerSections]);
  return null;
}
it("embeds backend-authoritative course risk relevance and exact commute warning fields", async () => {
  server.use(http.post(`${API_BASE_URL}/analyze`, () => HttpResponse.json(analyzeFixture)));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><MemoryRouter initialEntries={["/?crns=90001,90002"]}><ScheduleProvider><Seed /><SelectedCourseWorkspace /></ScheduleProvider></MemoryRouter></QueryClientProvider>);
  await waitFor(() => expect(screen.getByTestId("risk-score")).toHaveTextContent("41"));
  expect(screen.getByText("Contributes to schedule risk")).toBeTruthy();
  expect(screen.getByText("1 heavy-workload course: CS 1114")).toBeTruthy();
  expect(screen.getByText(/18 min walk/)).toBeTruthy();
  expect(screen.getByText(/adjusted 16 min/)).toBeTruthy();
  expect(screen.getByText(/10 min available gap/)).toBeTruthy();
  expect(screen.getByText(/impossible/)).toBeTruthy();
  expect(screen.getByText(/manual_override/)).toBeTruthy();
  expect(screen.getByText(/MCB -> WHI is an 18-minute walk/)).toBeTruthy();
  expect(screen.queryByText(/41.*/.*score.*90001/)).toBeNull();
});
