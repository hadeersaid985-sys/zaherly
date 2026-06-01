import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { listLeads, checkIsAdmin, grantAdminBootstrap } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Download, LogOut, Search, Sparkles, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "لوحة المسؤول — Swift Mind" }] }),
  component: AdminPage,
});

type Lead = {
  id: string;
  website_url: string;
  business_type: string;
  name: string;
  email: string;
  phone: string | null;
  ai_visibility_score: number | null;
  geo_score: number | null;
  seo_score: number | null;
  status: string;
  created_at: string;
};

function AdminPage() {
  const fetchLeads = useServerFn(listLeads);
  const checkAdmin = useServerFn(checkIsAdmin);
  const bootstrap = useServerFn(grantAdminBootstrap);

  const [leads, setLeads] = useState<Lead[]>([]);
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

  const exportCsv = () => {
    const rows = [
      ["ID", "Name", "Email", "Phone", "Website", "Business", "AI", "GEO", "SEO", "Status", "Date"],
      ...leads.map((l) => [
        l.id, l.name, l.email, l.phone ?? "", l.website_url, l.business_type,
        l.ai_visibility_score ?? "", l.geo_score ?? "", l.seo_score ?? "",
        l.status, new Date(l.created_at).toISOString(),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
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
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <span className="font-bold">Swift Mind — لوحة المسؤول</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={exportCsv}><Download className="size-4 me-2" />تصدير CSV</Button>
            <Button variant="ghost" size="sm" onClick={signOut}><LogOut className="size-4 me-2" />خروج</Button>
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
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold">العملاء المحتملون ({leads.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم</TableHead>
                  <TableHead>البريد</TableHead>
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
                  <TableRow><TableCell colSpan={10} className="text-center py-8 text-muted-foreground">لا توجد نتائج</TableCell></TableRow>
                )}
                {leads.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-medium">{l.name}</TableCell>
                    <TableCell dir="ltr" className="text-sm">{l.email}</TableCell>
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
