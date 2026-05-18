import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { Layout } from '@/components/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Search, ScanLine, Camera, X, AlertTriangle, ArrowRight, Loader2, CheckCircle2, XCircle, FlaskConical } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { StatusBadge } from '@/components/StatusBadge';
import { BrowserMultiFormatReader } from '@zxing/library';
import { 
  useSearchMedicines, 
  useGetMedicineByBarcode,
  useAnalyzeImage,
  useVerifyMedicine,
  Medicine
} from '@workspace/api-client-react';

type Tab = 'search' | 'verify';

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<Tab>('search');

  // ── Search tab state ──────────────────────────────────────────────────────
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const [, setLocation] = useLocation();
  const [scannerOpen, setScannerOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [barcodeQuery, setBarcodeQuery] = useState('');

  // ── Verify tab state ──────────────────────────────────────────────────────
  const [disease, setDisease] = useState('');
  const [tradeName, setTradeName] = useState('');

  const { data: searchResults, isLoading: isSearching } = useSearchMedicines(
    { q: debouncedQuery, type: 'name' },
    { query: { enabled: debouncedQuery.length > 2 } }
  );

  const { data: barcodeResult, isLoading: isScanningBarcode } = useGetMedicineByBarcode(
    barcodeQuery,
    { query: { enabled: !!barcodeQuery } }
  );

  const analyzeImageMutation = useAnalyzeImage();
  const verifyMutation = useVerifyMedicine();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    if (mode === 'barcode') setScannerOpen(true);
    else if (mode === 'photo') fileInputRef.current?.click();
    const tab = urlParams.get('tab');
    if (tab === 'verify') setActiveTab('verify');
  }, []);

  useEffect(() => {
    if (scannerOpen) startScanner();
    else stopScanner();
    return () => stopScanner();
  }, [scannerOpen]);

  const startScanner = async () => {
    if (!readerRef.current) readerRef.current = new BrowserMultiFormatReader();
    try {
      const devices = await readerRef.current.listVideoInputDevices();
      readerRef.current.decodeFromVideoDevice(devices[0].deviceId, videoRef.current, (result) => {
        if (result) {
          setBarcodeQuery(result.getText());
          setScannerOpen(false);
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const stopScanner = () => {
    if (readerRef.current) readerRef.current.reset();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      analyzeImageMutation.mutate({
        data: { imageBase64: base64.split(',')[1], mimeType: file.type }
      }, {
        onSuccess: (result) => { if (result.drugName) setQuery(result.drugName); }
      });
    };
    reader.readAsDataURL(file);
  };

  const handleVerify = () => {
    if (!disease.trim() || !tradeName.trim()) return;
    verifyMutation.mutate({ data: { disease: disease.trim(), tradeName: tradeName.trim() } });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 max-w-3xl">

        {/* Tab Switcher */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl mb-6">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'search'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Search className="w-4 h-4" />
            دور على دوا
          </button>
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'verify'
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            الدوا ده صح لمرضي؟
          </button>
        </div>

        {/* ── SEARCH TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'search' && (
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اكتب اسم الدوا..."
                className="h-14 pr-12 text-lg rounded-xl shadow-sm"
                data-testid="input-search"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2"
                onClick={() => setScannerOpen(true)}
                data-testid="btn-scan-barcode"
              >
                <ScanLine className="w-5 h-5" />
                امسح الباركود
              </Button>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                className="flex-1 h-12 gap-2"
                onClick={() => fileInputRef.current?.click()}
                data-testid="btn-take-photo"
              >
                <Camera className="w-5 h-5" />
                صوّر العلبة
              </Button>
            </div>
          </div>
        )}

        {/* ── VERIFY TAB ────────────────────────────────────────────────────── */}
        {activeTab === 'verify' && (
          <div className="flex flex-col gap-4 mb-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm text-foreground/80 leading-relaxed">
              اكتب المرض أو الشكوى اللي عندك واسم الدوا اللي وُصفلك أو اشتريته، وهنقولك إذا ده الدوا الصح ولا لأ.
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">المرض أو الشكوى اللي عندك</label>
              <Input
                value={disease}
                onChange={(e) => setDisease(e.target.value)}
                placeholder="مثلاً: ضغط دم عالي، سكري، صداع، التهاب..."
                className="h-12 rounded-xl"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">الاسم التجاري للدواء</label>
              <Input
                value={tradeName}
                onChange={(e) => setTradeName(e.target.value)}
                placeholder="مثلاً: بروفين، أموكسيل، كونكور..."
                className="h-12 rounded-xl"
                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
              />
            </div>

            <Button
              className="h-12 text-base gap-2"
              onClick={handleVerify}
              disabled={!disease.trim() || !tradeName.trim() || verifyMutation.isPending}
            >
              {verifyMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  بنتحقق...
                </>
              ) : (
                <>
                  <FlaskConical className="w-5 h-5" />
                  اتحقق دلوقتي
                </>
              )}
            </Button>

            {/* Verify Result */}
            {verifyMutation.data && !verifyMutation.isPending && (
              <VerifyResult
                tradeName={tradeName}
                disease={disease}
                result={verifyMutation.data}
              />
            )}
          </div>
        )}

        {/* Search tab results */}
        {activeTab === 'search' && (
          <>
            {analyzeImageMutation.isPending && (
              <div className="flex flex-col items-center justify-center p-8 bg-muted/30 rounded-xl mb-6 border animate-pulse">
                <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                <p className="text-lg font-medium">بيقرأ الدوا بالذكاء الاصطناعي...</p>
              </div>
            )}

            {isSearching && !analyzeImageMutation.isPending && (
              <div className="flex justify-center p-8">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
              </div>
            )}

            {barcodeResult && barcodeQuery && !isScanningBarcode && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4">نتيجة المسح: {barcodeQuery}</h3>
                {barcodeResult.found && barcodeResult.medicine ? (
                  <MedicineCard medicine={barcodeResult.medicine} onClick={() => setSelectedMedicine(barcodeResult.medicine!)} />
                ) : (
                  <div className="bg-warning/10 border border-warning/20 p-6 rounded-xl text-center">
                    <AlertTriangle className="w-12 h-12 text-warning mx-auto mb-4" />
                    <h4 className="text-xl font-bold text-foreground mb-2">الباركود ده مش موجود عندنا</h4>
                    <p className="text-muted-foreground mb-6">
                      الباركود اللي مسحته مش مربوط بأي دوا في قاعدة بياناتنا.
                    </p>
                    <div className="space-y-4 max-w-sm mx-auto text-right">
                      <label className="text-sm font-medium">عارف اسم الدوا ده؟ ساعدنا نربطه:</label>
                      <div className="flex gap-2">
                        <Input placeholder="اكتب اسم الدوا..." />
                        <Button>ربط</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!barcodeResult && searchResults && searchResults.length > 0 && (
              <div className="space-y-4">
                {searchResults.map((medicine, i) => (
                  <MedicineCard key={medicine.id} medicine={medicine} onClick={() => setSelectedMedicine(medicine)} index={i} />
                ))}
              </div>
            )}

            {!barcodeResult && searchResults && searchResults.length === 0 && debouncedQuery.length > 2 && !isSearching && (
              <div className="bg-destructive/10 border border-destructive/20 p-6 rounded-xl text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h4 className="text-xl font-bold text-destructive mb-2">الدوا ده مش مسجل في هيئة الدواء</h4>
                <p className="text-foreground/80 mb-6">
                  ممكن يكون مهرب، مقلد، أو مش مرخص اتداوله في مصر.
                </p>
                <Button
                  variant="destructive"
                  className="gap-2"
                  onClick={() => setLocation(`/report?medicine=${encodeURIComponent(query)}`)}
                >
                  أبلغ عن الدوا ده دلوقتي
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}

        {/* Barcode Scanner Overlay */}
        {scannerOpen && (
          <div className="fixed inset-0 z-50 bg-black/90 flex flex-col">
            <div className="flex-1 relative">
              <video ref={videoRef} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-white/50 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-0.5 bg-red-500 animate-[scan_2s_ease-in-out_infinite]" />
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white" />
                </div>
              </div>
              <div className="absolute top-8 left-0 right-0 text-center">
                <p className="text-white text-lg font-bold">وجّه الكاميرا ناحية الباركود</p>
              </div>
              <button
                className="absolute top-6 left-6 text-white/80 hover:text-white bg-black/20 p-2 rounded-full backdrop-blur"
                onClick={() => setScannerOpen(false)}
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}

        {/* Medicine Detail Sheet */}
        <Sheet open={!!selectedMedicine} onOpenChange={(open) => !open && setSelectedMedicine(null)}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-2xl sm:max-w-md sm:mx-auto sm:right-auto sm:left-auto" dir="rtl">
            {selectedMedicine && (
              <>
                <SheetHeader className="text-right border-b pb-4 mb-4">
                  <div className="mb-2">
                    <StatusBadge isVerified={selectedMedicine.isVerified} />
                  </div>
                  <SheetTitle className="text-2xl font-bold">{selectedMedicine.tradeNameAr || selectedMedicine.tradeNameEn}</SheetTitle>
                  <SheetDescription className="text-base">{selectedMedicine.tradeNameEn}</SheetDescription>
                </SheetHeader>
                <div className="space-y-4 pb-8 overflow-y-auto max-h-full">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">الاسم العلمي</div>
                    <div className="font-medium bg-muted/30 p-3 rounded-lg">{selectedMedicine.genericName || 'مش متوفر'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">الشركة المصنعة</div>
                    <div className="font-medium bg-muted/30 p-3 rounded-lg">{selectedMedicine.applicantName || 'مش متوفر'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">الشكل الدوائي</div>
                      <div className="font-medium bg-muted/30 p-3 rounded-lg">{selectedMedicine.dosageForm || 'مش متوفر'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">رقم التسجيل</div>
                      <div className="font-medium bg-muted/30 p-3 rounded-lg font-mono text-left" dir="ltr">{selectedMedicine.registrationNumber || 'مش متوفر'}</div>
                    </div>
                  </div>
                  {selectedMedicine.barcode && (
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">الباركود</div>
                      <div className="font-medium bg-muted/30 p-3 rounded-lg font-mono text-left flex items-center justify-between" dir="ltr">
                        {selectedMedicine.barcode}
                        <ScanLine className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                  <div className="pt-4 border-t mt-6">
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => setLocation(`/report?medicine=${encodeURIComponent(selectedMedicine.tradeNameAr || selectedMedicine.tradeNameEn || '')}`)}
                    >
                      أبلغ عن مشكلة في الدوا ده
                      <AlertTriangle className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}

// ── Verify Result Component ────────────────────────────────────────────────
function VerifyResult({
  tradeName,
  disease,
  result
}: {
  tradeName: string;
  disease: string;
  result: { isForDisease: boolean; explanation: string; alternatives?: string[] | null };
}) {
  const yes = result.isForDisease;

  return (
    <div className={`rounded-xl border p-5 ${yes ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex items-start gap-3 mb-4">
        {yes
          ? <CheckCircle2 className="w-7 h-7 text-green-600 shrink-0 mt-0.5" />
          : <XCircle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
        }
        <div>
          <h3 className={`text-lg font-bold mb-1 ${yes ? 'text-green-800' : 'text-red-800'}`}>
            {yes
              ? `أيوه، ${tradeName} صح لـ${disease}`
              : `لأ، ${tradeName} مش المناسب لـ${disease}`
            }
          </h3>
          <p className="text-sm text-foreground/80 leading-relaxed">{result.explanation}</p>
        </div>
      </div>

      {result.alternatives && result.alternatives.length > 0 && (
        <div className="border-t pt-3 mt-3 border-current/10">
          <p className="text-sm font-semibold text-foreground/70 mb-2">أدوية أشهر لـ{disease}:</p>
          <div className="flex flex-wrap gap-2">
            {result.alternatives.map((alt) => (
              <span key={alt} className="px-3 py-1 bg-background rounded-full text-xs font-medium border border-border text-foreground">
                {alt}
              </span>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] text-muted-foreground mt-4 border-t pt-3 border-current/10">
        ⚕️ المعلومة دي للتوعية بس. استشر دكتورك أو صيدلانيك قبل أي قرار.
      </p>
    </div>
  );
}

function MedicineCard({ medicine, onClick, index = 0 }: { medicine: Medicine; onClick: () => void; index?: number }) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
      style={{ animationDelay: `${index * 100}ms` }}
      onClick={onClick}
      data-testid={`card-medicine-${medicine.id}`}
    >
      <CardContent className="p-4 flex items-start gap-4">
        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h4 className="text-lg font-bold leading-tight">
              {medicine.tradeNameAr || medicine.tradeNameEn}
            </h4>
            <StatusBadge isVerified={medicine.isVerified} className="shrink-0 scale-90 origin-top-left" />
          </div>
          <div className="text-sm text-muted-foreground mb-2">{medicine.tradeNameEn}</div>
          <div className="text-xs text-foreground/80 line-clamp-1 bg-muted/50 inline-block px-2 py-1 rounded">
            {medicine.genericName}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
