import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ShieldAlert, Send, Loader2 } from 'lucide-react';
import { useCreateReport } from '@workspace/api-client-react';

const GOVERNORATES = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة", "الفيوم", 
  "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية", "الوادي الجديد", "السويس", 
  "أسوان", "أسيوط", "بني سويف", "بورسعيد", "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", 
  "مطروح", "الأقصر", "قنا", "شمال سيناء", "سوهاج"
];

const REASONS = [
  "علبة مختلفة عن المعتاد",
  "رائحة أو لون غريب",
  "أثر ضار بعد الاستخدام",
  "شراء من مصدر غير موثوق",
  "أخرى"
];

const reportSchema = z.object({
  medicineName: z.string().min(2, "يرجى إدخال اسم الدواء"),
  reportReason: z.string().min(1, "يرجى اختيار سبب الاشتباه"),
  description: z.string().optional(),
  governorate: z.string().optional(),
  pharmacyName: z.string().optional(),
  contactNumber: z.string().optional()
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportPage() {
  const [, setLocation] = useLocation();
  const createReportMutation = useCreateReport();

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      medicineName: "",
      reportReason: "",
      description: "",
      governorate: "",
      pharmacyName: "",
      contactNumber: ""
    }
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const medName = params.get('medicine');
    if (medName) {
      form.setValue('medicineName', medName);
    }
  }, [form]);

  const onSubmit = (data: ReportFormValues) => {
    createReportMutation.mutate({ data }, {
      onSuccess: () => {
        // Handled in UI
      }
    });
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(`قمت للتو بالإبلاغ عن دواء مشبوه (${form.getValues().medicineName}) عبر منصة صحتي. تأكدوا من أدويتكم دائماً!`);
    window.location.href = `whatsapp://send?text=${text}`;
  };

  if (createReportMutation.isSuccess) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-md text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-4">تم استلام بلاغك بنجاح</h2>
          <p className="text-muted-foreground mb-8">
            شكراً لمساهمتك في حماية المجتمع. سيتم تحويل بلاغك لهيئة الدواء المصرية لاتخاذ اللازم.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={handleShareWhatsApp} className="w-full gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white">
              شارك عبر واتساب
            </Button>
            <Button variant="outline" onClick={() => setLocation('/')} className="w-full">
              العودة للرئيسية
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-destructive/10 text-destructive rounded-lg">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">أبلغ عن دواء مشبوه</h1>
            <p className="text-sm text-muted-foreground">تواصل معنا وسنقوم بإرسال البلاغ للجهات المختصة</p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card p-6 rounded-xl border shadow-sm">
            <FormField
              control={form.control}
              name="medicineName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>اسم الدواء المشبوه <span className="text-destructive">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="اكتب اسم الدواء..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reportReason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>سبب الاشتباه <span className="text-destructive">*</span></FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger dir="rtl">
                        <SelectValue placeholder="اختر سبب الاشتباه..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent dir="rtl">
                      {REASONS.map(reason => (
                        <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف تفصيلي</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="اذكر أي تفاصيل إضافية قد تساعدنا..." 
                      className="resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="governorate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المحافظة</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger dir="rtl">
                          <SelectValue placeholder="اختر المحافظة" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent dir="rtl">
                        {GOVERNORATES.map(gov => (
                          <SelectItem key={gov} value={gov}>{gov}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pharmacyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الصيدلية (إن وجد)</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم الصيدلية ومكانها" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رقم التواصل (اختياري)</FormLabel>
                  <FormControl>
                    <Input placeholder="رقم الهاتف للمتابعة" dir="ltr" className="text-right" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full h-12 text-lg gap-2" 
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5 ml-1 transform rotate-180" />
              )}
              إرسال البلاغ
            </Button>
          </form>
        </Form>
      </div>
    </Layout>
  );
}
