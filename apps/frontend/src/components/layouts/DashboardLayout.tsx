// Dashboard layout with sidebar
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '../DashboardSidebar';
import Header from '../Header';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 p-6 bg-gray-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
