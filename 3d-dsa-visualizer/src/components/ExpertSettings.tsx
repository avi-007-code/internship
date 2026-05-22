import React, { useState, useEffect } from "react";
import { useAlgorithmStore } from "../context/AlgorithmContext";
import { Sliders, Terminal, Trash2, X, Info, Eye, EyeOff } from "lucide-react";

export default function ExpertSettings() {
  const { 
    logs, 
    clearData, 
    geminiApiKey, 
    setGeminiApiKey, 
    groqApiKey, 
    setGroqApiKey,
    selectedProvider,
    setSelectedProvider
  } = useAlgorithmStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showKey, setShowKey] = useState(false);
  
  const activeKey = selectedProvider === "AISTUDIO" ? geminiApiKey : groqApiKey;
  const [tempKey, setTempKey] = useState(activeKey);

  useEffect(() => {
    setTempKey(activeKey);
  }, [selectedProvider, geminiApiKey, groqApiKey, activeKey]);

  const handleSaveKey = () => {
    if (selectedProvider === "AISTUDIO") {
      setGeminiApiKey(tempKey.trim());
    } else {
      setGroqApiKey(tempKey.trim());
    }
  };

  const handleClearKey = () => {
    setTempKey("");
    if (selectedProvider === "AISTUDIO") {
      setGeminiApiKey("");
    } else {
      setGroqApiKey("");
    }
  };

  return (
    <div className="relative pointer-events-auto select-none">
      {/* 1. Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        title="Technical Settings & Diagnostics"
        className={`p-2.5 rounded-full transition-all duration-300 ${
          isOpen
            ? "bg-white text-slate-950 shadow-lg shadow-white/10 rotate-90"
            : "bg-slate-900/60 border border-white/5 backdrop-blur-xl text-white/70 hover:text-white hover:bg-slate-800/60"
        }`}
      >
        <Sliders className="w-4 h-4" />
      </button>

      {/* 2. Disclosed Settings Overlay Panel */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-80 sm:w-96 bg-slate-900/90 border border-white/10 backdrop-blur-2xl rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.7)] p-4 text-white z-50 space-y-4 transition-all animate-in fade-in slide-in-from-top-2 duration-200">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/50">
              Expert Mode & Trace Logs
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Technical Diagnostics (FOV, Orbit status, step information) */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-mono text-white/40 uppercase font-semibold block leading-none">
              3D Spatial Diagnostics
            </span>
            <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-mono font-medium">Field of View</span>
                <span className="text-xs text-white/90 font-mono font-semibold">50.0° auto</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-mono font-medium">Orbit Lock</span>
                <span className="text-xs text-white/90 font-mono font-semibold">Enabled</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-mono font-medium">Render Engine</span>
                <span className="text-xs text-white/90 font-mono font-semibold">WebGL 2.0</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-white/40 font-mono font-medium">Core SDK</span>
                <span className="text-xs text-emerald-400 font-mono font-semibold">
                  {geminiApiKey ? "Gemini Client" : groqApiKey ? "Groq Client" : "Gemini 3.5-F"}
                </span>
              </div>
            </div>
          </div>
          {/* Provider Selection & API Key Configuration */}
          <div className="space-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-mono text-white/40 uppercase font-semibold block leading-none">
                AI Service Integration
              </span>
              <div className="relative">
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value as "AISTUDIO" | "GROQ")}
                  className="bg-black/60 border border-white/15 rounded-md px-2 py-0.5 text-[10px] font-mono text-cyan-400 focus:outline-none focus:border-cyan-500/50 transition-all cursor-pointer hover:bg-black/80"
                >
                  <option value="AISTUDIO">Google AI Studio</option>
                  <option value="GROQ">Groq API</option>
                </select>
              </div>
            </div>

            <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2">
              <div className="text-[10px] text-white/60 leading-normal">
                {selectedProvider === "AISTUDIO" ? (
                  <span>
                    Avoid backend limits by routing traffic via your browser using a personal <span className="text-cyan-400 font-mono font-medium">gemini-2.5-flash</span> Key.
                  </span>
                ) : (
                  <span>
                    Direct client-side execution to high-speed Groq models (<span className="text-cyan-400 font-mono font-medium">llama-3.3-70b-versatile</span>) for instant 3D layout calculations.
                  </span>
                )}
              </div>
              
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder={selectedProvider === "AISTUDIO" ? "AIzaSy..." : "gsk_..."}
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white placeholder-white/20 focus:outline-none focus:border-cyan-500/50 transition-all pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                    title={showKey ? "Hide API Key" : "Show API Key"}
                  >
                    {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <button
                  onClick={handleSaveKey}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-semibold px-3 py-1.5 rounded-lg transition-all active:scale-95 cursor-pointer"
                >
                  Save
                </button>
              </div>

              {activeKey && (
                <div className="flex items-center justify-between text-[10px] pt-1">
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ✓ {selectedProvider === "AISTUDIO" ? "Gemini Key Engaged" : "Groq Key Engaged"}
                  </span>
                  <button
                    onClick={handleClearKey}
                    className="text-rose-400 hover:text-rose-300 font-mono flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3 h-3" /> Remove key
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Trace Logs Panel */}
          <div className="flex flex-col h-44 bg-black/40 border border-white/5 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-1.5 bg-white/5 border-b border-white/5">
              <span className="text-[9px] font-mono font-bold text-white/50 uppercase tracking-widest flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-cyan-400" /> Trace Console Out
              </span>
              <button
                onClick={clearData}
                title="Wipe tracer"
                className="p-1 rounded hover:bg-white/5 text-white/40 hover:text-rose-400 transition"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            <div className="flex-1 p-2.5 overflow-y-auto space-y-1 text-[9.5px] font-mono leading-relaxed select-text">
              {logs.length === 0 ? (
                <span className="text-white/20 italic">No trace streams caught...</span>
              ) : (
                logs.map((log) => {
                  let textClass = "text-white/60";
                  if (log.type === "success") textClass = "text-emerald-400 font-medium";
                  if (log.type === "error") textClass = "text-rose-400 font-bold";
                  if (log.type === "warning") textClass = "text-amber-400";
                  if (log.type === "code") textClass = "text-cyan-300";

                  return (
                    <div key={log.id} className="flex gap-1.5 pb-0.5">
                      <span className="text-white/20 select-none">[{log.time}]</span>
                      <span className={`${textClass} flex-1`}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-[9px] font-mono text-white/30">
            <Info className="w-3 h-3 text-white/30" />
            <span>Developer contest inspect view is enabled.</span>
          </div>

        </div>
      )}
    </div>
  );
}
