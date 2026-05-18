import React from 'react';
import { Link, useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ScanLine, Search, Camera, Activity, ShieldAlert, Users, CheckCircle, Search as SearchIcon, AlertOctagon } from 'lucide-react';
import { useGetStats } from '@workspace/api-client-react';

export default function Home() {
  const { data: stats } = useGetStats();
  const [, setLocation] = useLocation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary/5 py-12 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">
            دواؤك أصلي ولا مغشوش؟
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            دور على أي دوا واتأكد إنه مسجل في هيئة الدواء المصرية في ثانية.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center max-w-3xl mx-auto">
            <Button
              size="lg"
              className="w-full md:w-auto h-16 text-lg gap-3"
              onClick={() => setLocation('/search?mode=barcode')}
              data-testid="btn-hero-barcode"
            >
              <ScanLine className="w-6 h-6" />
              امسح الباركود
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="w-full md:w-auto h-16 text-lg gap-3 bg-background"
              onClick={() => setLocation('/search')}
              data-testid="btn-hero-search"
            >
              <Search className="w-6 h-6" />
              دور بالاسم
            </Button>
            <Button
              size="lg"
              variant="secondary"
              className="w-full md:w-auto h-16 text-lg gap-3"
              onClick={() => setLocation('/search?mode=photo')}
              data-testid="btn-hero-photo"
            >
              <Camera className="w-6 h-6" />
              صوّر العلبة
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-none shadow-sm bg-primary/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Activity className="w-8 h-8 text-primary mb-2" />
                <div className="text-3xl font-bold text-primary mb-1">
                  {stats?.medicineCount ? stats.medicineCount.toLocaleString() : '...'}
                </div>
                <div className="text-sm text-muted-foreground font-medium">دوا مسجل</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-destructive/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <ShieldAlert className="w-8 h-8 text-destructive mb-2" />
                <div className="text-3xl font-bold text-destructive mb-1">
                  {stats?.reportCount ? stats.reportCount.toLocaleString() : '...'}
                </div>
                <div className="text-sm text-muted-foreground font-medium">بلاغ مشبوه</div>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm bg-accent/5">
              <CardContent className="p-6 flex flex-col items-center text-center">
                <Users className="w-8 h-8 text-accent mb-2" />
                <div className="text-3xl font-bold text-accent mb-1">
                  {stats?.userCount ? stats.userCount.toLocaleString() : '...'}
                </div>
                <div className="text-sm text-muted-foreground font-medium">مستخدم</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-12">بتشتغل إزاي؟</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                <ScanLine className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">امسح أو صوّر</h4>
              <p className="text-muted-foreground">امسح الباركود أو صوّر العلبة بكاميرا موبايلك.</p>
            </div>
            <div className="flex flex-col items-center relative">
              <div className="w-16 h-16 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-4">
                <SearchIcon className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">بنتحقق</h4>
              <p className="text-muted-foreground">بندور في قاعدة بيانات هيئة الدواء المصرية في الحال.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-accent/10 text-accent flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold mb-2">بنخبرك</h4>
              <p className="text-muted-foreground">بتجيك النتيجة في الحال وتتأكد إن الدوا سليم قبل ما تاخده.</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
