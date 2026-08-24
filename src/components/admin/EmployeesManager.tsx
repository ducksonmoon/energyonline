"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { createEmployee, deleteEmployee } from "@/app/admin/(dashboard)/employees/actions";

type Employee = { id: string; username: string };

export function EmployeesManager({
  employees,
  currentUserId,
}: {
  employees: Employee[];
  currentUserId: string;
}) {
  const [rows, setRows] = useState(employees);
  const [pending, startTransition] = useTransition();
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function removeRow(row: Employee) {
    if (!confirm(`حساب «${row.username}» حذف بشه؟`)) return;
    startTransition(async () => {
      const res = await deleteEmployee(row.id);
      if (res?.error) toast.error(res.error);
      else {
        setRows((prev) => prev.filter((r) => r.id !== row.id));
        toast.success("حساب حذف شد");
      }
    });
  }

  function addEmployee() {
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("نام کاربری و رمز عبور رو وارد کن");
      return;
    }
    startTransition(async () => {
      const res = await createEmployee({ username: newUsername.trim(), password: newPassword });
      if (res?.error) {
        toast.error(res.error);
      } else {
        toast.success("کارمند اضافه شد");
        setNewUsername("");
        setNewPassword("");
        window.location.reload();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>نام کاربری</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium">
                  {row.username}
                  {row.id === currentUserId && (
                    <span className="text-xs text-muted-foreground mr-2">(خودت)</span>
                  )}
                </TableCell>
                <TableCell className="text-left">
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => removeRow(row)}
                    disabled={pending || row.id === currentUserId}
                  >
                    حذف
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8 text-muted-foreground">
                  هنوز کارمندی اضافه نشده.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-3">
        <div className="font-medium text-sm">افزودن کارمند جدید</div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">نام کاربری</div>
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="mehrshad"
              className="w-40"
            />
          </div>
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">رمز عبور</div>
            <Input
              type="text"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="حداقل ۶ کاراکتر"
              className="w-40"
            />
          </div>
          <Button type="button" onClick={addEmployee} disabled={pending}>
            + افزودن
          </Button>
        </div>
      </div>
    </div>
  );
}
