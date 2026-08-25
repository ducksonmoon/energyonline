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
          {report.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز فروشی ثبت نشده.</p>
          ) : (
            <>
              {/* Mobile: stacked list — a 3-col table with a long product name doesn't fit a narrow screen. */}
              <ul className="divide-y sm:hidden">
                {report.topProducts.map((p) => (
                  <li key={p.productId} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                    <span className="shrink-0 text-left text-muted-foreground">
                      {toFa(p.count)} فروش
                      <br />
                      {formatToman(p.revenue)}
                    </span>
                  </li>
                ))}
              </ul>

              <Table className="hidden sm:table">
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
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>فروش به تفکیک کارمند</CardTitle>
        </CardHeader>
        <CardContent>
          {report.byStaff.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز فروشی ثبت نشده.</p>
          ) : (
            <>
              <ul className="divide-y sm:hidden">
                {report.byStaff.map((s) => (
                  <li key={s.username} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 truncate font-medium">{s.username}</span>
                    <span className="shrink-0 text-left text-muted-foreground">
                      {toFa(s.count)} فروش
                      <br />
                      {formatToman(s.revenue)}
                    </span>
                  </li>
                ))}
              </ul>

              <Table className="hidden sm:table">
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
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>آخرین فروش‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          {report.recentSales.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">هنوز فروشی ثبت نشده.</p>
          ) : (
            <>
              {/* Mobile: stacked list — a 5-col table has no room on a narrow screen. */}
              <ul className="divide-y sm:hidden">
                {report.recentSales.map((s) => (
                  <li key={s.id} className="py-2.5 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="min-w-0 flex-1 truncate font-medium">{s.productName}</span>
                      <span className="shrink-0 font-medium">{formatToman(s.price)}</span>
                    </div>
                    <div className="mt-0.5 flex items-center justify-between gap-3 text-xs text-muted-foreground">
                      <span>
                        سایز {s.size} · {s.soldBy}
                      </span>
                      <span>
                        {s.createdAt.toLocaleString("fa-IR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              <Table className="hidden sm:table">
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
                </TableBody>
              </Table>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
