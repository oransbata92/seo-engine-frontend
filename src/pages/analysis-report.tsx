import { useRoute } from "wouter";
import { useGetAnalysis, getGetAnalysisQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Target, ListTodo, Lightbulb, Search, AlertCircle, Bot, MessageSquare, CheckCircle2, ChevronRight, BarChart3, Globe, Zap, FileText, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

function handlePrint(analysis: NonNullable<ReturnType<typeof useGetAnalysis>["data"]>) {
  const win = window.open("", "_blank");
  if (!win) return;

  const priorityLabel = (p: string) => p === "high" ? "أولوية عالية" : p === "medium" ? "أولوية متوسطة" : "أولوية منخفضة";
  const priorityColor = (p: string) => p === "high" ? "#fef2f2" : p === "medium" ? "#fffbeb" : "#f0fdf4";
  const priorityBorder = (p: string) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#10b981";

  const serpRows = analysis.serpResults.map((r) =>
    `<tr style="${r.isUserSite ? "background:#f0fdf4;font-weight:600;" : ""}">
      <td style="text-align:center;font-weight:700;font-size:15px;color:#64748b;">${r.position}</td>
      <td>
        <div style="font-weight:600;color:${r.isUserSite ? "#10b981" : "#3b82f6"};margin-bottom:3px;">${r.title}</div>
        <div style="font-size:11px;color:#64748b;">${r.snippet ?? ""}</div>
        ${r.isUserSite ? '<span style="background:#10b981;color:#fff;border-radius:10px;padding:1px 8px;font-size:10px;margin-top:4px;display:inline-block;">موقعك الحالي</span>' : ""}
      </td>
      <td style="font-family:monospace;font-size:11px;color:#64748b;direction:ltr;">${r.domain}</td>
    </tr>`
  ).join("");

  const gapByCategory = analysis.gapAnalysis.reduce((acc: Record<string, typeof analysis.gapAnalysis>, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const gapSections = Object.entries(gapByCategory).map(([cat, items]) =>
    `<div style="margin-bottom:12px;">
      <h4 style="font-size:13px;font-weight:700;color:#0f172a;border-right:3px solid #10b981;padding-right:8px;margin-bottom:8px;">${cat}</h4>
      ${items.map((item) =>
        `<div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;margin-bottom:6px;font-size:12px;">
          <span style="background:#eff6ff;color:#1d4ed8;border-radius:12px;padding:1px 8px;font-family:monospace;font-size:10px;" dir="ltr">${item.competitor}</span>
          <p style="margin:6px 0 0;"><strong style="color:#ef4444;">يتفوق في:</strong> ${item.advantage}</p>
        </div>`
      ).join("")}
    </div>`
  ).join("");

  const actionCards = analysis.actionPlan.map((a, i) =>
    `<div style="border:1px solid #e2e8f0;border-top:4px solid ${priorityBorder(a.priority)};border-radius:8px;padding:14px;margin-bottom:12px;background:${priorityColor(a.priority)};">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
        <span style="background:#e2e8f0;color:#475569;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;">${i + 1}</span>
        <span style="background:${priorityColor(a.priority)};border:1px solid ${priorityBorder(a.priority)};color:${priorityBorder(a.priority)};border-radius:12px;padding:1px 8px;font-size:10px;">${priorityLabel(a.priority)}</span>
      </div>
      <h4 style="font-size:13px;font-weight:700;margin-bottom:6px;">${a.title}</h4>
      <p style="font-size:12px;color:#475569;margin:0 0 8px;">${a.details}</p>
      ${a.impact ? `<div style="background:rgba(255,255,255,0.7);border-radius:6px;padding:8px;font-size:11px;"><strong style="color:#10b981;">الأثر المتوقع:</strong> ${a.impact}</div>` : ""}
    </div>`
  ).join("");

  const geoItems = analysis.geoRecommendations.map((r) =>
    `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:10px;background:#fafafa;">
      <h4 style="font-size:13px;font-weight:700;margin-bottom:5px;">${r.recommendation}</h4>
      <p style="font-size:12px;color:#64748b;margin:0;">${r.rationale}</p>
    </div>`
  ).join("");

  const promptCards = analysis.suggestedPrompts.map((p, i) =>
    `<div style="border:1px solid #e2e8f0;border-radius:8px;padding:12px;margin-bottom:10px;">
      <h4 style="font-size:12px;font-weight:700;margin-bottom:6px;color:#10b981;">${i + 1}. ${p.useCase}</h4>
      <pre style="background:#1e1e1e;color:#d4d4d4;padding:10px;border-radius:6px;font-size:10px;white-space:pre-wrap;word-break:break-word;direction:ltr;text-align:left;margin:0;">${p.prompt}</pre>
    </div>`
  ).join("");

  const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"/>
  <title>تقرير SEO — ${analysis.keyword}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Cairo',sans-serif;direction:rtl;color:#0f172a;background:#fff;padding:2cm;font-size:12px;line-height:1.8;}
    .cover{text-align:center;padding:28px 0 22px;border-bottom:3px solid #10b981;margin-bottom:24px;}
    .cover h1{font-size:26px;font-weight:800;color:#10b981;margin-bottom:8px;}
    .badge{display:inline-block;background:#f0fdf4;color:#065f46;border:1px solid #6ee7b7;border-radius:20px;padding:2px 12px;font-size:10px;margin:2px;}
    .badge-blue{background:#eff6ff;color:#1e40af;border-color:#93c5fd;}
    .badge-purple{background:#faf5ff;color:#6b21a8;border-color:#c4b5fd;}
    .meta{display:flex;justify-content:center;gap:16px;font-size:11px;color:#64748b;margin-top:10px;}
    h2{font-size:16px;font-weight:700;border-right:4px solid #10b981;padding-right:10px;margin:24px 0 12px;page-break-after:avoid;}
    .summary{background:#f0fdf4;border:1px solid #6ee7b7;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;line-height:2;}
    .kpi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:20px;}
    .kpi-box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:12px;text-align:center;}
    .kpi-box strong{color:#10b981;display:block;font-size:11px;margin-bottom:4px;}
    .kpi-box span{font-size:22px;font-weight:800;color:#0f172a;}
    .keywords{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:16px;}
    .kw-badge{background:#f1f5f9;border:1px solid #e2e8f0;border-radius:16px;padding:3px 12px;font-size:11px;}
    table{width:100%;border-collapse:collapse;font-size:11px;margin-bottom:16px;}
    th{background:#f0fdf4;color:#065f46;padding:8px;border:1px solid #d1fae5;font-weight:700;}
    td{padding:8px;border:1px solid #e2e8f0;vertical-align:top;}
    .section-page{page-break-before:always;}
    ul{padding-right:16px;}li{margin-bottom:4px;font-size:12px;}
    .footer{margin-top:32px;text-align:center;font-size:10px;color:#94a3b8;border-top:1px solid #e2e8f0;padding-top:12px;}
    .ai-badge{display:inline-flex;align-items:center;gap:6px;background:${analysis.aiOverviewPresent ? "#f0fdf4" : "#f8fafc"};color:${analysis.aiOverviewPresent ? "#065f46" : "#64748b"};border:1px solid ${analysis.aiOverviewPresent ? "#6ee7b7" : "#e2e8f0"};border-radius:20px;padding:4px 14px;font-size:11px;}
    @media print{body{padding:1.5cm}.section-page{page-break-before:always;}}
  </style></head><body>

  <div class="cover">
    <h1>📊 تقرير تحليل المنافسين والـ SEO</h1>
    <div style="margin-top:10px;">
      <span class="badge" style="font-size:13px;padding:4px 16px;">${analysis.keyword}</span>
      <span class="badge badge-blue">${analysis.userSite}</span>
      <span class="badge badge-purple">نية البحث: ${analysis.searchIntent}</span>
    </div>
    <div class="meta">
      <span>🌍 السوق: ${analysis.country?.toUpperCase()}</span>
      <span>🗣 اللغة: ${analysis.language}</span>
      <span>📅 ${new Date(analysis.createdAt).toLocaleDateString("ar-EG")}</span>
    </div>
  </div>

  <!-- KPIs -->
  <div class="kpi-grid">
    <div class="kpi-box"><strong>ترتيب موقعك</strong><span>${analysis.userPosition ?? "—"}</span></div>
    <div class="kpi-box"><strong>خطوات العمل</strong><span>${analysis.actionPlan.length}</span></div>
    <div class="kpi-box"><strong>توصيات GEO</strong><span>${analysis.geoRecommendations.length}</span></div>
  </div>

  <!-- Situation Summary -->
  <h2>📋 ملخص الوضع الحالي</h2>
  <div class="summary">${analysis.situationSummary}</div>
  <div style="background:#faf5ff;border:1px solid #c4b5fd;border-radius:8px;padding:12px;margin-bottom:20px;font-size:12px;">
    <strong style="color:#7c3aed;">تفسير نية البحث:</strong> ${analysis.intentExplanation}
  </div>
  <div style="margin-bottom:16px;">
    <span class="ai-badge">${analysis.aiOverviewPresent ? "✅ يظهر AI Overview لهذه الكلمة" : "ℹ️ لا يظهر AI Overview لهذه الكلمة"}</span>
  </div>

  <!-- Suggested Keywords -->
  <h2>🔑 كلمات مفتاحية مقترحة</h2>
  <div class="keywords">${analysis.suggestedKeywords.map((k) => `<span class="kw-badge">${k}</span>`).join("")}</div>

  <!-- Related Questions -->
  ${analysis.relatedQuestions.length > 0 ? `
  <h2>❓ أسئلة شائعة مرتبطة</h2>
  <ul>${analysis.relatedQuestions.map((q) => `<li>${q}</li>`).join("")}</ul>` : ""}

  <!-- SERP -->
  <div class="section-page">
    <h2>🔍 نتائج البحث الحالية (SERP — Top 10)</h2>
    <table>
      <thead><tr><th style="width:50px;">الترتيب</th><th>النتيجة</th><th style="width:160px;">النطاق</th></tr></thead>
      <tbody>${serpRows}</tbody>
    </table>
  </div>

  <!-- Gap Analysis -->
  <div class="section-page">
    <h2>📊 تحليل الفجوات التنافسية</h2>
    ${gapSections}
  </div>

  <!-- Action Plan -->
  <div class="section-page">
    <h2>🎯 خطة العمل التنفيذية</h2>
    ${actionCards}
  </div>

  <!-- GEO -->
  <div class="section-page">
    <h2>🤖 توصيات تحسين محركات الذكاء الاصطناعي (GEO)</h2>
    ${geoItems}
  </div>

  <!-- Prompts -->
  <div class="section-page">
    <h2>💡 أوامر الذكاء الاصطناعي الجاهزة</h2>
    ${promptCards}
  </div>

  <div class="footer">تم الإنتاج بواسطة محرك MZ-AI للتحليل الذكي — ${new Date().toLocaleString("ar-SA")}</div>
  <script>setTimeout(()=>{window.print();window.close();},600);</script>
  </body></html>`;

  win.document.write(html);
  win.document.close();
}

export default function AnalysisReport() {
  const [, params] = useRoute("/analysis/:id");
  const id = params?.id;
  const { toast } = useToast();

  const { data: analysis, isLoading, error } = useGetAnalysis(id!, {
    query: { enabled: !!id, queryKey: getGetAnalysisQueryKey(id!) }
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "تم النسخ",
        description: "تم نسخ النص إلى الحافظة بنجاح.",
      });
    }).catch(() => {
      toast({
        title: "حدث خطأ",
        description: "تعذر نسخ النص.",
        variant: "destructive",
      });
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-16">
        <div className="h-10 bg-muted/40 rounded-lg w-1/3 mb-2 animate-pulse" />
        <div className="h-6 bg-muted/40 rounded-lg w-1/4 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 h-32 bg-muted/40 rounded-xl animate-pulse" />
          <div className="col-span-2 h-32 bg-muted/40 rounded-xl animate-pulse" />
        </div>
        <div className="h-96 bg-muted/40 rounded-xl animate-pulse mt-6" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed border-destructive/50 bg-destructive/5">
        <AlertCircle className="w-12 h-12 text-destructive mb-4 opacity-80" />
        <h3 className="text-xl font-bold mb-2">تعذر تحميل التقرير</h3>
        <p className="text-muted-foreground">حدث خطأ أثناء الاتصال بالخادم أو التقرير غير موجود.</p>
      </div>
    );
  }

  // Group gap analysis by category
  const gapAnalysisByCategory = analysis.gapAnalysis.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, typeof analysis.gapAnalysis>);

  const priorityColors = {
    high: "bg-destructive/10 text-destructive border-destructive/20",
    medium: "bg-chart-3/10 text-chart-3 border-chart-3/20",
    low: "bg-chart-2/10 text-chart-2 border-chart-2/20",
  };

  const priorityLabels = {
    high: "أولوية عالية",
    medium: "أولوية متوسطة",
    low: "أولوية منخفضة",
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Header Section */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <span>{new Date(analysis.createdAt).toLocaleDateString('ar-EG')}</span>
          <span>•</span>
          <span className="font-mono flex items-center gap-1"><Globe className="w-3 h-3" /> {analysis.userSite}</span>
          <span>•</span>
          <span className="uppercase text-xs font-mono">{analysis.country} | {analysis.language}</span>
        </div>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary flex items-center gap-3">
              <Search className="w-8 h-8 text-primary/80" />
              {analysis.keyword}
            </h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="secondary" className="px-3 py-1.5 text-sm flex items-center gap-2 border-primary/20 bg-primary/10 text-primary">
              <Target className="w-4 h-4" />
              نية البحث: {analysis.searchIntent}
            </Badge>
            <div className="bg-card border border-border/50 rounded-lg px-4 py-2 flex flex-col items-center justify-center">
              <span className="text-xs text-muted-foreground">ترتيب موقعك</span>
              <span className="text-xl font-bold">{analysis.userPosition || "-"}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-primary/30 text-primary hover:bg-primary/10"
              onClick={() => handlePrint(analysis)}
            >
              <FileDown className="w-4 h-4" />
              تصدير PDF
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-card/50 backdrop-blur-sm border border-border/50 mb-8 sticky top-16 z-30">
          <TabsTrigger value="overview" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">نظرة عامة</TabsTrigger>
          <TabsTrigger value="action-plan" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">خطة العمل</TabsTrigger>
          <TabsTrigger value="serp" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">نتائج البحث (SERP)</TabsTrigger>
          <TabsTrigger value="gap" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">تحليل الفجوات</TabsTrigger>
          <TabsTrigger value="geo" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">توصيات GEO</TabsTrigger>
          <TabsTrigger value="prompts" className="py-2.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">أوامر الذكاء الاصطناعي</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-primary/20 shadow-lg shadow-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  ملخص الوضع الحالي
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg leading-relaxed text-foreground/90 font-medium">
                  {analysis.situationSummary}
                </p>
                <div className="mt-6 bg-muted/30 p-4 rounded-lg border border-border/50">
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                    <Target className="w-4 h-4 text-chart-2" />
                    تفسير نية البحث
                  </h4>
                  <p className="text-sm text-muted-foreground">{analysis.intentExplanation}</p>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="w-4 h-4 text-chart-4" />
                    الذكاء الاصطناعي في البحث
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-3 h-3 rounded-full", analysis.aiOverviewPresent ? "bg-primary animate-pulse" : "bg-muted")} />
                    <span className="text-sm font-medium">
                      {analysis.aiOverviewPresent ? "يظهر ملخص ذكاء اصطناعي (AI Overview) لهذه الكلمة" : "لا يظهر ملخص ذكاء اصطناعي لهذه الكلمة"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-chart-5" />
                    أسئلة شائعة (Related Questions)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysis.relatedQuestions.length > 0 ? (
                    <ul className="space-y-2">
                      {analysis.relatedQuestions.map((q, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-0.5" />
                          <span>{q}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-sm text-muted-foreground">لا توجد أسئلة شائعة ظاهرة</span>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-chart-3" />
                كلمات مفتاحية مقترحة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {analysis.suggestedKeywords.map((kw, i) => (
                  <Badge key={i} variant="secondary" className="px-3 py-1.5 text-sm font-normal bg-secondary/30 hover:bg-secondary/50 cursor-default transition-colors border-border/50">
                    {kw}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Action Plan Tab */}
        <TabsContent value="action-plan" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analysis.actionPlan.map((action, i) => (
              <Card key={i} className={cn("border-t-4 bg-card/50 backdrop-blur-sm relative overflow-hidden", 
                action.priority === 'high' ? "border-t-destructive shadow-md shadow-destructive/5" :
                action.priority === 'medium' ? "border-t-chart-3 shadow-md shadow-chart-3/5" :
                "border-t-chart-2 shadow-md shadow-chart-2/5"
              )}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className={cn("font-medium border text-xs px-2 py-0.5", priorityColors[action.priority])}>
                      {priorityLabels[action.priority]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg leading-tight">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{action.details}</p>
                  {action.impact && (
                    <div className="bg-background/60 p-3 rounded-md border border-border/50 mt-4">
                      <span className="text-xs font-semibold text-primary block mb-1">الأثر المتوقع:</span>
                      <span className="text-xs text-foreground/80">{action.impact}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SERP Tab */}
        <TabsContent value="serp" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ListTodo className="w-5 h-5 text-primary" />
                نتائج البحث الحالية (Top 10)
              </CardTitle>
              <CardDescription>هكذا تبدو صفحة النتائج الأولى في Google للكلمة المفتاحية المستهدفة</CardDescription>
            </CardHeader>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-16 text-center">الترتيب</TableHead>
                    <TableHead>النتيجة</TableHead>
                    <TableHead className="text-left" dir="ltr">النطاق</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analysis.serpResults.map((result) => (
                    <TableRow 
                      key={result.position} 
                      className={cn(
                        "transition-colors",
                        result.isUserSite ? "bg-primary/10 hover:bg-primary/15 border-l-4 border-l-primary" : ""
                      )}
                    >
                      <TableCell className="text-center font-bold text-lg text-muted-foreground">
                        {result.position}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-2xl">
                          <a href={result.link} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-400 font-semibold text-lg hover:underline decoration-blue-500/30 underline-offset-4 transition-all">
                            {result.title}
                          </a>
                          <span className="text-sm text-foreground/80 leading-relaxed">{result.snippet}</span>
                          {result.isUserSite && (
                            <Badge variant="default" className="w-fit mt-2">موقعك الحالي</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-left font-mono text-sm text-muted-foreground" dir="ltr">
                        {result.domain}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        {/* Gap Analysis Tab */}
        <TabsContent value="gap" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(gapAnalysisByCategory).map(([category, items]) => (
              <Card key={category} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {category}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 p-0">
                  <ul className="divide-y divide-border/50">
                    {items.map((item, i) => (
                      <li key={i} className="p-4 flex flex-col gap-2 hover:bg-muted/10 transition-colors">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-xs border-primary/20 text-primary bg-primary/5 px-2 py-0.5" dir="ltr">
                            {item.competitor}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                          <span className="text-destructive font-bold ml-1">تتفوق في:</span>
                          {item.advantage}
                        </p>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* GEO Recommendations Tab */}
        <TabsContent value="geo" className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 border-r-4 border-r-chart-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-6 h-6 text-chart-4" />
                توصيات تحسين محركات الذكاء الاصطناعي (GEO)
              </CardTitle>
              <CardDescription>كيف تجعل محتواك مفضلاً لدى Google AI Overview و ChatGPT ومحركات البحث المدعومة بالذكاء الاصطناعي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysis.geoRecommendations.map((rec, i) => (
                  <div key={i} className="flex gap-4 items-start p-4 rounded-xl bg-muted/20 border border-border/50">
                    <div className="w-8 h-8 rounded-full bg-chart-4/10 flex items-center justify-center shrink-0 mt-1">
                      <Lightbulb className="w-4 h-4 text-chart-4" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-semibold text-foreground">{rec.recommendation}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{rec.rationale}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Prompts Tab */}
        <TabsContent value="prompts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {analysis.suggestedPrompts.map((prompt, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50 flex flex-col">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    {prompt.useCase}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <div className="relative group flex-1">
                    <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="icon" variant="secondary" className="h-8 w-8 bg-card border border-border shadow-sm" onClick={() => copyToClipboard(prompt.prompt)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <ScrollArea className="h-full min-h-[160px] max-h-[300px] w-full rounded-md border border-border/50 bg-[#1e1e1e]">
                      <pre className="p-4 text-sm font-mono text-gray-300 whitespace-pre-wrap break-words leading-relaxed" dir="ltr">
                        {prompt.prompt}
                      </pre>
                    </ScrollArea>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}