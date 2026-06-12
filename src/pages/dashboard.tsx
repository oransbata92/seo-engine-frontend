import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAnalyzeCompetitors, useGetStats, getListAnalysesQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Search, Globe, BarChart, Target, Zap, Loader2, Play, ArrowRight } from "lucide-react";

const GLOBAL_MARKETS: { value: string; label: string; lang: string; group: string; flag: string }[] = [
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇺🇸", value: "us", label: "الولايات المتحدة",  lang: "en" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇨🇳", value: "cn", label: "الصين",            lang: "zh" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇬🇧", value: "gb", label: "بريطانيا",         lang: "en" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇩🇪", value: "de", label: "ألمانيا",           lang: "de" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇯🇵", value: "jp", label: "اليابان",           lang: "ja" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇰🇷", value: "kr", label: "كوريا الجنوبية",   lang: "ko" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇫🇷", value: "fr", label: "فرنسا",             lang: "fr" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇮🇳", value: "in", label: "الهند",             lang: "en" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇨🇦", value: "ca", label: "كندا",              lang: "en" },
  { group: "🌟 أعلى أسواق التجارة الإلكترونية",   flag: "🇦🇺", value: "au", label: "أستراليا",          lang: "en" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇧🇷", value: "br", label: "البرازيل",          lang: "pt" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇲🇽", value: "mx", label: "المكسيك",           lang: "es" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇮🇩", value: "id", label: "إندونيسيا",         lang: "id" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇳🇱", value: "nl", label: "هولندا",            lang: "nl" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇸🇪", value: "se", label: "السويد",            lang: "sv" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇮🇹", value: "it", label: "إيطاليا",           lang: "it" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇪🇸", value: "es", label: "إسبانيا",           lang: "es" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇷🇺", value: "ru", label: "روسيا",             lang: "ru" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇹🇷", value: "tr", label: "تركيا",             lang: "tr" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇵🇱", value: "pl", label: "بولندا",            lang: "pl" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇸🇬", value: "sg", label: "سنغافورة",          lang: "en" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇹🇭", value: "th", label: "تايلاند",           lang: "th" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇵🇭", value: "ph", label: "الفلبين",           lang: "en" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇦🇷", value: "ar_country", label: "الأرجنتين", lang: "es" },
  { group: "📈 أسواق سريعة النمو",                 flag: "🇨🇴", value: "co", label: "كولومبيا",          lang: "es" },
  { group: "🌍 الأسواق العربية",                   flag: "🇸🇦", value: "sa", label: "السعودية",          lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇦🇪", value: "ae", label: "الإمارات",          lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇪🇬", value: "eg", label: "مصر",               lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇰🇼", value: "kw", label: "الكويت",            lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇶🇦", value: "qa", label: "قطر",               lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇲🇦", value: "ma", label: "المغرب",            lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇯🇴", value: "jo", label: "الأردن",            lang: "ar" },
  { group: "🌍 الأسواق العربية",                   flag: "🇩🇿", value: "dz", label: "الجزائر",           lang: "ar" },
  { group: "🌱 أسواق ناشئة",                       flag: "🇳🇬", value: "ng", label: "نيجيريا",           lang: "en" },
  { group: "🌱 أسواق ناشئة",                       flag: "🇿🇦", value: "za", label: "جنوب أفريقيا",      lang: "en" },
  { group: "🌱 أسواق ناشئة",                       flag: "🇵🇰", value: "pk", label: "باكستان",           lang: "en" },
  { group: "🌱 أسواق ناشئة",                       flag: "🇧🇩", value: "bd", label: "بنغلاديش",          lang: "bn" },
  { group: "🌱 أسواق ناشئة",                       flag: "🇻🇳", value: "vn", label: "فيتنام",            lang: "vi" },
  { group: "🌱 أسواق ناشئة",                       flag: "🇨🇱", value: "cl", label: "تشيلي",             lang: "es" },
];

const LANGUAGE_LABELS: Record<string, string> = {
  ar: "العربية", en: "الإنجليزية", de: "الألمانية", fr: "الفرنسية",
  ja: "اليابانية", ko: "الكورية", zh: "الصينية", pt: "البرتغالية",
  es: "الإسبانية", ru: "الروسية", id: "الإندونيسية", nl: "الهولندية",
  sv: "السويدية", it: "الإيطالية", tr: "التركية", pl: "البولندية",
  th: "التايلاندية", bn: "البنغالية", vi: "الفيتنامية",
};
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Cell as PieCell, Legend } from "recharts";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

const analyzeSchema = z.object({
  userSite: z.string().min(3, { message: "يجب إدخال نطاق الموقع" }),
  keyword: z.string().min(2, { message: "يجب إدخال الكلمة المفتاحية" }),
  country: z.string().optional(),
  language: z.string().optional(),
  businessContext: z.string().optional(),
});

type AnalyzeFormValues = z.infer<typeof analyzeSchema>;

const loadingMessages = [
  "نجمع نتائج البحث من Google...",
  "نحلل المواقع المنافسة...",
  "نستخرج نية البحث (Search Intent)...",
  "نحلل الفجوات في المحتوى والـ SEO...",
  "نُجهز توصيات الـ AI Overview...",
  "نُولّد خطة العمل والأكواد...",
];

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const analyzeMutation = useAnalyzeCompetitors();
  
  const { data: stats, isLoading: isStatsLoading, error: statsError } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  const [loadingStep, setLoadingStep] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (analyzeMutation.isPending) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 4000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [analyzeMutation.isPending]);

  const form = useForm<AnalyzeFormValues>({
    resolver: zodResolver(analyzeSchema),
    defaultValues: {
      userSite: "",
      keyword: "",
      country: "sa",
      language: "ar",
      businessContext: "",
    },
  });

  // Auto-select language when country changes
  useEffect(() => {
    const sub = form.watch((value, { name }) => {
      if (name === "country") {
        const market = GLOBAL_MARKETS.find((m) => m.value === value.country);
        if (market) form.setValue("language", market.lang);
      }
    });
    return () => sub.unsubscribe();
  }, [form]);

  const onSubmit = (data: AnalyzeFormValues) => {
    analyzeMutation.mutate({ data }, {
      onSuccess: (report) => {
        queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        setLocation(`/analysis/${report.id}`);
      },
      onError: (error) => {
        toast({
          title: "حدث خطأ",
          description: "تعذر إكمال التحليل. يرجى المحاولة مرة أخرى.",
          variant: "destructive",
        });
      }
    });
  };

  const chartColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col gap-2 pt-4">
        <h1 className="text-3xl font-bold tracking-tight text-primary">لوحة القيادة</h1>
        <p className="text-muted-foreground">قم بتحليل منافسيك وتصدر نتائج البحث في Google.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-1">
          <Card className="border-primary/20 shadow-lg shadow-primary/5 bg-card/50 backdrop-blur-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-chart-2"></div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Target className="w-5 h-5 text-primary" />
                بدء تحليل جديد
              </CardTitle>
              <CardDescription>
                أدخل بيانات الموقع والكلمة المفتاحية المستهدفة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="userSite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>نطاق موقعك (Domain)</FormLabel>
                        <FormControl>
                          <Input placeholder="example.com" {...field} className="font-mono text-left bg-background/50" dir="ltr" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="keyword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الكلمة المفتاحية (Keyword)</FormLabel>
                        <FormControl>
                          <Input placeholder="مثال: افضل شركة تسويق" {...field} className="bg-background/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => {
                      const selected = GLOBAL_MARKETS.find((m) => m.value === field.value);
                      const groups = [...new Set(GLOBAL_MARKETS.map((m) => m.group))];
                      return (
                        <FormItem>
                          <FormLabel className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5" />
                            السوق المستهدف
                          </FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-background/50">
                                <SelectValue>
                                  {selected ? `${selected.flag} ${selected.label}` : "اختر السوق"}
                                </SelectValue>
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-72">
                              {groups.map((group) => (
                                <div key={group}>
                                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1 mt-1">
                                    {group}
                                  </div>
                                  {GLOBAL_MARKETS.filter((m) => m.group === group).map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                      {m.flag} {m.label}
                                    </SelectItem>
                                  ))}
                                </div>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>لغة البحث <span className="text-xs text-muted-foreground">(تُحدَّد تلقائياً)</span></FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50">
                              <SelectValue>
                                {LANGUAGE_LABELS[field.value ?? "en"] ?? field.value}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(LANGUAGE_LABELS).map(([code, label]) => (
                              <SelectItem key={code} value={code}>{label} ({code})</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessContext"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>سياق العمل (اختياري)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="صف طبيعة عملك، جمهورك المستهدف، أو ميزتك التنافسية لتحسين جودة التحليل..." 
                            className="resize-none h-24 bg-background/50" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {analyzeMutation.isPending ? (
                    <div className="mt-6 p-4 rounded-md bg-secondary/30 border border-secondary border-dashed flex flex-col items-center justify-center gap-3 text-center animate-in fade-in slide-in-from-bottom-2">
                      <Loader2 className="w-8 h-8 text-primary animate-spin" />
                      <div className="font-medium text-sm">جاري المعالجة...</div>
                      <p className="text-xs text-muted-foreground animate-pulse">{loadingMessages[loadingStep]}</p>
                    </div>
                  ) : (
                    <Button type="submit" className="w-full mt-6 group">
                      بدء التحليل الشامل
                      <Play className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  )}
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Stats */}
        <div className="lg:col-span-2 space-y-6">
          
          {isStatsLoading ? (
            <div className="h-[400px] flex items-center justify-center border border-border/50 rounded-xl bg-card/20">
              <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
            </div>
          ) : statsError || !stats ? (
            <div className="h-[200px] flex flex-col items-center justify-center border border-border/50 rounded-xl bg-card/20 text-muted-foreground">
              <BarChart className="w-8 h-8 mb-2 opacity-50" />
              <p>لا توجد إحصائيات متاحة حالياً</p>
            </div>
          ) : (
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      إجمالي التحليلات
                      <BarChart className="w-4 h-4 text-primary" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">{stats.totalAnalyses}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      كلمات مفتاحية
                      <Search className="w-4 h-4 text-chart-2" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">{stats.uniqueKeywords}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      مواقع منافسة
                      <Globe className="w-4 h-4 text-chart-3" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">{stats.uniqueSites}</div>
                  </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
                      متوسط الترتيب
                      <Zap className="w-4 h-4 text-chart-4" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="text-3xl font-bold">
                      {stats.avgUserPosition ? stats.avgUserPosition.toFixed(1) : "-"}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">أبرز المنافسين تكراراً</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] pt-4">
                    {stats.topRecurringCompetitors && stats.topRecurringCompetitors.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <RechartsBarChart
                          data={stats.topRecurringCompetitors.slice(0, 5)}
                          layout="vertical"
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="domain" 
                            type="category" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                            width={100}
                          />
                          <Tooltip 
                            cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', color: 'hsl(var(--popover-foreground))', direction: 'ltr' }}
                            itemStyle={{ color: 'hsl(var(--primary))' }}
                          />
                          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                            {stats.topRecurringCompetitors.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Bar>
                        </RechartsBarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">لا توجد بيانات كافية</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base font-semibold">توزيع نية البحث (Search Intent)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[250px] pt-0">
                    {stats.intentDistribution && stats.intentDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.intentDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="count"
                            nameKey="intent"
                          >
                            {stats.intentDistribution.map((entry, index) => (
                              <PieCell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', color: 'hsl(var(--popover-foreground))' }}
                          />
                          <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-muted-foreground">لا توجد بيانات كافية</div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Analyses List */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold">أحدث التحليلات</CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setLocation('/analyses')} className="text-xs">
                      عرض الكل
                      <ArrowRight className="w-3 h-3 mr-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentAnalyses && stats.recentAnalyses.length > 0 ? (
                      stats.recentAnalyses.map((analysis) => (
                        <div 
                          key={analysis.id} 
                          className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-muted/30 transition-colors cursor-pointer group"
                          onClick={() => setLocation(`/analysis/${analysis.id}`)}
                        >
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{analysis.keyword}</span>
                              <Badge variant="outline" className="text-[10px] font-normal px-1.5 py-0 h-5">
                                {analysis.searchIntent}
                              </Badge>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono" dir="ltr">
                              {analysis.userSite}
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="hidden sm:flex flex-col items-end text-xs text-muted-foreground">
                              <span className="flex items-center gap-1"><Search className="w-3 h-3" /> {new Date(analysis.createdAt).toLocaleDateString('ar-EG')}</span>
                            </div>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              <ArrowRight className="w-4 h-4 transform rotate-180" />
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground">
                        لا توجد تحليلات سابقة. ابدأ تحليل جديد الآن!
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

            </>
          )}

        </div>
      </div>
    </div>
  );
}
