import DashboardLayout from "../../components/layouts/DashboardLayout";

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p className="text-gray-600">Welcome to your dashboard</p>
      </div>
    </DashboardLayout>
  );
}
