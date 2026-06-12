import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Database, Globe, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Search, Code2, FileText, List, HelpCircle, Cpu, ChevronDown, ChevronUp, FileDown
} from "lucide-react";

const MARKETS = [
  { value: "sa", label: "🇸🇦 السعودية", lang: "ar" },
  { value: "ae", label: "🇦🇪 الإمارات", lang: "ar" },
  { value: "eg", label: "🇪🇬 مصر", lang: "ar" },
  { value: "kw", label: "🇰🇼 الكويت", lang: "ar" },
  { value: "qa", label: "🇶🇦 قطر", lang: "ar" },
  { value: "bh", label: "🇧🇭 البحرين", lang: "ar" },
  { value: "om", label: "🇴🇲 عُمان", lang: "ar" },
  { value: "jo", label: "🇯🇴 الأردن", lang: "ar" },
  { value: "ma", label: "🇲🇦 المغرب", lang: "ar" },
  { value: "us", label: "🇺🇸 الولايات المتحدة", lang: "en" },
  { value: "gb", label: "🇬🇧 المملكة المتحدة", lang: "en" },
];

interface SerpEntry { rank: number; domain: string; title: string; description: string | null; isClient: boolean; }
interface ClientPageRaw {
  h1Actual: string | null; metaTitle: string | null; metaDescription: string | null;
  metaKeywordsRaw: string | null; metaKeywordsHasCompetitorNames: boolean;
  competitorNamesFound: string[]; h2List: string[]; h3List: string[];
  hasVisibleFaq: boolean; schemaTypesFound: string[];
  trustSignalsLocation: string | null; scrapedAt: string | null; scrapeError: string | null;
}
interface DataIntelligenceReport {
  serp: SerpEntry[]; clientPage: ClientPageRaw; paaQuestions: string[];
  aiOverviewAppears: boolean; clientSerpRank: number | null;
  keyword: string; market: string; collectedAt: string;
}

function exportIntelligencePdf(report: DataIntelligenceReport) {
  const win = window.open("", "_blank");
  if (!win) return;
  const cp = report.clientPage;
  const CSS = `body{font-family:Tajawal,Arial,sans-serif;direction:rtl;background:#fff;color:#1a1a2e;max-width:800px;margin:0 auto;padding:24px;font-size:12px;line-height:1.6}
h1{color:#0891b2;font-size:22px;margin-bottom:4px}h2{color:#1e40af;font-size:14px;margin:18px 0 8px;border-bottom:2px solid #e2e8f0;padding-bottom:4px}
.cover{text-align:center;margin-bottom:20px;padding:20px;background:linear-gradient(135deg,#ecfeff,#eff6ff);border-radius:10px}
.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;margin:2px;background:#cffafe;color:#164e63}
table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px}
th{background:#ecfeff;color:#0e7490;padding:7px 6px;text-align:right;font-weight:600}td{padding:6px;border-bottom:1px solid #f1f5f9}
.highlight{background:#ecfeff;font-weight:700}
.meta-row{display:flex;gap:8px;margin-bottom:6px;font-size:11px}
.meta-label{color:#64748b;font-weight:600;flex-shrink:0;min-width:120px}
.meta-val{color:#1a1a2e;word-break:break-all}
.schema-badge{display:inline-block;padding:2px 8px;border-radius:12px;background:#dbeafe;color:#1e40af;font-size:10px;font-family:monospace;margin:2px}
.warn-badge{background:#fef2f2;color:#991b1b}
.paa{display:flex;gap:8px;padding:7px 10px;border-radius:6px;background:#f8fafc;border:1px solid #e2e8f0;margin-bottom:5px}
.paa-num{width:20px;height:20px;border-radius:50%;background:#0891b2;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.footer{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
@media print{body{padding:1cm}}`;

  const serpRows = report.serp.map((e) =>
    `<tr class="${e.isClient ? "highlight" : ""}"><td style="text-align:center;font-weight:700">${e.rank}${e.isClient ? " ★" : ""}</td><td>${e.domain}${e.isClient ? " (أنت)" : ""}</td><td>${e.title}</td><td style="color:#64748b">${e.description ? e.description.substring(0, 60) + "…" : "—"}</td></tr>`
  ).join("");

  const metaRows = [
    ["H1", cp.h1Actual ?? "null"],
    ["Meta Title", cp.metaTitle ?? "null"],
    ["Meta Description", cp.metaDescription ? cp.metaDescription.substring(0, 120) + "…" : "null"],
    ["Meta Keywords", cp.metaKeywordsRaw ? (cp.metaKeywordsRaw.substring(0, 150) + (cp.metaKeywordsHasCompetitorNames ? " ⚠️ يحتوي أسماء منافسين!" : "")) : "null"],
    ["FAQ مرئي", cp.hasVisibleFaq ? "✓ نعم" : "✗ لا"],
    ["Schema Markup", cp.schemaTypesFound.length ? cp.schemaTypesFound.join("، ") : "لا توجد"],
    ["إشارات الثقة", cp.trustSignalsLocation ?? "لم يُعثر"],
  ].map(([l, v]) => `<div class="meta-row"><div class="meta-label">${l}</div><div class="meta-val">${v}</div></div>`).join("");

  const h2s = cp.h2List.length ? cp.h2List.map((h) => `<li>${h}</li>`).join("") : "<li style='color:#94a3b8'>لا توجد</li>";
  const h3s = cp.h3List.length ? cp.h3List.slice(0, 15).map((h) => `<li>${h}</li>`).join("") : "<li style='color:#94a3b8'>لا توجد</li>";
  const paas = report.paaQuestions.map((q, i) =>
    `<div class="paa"><div class="paa-num">${i + 1}</div><div>${q}</div></div>`
  ).join("");

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>استخبارات البيانات — ${report.keyword}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="cover"><h1>محقق البيانات الخام</h1><p style="color:#64748b;font-size:12px">Raw Data Intelligence Report</p>
<div style="margin-top:8px"><span class="badge">${report.keyword}</span><span class="badge">${report.market.toUpperCase()}</span>
${report.clientSerpRank ? `<span class="badge" style="background:#d1fae5;color:#065f46">المرتبة: #${report.clientSerpRank}</span>` : '<span class="badge" style="background:#fef2f2;color:#991b1b">لا يظهر في أول 10</span>'}
${report.aiOverviewAppears ? '<span class="badge" style="background:#fef9c3;color:#713f12">AI Overview: موجود</span>' : ""}
</div></div>
<h2>SERP — نتائج البحث الحالية</h2>
<table><thead><tr><th>#</th><th>الدومين</th><th>العنوان</th><th>الوصف</th></tr></thead><tbody>${serpRows}</tbody></table>
<h2>بيانات الصفحة الرئيسية</h2>${metaRows}
<h2>هيكل H2</h2><ul style="font-size:11px;padding-right:18px">${h2s}</ul>
<h2>هيكل H3 (أول 15)</h2><ul style="font-size:11px;padding-right:18px">${h3s}</ul>
<h2>أسئلة الناس — PAA</h2>${paas || "<p style='color:#94a3b8'>لا توجد</p>"}
<div class="footer">تم الإنتاج بواسطة محرك MZ-AI — ${new Date(report.collectedAt).toLocaleString("ar-SA")}</div>
<script>setTimeout(()=>{window.print();window.close();},400);</script></body></html>`;
  win.document.write(html);
  win.document.close();
}

function StatusBadge({ ok, warn, label }: { ok?: boolean; warn?: boolean; label: string }) {
  if (ok) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-medium"><CheckCircle2 className="h-3 w-3" />{label}</span>;
  if (warn) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-400 text-xs font-medium"><AlertTriangle className="h-3 w-3" />{label}</span>;
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-medium"><XCircle className="h-3 w-3" />{label}</span>;
}

function NullValue() {
  return <span className="text-muted-foreground/50 italic text-xs">null</span>;
}

function MetaField({ label, value, mono = false }: { label: string; value: string | null; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      {value ? (
        <p className={`text-sm text-foreground leading-relaxed break-all ${mono ? "font-mono bg-muted/30 px-2 py-1 rounded text-xs" : ""}`}>{value}</p>
      ) : <NullValue />}
    </div>
  );
}

export default function IntelligencePage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ websiteUrl: "", primaryKeyword: "", targetMarket: "sa", language: "ar" });
  const [report, setReport] = useState<DataIntelligenceReport | null>(null);
  const [showAllH3, setShowAllH3] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/data-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).error ?? "فشل"); }
      return res.json() as Promise<DataIntelligenceReport>;
    },
    onSuccess: (data) => {
      setReport(data);
      toast({ title: "✅ اكتملت عملية الجمع", description: "البيانات الخام جاهزة" });
    },
    onError: (e: Error) => toast({ title: "خطأ", description: e.message, variant: "destructive" }),
  });

  const cp = report?.clientPage;

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
          <Database className="h-4 w-4" />
          Raw Data Intelligence Collector
        </div>
        <h1 className="text-4xl font-bold text-white">محقق البيانات الخام</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          يجمع بيانات Google الحقيقية من SERP + يزور الموقع ويستخرج كل البيانات التقنية — بدون تحليل، JSON نظيف
        </p>
      </div>

      {/* Form */}
      <Card className="bg-card/60 border-border/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5 text-cyan-400" /> إعدادات الجمع</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>موقع العميل (URL أو دومين)</Label>
              <Input placeholder="مثال: mysite.com أو https://mysite.com" value={form.websiteUrl} onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الكلمة المفتاحية الرئيسية</Label>
              <Input placeholder="مثال: شركة تصميم مواقع" value={form.primaryKeyword} onChange={(e) => setForm({ ...form, primaryKeyword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Globe className="h-4 w-4" /> السوق المستهدف</Label>
              <select
                value={form.targetMarket}
                onChange={(e) => {
                  const m = MARKETS.find((x) => x.value === e.target.value);
                  setForm({ ...form, targetMarket: e.target.value, language: m?.lang ?? "ar" });
                }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MARKETS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label>اللغة</Label>
              <select
                value={form.language}
                onChange={(e) => setForm({ ...form, language: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="ar">العربية</option>
                <option value="en">الإنجليزية</option>
              </select>
            </div>
          </div>
          <Button
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white h-12 text-base font-semibold"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.websiteUrl || !form.primaryKeyword}
          >
            {mutation.isPending
              ? <><Loader2 className="h-5 w-5 animate-spin ml-2" /> يجمع البيانات من Google والموقع…</>
              : <><Database className="h-5 w-5 ml-2" /> ابدأ جمع البيانات الخام</>}
          </Button>
          {mutation.isPending && (
            <p className="text-center text-xs text-muted-foreground">يستغرق 10-20 ثانية — يجلب SERP + يزور الموقع في نفس الوقت</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {report && cp && (
        <div className="space-y-6">
          {/* PDF Export */}
          <div className="flex justify-end">
            <Button onClick={() => exportIntelligencePdf(report)} variant="outline" className="gap-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10">
              <FileDown className="h-4 w-4" />
              تحميل PDF
            </Button>
          </div>
          {/* Status Row */}
          <div className="flex flex-wrap gap-3 items-center p-4 rounded-xl border border-border/40 bg-muted/20">
            <div className="flex items-center gap-2 text-sm text-muted-foreground ml-auto">
              <span className="font-mono text-xs bg-muted/50 px-2 py-0.5 rounded">{report.keyword}</span>
              <span>·</span>
              <span className="uppercase text-xs">{report.market}</span>
              <span>·</span>
              <span className="text-xs">{new Date(report.collectedAt).toLocaleTimeString("ar-SA")}</span>
            </div>
            <StatusBadge ok={report.aiOverviewAppears} warn={false} label={report.aiOverviewAppears ? "AI Overview: موجود" : "AI Overview: غير موجود"} />
            <StatusBadge ok={!cp.scrapeError} label={cp.scrapeError ? `خطأ في الزيارة: ${cp.scrapeError.substring(0, 30)}` : "تمت زيارة الموقع"} />
            {report.clientSerpRank ? (
              <StatusBadge ok={report.clientSerpRank <= 3} warn={report.clientSerpRank <= 7} label={`المرتبة: #${report.clientSerpRank}`} />
            ) : (
              <StatusBadge label="لا يظهر في أول 10" />
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* SERP Table */}
            <Card className="bg-card/60 border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5 text-cyan-400" /> SERP — نتائج البحث الحالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60 text-muted-foreground text-xs">
                        <th className="py-2 px-3 text-center w-10">#</th>
                        <th className="py-2 px-3 text-right">الدومين</th>
                        <th className="py-2 px-3 text-right">العنوان</th>
                        <th className="py-2 px-3 text-right hidden md:table-cell">الوصف</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.serp.map((entry) => (
                        <tr
                          key={entry.rank}
                          className={`border-b border-border/30 transition-colors ${entry.isClient ? "bg-cyan-500/10 border-cyan-500/30" : "hover:bg-muted/20"}`}
                        >
                          <td className="py-2.5 px-3 text-center">
                            <span className={`font-bold text-sm ${entry.isClient ? "text-cyan-400" : "text-muted-foreground"}`}>
                              {entry.rank}
                            </span>
                            {entry.isClient && <span className="block text-xs text-cyan-400 font-medium">أنت</span>}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`text-xs font-mono ${entry.isClient ? "text-cyan-300 font-semibold" : "text-muted-foreground"}`}>
                              {entry.domain}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <span className={`text-sm ${entry.isClient ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                              {entry.title}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 hidden md:table-cell max-w-xs">
                            <span className="text-xs text-muted-foreground/70 line-clamp-2">{entry.description ?? "—"}</span>
                          </td>
                        </tr>
                      ))}
                      {report.serp.length === 0 && (
                        <tr><td colSpan={4} className="py-8 text-center text-muted-foreground text-sm">لم يُعثر على نتائج SERP</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* On-Page Meta Data */}
            <Card className={`border-border/60 ${cp.scrapeError ? "bg-red-950/30 border-red-500/20" : "bg-card/60"}`}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-cyan-400" />
                  بيانات الصفحة الرئيسية
                  {cp.scrapeError && <Badge variant="destructive" className="text-xs">خطأ في الزيارة</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cp.scrapeError ? (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-300">
                    <XCircle className="h-4 w-4 inline ml-1" />
                    {cp.scrapeError}
                  </div>
                ) : null}
                <MetaField label="H1 الفعلي" value={cp.h1Actual} />
                <MetaField label="Meta Title" value={cp.metaTitle} />
                <MetaField label="Meta Description" value={cp.metaDescription} />

                {/* Meta Keywords with competitor check */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground font-medium">Meta Keywords</p>
                    {cp.metaKeywordsRaw && cp.metaKeywordsHasCompetitorNames && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" /> يحتوي أسماء منافسين!
                      </span>
                    )}
                    {cp.metaKeywordsRaw && !cp.metaKeywordsHasCompetitorNames && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs">نظيف</span>
                    )}
                  </div>
                  {cp.metaKeywordsRaw ? (
                    <p className="font-mono bg-muted/30 px-2 py-1.5 rounded text-xs text-foreground break-all leading-relaxed">{cp.metaKeywordsRaw}</p>
                  ) : <NullValue />}
                  {cp.competitorNamesFound.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs text-red-400">أسماء المنافسين الموجودة:</span>
                      {cp.competitorNamesFound.map((name) => (
                        <Badge key={name} variant="destructive" className="text-xs">{name}</Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Indicators */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <StatusBadge ok={cp.hasVisibleFaq} label={cp.hasVisibleFaq ? "FAQ موجود" : "لا يوجد FAQ"} />
                  <StatusBadge ok={Boolean(cp.trustSignalsLocation)} warn={false} label={cp.trustSignalsLocation ? `ثقة: ${cp.trustSignalsLocation}` : "لا توجد إشارات ثقة"} />
                </div>

                {/* Schema Types */}
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Schema Markup المكتشفة</p>
                  {cp.schemaTypesFound.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {cp.schemaTypesFound.map((s) => (
                        <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 text-xs font-mono">
                          <Code2 className="h-3 w-3" />{s}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-xs text-red-400 flex items-center gap-1"><XCircle className="h-3 w-3" /> لا توجد Schema Markup</span>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Headings */}
            <Card className="bg-card/60 border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><List className="h-5 w-5 text-cyan-400" /> هيكل العناوين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* H2 List */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    H2
                    <span className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">{cp.h2List.length}</span>
                  </p>
                  {cp.h2List.length > 0 ? (
                    <ul className="space-y-1">
                      {cp.h2List.map((h, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-cyan-500/60 font-mono text-xs mt-0.5">H2</span>
                          <span className="text-foreground leading-snug">{h}</span>
                        </li>
                      ))}
                    </ul>
                  ) : <NullValue />}
                </div>

                {/* H3 List */}
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-2">
                    H3
                    <span className="bg-muted/50 px-1.5 py-0.5 rounded text-xs">{cp.h3List.length}</span>
                  </p>
                  {cp.h3List.length > 0 ? (
                    <>
                      <ul className="space-y-1">
                        {(showAllH3 ? cp.h3List : cp.h3List.slice(0, 6)).map((h, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-purple-500/60 font-mono text-xs mt-0.5">H3</span>
                            <span className="text-muted-foreground leading-snug">{h}</span>
                          </li>
                        ))}
                      </ul>
                      {cp.h3List.length > 6 && (
                        <Button variant="ghost" size="sm" className="text-xs" onClick={() => setShowAllH3(!showAllH3)}>
                          {showAllH3 ? <><ChevronUp className="h-3 w-3 ml-1" /> إخفاء</> : <><ChevronDown className="h-3 w-3 ml-1" /> عرض الكل ({cp.h3List.length})</>}
                        </Button>
                      )}
                    </>
                  ) : <NullValue />}
                </div>
              </CardContent>
            </Card>

            {/* PAA Questions */}
            <Card className="bg-card/60 border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-cyan-400" />
                  PAA — أسئلة الناس الشائعة
                  <span className="text-xs text-muted-foreground font-normal">People Also Ask</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {report.paaQuestions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {report.paaQuestions.map((q, i) => (
                      <div key={i} className="flex items-start gap-2.5 p-3 rounded-lg border border-border/40 bg-muted/20">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-sm text-foreground leading-relaxed">{q}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-4 text-center">لم يُعثر على أسئلة PAA لهذه الكلمة المفتاحية</p>
                )}
              </CardContent>
            </Card>

            {/* Raw JSON Output */}
            <Card className="bg-card/60 border-border/60 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-cyan-400" /> JSON الخام — Raw Output</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs font-mono bg-muted/30 p-4 rounded-lg overflow-x-auto leading-relaxed text-muted-foreground max-h-72 overflow-y-auto" dir="ltr">
                  {JSON.stringify(report, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
