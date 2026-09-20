import { describe, expect, it, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { server } from "../test/msw/server";
import AppHeader from "./AppHeader";

function renderHeader() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><MemoryRouter><AppHeader /></MemoryRouter></QueryClientProvider>);
}
describe("AppHeader", () => {
  beforeEach(() => localStorage.clear());
  it("has no global search surface and exposes the theme toggle", () => {
    renderHeader();
    expect(screen.queryByPlaceholderText(/CS 2104/i)).toBeNull();
    expect(screen.queryByRole("button", { name: "Search courses" })).toBeNull();
    expect(screen.getByRole("switch", { name: /dark mode|light mode/i })).toBeTruthy();
  });
  it("persists the cosmetic dark-mode preference", () => {
    renderHeader();
    fireEvent.click(screen.getByRole("switch", { name: /dark mode/i }));
    expect(localStorage.getItem("hokielens-theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
