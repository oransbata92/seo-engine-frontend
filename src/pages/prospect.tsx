import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Mail, MessageCircle, Linkedin, Copy, Check, AlertTriangle, TrendingDown, Globe, Loader2, Users, FileDown } from "lucide-react";

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

interface ProspectReport {
  domain: string;
  keyword: string;
  topProblems: string[];
  trafficLoss: string;
  revenueLoss: string;
  emailMessage: string;
  whatsappMessage: string;
  linkedinMessage: string;
  generatedAt: string;
}

function exportProspectPdf(report: ProspectReport) {
  const win = window.open("", "_blank");
  if (!win) return;
  const CSS = `body{font-family:Tajawal,Arial,sans-serif;direction:rtl;background:#fff;color:#1a1a2e;max-width:800px;margin:0 auto;padding:24px;font-size:12px;line-height:1.6}
h1{color:#2563eb;font-size:22px;margin-bottom:4px}h2{color:#1e40af;font-size:14px;margin:18px 0 8px;border-bottom:2px solid #e2e8f0;padding-bottom:4px}
.cover{text-align:center;margin-bottom:20px;padding:20px;background:linear-gradient(135deg,#eff6ff,#fef2f2);border-radius:10px}
.badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:10px;margin:2px;background:#dbeafe;color:#1e40af}
.problem{display:flex;align-items:flex-start;gap:8px;padding:8px 10px;border-radius:6px;background:#fef2f2;border:1px solid #fecaca;margin-bottom:6px}
.num{width:22px;height:22px;border-radius:50%;background:#ef4444;color:#fff;font-size:10px;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.loss-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
.loss-box{padding:12px;border-radius:8px;text-align:center}.loss-box strong{display:block;font-size:14px;font-weight:700}
.msg-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px;margin-bottom:12px;white-space:pre-wrap;font-size:12px;line-height:1.7}
.msg-label{font-weight:700;color:#1e40af;margin-bottom:6px;font-size:13px}
.footer{margin-top:24px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:10px}
@media print{body{padding:1cm}}`;

  const problems = report.topProblems.map((p, i) =>
    `<div class="problem"><div class="num">${i + 1}</div><div>${p}</div></div>`
  ).join("");

  const html = `<!DOCTYPE html><html lang="ar" dir="rtl"><head><meta charset="UTF-8"><title>تقرير العميل — ${report.domain}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap" rel="stylesheet">
<style>${CSS}</style></head><body>
<div class="cover"><h1>تقرير التواصل مع العميل</h1><p style="color:#64748b;font-size:12px">Lead Generation Report</p><div style="margin-top:8px"><span class="badge">${report.domain}</span><span class="badge">${report.keyword}</span></div></div>
<h2>أبرز المشاكل المكتشفة</h2>${problems}
<div class="loss-grid">
<div class="loss-box" style="background:#fef2f2;border:1px solid #fecaca"><span style="color:#ef4444;font-size:11px">خسارة الزيارات</span><strong style="color:#dc2626">${report.trafficLoss}</strong></div>
<div class="loss-box" style="background:#fff7ed;border:1px solid #fed7aa"><span style="color:#ea580c;font-size:11px">خسارة الإيرادات</span><strong style="color:#c2410c">${report.revenueLoss}</strong></div>
</div>
<h2>📧 رسالة البريد الإلكتروني</h2>
<div class="msg-box">${report.emailMessage}</div>
<h2>💬 رسالة واتساب</h2>
<div class="msg-box">${report.whatsappMessage}</div>
<h2>💼 رسالة لينكد إن</h2>
<div class="msg-box">${report.linkedinMessage}</div>
<div class="footer">تم الإنتاج بواسطة محرك MZ-AI — ${new Date(report.generatedAt).toLocaleString("ar-SA")}</div>
<script>setTimeout(()=>{window.print();window.close();},400);</script></body></html>`;
  win.document.write(html);
  win.document.close();
}

type Channel = "email" | "whatsapp" | "linkedin";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Button variant="outline" size="sm" onClick={handleCopy} className="gap-2 shrink-0">
      {copied ? <><Check className="h-4 w-4 text-emerald-400" /> تم النسخ</> : <><Copy className="h-4 w-4" /> نسخ</>}
    </Button>
  );
}

export default function ProspectPage() {
  const { toast } = useToast();
  const [form, setForm] = useState({ domain: "", keyword: "", industry: "", country: "sa" });
  const [report, setReport] = useState<ProspectReport | null>(null);
  const [activeChannel, setActiveChannel] = useState<Channel>("email");

  const mutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/prospect-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("فشل");
      return res.json() as Promise<ProspectReport>;
    },
    onSuccess: (data) => {
      setReport(data);
      toast({ title: "✅ التقرير جاهز", description: "رسائل التواصل جاهزة للإرسال" });
    },
    onError: () => toast({ title: "خطأ", description: "فشل في توليد التقرير", variant: "destructive" }),
  });

  const channels: { id: Channel; label: string; icon: typeof Mail; color: string; bg: string }[] = [
    { id: "email", label: "البريد الإلكتروني", icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/30" },
    { id: "whatsapp", label: "واتساب", icon: MessageCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
    { id: "linkedin", label: "لينكد إن", icon: Linkedin, color: "text-sky-400", bg: "bg-sky-500/10 border-sky-500/30" },
  ];

  const activeMsg = report ? (activeChannel === "email" ? report.emailMessage : activeChannel === "whatsapp" ? report.whatsappMessage : report.linkedinMessage) : "";

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
          <Users className="h-4 w-4" />
          Lead Generation Mode
        </div>
        <h1 className="text-4xl font-bold text-white">رسائل التواصل مع العملاء</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          أدخل موقع العميل المحتمل وسيجلب النظام بيانات Google الحقيقية ويولّد رسائل تواصل احترافية جاهزة للإرسال
        </p>
      </div>

      {/* Form */}
      <Card className="bg-card/60 border-border/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-400" /> تحليل العميل المحتمل</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>موقع العميل المحتمل</Label>
              <Input placeholder="مثال: competitor-site.com" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>الكلمة المفتاحية المستهدفة</Label>
              <Input placeholder="مثال: شركة محاسبة" value={form.keyword} onChange={(e) => setForm({ ...form, keyword: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>قطاع العميل</Label>
              <Input placeholder="مثال: محاسبة وضرائب" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} />
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
            className="w-full bg-blue-600 hover:bg-blue-500 text-white h-12 text-base font-semibold"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !form.domain || !form.keyword || !form.industry}
          >
            {mutation.isPending
              ? <><Loader2 className="h-5 w-5 animate-spin ml-2" /> يحلل الموقع ويكتب الرسائل…</>
              : <><Mail className="h-5 w-5 ml-2" /> ولّد رسائل التواصل</>}
          </Button>
          {mutation.isPending && (
            <p className="text-center text-xs text-muted-foreground">سيجلب بيانات Google الحقيقية ثم يكتب رسائل مخصصة للعميل</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {report && (
        <div className="space-y-6">
          {/* PDF Export */}
          <div className="flex justify-end">
            <Button onClick={() => exportProspectPdf(report)} variant="outline" className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
              <FileDown className="h-4 w-4" />
              تحميل PDF
            </Button>
          </div>
          {/* Prospect Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-red-950/60 to-red-900/40 border-red-500/20">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="h-6 w-6 text-red-400" />
                  <h3 className="font-bold text-red-300">خسارة الزيارات</h3>
                </div>
                <p className="text-xl font-bold text-red-200">{report.trafficLoss}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-orange-950/60 to-orange-900/40 border-orange-500/20">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingDown className="h-6 w-6 text-orange-400" />
                  <h3 className="font-bold text-orange-300">خسارة الإيرادات</h3>
                </div>
                <p className="text-xl font-bold text-orange-200">{report.revenueLoss}</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Problems */}
          <Card className="bg-card/60 border-red-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400"><AlertTriangle className="h-5 w-5" /> أبرز المشاكل المكتشفة</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {report.topProblems.map((problem, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/30 text-red-300 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <span className="text-foreground text-sm leading-relaxed">{problem}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Outreach Messages */}
          <Card className="bg-card/60 border-border/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5 text-blue-400" /> رسائل التواصل الجاهزة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Channel Tabs */}
              <div className="flex gap-2 flex-wrap">
                {channels.map((ch) => {
                  const Icon = ch.icon;
                  const isActive = activeChannel === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChannel(ch.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${isActive ? ch.bg + " " + ch.color : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"}`}
                    >
                      <Icon className="h-4 w-4" />
                      {ch.label}
                    </button>
                  );
                })}
              </div>

              {/* Message Display */}
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-muted-foreground">
                    {activeChannel === "email" ? "نسخ النص كاملاً والصقه في بريدك الإلكتروني" : activeChannel === "whatsapp" ? "نسخ الرسالة وأرسلها مباشرة عبر واتساب" : "نسخ الرسالة واستخدمها في InMail أو تعليق"}
                  </span>
                  <CopyButton text={activeMsg} />
                </div>
                <div className={`p-5 rounded-xl border whitespace-pre-wrap text-sm leading-relaxed font-medium ${activeChannel === "email" ? "bg-blue-950/30 border-blue-500/20 text-blue-100" : activeChannel === "whatsapp" ? "bg-emerald-950/30 border-emerald-500/20 text-emerald-100" : "bg-sky-950/30 border-sky-500/20 text-sky-100"}`}>
                  {activeMsg}
                </div>
              </div>

              {/* Tips */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
                  <Mail className="h-4 w-4 text-blue-400 mb-1.5" />
                  <strong className="text-foreground block mb-1">البريد الإلكتروني</strong>
                  أرسلها مع subject line: "فرصة SEO لموقع {report.domain}"
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
                  <MessageCircle className="h-4 w-4 text-emerald-400 mb-1.5" />
                  <strong className="text-foreground block mb-1">واتساب</strong>
                  أفضل وقت للإرسال: يوم الأحد-الثلاثاء 10ص-12ظ
                </div>
                <div className="p-3 rounded-lg bg-muted/30 border border-border/40 text-xs text-muted-foreground">
                  <Linkedin className="h-4 w-4 text-sky-400 mb-1.5" />
                  <strong className="text-foreground block mb-1">لينكد إن</strong>
                  تواصل مع المدير التسويقي أو صاحب الشركة مباشرة
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
