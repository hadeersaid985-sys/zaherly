import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listLeads, checkIsAdmin, grantAdminBootstrap, deleteLeads } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BrandLogo } from "@/components/brand-logo";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download, LogOut, Search, Sparkles, ExternalLink, FileSpreadsheet, Trash2 } from "lucide-react";
import * as XLSX from "xlsx";


export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة المسؤول — ظاهرلي" }] }),
  component: AdminPage,
});

type Lead = {
  id: string;
  website_url: string;
  business_type: string;
  name: string;
  email: string | null;
  phone: string | null;
  marketing_consent?: boolean;
  ai_visibility_score: number | null;
  geo_score: number | null;
  seo_score: number | null;
  content_score?: number | null;
  authority_score?: number | null;
  status: string;
  created_at: string;
};

function AdminPage() {
  const fetchLeads = useServerFn(listLeads);
  const checkAdmin = useServerFn(checkIsAdmin);
  const bootstrap = useServerFn(grantAdminBootstrap);
  const removeLeads = useServerFn(deleteLeads);

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [minScore, setMinScore] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchLeads({
        data: {
          search: search || undefined,
          minScore: minScore ? Number(minScore) : undefined,
          from: from || undefined,
          to: to || undefined,
        },
      });
      setLeads(res.leads as Lead[]);
      setSelected(new Set());

    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const a = await checkAdmin();
        setIsAdmin(a.isAdmin);
        if (a.isAdmin) load();
        else setLoading(false);
      } catch {
        setIsAdmin(false);
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const becomeAdmin = async () => {
    try {
      await bootstrap();
      toast.success("تم منحك صلاحيات المسؤول");
      setIsAdmin(true);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ");
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const rowsForExport = () =>
    leads.map((l) => ({
      "الاسم": l.name,
      "البريد الإلكتروني": l.email ?? "",
      "رقم الجوال": l.phone ?? "",
      "موافقة على العروض": l.marketing_consent ? "نعم" : "لا",
      "رابط الموقع": l.website_url,
      "نوع النشاط": l.business_type,
      "نتيجة AI": l.ai_visibility_score ?? "",
      "نتيجة GEO": l.geo_score ?? "",
      "نتيجة SEO": l.seo_score ?? "",
      "جودة المحتوى": l.content_score ?? "",
      "الموثوقية": l.authority_score ?? "",
      "الحالة": l.status,
      "التاريخ": new Date(l.created_at).toLocaleString("ar-EG"),
      "رابط التقرير": `${window.location.origin}/report/${l.id}`,
      "ID": l.id,
    }));

  const exportXlsx = () => {
    const rows = rowsForExport();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws["!cols"] = Object.keys(rows[0] ?? {}).map((k) => ({ wch: Math.max(14, k.length + 4) }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    XLSX.writeFile(wb, `zaherly-leads-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const exportCsv = () => {
    const rows = rowsForExport();
    const header = Object.keys(rows[0] ?? {});
    const csv = [
      header.join(","),
      ...rows.map((r) => header.map((h) => `"${String((r as Record<string, unknown>)[h] ?? "").replace(/"/g, '""')}"`).join(",")),
    ].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zaherly-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="p-8 max-w-md text-center">
          <h1 className="text-xl font-bold mb-2">حسابك ليس مسؤولاً</h1>
          <p className="text-sm text-muted-foreground mb-4">
            إذا كنت أول مستخدم، يمكنك منح نفسك صلاحيات المسؤول الآن.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={becomeAdmin} className="bg-gradient-hero">منحني صلاحيات المسؤول</Button>
            <Button variant="outline" onClick={signOut}>تسجيل خروج</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <BrandLogo className="h-10 sm:h-12 md:h-14 w-auto" />
            <span className="text-sm text-muted-foreground hidden md:inline">لوحة المسؤول</span>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="default" size="sm" onClick={exportXlsx} className="bg-gradient-hero px-2 sm:px-3" aria-label="تصدير Excel">
              <FileSpreadsheet className="size-4 sm:me-2" />
              <span className="hidden sm:inline">Excel</span>
            </Button>
            <Button variant="outline" size="sm" onClick={exportCsv} className="px-2 sm:px-3" aria-label="تصدير CSV">
              <Download className="size-4 sm:me-2" />
              <span className="hidden sm:inline">CSV</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={signOut} className="px-2 sm:px-3" aria-label="تسجيل خروج">
              <LogOut className="size-4 sm:me-2" />
              <span className="hidden sm:inline">خروج</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <Card className="p-4">
          <div className="grid md:grid-cols-5 gap-3">
            <div className="md:col-span-2">
              <Input placeholder="بحث (اسم، إيميل، موقع، نشاط)" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Input placeholder="الحد الأدنى للنتيجة" type="number" value={minScore} onChange={(e) => setMinScore(e.target.value)} />
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="mt-3 flex justify-end">
            <Button onClick={load} disabled={loading} className="gap-2">
              <Search className="size-4" />
              {loading ? "جاري..." : "تطبيق"}
            </Button>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between gap-2 flex-wrap">
            <h2 className="font-bold">العملاء المحتملون ({leads.length})</h2>
            <div className="flex items-center gap-2">
              {selected.size > 0 && (
                <span className="text-sm text-muted-foreground">{selected.size} محدد</span>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={selected.size === 0 || deleting} className="gap-2">
                    <Trash2 className="size-4" />
                    حذف المحدد
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>حذف العملاء المحددين؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      سيتم حذف {selected.size} سجل نهائياً ولا يمكن التراجع.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        setDeleting(true);
                        try {
                          const ids = Array.from(selected);
                          await removeLeads({ data: { ids } });
                          toast.success(`تم حذف ${ids.length} سجل`);
                          await load();
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "خطأ");
                        } finally {
                          setDeleting(false);
                        }
                      }}
                    >
                      حذف
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 ps-4 pe-2">
                    <Checkbox
                      className="rounded-[4px] h-4 w-4"
                      checked={leads.length > 0 && selected.size === leads.length}
                      onCheckedChange={(c) => {
                        if (c) setSelected(new Set(leads.map((l) => l.id)));
                        else setSelected(new Set());
                      }}
                      aria-label="تحديد الكل"
                    />
                  </TableHead>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
                  <TableHead>الجوال</TableHead>
                  <TableHead>الموقع</TableHead>
                  <TableHead>النشاط</TableHead>
                  <TableHead>AI</TableHead>
                  <TableHead>GEO</TableHead>
                  <TableHead>SEO</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>التاريخ</TableHead>
                  <TableHead>التقرير</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leads.length === 0 && !loading && (
                  <TableRow><TableCell colSpan={12} className="text-center py-8 text-muted-foreground">لا توجد نتائج</TableCell></TableRow>
                )}
                {leads.map((l) => (
                  <TableRow key={l.id} data-state={selected.has(l.id) ? "selected" : undefined}>
                    <TableCell className="ps-4 pe-2">
                      <Checkbox
                        className="rounded-[4px] h-4 w-4"
                        checked={selected.has(l.id)}
                        onCheckedChange={(c) => {
                          setSelected((prev) => {
                            const next = new Set(prev);
                            if (c) next.add(l.id);
                            else next.delete(l.id);
                            return next;
                          });
                        }}
                        aria-label={`تحديد ${l.name}`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell dir="ltr" className="text-sm">{l.email}</TableCell>
                    <TableCell dir="ltr" className="text-sm">{l.phone}</TableCell>
                    <TableCell dir="ltr" className="text-xs max-w-[200px] truncate">{l.website_url}</TableCell>
                    <TableCell className="text-sm">{l.business_type}</TableCell>
                    <TableCell>{l.ai_visibility_score ?? "—"}</TableCell>
                    <TableCell>{l.geo_score ?? "—"}</TableCell>
                    <TableCell>{l.seo_score ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant={l.status === "completed" ? "default" : l.status === "failed" ? "destructive" : "secondary"}>
                        {l.status === "completed" ? "مكتمل" : l.status === "failed" ? "فشل" : "قيد التنفيذ"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(l.created_at).toLocaleDateString("ar")}</TableCell>
                    <TableCell>
                      <Link to="/report/$id" params={{ id: l.id }} className="text-primary hover:underline inline-flex items-center gap-1 text-sm">
                        فتح <ExternalLink className="size-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

      </div>
    </div>
  );
}
