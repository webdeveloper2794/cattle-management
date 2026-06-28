import { FormDialog } from "@/components/shared/form/form-dialog";

export default function Page() {
  return (
    <div className="p-4 lg:p-6">
      <h1>Cattle List Page</h1>
      <FormDialog type="create" />
    </div>
  );
}
