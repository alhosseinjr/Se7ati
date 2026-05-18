import React from "react";
import { Link } from "wouter";
import { Stethoscope, ShieldCheck, Home, Search, MessageSquare, AlertOctagon } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans text-foreground" dir="rtl">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary tracking-tight leading-none mb-0.5">صحتي</h1>
              <p className="text-[10px] text-muted-foreground leading-none">اتأكد من دواؤك قبل ما تاخده</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href="/" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors">
              <Home className="w-4 h-4" /> الرئيسية
            </Link>
            <Link href="/search" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors">
              <Search className="w-4 h-4" /> دور وتحقق
            </Link>
            <Link href="/assistant" className="flex items-center gap-1.5 text-foreground/80 hover:text-primary transition-colors">
              <MessageSquare className="w-4 h-4" /> الصيدلاني
            </Link>
            <Link href="/report" className="flex items-center gap-1.5 text-destructive hover:text-destructive/80 transition-colors">
              <AlertOctagon className="w-4 h-4" /> أبلغ عن دوا
            </Link>
          </nav>

          <div className="md:hidden flex items-center gap-2">
            <Link href="/search" className="text-primary p-2">
              <Search className="w-5 h-5" />
            </Link>
            <Link href="/assistant" className="text-primary p-2">
              <MessageSquare className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t bg-muted/40 py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-10 h-10 text-primary/50" />
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            صحتي أداة توعوية بس ومش بديل عن الدكتور أو الصيدلاني. لو عندك دوا مشبوه اتصل بهيئة الدواء المصرية على 15301
          </p>
          <p className="text-xs text-muted-foreground/60 mt-4">
            &copy; {new Date().getFullYear()} منصة صحتي للتحقق من الأدوية في مصر.
          </p>
        </div>
      </footer>
      
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          <Link href="/" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary active:text-primary">
            <Home className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">الرئيسية</span>
          </Link>
          <Link href="/search" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary active:text-primary">
            <Search className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">بحث</span>
          </Link>
          <Link href="/assistant" className="flex flex-col items-center justify-center w-full h-full text-muted-foreground hover:text-primary active:text-primary">
            <MessageSquare className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">الصيدلاني</span>
          </Link>
          <Link href="/report" className="flex flex-col items-center justify-center w-full h-full text-destructive/80 hover:text-destructive active:text-destructive">
            <AlertOctagon className="w-5 h-5 mb-1" />
            <span className="text-[10px] font-medium">إبلاغ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
