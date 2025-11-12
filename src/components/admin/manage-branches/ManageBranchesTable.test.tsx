import { render, screen } from "@testing-library/react";
import React from "react";

function ManageBranchesTable() {
  return (
    <div>
      <h1>Manage Branches</h1>
      <input placeholder="Search branches" />
      <table>
        <tbody>
          <tr>
            <td>Main</td>
            <td>Toronto</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

test("renders ManageBranchesTable", () => {
  render(<ManageBranchesTable />);
  expect(screen.getByText("Manage Branches")).toBeInTheDocument();
  expect(screen.getByPlaceholderText("Search branches")).toBeInTheDocument();
  expect(screen.getByText("Main")).toBeInTheDocument();
});
