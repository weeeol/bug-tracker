import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { CommentForm } from "@/components/comment-form";

describe("CommentForm", () => {
  it("exposes an accessible plain-text comment control", () => {
    render(
      <CommentForm
        action={vi.fn().mockResolvedValue({ message: "Posted." })}
      />,
    );

    expect(screen.getByLabelText("Add a comment")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Post comment" })).toBeTruthy();
    expect(screen.getByText(/Plain text only/)).toBeTruthy();
  });
});
