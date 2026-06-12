import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useGenerateContent } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  PenLine, Loader2, Search, Briefcase, Link2, Copy, Check,
  FileDown, MessageSquare, Hash, AlignLeft, FileText, LayoutTemplate,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const contentSchema = z.object({
  keyword: z.string().min(2, { message: "يجب إدخال الكلمة المفتاحية" }),
  industry: z.string().min(2, { message: "يجب إدخال القطاع" }),
  contentType: z.enum(["article", "faq", "landing-page"]).default("article"),
  targetUrl: z.string().optional(),
  additionalContext: z.string().optional(),
});

type ContentFormValues = z.infer<typeof contentSchema>;

const CONTENT_TYPES = [
  { value: "article", label: "مقال مدونة", icon: <FileText className="h-4 w-4" /> },
  { value: "faq", label: "أسئلة شائعة", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "landing-page", label: "صفحة هبوط", icon: <LayoutTemplate className="h-4 w-4" /> },
] as const;

const loadingMessages = [
  "نُحلّل نية البحث لـ الكلمة المفتاحية...",
  "نبني هيكل المحتوى المثالي للـ SEO...",
  "نكتب المحتوى بأسلوب يُقتبس منه الـ AI...",
  "نُنشئ أسئلة FAQ وروابط داخلية مقترحة...",
  "نصيغ العناصر التقنية (Meta Title & Description)...",
];

function handlePrint(data: {
  title: string; keyword: string; industry: string; contentType: string;
  metaTitle: string; metaDescription: string; markdown: string;
  faqItems: { question: string; answer: string }[];
  wordCount: number;
}) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const faqHtml = data.faqItems.map((f, i) =>
    `<div class="faq-item"><strong>${i + 1}. ${f.question}</strong><p>${f.answer}</p></div>`
  ).join("");

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8"/>
  <title>${data.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Cairo',sans-serif;direction:rtl;color:#0f172a;background:#fff;padding:2cm 2.5cm;font-size:13px;line-height:1.8}
    .cover{text-align:center;padding:32px 0;border-bottom:3px solid #10b981;margin-bottom:28px}
    .cover h1{font-size:24px;font-weight:800;color:#10b981;margin-bottom:8px}
    .meta-box{background:#f0fdf4;border:1px solid #6ee7b7;border-radius:8px;padding:16px;margin-bottom:24px}
    .meta-box h3{font-size:12px;color:#065f46;font-weight:700;margin-bottom:6px}
    .meta-box p{font-size:12px;color:#047857}
    h2{font-size:17px;font-weight:700;color:#0f172a;margin:20px 0 8px;border-right:3px solid #10b981;padding-right:10px}
    h3{font-size:14px;font-weight:700;color:#1e293b;margin:14px 0 6px}
    p{margin-bottom:8px}
    ul,ol{padding-right:20px;margin-bottom:8px}
    li{margin-bottom:3px}
    strong{font-weight:700}
    code{background:#e2e8f0;padding:1px 5px;border-radius:3px;font-size:11px}
    blockquote{border-right:3px solid #10b981;padding-right:12px;color:#475569;margin:8px 0}
    table{width:100%;border-collapse:collapse;margin:12px 0}
    td,th{border:1px solid #e2e8f0;padding:6px 10px;text-align:right}
    th{background:#f0fdf4;font-weight:700}
    .faq-section{margin-top:24px;padding-top:16px;border-top:2px solid #e2e8f0}
    .faq-item{margin-bottom:14px;padding:12px;background:#f8fafc;border-radius:6px}
    .faq-item strong{color:#10b981;display:block;margin-bottom:4px}
    .footer{margin-top:32px;text-align:center;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px}
    .badge{display:inline-block;background:#f0fdf4;color:#065f46;border:1px solid #6ee7b7;border-radius:20px;padding:2px 12px;font-size:11px;margin:2px}
    @media print{body{padding:1.5cm 2cm}}
  </style>
</head>
<body>
  <div class="cover">
    <h1>${data.title}</h1>
    <div style="margin-top:8px">
      <span class="badge">${data.keyword}</span>
      <span class="badge">${data.industry}</span>
      <span class="badge">${data.wordCount} كلمة</span>
    </div>
  </div>
  <div class="meta-box">
    <h3>Meta Title (SEO)</h3>
    <p>${data.metaTitle}</p>
    <h3 style="margin-top:10px">Meta Description</h3>
    <p>${data.metaDescription}</p>
  </div>
  <div id="content"></div>
  ${data.faqItems.length > 0 ? `<div class="faq-section"><h2>الأسئلة الشائعة (FAQ)</h2>${faqHtml}</div>` : ""}
  <div class="footer">تم إنتاج هذا المحتوى بواسطة محرك MZ-AI — مُحسَّن للـ SEO والـ GEO</div>
  <script>
    const md=${JSON.stringify(data.markdown)};
    document.getElementById('content').innerHTML=md
      .replace(/^### (.+)$/gm,'<h3>$1</h3>')
      .replace(/^## (.+)$/gm,'<h2>$1</h2>')
      .replace(/^# (.+)$/gm,'')
      .replace(/\\*\\*(.+?)\\*\\*/g,'<strong>$1</strong>')
      .replace(/^- (.+)$/gm,'<li>$1</li>')
      .replace(/^\\d+\\. (.+)$/gm,'<li>$1</li>')
      .replace(/(<li>.*<\\/li>\\n?)+/g,'<ul>$&</ul>')
      .replace(/> (.+)/g,'<blockquote>$1</blockquote>')
      .replace(/\`(.+?)\`/g,'<code>$1</code>')
      .replace(/\\|(.+)\\|/g,(m)=>{const cells=m.split('|').filter(Boolean);return '<tr>'+cells.map(c=>'<td>'+c.trim()+'</td>').join('')+'</tr>';})
      .replace(/(<tr>.*<\\/tr>\\n?)+/g,'<table>$&</table>')
      .replace(/\\n\\n/g,'<br><br>');
    setTimeout(()=>{window.print();window.close();},400);
  </script>
</body>
</html>`;
  printWindow.document.write(html);
  printWindow.document.close();
}

export default function ContentPage() {
  const { toast } = useToast();
  const contentMutation = useGenerateContent();
  const [copied, setCopied] = useState<"markdown" | "meta" | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const form = useForm<ContentFormValues>({
    resolver: zodResolver(contentSchema),
    defaultValues: { keyword: "", industry: "", contentType: "article", targetUrl: "", additionalContext: "" },
  });

  function onSubmit(values: ContentFormValues) {
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((p) => (p < loadingMessages.length - 1 ? p + 1 : p));
    }, 5000);

    contentMutation.mutate(
      { data: { ...values, targetUrl: values.targetUrl || undefined, additionalContext: values.additionalContext || undefined } },
      {
        onSuccess: () => {
          clearInterval(interval);
          toast({ title: "المحتوى جاهز", description: "تم إنتاج المحتوى المحسّن بنجاح" });
          setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 200);
        },
        onError: (err) => {
          clearInterval(interval);
          toast({ title: "فشل الإنتاج", description: err instanceof Error ? err.message : "حدث خطأ", variant: "destructive" });
        },
      }
    );
  }

  const result = contentMutation.data;

  async function copyMarkdown() {
    if (!result?.markdown) return;
    await navigator.clipboard.writeText(result.markdown);
    setCopied("markdown");
    toast({ title: "تم نسخ المحتوى كاملاً" });
    setTimeout(() => setCopied(null), 2000);
  }

  async function copyMeta() {
    if (!result) return;
    const text = `Meta Title: ${result.metaTitle}\nMeta Description: ${result.metaDescription}`;
    await navigator.clipboard.writeText(text);
    setCopied("meta");
    toast({ title: "تم نسخ بيانات الـ Meta" });
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <PenLine className="h-3.5 w-3.5" />
          التدفق الذكي — إنتاج المحتوى بالذكاء الاصطناعي
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-primary">إنتاج المحتوى الذكي</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          أدخل الكلمة المفتاحية والقطاع — المحرك يُنتج لك مقالاً كاملاً محسّناً للـ SEO التقليدي
          والـ GEO (ليُقتبس منه في ChatGPT وClaude وGemini) مع FAQ وبيانات Meta جاهزة.
        </p>
      </motion.div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PenLine className="h-5 w-5 text-primary" />
            إعداد المحتوى
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="keyword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Search className="h-4 w-4" />الكلمة المفتاحية</FormLabel>
                    <FormControl><Input placeholder="مثال: أفضل شركة تصميم مواقع" {...field} /></FormControl>
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

              <FormField control={form.control} name="contentType" render={({ field }) => (
                <FormItem>
                  <FormLabel>نوع المحتوى</FormLabel>
                  <div className="flex gap-2 flex-wrap">
                    {CONTENT_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => field.onChange(t.value)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          field.value === t.value
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40"
                        }`}
                      >
                        {t.icon}{t.label}
                      </button>
                    ))}
                  </div>
                </FormItem>
              )} />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField control={form.control} name="targetUrl" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><Link2 className="h-4 w-4" />رابط الصفحة (اختياري)</FormLabel>
                    <FormControl><Input placeholder="https://example.com/page" {...field} /></FormControl>
                  </FormItem>
                )} />
                <FormField control={form.control} name="additionalContext" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2"><AlignLeft className="h-4 w-4" />سياق إضافي (اختياري)</FormLabel>
                    <FormControl><Textarea placeholder="الجمهور المستهدف، المنافسون، نبرة المحتوى..." rows={1} {...field} /></FormControl>
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={contentMutation.isPending}>
                {contentMutation.isPending ? (
                  <><Loader2 className="ml-2 h-5 w-5 animate-spin" />جاري الإنتاج...</>
                ) : (
                  <><PenLine className="ml-2 h-5 w-5" />إنتاج المحتوى</>
                )}
              </Button>

              {contentMutation.isPending && (
                <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm space-y-1">
                  <div className="flex items-center gap-3 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                    {loadingMessages[loadingStep]}
                  </div>
                  <p className="text-xs text-muted-foreground pr-7">قد يستغرق الإنتاج حتى دقيقة كاملة.</p>
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
              <h2 className="text-xl font-bold">المحتوى المُنتج</h2>
              <Badge variant="outline">{result.keyword}</Badge>
              <Badge variant="secondary">{result.industry}</Badge>
              <Badge className="bg-primary/10 text-primary border-primary/20">
                <Hash className="h-3 w-3 ml-1" />{result.wordCount} كلمة
              </Badge>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={copyMeta}>
                {copied === "meta" ? <><Check className="h-4 w-4 ml-2" />تم</>
                  : <><Copy className="h-4 w-4 ml-2" />نسخ Meta</>}
              </Button>
              <Button variant="outline" size="sm" onClick={copyMarkdown}>
                {copied === "markdown" ? <><Check className="h-4 w-4 ml-2" />تم</>
                  : <><Copy className="h-4 w-4 ml-2" />نسخ Markdown</>}
              </Button>
              <Button variant="default" size="sm" onClick={() => handlePrint(result)}>
                <FileDown className="h-4 w-4 ml-2" />تحميل PDF
              </Button>
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-emerald-400 uppercase">العنوان الرئيسي (H1)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-bold text-foreground text-base leading-snug">{result.title}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-blue-400 uppercase">Meta Title (SEO)</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{result.metaTitle}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.metaTitle.length} / 60 حرف</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-violet-500/10 to-violet-500/5 border-violet-500/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-xs font-semibold text-violet-400 uppercase">Meta Description</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground">{result.metaDescription}</p>
                <p className="text-xs text-muted-foreground mt-1">{result.metaDescription.length} / 160 حرف</p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="content" dir="rtl">
            <TabsList className="w-full">
              <TabsTrigger value="content" className="flex-1">المحتوى الكامل</TabsTrigger>
              <TabsTrigger value="faq" className="flex-1">
                الأسئلة الشائعة
                <Badge variant="secondary" className="mr-2 text-xs">{result.faqItems.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="links" className="flex-1">روابط داخلية مقترحة</TabsTrigger>
            </TabsList>

            <TabsContent value="content">
              <Card>
                <CardContent className="pt-6">
                  <article className="prose prose-invert max-w-none prose-headings:text-primary prose-h2:text-lg prose-h3:text-base prose-strong:text-foreground prose-li:my-0.5 prose-p:leading-relaxed prose-p:text-muted-foreground prose-li:text-muted-foreground prose-table:text-sm">
                    <ReactMarkdown>{result.markdown}</ReactMarkdown>
                  </article>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faq">
              <Card>
                <CardContent className="pt-6 space-y-4">
                  {result.faqItems.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">لم تُولَّد أسئلة شائعة لهذا المحتوى.</p>
                  ) : (
                    result.faqItems.map((faq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="rounded-lg border border-border bg-card/50 p-4"
                      >
                        <p className="font-semibold text-primary text-sm mb-2">س: {faq.question}</p>
                        <p className="text-muted-foreground text-sm leading-relaxed">ج: {faq.answer}</p>
                      </motion.div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="links">
              <Card>
                <CardContent className="pt-6">
                  {result.suggestedInternalLinks.length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-8">لا توجد روابط داخلية مقترحة.</p>
                  ) : (
                    <ul className="space-y-3">
                      {result.suggestedInternalLinks.map((link, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-lg border border-border bg-card/50 px-4 py-3">
                          <Link2 className="h-4 w-4 text-primary shrink-0" />
                          <span className="text-sm">{link}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-xs text-muted-foreground mt-4">
                    استخدم هذه النصوص كـ anchor text للربط بين صفحات موقعك لتعزيز سلطة الصفحة وتحسين الـ SEO الداخلي.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="text-center text-xs text-muted-foreground pt-2">
            تم الإنتاج بواسطة MZ-AI — {new Date(result.generatedAt).toLocaleString("ar-SA")}
          </p>
        </motion.div>
      )}

      {!result && !contentMutation.isPending && (
        <div className="flex flex-col items-center justify-center text-center py-20 text-muted-foreground">
          <PenLine className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-base font-semibold">المحرك جاهز للإنتاج</p>
          <p className="text-sm mt-1 opacity-70">أدخل كلمة مفتاحية وقطاع لإنتاج محتوى كامل</p>
          <p className="text-xs mt-2 opacity-50">مقال · أسئلة شائعة · صفحة هبوط · Meta Tags · روابط داخلية</p>
        </div>
      )}
    </div>
  );
}
