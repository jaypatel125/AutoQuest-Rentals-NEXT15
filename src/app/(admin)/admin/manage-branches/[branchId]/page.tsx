import EditBranch from "@/components/admin/edit-branch";
import PageLayout from "@/components/common/page-layout";

export default function EditBranchPage() {
  return (
    <PageLayout title="Edit Branch" description="Modify branch details below.">
      <EditBranch />
    </PageLayout>
  );
}
