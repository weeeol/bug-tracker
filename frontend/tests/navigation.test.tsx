import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { type ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteHeader } from "@/components/site-header";
import { ThemePicker } from "@/components/theme-picker";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceShell } from "@/components/workspace-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/app/acme",
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: {
    children: ReactNode;
    href: string;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

afterEach(cleanup);

describe("SiteHeader", () => {
  it("exposes semantic, keyboard-focusable navigation links", () => {
    render(<SiteHeader />);

    expect(
      screen.getByRole("navigation", { name: "Primary navigation" }),
    ).toBeTruthy();
    expect(
      screen
        .getByRole("link", { name: "Bug Tracker home" })
        .getAttribute("href"),
    ).toBe("/");
    expect(
      screen.getByRole("link", { name: "Sign in" }).getAttribute("href"),
    ).toBe("/auth/sign-in");
    expect(
      screen.getByRole("link", { name: "Sign up" }).getAttribute("href"),
    ).toBe("/auth/sign-up");
    expect(screen.queryByRole("button", { name: "Sign out" })).toBeNull();
  });
});

describe("ThemePicker", () => {
  it("exposes all supported themes and persists a selection", () => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
      },
    });
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: () => ({ matches: false }),
    });

    render(
      <ThemeProvider>
        <ThemePicker />
      </ThemeProvider>,
    );

    const picker = screen.getByRole("combobox", { name: "Theme" });
    expect(screen.getByRole("option", { name: "Light" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Dark" })).toBeTruthy();
    expect(screen.getByRole("option", { name: "Retro dev" })).toBeTruthy();

    fireEvent.change(picker, { target: { value: "retro" } });
    expect(window.localStorage.getItem("bug-tracker-theme")).toBe("retro");
  });
});

describe("WorkspaceShell", () => {
  it("marks the current section and closes the mobile menu with Escape", () => {
    render(
      <ThemeProvider>
        <WorkspaceShell
          organizationSlug="acme"
          organizationName="Acme"
          projects={[{ id: "project-1", name: "Inbox" }]}
        >
          <p>Content</p>
        </WorkspaceShell>
      </ThemeProvider>,
    );

    expect(
      screen
        .getByRole("link", { name: "Overview" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByRole("button", { name: "Sign out" })).toBeTruthy();
    fireEvent.click(
      screen.getByRole("button", { name: "Open workspace navigation" }),
    );
    expect(
      screen.getByRole("button", { name: "Close workspace navigation" }),
    ).toBeTruthy();
    fireEvent.keyDown(document, { key: "Escape" });
    expect(
      screen.queryByRole("button", { name: "Close workspace navigation" }),
    ).toBeNull();
  });
});
