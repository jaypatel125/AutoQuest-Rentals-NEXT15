import { getAllBranches } from "./actions";

export default async function ManageBranchesPage() {
  const branches = await getAllBranches();

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Manage Branches</h1>
      <ManageBranchesTable branches={branches} />
    </main>
  );
}
