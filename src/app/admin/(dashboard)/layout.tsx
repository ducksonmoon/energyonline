import { redirect } from "next/navigation";
import { getSession, destroySession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  async function logout() {
    "use server";
    await destroySession();
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen flex" dir="rtl">
      <AdminSidebar username={session.username} logoutAction={logout} />
      <main className="flex-1 p-6 md:p-8 bg-muted/20 overflow-x-hidden">{children}</main>
    </div>
  );
}
