import AddBranch from "@/components/admin/add-branch";
import PageLayout from "@/components/common/page-layout";
import React from "react";

const AddBranchPage = () => {
  return (
    <PageLayout
      title="Add Branch"
      description="Add a new branch to the system."
    >
      <AddBranch />
    </PageLayout>
  );
};

export default AddBranchPage;
