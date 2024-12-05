import { render, screen } from "@testing-library/react";
import { test, describe, expect, vi } from "vitest";
import TodoItem from "./TodoItem"

describe("todo item renders", () => {
	test("renders with right name", () => {
		const todo = {
			id: "3213281093",
			text: "right name",
			done: false
		}
		render(<TodoItem todo={todo} onClickDelete={vi.fn()} onClickComplete={vi.fn()} />)

		const renderedTodoItem = screen.getByText("right name");
		expect(renderedTodoItem).toBeTruthy();
	})
})
