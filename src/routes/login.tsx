import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "دخول المسؤول — Swift Mind" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate({ to: "/admin" });
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
          options: { emailRedirectTo: window.location.origin + "/admin" },
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
        <Link to="/" className="flex items-center gap-3 justify-center mb-6">
          <BrandLogo className="h-12 w-auto" />
          <span className="font-bold text-lg">Swift Mynd</span>
        </Link>
        <h1 className="text-2xl font-bold text-center mb-2">
          {mode === "signin" ? "دخول لوحة المسؤول" : "إنشاء حساب مسؤول"}
        </h1>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {mode === "signup" ? "أول حساب يُنشأ يُمنح صلاحيات المسؤول تلقائياً" : "أدخل بياناتك للوصول للوحة التحكم"}
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
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="w-full text-sm text-muted-foreground hover:text-foreground mt-4"
        >
          {mode === "signin" ? "لا تملك حساباً؟ سجّل الآن" : "لديك حساب؟ سجّل دخول"}
        </button>
      </Card>
    </div>
  );
}
