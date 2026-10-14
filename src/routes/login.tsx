import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "تسجيل الدخول — ظاهرلي" },
    { name: "description", content: "سجّل الدخول إلى ظاهرلي لمتابعة تقارير موقعك وأدوات الظهور في الذكاء الاصطناعي." },
    { property: "og:title", content: "تسجيل الدخول — ظاهرلي" },
    { property: "og:description", content: "حسابك وتقاريرك وأدواتك في ظاهرلي." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let done = false;
    const go = () => { if (!done) { done = true; navigate({ to: "/dashboard", replace: true }); } };
    supabase.auth.getSession().then(({ data }) => { if (data.session) go(); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) go();
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/dashboard" },
        });
        if (error) throw error;
        toast.success("تم إنشاء الحساب! جاري الدخول...");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطأ في المصادقة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="p-8 w-full max-w-md shadow-elegant">
        <Link to="/" className="flex items-center justify-center mb-6">
          <BrandLogo className="h-20 md:h-24 w-auto" />
        </Link>
        <h1 className="text-2xl font-bold text-center mb-2">
          {mode === "signin" ? "تسجيل الدخول" : "إنشاء حساب جديد"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "signup" ? "أنشئ حسابك لمتابعة تقاريرك وأدواتك" : "أدخل بياناتك للوصول للوحة التحكم"}
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <Input id="email" type="email" required dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="password">كلمة المرور</Label>
            <Input id="password" type="password" required minLength={8} dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-gradient-hero">
            {loading ? "جاري..." : mode === "signin" ? "دخول" : "إنشاء حساب"}
          </Button>
        </form>
        <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="mt-4 w-full text-sm text-primary hover:underline">
          {mode === "signin" ? "ليس لديك حساب؟ أنشئ حساباً" : "لديك حساب؟ سجّل الدخول"}
        </button>
      </Card>
    </div>
  );
}
