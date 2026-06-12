import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ShieldCheck, Globe, Loader2, CheckCircle2, AlertTriangle, XCircle, Lightbulb, Brain, Cpu, FileDown } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";

const MARKETS = [
  { value: "sa", label: "🇸🇦 السعودية" },
  { value: "ae", label: "🇦🇪 الإمارات" },
  { value: "eg", label: "🇪🇬 مصر" },
  { value: "kw", label: "🇰🇼 الكويت" },
  { value: "qa", label: "🇶🇦 قطر" },
  { value: "bh", label: "🇧🇭 البحرين" },
  { value: "om", label: "🇴🇲 عُمان" },
  { value: "jo", label: "🇯🇴 الأردن" },
  { value: "ma", label: "🇲🇦 المغرب" },
];

interface AiModelReadiness {
  model: string;
  score: number;
  status: string;
  gaps: string[];
}

interface TechnicalCheck {
  category: string;
  item: string;
  status: "pass" | "warn" | "fail";
  recommendation: string;
}

interface SeoAuditReport {
  domain: string;
  keyword: string;
  aiVisibilityScore: number;
  technicalScore: number;
  contentScore: number;
  overallScore: number;
  aiReadiness: AiModelReadiness[];
  technicalChecks: TechnicalCheck[];
  recommendations: string[];
  generatedAt: string;
}

function exportAuditPdf(report: SeoAuditReport) {
  const win = window.open("", "_blank");
  if (!win) return;
  const CSS = `body{font-family:Tajawal,Arial,sans-serif;direction:rtl;background:#fff;color:#1a1a2e;max-width:800px;margin:0 auto;padding:24px;font-size:12px;line-height:1.6}
h1{color:#7c3aed;font-size:22px;margin-bottom:4px}h2{color:#1e40af;font-size:14px;margin:18px 0 8px;border-bottom:2px solid #e2e8f0;padding-bottom:4px}
.cover{text-align:center;margin-bottom:20px;padding:20px;background:linear-gradient(135deg,#faf5ff,#eff6ff);border-radius:10px}
.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;margin:2px;background:#ede9fe;color:#5b21b6}
.scores{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
.score-box{text-align:center;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px}
.score-box strong{display:block;font-size:22px;font-weight:700}.score-box span{font-size:10px;color:#64748b}
.model{padding:8px 10px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:6px;background:#fafafa}
.model-name{font-weight:700;font-size:12px}.model-score{float:left;font-weight:700}
.gap{font-size:10px;color:#64748b;margin-top:2px}
table{width:100%;border-collapse:collapse;margin-bottom:14px;font-size:11px}
th{background:#faf5ff;color:#5b21b6;padding:7px 6px;text-align:right;font-weight:600}td{padding:6px;border-bottom:1px solid #f1f5f9}
.pass{color:#059669;font-weight:700}.warn{color:#d97706;font-weight:700}.fail{color:#dc2626;font-weight:700}
.rec{display:flex;gap:8px;padding:8px;border-radius:6px;background:#faf5ff;border:1px solid #ddd6fe;margin-bottom:6px}
.rec-num{width:22px;height:22px;border-radius:50%;background:#7c3aed;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.footer{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
@media print{body{padding:1cm}}`;

  const aiModels = report.aiReadiness.map((m) => {
    const c = m.score >= 70 ? "#059669" : m.score >= 45 ? "#d97706" : "#dc2626";
    return `<div class="model"><span class="model-name">${m.model}</span><span class="model-score" style="color:${c}">${m.score}/100</span><span style="color:#64748b;font-size:10px;margin-right:8px">${m.status}</span><div class="gap">${m.gaps.map((g) => `• ${g}`).join("<br>")}</div></div>`;
  }).join("");

  const checks = report.technicalChecks.map((c) =>
    `<tr><td>${c.category}</td><td>${c.item}</td><td class="${c.status}">${c.status === "pass" ? "✓ ناجح" : c.status === "warn" ? "⚠ تحذير" : "✗ فشل"}</td><td style="color:#64748b">${c.status !== "pass" ? c.recommendation : "—"}</td></tr>`
  ).join("");

  const recs = report.recommendations.map((r, i) =>
    `<div class="rec"><div class="rec-num">${i + 1}</div><div>${r}</div></div>`
  ).join("");

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>تدقيق SEO — ${report.domain}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="cover"><h1>تدقيق SEO الذكي</h1><p style="color:#64748b;font-size:12px">AI SEO Audit Report</p><div style="margin-top:8px"><span class="badge">${report.domain}</span><span class="badge">${report.keyword}</span></div></div>
<div class="scores">
<div class="score-box"><strong style="color:#7c3aed">${report.overallScore}</strong><span>التقييم الكلي</span></div>
<div class="score-box"><strong style="color:#0891b2">${report.aiVisibilityScore}</strong><span>AI Visibility</span></div>
<div class="score-box"><strong style="color:#059669">${report.technicalScore}</strong><span>التقنية</span></div>
<div class="score-box"><strong style="color:#d97706">${report.contentScore}</strong><span>المحتوى</span></div>
</div>
<h2>جاهزية نماذج الذكاء الاصطناعي</h2>${aiModels}
<h2>قائمة التدقيق التقني</h2>
<table><thead><tr><th>الفئة</th><th>العنصر</th><th>الحالة</th><th>التوصية</th></tr></thead><tbody>${checks}</tbody></table>
<h2>التوصيات القابلة للتطبيق</h2>${recs}
<div class="footer">تم الإنتاج بواسطة محرك MZ-AI — ${new Date(report.generatedAt).toLocaleString("ar-SA")}</div>
<script>setTimeout(()=>{window.print();window.close();},400);</script></body></html>`;
  win.document.write(html);
  win.document.close();
}

const AI_ICONS: Record<string, string> = {
  ChatGPT: "🤖",
  Gemini: "✨",
  Claude: "🧠",
  Perplexity: "🔍",
};

function ScoreCircle({ score, label, size = "lg" }: { score: number; label: string; size?: "sm" | "lg" }) {
  const pct = Math.min(100, Math.max(0, score));
  const r = size === "lg" ? 48 : 32;
  const circ = 2 * Math.PI * r;
  const stroke = circ - (pct / 100) * circ;
  const color = pct >= 70 ? "#10b981" : pct >= 45 ? "#f59e0b" : "#ef4444";
  const sw = size === "lg" ? 8 : 6;
  const sz = size === "lg" ? 120 : 80;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: sz, height: sz }}>
        <svg width={sz} height={sz} viewBox={`0 0 ${sz} ${sz}`}>
          <circle cx={sz / 2} cy={sz / 2} r={r} fill="none" stroke="#374151" strokeWidth={sw} />
          <circle
            cx={sz / 2} cy={sz / 2} r={r} fill="none"
            stroke={color} strokeWidth={sw} strokeLinecap="round"
            strokeDasharray={circ} strokeDashoffset={stroke}
            transform={`rotate(-90 ${sz / 2} ${sz / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold ${size === "lg" ? "text-3xl" : "text-xl"}`} style={{ color }}>{pct}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground text-center leading-tight">{label}</span>
    </div>
  );
}

function StatusIcon({ status }: { status: "pass" | "warn" | "fail" }) {
  if (status === "pass") return <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />;
  return <XCircle className="h-5 w-5 text-red-400 shrink-0" />;
}

const statusBg = (s: "pass" | "warn" | "fail") =>
  s === "pass" ? "bg-emerald-500/10 border-emerald-500/20" : s === "warn" ? "bg-yellow-500/10 border-yellow-500/20" : "bg-red-500/10 border-red-500/20";

export default function AuditPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ domain: "", keyword: "", industry: "", country: "sa" });
  const [report, setReport] = useState<SeoAuditReport | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("الكل");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/seo-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("فشل");
      return res.json() as Promise<SeoAuditReport>;
    },
    onSuccess: (data) => {
      setReport(data);
      toast({ title: "✅ اكتمل التدقيق", description: "تقرير تدقيق SEO الذكي جاهز" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل في توليد التدقيق", variant: "destructive" }),
  });

  const categories = report ? ["الكل", ...Array.from(new Set(report.technicalChecks.map((c) => c.category)))] : [];
  const filteredChecks = report?.technicalChecks.filter((c) => categoryFilter === "الكل" || c.category === categoryFilter) ?? [];

  const passCount = report?.technicalChecks.filter((c) => c.status === "pass").length ?? 0;
  const warnCount = report?.technicalChecks.filter((c) => c.status === "warn").length ?? 0;
  const failCount = report?.technicalChecks.filter((c) => c.status === "fail").length ?? 0;

  const radarData = report?.aiReadiness.map((m) => ({ subject: m.model, value: m.score, fullMark: 100 })) ?? [];

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium">
          <ShieldCheck className="h-4 w-4" />
          AI SEO Audit — تدقيق SEO الذكي
        </div>
        <h1 className="text-4xl font-bold text-white">تدقيق SEO الذكي</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          قيّم جاهزية موقعك للـ AI Search (ChatGPT، Gemini، Claude، Perplexity) واحصل على تقرير تقني شامل مع خطة تحسين
        </p>
      </div>

      {/* Form */}
      <Card className="bg-card/60 border-border/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-purple-400" /> بيانات التدقيق</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الموقع المراد تدقيقه</Label>
              <Input placeholder="مثال: mysite.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الكلمة المفتاحية المستهدفة</Label>
              <Input placeholder="مثال: أفضل مطعم رياض" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>القطاع / الصناعة</Label>
              <Input placeholder="مثال: مطاعم وخدمات غذائية" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1"><Globe className="h-4 w-4" /> السوق</Label>
              <select
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {MARKETS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>
          <Button
            className="w-full bg-purple-600 hover:bg-purple-500 text-white h-12 text-base font-semibold"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.domain || !form.keyword || !form.industry}
          >
            {mutation.isPending
              ? <><Loader2 className="h-5 w-5 animate-spin ml-2" /> يحلل Google ويدقق الموقع…</>
              : <><ShieldCheck className="h-5 w-5 ml-2" /> ابدأ التدقيق الذكي</>}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {report && (
        <div className="space-y-8">
          {/* PDF Export */}
          <div className="flex justify-end">
            <Button onClick={() => exportAuditPdf(report)} variant="outline" className="gap-2 border-purple-500/30 text-purple-400 hover:bg-purple-500/10">
              <FileDown className="h-4 w-4" />
              تحميل PDF
            </Button>
          </div>
          {/* Score Cards */}
          <Card className="bg-card/60 border-border/60">
            <CardHeader><CardTitle className="flex items-center gap-2"><Cpu className="h-5 w-5 text-purple-400" /> نظام التقييم الشامل</CardTitle></CardHeader>
            <CardContent>
              <div className="flex justify-around flex-wrap gap-6 py-4">
                <ScoreCircle score={report.overallScore} label="التقييم الكلي" size="lg" />
                <ScoreCircle score={report.aiVisibilityScore} label="AI Visibility" size="sm" />
                <ScoreCircle score={report.technicalScore} label="التقنية" size="sm" />
                <ScoreCircle score={report.contentScore} label="المحتوى" size="sm" />
              </div>

              {/* Technical Counts */}
              <div className="flex justify-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400" /><span className="text-emerald-400 font-bold">{passCount}</span><span className="text-muted-foreground">ناجح</span></div>
                <div className="flex items-center gap-1.5 text-sm"><AlertTriangle className="h-4 w-4 text-yellow-400" /><span className="text-yellow-400 font-bold">{warnCount}</span><span className="text-muted-foreground">تحذير</span></div>
                <div className="flex items-center gap-1.5 text-sm"><XCircle className="h-4 w-4 text-red-400" /><span className="text-red-400 font-bold">{failCount}</span><span className="text-muted-foreground">فشل</span></div>
              </div>
            </CardContent>
          </Card>

          {/* AI Model Readiness */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/60 border-border/60">
              <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5 text-purple-400" /> جاهزية كل نموذج AI</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {report.aiReadiness.map((model) => {
                  const pct = model.score;
                  const color = pct >= 70 ? "bg-emerald-500" : pct >= 45 ? "bg-yellow-500" : "bg-red-500";
                  const textColor = pct >= 70 ? "text-emerald-400" : pct >= 45 ? "text-yellow-400" : "text-red-400";
                  return (
                    <div key={model.model} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{AI_ICONS[model.model] ?? "🤖"} {model.model}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{model.status}</span>
                          <span className={`font-bold text-sm ${textColor}`}>{pct}/100</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                      {model.gaps.length > 0 && (
                        <ul className="space-y-1">
                          {model.gaps.map((gap, i) => (
                            <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                              {gap}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Radar Chart */}
            {radarData.length > 0 && (
              <Card className="bg-card/60 border-border/60">
                <CardHeader><CardTitle className="text-sm text-muted-foreground">مقارنة الجاهزية للـ AI</CardTitle></CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#374151" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#9ca3af", fontSize: 13 }} />
                      <Radar name="Score" dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} dot={{ fill: "#a855f7" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Technical Checklist */}
          <Card className="bg-card/60 border-border/60">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
              <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-purple-400" /> قائمة التدقيق التقني</CardTitle>
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${categoryFilter === cat ? "bg-purple-500/20 border-purple-500/40 text-purple-300" : "border-border/40 text-muted-foreground hover:border-border"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredChecks.map((check, i) => (
                  <div key={i} className={`p-3 rounded-lg border flex items-start gap-3 ${statusBg(check.status)}`}>
                    <StatusIcon status={check.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded">{check.category}</span>
                        <span className="font-medium text-foreground text-sm">{check.item}</span>
                      </div>
                      {check.status !== "pass" && (
                        <p className="text-xs text-muted-foreground mt-1">{check.recommendation}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="bg-card/60 border-purple-500/20">
            <CardHeader><CardTitle className="flex items-center gap-2 text-purple-400"><Lightbulb className="h-5 w-5" /> توصيات قابلة للتطبيق فوراً</CardTitle></CardHeader>
            <CardContent>
              <ol className="space-y-3">
                {report.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-500/30 text-purple-300 text-sm font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-foreground text-sm leading-relaxed">{rec}</span>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
