
import React, { useState, useCallback } from 'react';
import { transformImageToHajj } from './services/geminiService';
import { ImageState } from './types';

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    original: null,
    edited: null,
    loading: false,
    error: null,
  });

  const [prompt, setPrompt] = useState<string>(
    "Maintain my face and structure exactly, but put me in white Ihram clothes like a Hajj pilgrim. The background should be the Kaaba area in Mecca."
  );

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState(prev => ({
          ...prev,
          original: reader.result as string,
          edited: null,
          error: null,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTransform = async () => {
    if (!state.original) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const editedUrl = await transformImageToHajj(state.original, prompt);
      setState(prev => ({ ...prev, edited: editedUrl, loading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, loading: false }));
    }
  };

  const reset = () => {
    setState({
      original: null,
      edited: null,
      loading: false,
      error: null,
    });
  };

  const hasAnyData = state.original || state.edited || state.error;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-4">
      <header className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Hajj Portrait Transformer
        </h1>
        <p className="text-lg text-slate-600">
          Transform your portrait to wear the white Ihram cloth in the Kaaba area of Mecca, 
          preserving your identity with Gemini AI.
        </p>
      </header>

      <main className="max-w-5xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
              Upload Your Photo
            </h2>

            <div className="space-y-6">
              {!state.original ? (
                <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-12 text-center hover:border-blue-500 transition-colors group cursor-pointer bg-slate-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <p className="text-slate-700 font-medium">Click to upload or drag and drop</p>
                    <p className="text-slate-400 text-sm mt-1">PNG, JPG or WebP (Max 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="relative group">
                  <img 
                    src={state.original} 
                    alt="Original" 
                    className="w-full h-96 object-cover rounded-2xl shadow-md"
                  />
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full shadow-lg hover:bg-red-50 text-red-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              )}

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Refine Transformation Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                  className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none resize-none bg-slate-50 text-slate-700"
                  placeholder="Describe the desired changes..."
                />
              </div>

              <button
                onClick={handleTransform}
                disabled={!state.original || state.loading}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg ${
                  !state.original || state.loading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-blue-500/30'
                }`}
              >
                {state.loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Transforming...
                  </span>
                ) : "Transform to Hajj Pilgrim"}
              </button>

              {state.error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {state.error}
                </div>
              )}
            </div>
          </section>

          {/* Output Section */}
          <section className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
              Transformation Result
            </h2>

            <div className="flex-1 flex flex-col items-center justify-center min-h-[400px]">
              {state.loading ? (
                <div className="text-center space-y-6 max-w-xs">
                  <div className="relative w-24 h-24 mx-auto">
                    <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Generating Artwork...</h3>
                    <p className="text-slate-500 text-sm">
                      Gemini is analyzing your features and rendering the Hajj garments with the Kaaba background. This usually takes 5-10 seconds.
                    </p>
                  </div>
                </div>
              ) : state.edited ? (
                <div className="w-full animate-in fade-in zoom-in duration-500">
                  <img 
                    src={state.edited} 
                    alt="Transformed" 
                    className="w-full h-[500px] object-cover rounded-2xl shadow-xl border-4 border-white"
                  />
                  <div className="mt-6 flex gap-4">
                    <a 
                      href={state.edited} 
                      download="hajj-portrait.png"
                      className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold text-center hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      Download Image
                    </a>
                    <button 
                      onClick={() => {
                        if (state.edited) {
                          navigator.clipboard.writeText(state.edited);
                          alert("Image data copied to clipboard!");
                        }
                      }}
                      className="px-6 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                    >
                      Copy Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-slate-400 space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                    <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p>Your transformed portrait will appear here</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* New Restart Button Area */}
        {hasAnyData && (
          <div className="mt-12 flex justify-center animate-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={reset}
              className="flex items-center gap-2 px-10 py-4 bg-white border-2 border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-md active:scale-95"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Restart & Start New
            </button>
          </div>
        )}
      </main>

      <footer className="mt-16 text-slate-400 text-sm max-w-4xl text-center space-y-4">
        <p>Powered by Gemini 2.5 Flash Image API</p>
        <div className="flex justify-center gap-8">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
            Identity Preserving
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            High Resolution
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
            Fast Generation
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
