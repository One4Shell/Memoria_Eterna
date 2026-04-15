/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MapPin, 
  QrCode, 
  Download, 
  Plus, 
  Info,
  ExternalLink,
  User,
  History,
  Navigation,
  Eye,
  Settings,
  ArrowLeft,
  Share2
} from 'lucide-react';
import LZString from 'lz-string';

// Types
interface MemorialData {
  n: string; // Name
  b: string; // Birth Date
  d: string; // Death Date
  bio: string; // Biography
  loc: string; // Location (lat,lng or address)
  msg?: string; // Short dedication
}

export default function App() {
  const [view, setView] = useState<'editor' | 'viewer'>('editor');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isScanned, setIsScanned] = useState(false);
  const [data, setData] = useState<MemorialData>({
    n: '',
    b: '',
    d: '',
    bio: '',
    loc: '',
    msg: ''
  });

  // Check URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get('m');
    
    if (compressed) {
      try {
        const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
        if (decompressed) {
          setData(JSON.parse(decompressed));
          setView('viewer');
          setIsScanned(true);
        }
      } catch (e) {
        console.error("Failed to parse memorial data", e);
      }
    }
  }, []);

  const generatedUrl = useMemo(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const compressed = LZString.compressToEncodedURIComponent(JSON.stringify(data));
    return `${baseUrl}?m=${compressed}`;
  }, [data]);

  const handleDownloadQR = () => {
    const svg = document.getElementById('memorial-qr');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${data.n.replace(/\s+/g, '_') || 'memorial'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (view === 'viewer') {
    return (
      <div className="min-h-screen bg-ios-bg flex flex-col items-center font-sans pb-12">
        {/* Profile Header */}
        <div className="w-full h-56 bg-ios-surface relative flex items-center justify-center overflow-hidden border-b border-ios-separator/30">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-28 h-28 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue z-10"
          >
            <Heart size={56} fill="currentColor" />
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full px-4 -mt-10 z-20 space-y-5"
        >
          <div className="ios-card p-6 text-center space-y-1">
            <h1 className="text-2xl font-bold text-ios-label">
              {data.n || 'In Memoria'}
            </h1>
            <p className="text-ios-secondary-label font-medium text-sm">
              {data.b || '...'} — {data.d || '...'}
            </p>
            {data.msg && (
              <p className="text-ios-blue italic font-serif text-base pt-2">
                "{data.msg}"
              </p>
            )}
          </div>

          <div className="ios-card p-6 space-y-4">
            <div className="flex items-center gap-3 text-ios-label">
              <History size={20} className="text-ios-blue" />
              <h2 className="font-bold text-lg">La Storia</h2>
            </div>
            <p className="text-ios-secondary-label leading-relaxed whitespace-pre-wrap text-base">
              {data.bio || 'Nessuna biografia disponibile.'}
            </p>
          </div>

          {data.loc && (
            <motion.div whileTap={{ scale: 0.98 }}>
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.loc)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 py-4 bg-ios-blue text-white rounded-2xl font-semibold shadow-md active:opacity-80 transition-all"
              >
                <Navigation size={20} />
                <span>Raggiungi la Tomba</span>
                <ExternalLink size={16} className="opacity-50" />
              </a>
            </motion.div>
          )}

          <div className="pt-12 opacity-30 flex flex-col items-center gap-2">
            <Heart size={16} fill="currentColor" />
            <p className="text-[10px] uppercase tracking-widest font-bold text-ios-label">Memoria Eterna</p>
          </div>
        </motion.div>

        {/* Floating Back Button for Admin/Preview */}
        {!isScanned && (
          <button 
            onClick={() => setView('editor')}
            className="fixed bottom-8 right-6 w-14 h-14 rounded-full bg-ios-surface text-ios-blue flex items-center justify-center shadow-xl active:scale-95 transition-transform z-50 border border-ios-separator/20"
            title="Torna all'editor"
          >
            <ArrowLeft size={24} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-ios-bg overflow-hidden font-sans">
      {/* Mobile Top App Bar */}
      <header className="px-6 py-4 flex items-center justify-center bg-ios-surface/80 backdrop-blur-xl border-b border-ios-separator/30 shrink-0 lg:hidden text-center">
        <span className="font-bold text-lg text-ios-label">Memoria Eterna</span>
      </header>

      {/* Desktop Header */}
      <header className="hidden lg:flex px-12 py-5 border-b border-ios-separator/30 justify-between items-center bg-ios-surface shrink-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-ios-blue flex items-center justify-center text-white">
            <QrCode size={20} />
          </div>
          <h1 className="font-bold text-xl text-ios-label">Memoria Eterna</h1>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setView('viewer')}
            className="px-6 py-2.5 bg-ios-grouped-bg rounded-xl text-sm font-semibold text-ios-blue hover:bg-ios-separator/20 transition-all"
          >
            Anteprima
          </button>
          <button 
            onClick={handleDownloadQR}
            disabled={!data.n}
            className="px-6 py-2.5 bg-ios-blue text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-30"
          >
            Scarica QR
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="h-full lg:grid lg:grid-cols-[420px_1fr]">
          
          {/* Editor Pane */}
          <section className={`h-full overflow-y-auto pt-10 p-6 lg:p-10 transition-all duration-300 ${activeTab === 'edit' ? 'block' : 'hidden lg:block'}`}>
            <div className="max-w-xl mx-auto space-y-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-bold text-ios-label">Nuovo Memoriale</h2>
                <p className="text-ios-secondary-label text-sm">Inserisci i dati per il codice commemorativo.</p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ios-secondary-label uppercase ml-1">Nome Completo</label>
                  <input 
                    type="text"
                    placeholder="Mario Rossi"
                    className="ios-input"
                    value={data.n}
                    onChange={e => setData({...data, n: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-ios-secondary-label uppercase ml-1">Nascita</label>
                    <input 
                      type="text"
                      placeholder="1940"
                      className="ios-input"
                      value={data.b}
                      onChange={e => setData({...data, b: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-ios-secondary-label uppercase ml-1">Decesso</label>
                    <input 
                      type="text"
                      placeholder="2024"
                      className="ios-input"
                      value={data.d}
                      onChange={e => setData({...data, d: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ios-secondary-label uppercase ml-1">Dedica</label>
                  <input 
                    type="text"
                    placeholder="Per sempre nei nostri cuori"
                    className="ios-input italic"
                    value={data.msg}
                    onChange={e => setData({...data, msg: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ios-secondary-label uppercase ml-1">Biografia</label>
                  <textarea 
                    rows={5}
                    placeholder="Racconta la sua storia..."
                    className="ios-input min-h-[150px] resize-none"
                    value={data.bio}
                    onChange={e => setData({...data, bio: e.target.value})}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-ios-secondary-label uppercase ml-1">Posizione</label>
                  <input 
                    type="text"
                    placeholder="Indirizzo o Coordinate"
                    className="ios-input"
                    value={data.loc}
                    onChange={e => setData({...data, loc: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="h-24 lg:hidden" />
            </div>
          </section>

          {/* Preview Pane */}
          <section className={`h-full overflow-y-auto pt-10 p-6 lg:p-12 flex flex-col items-center justify-center transition-all duration-300 ${activeTab === 'preview' ? 'block' : 'hidden lg:flex'}`}>
            <div className="max-w-md w-full space-y-10">
              
              {/* QR Code Card */}
              <motion.div 
                layoutId="qr-card"
                className="ios-card p-10 flex flex-col items-center justify-center gap-8 text-center mx-auto"
              >
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-ios-label">Codice QR</h3>
                  <p className="text-sm text-ios-secondary-label">Scansiona per leggere la storia</p>
                </div>
                
                <div className="p-6 bg-white rounded-3xl shadow-sm border border-ios-separator/20">
                  <QRCodeSVG 
                    id="memorial-qr"
                    value={generatedUrl} 
                    size={220}
                    level="M"
                    includeMargin={false}
                  />
                </div>
              </motion.div>

              <div className="h-24 lg:hidden" />
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden h-20 bg-ios-surface/80 backdrop-blur-xl border-t border-ios-separator/30 flex items-center justify-around px-6 shrink-0 z-40">
        <button 
          onClick={() => setActiveTab('edit')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'edit' ? 'text-ios-blue' : 'text-ios-secondary-label'}`}
        >
          <User size={24} />
          <span className="text-[10px] font-semibold">Dati</span>
        </button>
        <button 
          onClick={() => setActiveTab('preview')}
          className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'preview' ? 'text-ios-blue' : 'text-ios-secondary-label'}`}
        >
          <Eye size={24} />
          <span className="text-[10px] font-semibold">QR Code</span>
        </button>
        <button 
          onClick={() => setView('viewer')}
          className="flex flex-col items-center gap-1 text-ios-secondary-label"
        >
          <Share2 size={24} />
          <span className="text-[10px] font-semibold">Pagina</span>
        </button>
      </nav>

      {/* Mobile FAB */}
      <AnimatePresence>
        {activeTab === 'preview' && (
          <motion.button 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleDownloadQR}
            disabled={!data.n}
            className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-ios-blue text-white flex items-center justify-center shadow-xl active:scale-95 transition-transform z-50"
          >
            <Download size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
