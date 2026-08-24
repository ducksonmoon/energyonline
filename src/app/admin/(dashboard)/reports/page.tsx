import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { getSalesReport } from "@/lib/queries";
import { formatToman, toFa } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const report = await getSalesReport();

  const stats = [
    { label: "امروز", count: report.today.count, revenue: report.today.revenue },
    { label: "۷ روز اخیر", count: report.week.count, revenue: report.week.revenue },
    { label: "این ماه", count: report.month.count, revenue: report.month.revenue },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">گزارش فروش</h1>
        <p className="text-sm text-muted-foreground">آمار فروش‌های ثبت‌شده از صفحه ثبت فروش</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="pb-2">
              <CardDescription>{s.label}</CardDescription>
              <CardTitle className="text-3xl">{toFa(s.count)}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{formatToman(s.revenue)}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>پرفروش‌ترین محصولات</CardTitle>
          <CardDescription>بر اساس تعداد فروش (تمام دوره)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>محصول</TableHead>
                <TableHead>تعداد فروش</TableHead>
                <TableHead>درآمد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.topProducts.map((p) => (
                <TableRow key={p.productId}>
                  <TableCell className="font-medium max-w-[220px] truncate">{p.name}</TableCell>
                  <TableCell>{toFa(p.count)}</TableCell>
                  <TableCell>{formatToman(p.revenue)}</TableCell>
                </TableRow>
              ))}
              {report.topProducts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    هنوز فروشی ثبت نشده.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>فروش به تفکیک کارمند</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>کارمند</TableHead>
                <TableHead>تعداد فروش</TableHead>
                <TableHead>درآمد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.byStaff.map((s) => (
                <TableRow key={s.username}>
                  <TableCell className="font-medium">{s.username}</TableCell>
                  <TableCell>{toFa(s.count)}</TableCell>
                  <TableCell>{formatToman(s.revenue)}</TableCell>
                </TableRow>
              ))}
              {report.byStaff.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                    هنوز فروشی ثبت نشده.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آخرین فروش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>محصول</TableHead>
                <TableHead>سایز</TableHead>
                <TableHead>قیمت</TableHead>
                <TableHead>کارمند</TableHead>
                <TableHead>زمان</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.recentSales.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium max-w-[200px] truncate">{s.productName}</TableCell>
                  <TableCell>{s.size}</TableCell>
                  <TableCell>{formatToman(s.price)}</TableCell>
                  <TableCell className="text-muted-foreground">{s.soldBy}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {s.createdAt.toLocaleString("fa-IR", {
                      hour: "2-digit",
                      minute: "2-digit",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </TableCell>
                </TableRow>
              ))}
              {report.recentSales.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    هنوز فروشی ثبت نشده.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
