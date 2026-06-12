import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateReputationReport } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  Sparkles,
  Loader2,
  Building2,
  Briefcase,
  Copy,
  Check,
  Brain,
  FileDown,
  BarChart2,
  Search,
  Globe,
  Code2,
  Link,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MARKETS: { value: string; label: string; lang: string; flag: string }[] = [
  { flag: "🇸🇦", value: "sa", label: "السعودية", lang: "ar" },
  { flag: "🇦🇪", value: "ae", label: "الإمارات", lang: "ar" },
  { flag: "🇪🇬", value: "eg", label: "مصر", lang: "ar" },
  { flag: "🇰🇼", value: "kw", label: "الكويت", lang: "ar" },
  { flag: "🇶🇦", value: "qa", label: "قطر", lang: "ar" },
  { flag: "🇧🇭", value: "bh", label: "البحرين", lang: "ar" },
  { flag: "🇴🇲", value: "om", label: "عُمان", lang: "ar" },
  { flag: "🇯🇴", value: "jo", label: "الأردن", lang: "ar" },
  { flag: "🇱🇧", value: "lb", label: "لبنان", lang: "ar" },
  { flag: "🇲🇦", value: "ma", label: "المغرب", lang: "ar" },
  { flag: "🇹🇳", value: "tn", label: "تونس", lang: "ar" },
  { flag: "🇺🇸", value: "us", label: "الولايات المتحدة", lang: "en" },
  { flag: "🇬🇧", value: "gb", label: "المملكة المتحدة", lang: "en" },
  { flag: "🇩🇪", value: "de", label: "ألمانيا", lang: "de" },
  { flag: "🇫🇷", value: "fr", label: "فرنسا", lang: "fr" },
  { flag: "🇹🇷", value: "tr", label: "تركيا", lang: "tr" },
  { flag: "🇮🇳", value: "in", label: "الهند", lang: "en" },
  { flag: "🇵🇰", value: "pk", label: "باكستان", lang: "ur" },
];

const reputationSchema = z.object({
  brandName: z.string().min(2, { message: "يجب إدخال اسم البراند" }),
  industry: z.string().min(2, { message: "يجب إدخال القطاع" }),
  domain: z.string().optional(),
  country: z.string().default("sa"),
});

type ReputationFormValues = z.infer<typeof reputationSchema>;

const loadingMessages = [
  "MZ-AI يُشغّل رادار السمعة...",
  "نفحص كيف تراك نماذج ChatGPT وClaude وGemini...",
  "نستخرج الكلمات السحرية التي تفوّتها المنافسون...",
  "نبني خطة GEO للظهور في توصيات الـ AI...",
  "نُجهّز الترسانة التقنية (Schema Markup & Speed)...",
];

interface ReportSection {
  title: string;
  content: string;
}

const SECTION_META: { keyword: string; icon: React.ReactNode; color: string }[] = [
  {
    keyword: "السمعة",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  },
  {
    keyword: "تشخيص",
    icon: <BarChart2 className="h-5 w-5" />,
    color: "from-violet-500/20 to-violet-500/5 border-violet-500/30",
  },
  {
    keyword: "SEO",
    icon: <Search className="h-5 w-5" />,
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  },
  {
    keyword: "الكلمات",
    icon: <Search className="h-5 w-5" />,
    color: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30",
  },
  {
    keyword: "GEO",
    icon: <Globe className="h-5 w-5" />,
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  },
  {
    keyword: "الظهور",
    icon: <Globe className="h-5 w-5" />,
    color: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/30",
  },
  {
    keyword: "تقني",
    icon: <Code2 className="h-5 w-5" />,
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  },
  {
    keyword: "الترسانة",
    icon: <Code2 className="h-5 w-5" />,
    color: "from-amber-500/20 to-amber-500/5 border-amber-500/30",
  },
];

function parseSections(markdown: string): ReportSection[] {
  const lines = markdown.split("\n");
  const sections: ReportSection[] = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ")) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
      }
      currentTitle = line.replace(/^##\s+/, "").replace(/\*\*/g, "").trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
  }

  if (sections.length === 0) {
    return [{ title: "التقرير الكامل", content: markdown }];
  }

  return sections;
}

function matchMeta(title: string) {
  const lower = title.toLowerCase();
  return (
    SECTION_META.find((m) =>
      lower.includes(m.keyword.toLowerCase()) || title.includes(m.keyword)
    ) ?? {
      icon: <Brain className="h-5 w-5" />,
      color: "from-primary/20 to-primary/5 border-primary/30",
    }
  );
}

function handlePrint(brandName: string, industry: string, markdown: string) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <title>رادار السمعة MZ-AI — ${brandName}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Cairo', sans-serif;
      direction: rtl;
      color: #0f172a;
      background: #fff;
      padding: 2cm 2.5cm;
      font-size: 13px;
      line-height: 1.8;
    }
    .cover {
      text-align: center;
      padding: 40px 0 32px;
      border-bottom: 3px solid #10b981;
      margin-bottom: 32px;
    }
    .cover h1 { font-size: 28px; font-weight: 800; color: #10b981; margin-bottom: 8px; }
    .cover .meta { font-size: 14px; color: #475569; }
    .cover .badge {
      display: inline-block;
      background: #f0fdf4;
      color: #065f46;
      border: 1px solid #6ee7b7;
      border-radius: 20px;
      padding: 3px 14px;
      font-size: 12px;
      margin: 4px;
    }
    .section {
      margin-bottom: 28px;
      padding: 20px 24px;
      border-radius: 8px;
      border-right: 4px solid #10b981;
      background: #f8fafc;
      break-inside: avoid;
    }
    .section h2 {
      font-size: 17px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 14px;
    }
    h3 { font-size: 14px; font-weight: 700; color: #1e293b; margin: 14px 0 6px; }
    p { margin-bottom: 8px; }
    ul, ol { padding-right: 24px; margin-bottom: 8px; }
    li { margin-bottom: 4px; }
    strong { font-weight: 700; color: #0f172a; }
    code { background: #e2e8f0; padding: 1px 5px; border-radius: 3px; font-size: 11px; }
    blockquote { border-right: 3px solid #10b981; padding-right: 12px; color: #475569; margin: 8px 0; }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 11px;
      color: #94a3b8;
      border-top: 1px solid #e2e8f0;
      padding-top: 16px;
    }
    @media print {
      body { padding: 1.5cm 2cm; }
      .section { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>رادار السمعة الرقمية — MZ-AI</h1>
    <div class="meta">
      <span class="badge">${brandName}</span>
      <span class="badge">${industry}</span>
    </div>
    <div class="meta" style="margin-top:10px;font-size:12px;color:#94a3b8;">
      مدعوم بـ Claude (Anthropic) &nbsp;|&nbsp; ${new Date().toLocaleDateString("ar-SA", { dateStyle: "long" })}
    </div>
  </div>
  <div id="content"></div>
  <div class="footer">تم إنشاء هذا التقرير بواسطة محرك MZ-AI لرادار السمعة — مدعوم بـ Claude (Anthropic)</div>
  <script>
    const md = ${JSON.stringify(markdown)};
    const lines = md.split("\\n");
    let html = "";
    let inSection = false;
    let sectionContent = "";
    let sectionTitle = "";

    function renderSection(title, content) {
      return '<div class="section"><h2>' + title + '</h2>' + renderContent(content) + '</div>';
    }
    function renderContent(text) {
      return text
        .replace(/### (.+)/g, '<h3>$1</h3>')
        .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
        .replace(/^- (.+)/gm, '<li>$1</li>')
        .replace(/^\\d+\\. (.+)/gm, '<li>$1</li>')
        .replace(/(<li>.*<\\/li>\\n?)+/g, '<ul>$&</ul>')
        .replace(/> (.+)/g, '<blockquote>$1</blockquote>')
        .replace(/\`(.+?)\`/g, '<code>$1</code>')
        .replace(/([^>\\n])\\n([^<\\n])/g, '$1<br>$2')
        .replace(/\\n\\n/g, '<br><br>');
    }

    for (const line of lines) {
      if (line.startsWith("## ")) {
        if (sectionTitle) html += renderSection(sectionTitle, sectionContent.trim());
        sectionTitle = line.replace(/^## /, "").replace(/\\*\\*/g, "");
        sectionContent = "";
      } else if (line.startsWith("# ")) {
        // skip h1 (already in cover)
      } else {
        sectionContent += line + "\\n";
      }
    }
    if (sectionTitle) html += renderSection(sectionTitle, sectionContent.trim());
    if (!html) html = '<div class="section">' + renderContent(md) + '</div>';

    document.getElementById("content").innerHTML = html;
    setTimeout(() => { window.print(); window.close(); }, 400);
  </script>
</body>
</html>`;

  printWindow.document.write(html);
  printWindow.document.close();
}

export default function Reputation() {
  const { toast } = useToast();
  const reputationMutation = useGenerateReputationReport();
  const [copied, setCopied] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const reportRef = useRef<HTMLDivElement>(null);

  const form = useForm<ReputationFormValues>({
    resolver: zodResolver(reputationSchema),
    defaultValues: { brandName: "", industry: "", domain: "", country: "sa" },
  });

  const watchedCountry = form.watch("country");

  function onSubmit(values: ReputationFormValues) {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
    }, 3500);

    const market = MARKETS.find((m) => m.value === values.country) ?? MARKETS[0];
    reputationMutation.mutate(
      {
        data: {
          brandName: values.brandName,
          industry: values.industry,
          domain: values.domain || undefined,
          country: values.country,
          language: market.lang,
        } as any,
      },
      {
        onSuccess: () => {
          clearInterval(interval);
          toast({ title: "رادار MZ-AI اكتمل", description: "تقرير السمعة جاهز أدناه" });
          setTimeout(() => reportRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
        },
        onError: (err) => {
          clearInterval(interval);
          toast({
            title: "فشل توليد التقرير",
            description: err instanceof Error ? err.message : "حدث خطأ غير متوقع",
            variant: "destructive",
          });
        },
      }
    );
  }

  const report = reputationMutation.data;
  const sections = report ? parseSections(report.markdown) : [];

  async function handleCopy() {
    if (!report?.markdown) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    toast({ title: "تم نسخ التقرير كاملاً" });
    setTimeout(() => setCopied(false), 2000);
  }

  function onPrint() {
    if (!report) return;
    handlePrint(report.brandName, report.industry, report.markdown);
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Brain className="h-3.5 w-3.5" />
          MZ-AI Engine — Powered by Claude (Anthropic)
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">
          رادار السمعة الرقمية
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          المحرك الذكي MZ-AI يكشف لماذا قد لا يوصي الـ AI بعلامتك — ويعطيك الكلمات
          السحرية وخطة GEO لتتصدر توصيات ChatGPT وClaude وGoogle.
        </p>
      </motion.div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            تشغيل رادار السمعة — MZ-AI
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="brandName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        اسم البراند
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: مرسيدس السعودية" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        القطاع / الصناعة
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: السيارات الفاخرة" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="domain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Link className="h-4 w-4" />
                        موقع البراند <span className="text-muted-foreground text-xs">(اختياري — يحسّن الدقة)</span>
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="مثال: mercedes.com.sa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => {
                    const sel = MARKETS.find((m) => m.value === field.value);
                    return (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          السوق المستهدف
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue>{sel ? `${sel.flag} ${sel.label}` : "اختر السوق"}</SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {MARKETS.map((m) => (
                              <SelectItem key={m.value} value={m.value}>
                                {m.flag} {m.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  className="px-8 font-semibold"
                  disabled={reputationMutation.isPending}
                >
                  {reputationMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 ml-2" />
                  )}
                  {reputationMutation.isPending ? "جاري فحص الرادار..." : "تشغيل رادار السمعة"}
                </Button>
                {watchedCountry && (
                  <p className="text-xs text-muted-foreground">
                    سيجلب MZ-AI بيانات Google الحقيقية من سوق {MARKETS.find(m => m.value === watchedCountry)?.label}
                  </p>
                )}
              </div>
            </form>
          </Form>

          {reputationMutation.isPending && (
            <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-primary space-y-1">
              <div className="flex items-center gap-3">
                <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                {loadingMessages[loadingStep]}
              </div>
              <p className="text-xs text-muted-foreground pr-7">
                التقرير مفصّل — قد يستغرق حتى دقيقة كاملة.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {report && sections.length > 0 && (
        <motion.div
          ref={reportRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold">نتائج رادار MZ-AI</h2>
              <Badge variant="outline">{report.brandName}</Badge>
              <Badge variant="secondary">{report.industry}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? (
                  <><Check className="h-4 w-4 ml-2" />تم النسخ</>
                ) : (
                  <><Copy className="h-4 w-4 ml-2" />نسخ Markdown</>
                )}
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={onPrint}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                تحميل PDF
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            {sections.map((section, i) => {
              const meta = matchMeta(section.title);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card
                    className={`bg-gradient-to-br ${meta.color} border h-full`}
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <span className="text-primary">{meta.icon}</span>
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <article className="prose prose-invert prose-sm max-w-none prose-headings:text-foreground prose-headings:font-bold prose-h3:text-sm prose-strong:text-foreground prose-li:my-0.5 prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground">
                        <ReactMarkdown>{section.content}</ReactMarkdown>
                      </article>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          <p className="text-center text-xs text-muted-foreground pt-2">
            تم التوليد بواسطة Claude (Anthropic) —{" "}
            {new Date(report.generatedAt).toLocaleString("ar-SA")}
          </p>
        </motion.div>
      )}

      {!report && !reputationMutation.isPending && (
        <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
          <Brain className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-base font-semibold">رادار MZ-AI جاهز للفحص</p>
          <p className="text-sm mt-1 opacity-70">
            أدخل اسم البراند والقطاع لكشف نقاط ضعفه أمام الـ AI
          </p>
          <p className="text-xs mt-2 opacity-50">
            تشخيص السمعة · الكلمات السحرية · خطة GEO · الترسانة التقنية
          </p>
        </div>
      )}
    </div>
  );
}
