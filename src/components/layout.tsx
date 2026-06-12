import { Link, useLocation } from "wouter";
import { LayoutDashboard, List, Activity, Menu, X, Brain, PenLine, Link2, TrendingUp, Mail, ShieldCheck, Database } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const sidebarLinks = [
  { href: "/", label: "لوحة القيادة", icon: LayoutDashboard },
  { href: "/analyses", label: "التقارير السابقة", icon: List },
  { href: "/reputation", label: "رادار السمعة — MZ-AI", icon: Brain },
  { href: "/content", label: "إنتاج المحتوى الذكي", icon: PenLine },
  { href: "/backlinks", label: "استراتيجية الروابط", icon: Link2 },
  { href: "/revenue", label: "محرك الإيرادات", icon: TrendingUp },
  { href: "/prospect", label: "رسائل التواصل", icon: Mail },
  { href: "/audit", label: "تدقيق SEO الذكي", icon: ShieldCheck },
  { href: "/intelligence", label: "محقق البيانات الخام", icon: Database },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans selection:bg-primary/30" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 right-0 z-50 w-72 border-l border-border bg-card transition-transform duration-300 ease-in-out md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex h-16 items-center px-6 border-b border-border justify-between md:justify-center">
          <div className="flex items-center gap-3 font-bold text-xl tracking-tight text-primary">
            <Activity className="h-6 w-6" />
            <span>محرك الـ SEO</span>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-4rem)] pb-10">
          <div className="flex flex-col gap-2 p-4">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
              القائمة الرئيسية
            </div>
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location === link.href || (link.href !== "/" && location.startsWith(link.href));
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start gap-3 px-3 h-11 text-base font-medium transition-colors",
                      isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Topbar for mobile */}
        <header className="flex md:hidden h-16 items-center border-b border-border bg-card px-4 shrink-0">
          <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
          <div className="flex-1 flex justify-center items-center gap-2 font-bold text-primary">
            <Activity className="h-5 w-5" />
            <span>محرك الـ SEO</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative">
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
