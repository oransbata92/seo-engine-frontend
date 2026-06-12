import { useState, useMemo } from "react";
import { useLocation, Link } from "wouter";
import { useListAnalyses, useDeleteAnalysis, getListAnalysesQueryKey, getGetStatsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Search, SearchX, Globe, Calendar, Zap, ListFilter, Trash2, ArrowRight, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function Analyses() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: analyses, isLoading, error } = useListAnalyses({
    query: { queryKey: getListAnalysesQueryKey() }
  });

  const deleteMutation = useDeleteAnalysis();

  const [searchTerm, setSearchTerm] = useState("");

  const filteredAnalyses = useMemo(() => {
    if (!analyses) return [];
    if (!searchTerm) return analyses;
    
    const lowerSearch = searchTerm.toLowerCase();
    return analyses.filter(
      (a) => 
        a.keyword.toLowerCase().includes(lowerSearch) || 
        a.userSite.toLowerCase().includes(lowerSearch) ||
        a.searchIntent.toLowerCase().includes(lowerSearch)
    );
  }, [analyses, searchTerm]);

  const handleDelete = (id: string) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({
          title: "تم الحذف بنجاح",
          description: "تم حذف التقرير من سجلاتك.",
        });
        queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
      },
      onError: () => {
        toast({
          title: "حدث خطأ",
          description: "لم نتمكن من حذف التقرير.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pt-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
            التقارير السابقة
          </h1>
          <p className="text-muted-foreground mt-1">تصفح سجل تحليلاتك السابقة وتوصيات SEO.</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-80">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالكلمة المفتاحية، الموقع، أو النية..." 
              className="pl-3 pr-9" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse bg-card/40 border-border/50 h-48">
              <CardHeader className="pb-2">
                <div className="h-5 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed border-destructive/50 bg-destructive/5">
          <Zap className="w-12 h-12 text-destructive mb-4 opacity-80" />
          <h3 className="text-xl font-bold mb-2">تعذر تحميل التقارير</h3>
          <p className="text-muted-foreground mb-4">حدث خطأ أثناء الاتصال بالخادم.</p>
          <Button onClick={() => queryClient.invalidateQueries({ queryKey: getListAnalysesQueryKey() })} variant="outline">
            إعادة المحاولة
          </Button>
        </div>
      ) : analyses && analyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border rounded-xl border-dashed border-border/60 bg-card/20">
          <SearchX className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">لا توجد تقارير</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            لم تقم بإجراء أي تحليلات بعد. ابدأ بتحليل منافسيك لمعرفة الفجوات في الـ SEO.
          </p>
          <Button onClick={() => setLocation('/')}>
            تحليل جديد <ArrowLeft className="w-4 h-4 ml-2" />
          </Button>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border rounded-xl border-dashed border-border/60 bg-card/20">
          <ListFilter className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-bold mb-2">لا توجد نتائج مطابقة</h3>
          <p className="text-muted-foreground mb-4">لم نعثر على تقارير تطابق بحثك "{searchTerm}"</p>
          <Button variant="link" onClick={() => setSearchTerm("")}>
            مسح البحث
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAnalyses.map((analysis) => (
            <Card key={analysis.id} className="flex flex-col border-border/60 bg-card/40 backdrop-blur-sm hover:border-primary/40 transition-all hover:shadow-md hover:shadow-primary/5 group">
              <CardHeader className="pb-3 border-b border-border/30">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 w-full pr-8 relative">
                    <Badge variant="outline" className="mb-2 bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
                      {analysis.searchIntent}
                    </Badge>
                    <CardTitle className="text-lg leading-tight line-clamp-2" title={analysis.keyword}>
                      {analysis.keyword}
                    </CardTitle>
                    <div className="flex items-center text-sm text-muted-foreground font-mono" dir="ltr">
                      <Globe className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{analysis.userSite}</span>
                    </div>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="absolute top-0 right-0 w-7 h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>هل أنت متأكد من الحذف؟</AlertDialogTitle>
                          <AlertDialogDescription>
                            هذا الإجراء لا يمكن التراجع عنه. سيتم حذف تقرير التحليل نهائياً.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-row-reverse sm:space-x-reverse space-x-2">
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(analysis.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف التقرير'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                  </div>
                </div>
              </CardHeader>
              <CardContent className="py-4 flex-1">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-background/50 rounded-md p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground mb-1">ترتيب موقعك</span>
                    <span className="font-bold text-lg">{analysis.userPosition || "-"}</span>
                  </div>
                  <div className="bg-background/50 rounded-md p-2 flex flex-col items-center justify-center text-center">
                    <span className="text-xs text-muted-foreground mb-1">خطوات العمل</span>
                    <span className="font-bold text-lg">{analysis.actionCount}</span>
                  </div>
                  {analysis.topCompetitor && (
                    <div className="col-span-2 bg-background/50 rounded-md p-2 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground flex-shrink-0">أبرز منافس:</span>
                      <span className="font-mono text-xs truncate" dir="ltr">{analysis.topCompetitor}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between items-center border-t border-border/30 mt-auto px-4 py-3">
                <div className="text-xs text-muted-foreground flex items-center">
                  <Calendar className="w-3 h-3 ml-1" />
                  {format(new Date(analysis.createdAt), "d MMMM yyyy", { locale: ar })}
                </div>
                <Button variant="secondary" size="sm" className="h-8 gap-1" onClick={() => setLocation(`/analysis/${analysis.id}`)}>
                  عرض التقرير
                  <ArrowLeft className="w-3 h-3" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}