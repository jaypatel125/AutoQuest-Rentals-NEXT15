import AddVehicleForm from "@/components/admin/add-vehicle";
import PageLayout from "@/components/utility/page-layout";

export default function AddVehiclePage() {
  return (
    <PageLayout
      title="Add New Vehicle"
      description="Fill in vehicle details and upload an image"
    >
      <AddVehicleForm />
    </PageLayout>
  );
}
