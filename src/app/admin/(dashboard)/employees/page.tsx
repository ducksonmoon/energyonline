import { EmployeesManager } from "@/components/admin/EmployeesManager";
import { getAdminUsers } from "@/lib/queries";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminEmployeesPage() {
  const [employees, session] = await Promise.all([getAdminUsers(), getSession()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">کارکنان</h1>
        <p className="text-sm text-muted-foreground">
          حساب ورود برای هر کارمند بساز تا فروش‌های ثبت‌شده توی گزارش به اسم خودش ثبت بشه
        </p>
      </div>
      <EmployeesManager employees={employees} currentUserId={session?.sub ?? ""} />
    </div>
  );
}
