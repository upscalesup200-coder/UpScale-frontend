"use client";
import AdminSidebar from "./components/AdminSidebar";

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-row-reverse" dir="rtl">    
      <AdminSidebar />
      <main className="flex-1 w-full overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}