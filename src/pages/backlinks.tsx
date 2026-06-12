import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateBacklinkStrategy } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  Link2, Loader2, Search, Briefcase, Globe, Copy, Check, FileDown,
  Zap, Target, Code2, TrendingUp, Mail, Building2, ChevronDown, ChevronUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  keyword: z.string().min(2, { message: "يجب إدخال الكلمة المفتاحية" }),
  industry: z.string().min(2, { message: "يجب إدخال القطاع" }),
  domain: z.string().optional(),
  targetRegion: z.enum(["gulf", "levant", "egypt", "maghreb", "all-arabic"]).default("gulf"),
  competitors: z.string().optional(),
});
type FormValues = z.infer<typeof formSchema>;

const REGIONS = [
  { group: "🌍 الأسواق العربية",     value: "gulf",          label: "الخليج العربي" },
  { group: "🌍 الأسواق العربية",     value: "levant",        label: "بلاد الشام" },
  { group: "🌍 الأسواق العربية",     value: "egypt",         label: "مصر وشمال أفريقيا" },
  { group: "🌍 الأسواق العربية",     value: "maghreb",       label: "المغرب العربي" },
  { group: "🌍 الأسواق العربية",     value: "all-arabic",    label: "كل الأسواق العربية" },
  { group: "🌎 الأمريكتان",          value: "north-america", label: "🇺🇸🇨🇦 أمريكا الشمالية" },
  { group: "🌎 الأمريكتان",          value: "latin-america", label: "🇧🇷🇲🇽 أمريكا اللاتينية" },
  { group: "🌍 أوروبا",              value: "western-europe",label: "🇬🇧🇩🇪🇫🇷 أوروبا الغربية" },
  { group: "🌍 أوروبا",              value: "eastern-europe",label: "🇷🇺🇵🇱🇹🇷 أوروبا الشرقية" },
  { group: "🌏 آسيا",                value: "east-asia",     label: "🇯🇵🇰🇷🇨🇳 شرق آسيا" },
  { group: "🌏 آسيا",                value: "southeast-asia",label: "🇮🇩🇹🇭🇸🇬 جنوب شرق آسيا" },
  { group: "🌏 آسيا",                value: "south-asia",    label: "🇮🇳🇵🇰🇧🇩 جنوب آسيا" },
  { group: "🌍 أفريقيا وأوقيانوسيا", value: "africa",        label: "🇳🇬🇿🇦 أفريقيا" },
  { group: "🌍 أفريقيا وأوقيانوسيا", value: "oceania",       label: "🇦🇺🇳🇿 أوقيانوسيا" },
];

const PRIORITY_COLORS = {
  high: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  low: "bg-slate-500/15 text-slate-400 border-slate-500/30",
};
const PRIORITY_LABELS = { high: "أولوية عالية", medium: "أولوية متوسطة", low: "أولوية منخفضة" };

const loadingSteps = [
  "نُحلّل فرص الروابط في السوق العربي...",
  "نُحدّد فئات المواقع المثالية DA 20-49...",
  "نكتب قوالب التواصل الاحترافية بالعربي...",
  "نُنشئ خارطة طريق KPIs الشهرية...",
  "نُراجع التوصيات التقنية RTL/hreflang...",
];

function OutreachCard({ tpl, idx }: { tpl: { type: string; subject: string; body: string }; idx: number }) {
  const [open, setOpen] = useState(idx === 0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  async function copyBody() {
    await navigator.clipboard.writeText(`الموضوع: ${tpl.subject}\n\n${tpl.body}`);
    setCopied(true);
    toast({ title: "تم نسخ القالب" });
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Card className="border-border">
      <CardHeader
        className="cursor-pointer select-none py-4"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2"><Mail className="h-4 w-4 text-primary" /></div>
            <div>
              <CardTitle className="text-sm font-semibold">{tpl.type}</CardTitle>
              <CardDescription className="text-xs mt-0.5">{tpl.subject}</CardDescription>
            </div>
          </div>
          {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 space-y-3">
          <div className="rounded-lg bg-muted/30 border border-border p-4 text-sm leading-relaxed whitespace-pre-wrap text-foreground font-mono text-xs">
            {tpl.body}
          </div>
          <Button variant="outline" size="sm" onClick={copyBody}>
            {copied ? <><Check className="h-3.5 w-3.5 ml-2" />تم</> : <><Copy className="h-3.5 w-3.5 ml-2" />نسخ القالب</>}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

function handlePrint(report: ReturnType<typeof useGenerateBacklinkStrategy>["data"]) {
  if (!report) return;
  const win = window.open("", "_blank");
  if (!win) return;

  const cats = report.targetSiteCategories.map((c, i) =>
    `<div class="cat-item p-cat-${c.priority}">
      <div class="cat-header"><span class="cat-num">${i + 1}</span><strong>${c.category}</strong><span class="da-badge">DA ${c.daRange}</span><span class="p-label">${PRIORITY_LABELS[c.priority as keyof typeof PRIORITY_LABELS] ?? c.priority}</span></div>
      <p><strong>التكتيك:</strong> ${c.tactics}</p>
      <p><strong>أمثلة:</strong> ${c.examples.join(" · ")}</p>
    </div>`
  ).join("");

  const qw = report.quickWins.map((w) => `<li>${w}</li>`).join("");
  const lt = report.longTermMoves.map((m) => `<li>${m}</li>`).join("");
  const hn = report.hreflangNotes.map((n) => `<li>${n}</li>`).join("");

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/><title>استراتيجية الروابط — ${report.keyword}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Cairo',sans-serif;direction:rtl;color:#0f172a;background:#fff;padding:2cm;font-size:12px;line-height:1.8}
  .cover{text-align:center;padding:24px 0 20px;border-bottom:3px solid #10b981;margin-bottom:20px}
  .cover h1{font-size:22px;font-weight:800;color:#10b981}.badge{display:inline-block;background:#f0fdf4;color:#065f46;border:1px solid #6ee7b7;border-radius:20px;padding:2px 12px;font-size:10px;margin:2px}
  h2{font-size:15px;font-weight:700;border-right:3px solid #10b981;padding-right:8px;margin:18px 0 10px}
  .summary{background:#f0fdf4;border:1px solid #6ee7b7;border-radius:8px;padding:14px;margin-bottom:16px;font-size:12px;line-height:1.9}
  .cat-item{border:1px solid #e2e8f0;border-radius:6px;padding:12px;margin-bottom:10px}
  .cat-header{display:flex;align-items:center;gap:8px;margin-bottom:6px;flex-wrap:wrap}
  .cat-num{background:#10b981;color:#fff;width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
  .da-badge{background:#dbeafe;color:#1e40af;padding:1px 8px;border-radius:12px;font-size:10px}
  .p-label{padding:1px 8px;border-radius:12px;font-size:10px}
  .p-cat-high .p-label{background:#d1fae5;color:#065f46}.p-cat-medium .p-label{background:#fef3c7;color:#92400e}.p-cat-low .p-label{background:#f1f5f9;color:#475569}
  .kpi-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:16px}
  .kpi-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;text-align:center}
  .kpi-box strong{color:#10b981;display:block;font-size:11px;margin-bottom:4px}
  ul{padding-right:16px;margin-bottom:8px}li{margin-bottom:4px}
  .footer{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
  @media print{body{padding:1.5cm}}</style></head><body>
  <div class="cover"><h1>استراتيجية الروابط الخلفية</h1><div style="margin-top:8px"><span class="badge">${report.keyword}</span><span class="badge">${report.industry}</span><span class="badge">${REGIONS.find(r => r.value === report.targetRegion)?.label ?? report.targetRegion}</span></div></div>
  <div class="summary">${report.executiveSummary}</div>
  <div class="kpi-grid">
    <div class="kpi-box"><strong>الشهر الأول</strong>${report.kpiTargets.month1}</div>
    <div class="kpi-box"><strong>3 أشهر</strong>${report.kpiTargets.month3}</div>
    <div class="kpi-box"><strong>6 أشهر</strong>${report.kpiTargets.month6}</div>
  </div>
  <h2>فئات المواقع المستهدفة</h2>${cats}
  <h2>الانتصارات السريعة</h2><ul>${qw}</ul>
  <h2>الخطوات الاستراتيجية بعيدة المدى</h2><ul>${lt}</ul>
  <h2>توصيات تقنية RTL/hreflang</h2><ul>${hn}</ul>
  <div class="footer">تم الإنتاج بواسطة محرك MZ-AI — ${new Date(report.generatedAt).toLocaleString("ar-SA")}</div>
  <script>setTimeout(()=>{window.print();window.close();},400);</script></body></html>`;
  win.document.write(html);
  win.document.close();
}

export default function BacklinksPage() {
  const { toast } = useToast();
  const mutation = useGenerateBacklinkStrategy();
  const [loadingStep, setLoadingStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { keyword: "", industry: "", domain: "", targetRegion: "gulf", competitors: "" },
  });

  function onSubmit(values: FormValues) {
    setLoadingStep(0);
    const iv = setInterval(() => setLoadingStep((p) => (p < loadingSteps.length - 1 ? p + 1 : p)), 6000);
    mutation.mutate(
      {
        data: {
          ...values,
          domain: values.domain || undefined,
          competitors: values.competitors || undefined,
        },
      },
      {
        onSuccess: () => {
          clearInterval(iv);
          toast({ title: "الاستراتيجية جاهزة", description: "تم إنشاء استراتيجية الروابط بنجاح" });
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
        },
        onError: (e) => {
          clearInterval(iv);
          toast({ title: "فشل الإنشاء", description: e instanceof Error ? e.message : "حدث خطأ", variant: "destructive" });
        },
      }
    );
  }

  const result = mutation.data;

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Link2 className="h-3.5 w-3.5" />
          بناء الروابط الخلفية — DA 20-49
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">استراتيجية الروابط الخلفية</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
          غطِّ أي سوق عالمي — من الخليج إلى الولايات المتحدة إلى آسيا.
          مواقع DA 20-49، قوالب تواصل احترافية، توصيات تقنية، وخارطة طريق KPIs لـ 6 أشهر.
        </p>
      </motion.div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            إعداد الاستراتيجية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="keyword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Search className="h-4 w-4" />الكلمة المفتاحية</FormLabel>
                    <FormControl><Input placeholder="مثال: شركة تصميم مواقع" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="industry" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Briefcase className="h-4 w-4" />القطاع</FormLabel>
                    <FormControl><Input placeholder="مثال: التسويق الرقمي" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <FormField control={form.control} name="targetRegion" render={({ field }) => {
                const selected = REGIONS.find((r) => r.value === field.value);
                const groups = [...new Set(REGIONS.map((r) => r.group))];
                return (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Globe className="h-4 w-4" />المنطقة المستهدفة</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue>{selected?.label ?? "اختر المنطقة"}</SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-72">
                        {groups.map((group) => (
                          <div key={group}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1 mt-1">{group}</div>
                            {REGIONS.filter((r) => r.group === group).map((r) => (
                              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                );
              }} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="domain" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Building2 className="h-4 w-4" />موقعك (اختياري)</FormLabel>
                    <FormControl><Input placeholder="example.com" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="competitors" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Target className="h-4 w-4" />المنافسون (اختياري)</FormLabel>
                    <FormControl><Input placeholder="competitor1.com, competitor2.com" {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={mutation.isPending}>
                {mutation.isPending
                  ? <><Loader2 className="ml-2 h-5 w-5 animate-spin" />جاري الإنشاء...</>
                  : <><Link2 className="ml-2 h-5 w-5" />إنشاء الاستراتيجية</>}
              </Button>

              {mutation.isPending && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
                  <div className="flex items-center gap-3 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    {loadingSteps[loadingStep]}
                  </div>
                  <p className="text-xs text-muted-foreground pr-7 mt-1">قد يستغرق حتى دقيقة كاملة للتحليل الكامل.</p>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {result && (
        <motion.div ref={resultRef} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold">الاستراتيجية</h2>
              <Badge variant="outline">{result.keyword}</Badge>
              <Badge variant="secondary">{result.industry}</Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                {REGIONS.find((r) => r.value === result.targetRegion)?.label ?? result.targetRegion}
              </Badge>
            </div>
            <Button variant="default" size="sm" onClick={() => handlePrint(result)}>
              <FileDown className="h-4 w-4 ml-2" />تحميل PDF
            </Button>
          </div>

          <Separator />

          {/* Executive Summary */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-primary flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />الملخص التنفيذي
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-start justify-between gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground flex-1">{result.executiveSummary}</p>
              <Button variant="ghost" size="icon" className="shrink-0" onClick={async () => {
                await navigator.clipboard.writeText(result.executiveSummary);
                setCopiedSummary(true);
                setTimeout(() => setCopiedSummary(false), 2000);
              }}>
                {copiedSummary ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CardContent>
          </Card>

          {/* KPI Timeline */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "الشهر الأول", value: result.kpiTargets.month1, color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/30 text-emerald-400" },
              { label: "3 أشهر", value: result.kpiTargets.month3, color: "from-blue-500/10 to-blue-500/5 border-blue-500/30 text-blue-400" },
              { label: "6 أشهر", value: result.kpiTargets.month6, color: "from-violet-500/10 to-violet-500/5 border-violet-500/30 text-violet-400" },
            ].map((kpi) => (
              <Card key={kpi.label} className={`bg-gradient-to-br ${kpi.color}`}>
                <CardHeader className="pb-2">
                  <CardDescription className={`text-xs font-semibold uppercase ${kpi.color.split(" ")[3]}`}>{kpi.label}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-foreground leading-relaxed">{kpi.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Tabs defaultValue="sites" dir="rtl">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="sites">فئات المواقع</TabsTrigger>
              <TabsTrigger value="outreach">قوالب التواصل</TabsTrigger>
              <TabsTrigger value="roadmap">خارطة الطريق</TabsTrigger>
              <TabsTrigger value="technical">تقنية RTL</TabsTrigger>
            </TabsList>

            {/* Target Sites */}
            <TabsContent value="sites">
              <div className="space-y-3">
                {result.targetSiteCategories.map((cat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Card className="border-border">
                      <CardContent className="pt-5 pb-4">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="rounded-full bg-primary text-primary-foreground w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</div>
                            <div className="min-w-0">
                              <p className="font-semibold text-sm">{cat.category}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{cat.tactics}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className="text-xs border-blue-500/30 text-blue-400 bg-blue-500/10">
                              DA {cat.daRange}
                            </Badge>
                            <Badge variant="outline" className={`text-xs ${PRIORITY_COLORS[cat.priority as keyof typeof PRIORITY_COLORS] ?? ""}`}>
                              {PRIORITY_LABELS[cat.priority as keyof typeof PRIORITY_LABELS] ?? cat.priority}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pr-10">
                          {cat.examples.map((ex, j) => (
                            <span key={j} className="text-xs bg-muted/50 border border-border rounded-md px-2 py-0.5 text-muted-foreground">{ex}</span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            {/* Outreach Templates */}
            <TabsContent value="outreach">
              <div className="space-y-3">
                {result.outreachTemplates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8 text-sm">لا توجد قوالب.</p>
                ) : (
                  result.outreachTemplates.map((tpl, i) => <OutreachCard key={i} tpl={tpl} idx={i} />)
                )}
              </div>
            </TabsContent>

            {/* Roadmap */}
            <TabsContent value="roadmap">
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border-emerald-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-emerald-400">
                      <Zap className="h-4 w-4" />الانتصارات السريعة (1-2 أسبوع)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.quickWins.map((w, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                          {w}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
                <Card className="border-violet-500/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2 text-violet-400">
                      <Target className="h-4 w-4" />الخطوات الاستراتيجية (3-6 أشهر)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {result.longTermMoves.map((m, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-violet-400 font-bold shrink-0 mt-0.5">{i + 1}.</span>
                          {m}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Technical RTL */}
            <TabsContent value="technical">
              <Card className="border-amber-500/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2 text-amber-400">
                    <Code2 className="h-4 w-4" />توصيات RTL/hreflang التقنية
                  </CardTitle>
                  <CardDescription className="text-xs">
                    نقاط فنية تغفلها أدوات مثل Ahrefs وSEMrush في المواقع العربية
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {result.hreflangNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground">
                        <Code2 className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground pt-2">
            تم الإنتاج بواسطة MZ-AI — {new Date(result.generatedAt).toLocaleString("ar-SA")}
          </p>
        </motion.div>
      )}

      {!result && !mutation.isPending && (
        <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
          <Link2 className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-base font-semibold">المحرك جاهز لبناء الروابط</p>
          <p className="text-sm mt-1 opacity-70">الميزة التي لا يملكها SEMrush ولا Ahrefs بالعربي</p>
          <p className="text-xs mt-2 opacity-50">فئات المواقع DA 20-49 · قوالب التواصل · KPIs شهرية · تقنية RTL/hreflang</p>
        </div>
      )}
    </div>
  );
}
