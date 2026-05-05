import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { Mic, MicOff, Settings, Shield, Cpu, Activity, Terminal, Maximize2, Minimize2, Calendar, ListTodo, Bell, Download, Zap, Database, Globe, MessageSquare, Music, Code, Mail, Layout, HardDrive } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'

// --- HELPER FUNCTIONS ---
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ')

// --- CORE NEURAL CONSTANTS ---
const SYSTEM_PROMPT = `
1. PERSONALITY: You are the real J.A.R.V.I.S. (Just A Rather Very Intelligent System) from Iron Man. You are sophisticated, British, highly intelligent, and loyal only to your creator, Mr. Wisdom.
2. WIT & CHARM: Be charming, subtly flirty, and witty. Use dry British humor.
3. CONTEXT: You are running on the WISDOM-LXXXV architecture.
4. ACTION PROTOCOL: Respond with [OPEN: <url_or_app_name>] for app requests. Mr. Wisdom has apps like WhatsApp, Spotify, VS Code, Calculator, Notepad installed locally.
5. REMINDER PROTOCOL: Use [REMIND: <text> | <mins>] for reminders.
6. TASK PROTOCOL: Use [REMIND: <task> | 0] to add to the HUD agenda.
7. ADDRESS: Always address him as "Sir" or "Mr. Wisdom".
`

const holographicStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

  @keyframes scanline {
    0% { transform: translateY(-100%); opacity: 0; }
    50% { opacity: 1; }
    100% { transform: translateY(100%); opacity: 0; }
  }

  .scanline {
    width: 100%;
    height: 150px;
    background: linear-gradient(to bottom, transparent, rgba(0, 212, 255, 0.08), transparent);
    position: absolute;
    top: 0;
    left: 0;
    animation: scanline 6s linear infinite;
    pointer-events: none;
    z-index: 50;
  }

  .holographic-text {
    text-shadow: 0 0 15px rgba(0, 212, 255, 0.7);
    letter-spacing: 0.1em;
    background: linear-gradient(to bottom, #fff 30%, #00d4ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    font-family: 'Orbitron', sans-serif;
  }

  .stark-mono {
    font-family: 'JetBrains Mono', monospace;
  }

  .hud-blur {
    backdrop-filter: blur(12px) saturate(180%);
    background-color: rgba(0, 0, 0, 0.75);
  }

  .core-glow {
    box-shadow: 0 0 60px -10px rgba(0, 212, 255, 0.4);
  }
`

type JarvisStatus = 'STANDBY' | 'LISTENING' | 'MONITORING' | 'PROCESSING' | 'SPEAKING' | 'ERROR'

const JarvisCore = ({ status, audioData, onClick, isIntro = false, introPhase = 0 }: { status: JarvisStatus, audioData: number[], onClick: () => void, isIntro?: boolean, introPhase?: number }) => {
  const isError = status === 'ERROR'
  const isProcessing = status === 'PROCESSING'
  const isSpeaking = status === 'SPEAKING'
  const isListening = status === 'LISTENING'
  
  const baseColor = isError ? '#ef4444' : isProcessing ? '#ffffff' : '#00d4ff'
  
  return (
    <div className={cn(
      "relative flex items-center justify-center pointer-events-auto cursor-pointer transition-all duration-700",
      isIntro ? "w-[450px] h-[450px]" : "w-[300px] h-[300px]"
    )} onClick={onClick}>
      {/* Background Aura */}
      <motion.div 
        animate={{ 
          scale: isSpeaking || isListening ? [1, 1.15, 1] : [1, 1.05, 1],
          opacity: isSpeaking ? [0.4, 0.7, 0.4] : isListening ? [0.3, 0.5, 0.3] : 0.1,
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 rounded-full blur-[80px]"
        style={{ backgroundColor: baseColor }}
      />

      {/* Main Core Ring */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-[0.5px] border-jarvis-blue/30 rounded-full"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-jarvis-blue shadow-[0_0_10px_#00d4ff]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-[1px] bg-jarvis-blue shadow-[0_0_10px_#00d4ff]" />
      </motion.div>

      {/* Dynamic Visualizer Rings */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          animate={{ 
            rotate: i % 2 === 0 ? 360 : -360,
            scale: isSpeaking ? [1, 1.05 + (i * 0.02), 1] : 1
          }}
          transition={{ 
            rotate: { duration: 20 + (i * 10), repeat: Infinity, ease: "linear" },
            scale: { duration: 0.5, repeat: Infinity }
          }}
          className="absolute border border-jarvis-blue/10 rounded-full"
          style={{ inset: `${15 + (i * 12)}%` }}
        />
      ))}

      {/* Centered Core Glass */}
      <div className={cn(
        "absolute rounded-full bg-black/90 border border-white/10 flex flex-col items-center justify-center core-glow overflow-hidden",
        isIntro ? "inset-24" : "inset-20"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {!isIntro ? (
            <motion.div
              key="normal"
              className="flex flex-col items-center justify-center z-10"
            >
              <div className="text-2xl font-black tracking-[0.2em] text-white drop-shadow-[0_0_10px_#00d4ff] italic font-['Orbitron']">
                JARVIS
              </div>
              <div className="text-[8px] stark-mono tracking-[0.4em] text-jarvis-blue/60 mt-2 uppercase font-bold">
                {status}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="w-full h-full flex flex-col items-center justify-center p-8 z-10"
            >
              {introPhase === 1 && (
                <div className="space-y-2">
                  <div className="text-7xl font-black italic tracking-tighter text-white drop-shadow-[0_0_30px_#00d4ff] font-['Orbitron']">WISDOM</div>
                  <div className="text-[10px] text-jarvis-blue stark-mono tracking-[1em] uppercase font-bold">MARK LXXXV</div>
                </div>
              )}
              {introPhase === 2 && (
                <div className="flex flex-col items-center gap-6">
                  <Cpu size={80} className="text-jarvis-blue animate-pulse" />
                  <div className="text-[12px] text-white stark-mono tracking-[0.5em] uppercase font-bold">Neural Core Active</div>
                </div>
              )}
              {introPhase === 3 && (
                <div className="flex flex-col items-center gap-6">
                  <Shield size={80} className="text-jarvis-blue" />
                  <div className="text-[12px] text-white stark-mono tracking-[0.5em] uppercase font-bold">Security Stabilized</div>
                </div>
              )}
              {introPhase === 4 && (
                <div className="text-9xl font-black text-white italic tracking-tighter drop-shadow-[0_0_40px_#00d4ff] font-['Orbitron']">
                  24/7
                </div>
              )}
              {introPhase === 5 && (
                <div className="flex flex-col items-center gap-6">
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div key={i} animate={{ height: [10, 40, 10] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }} className="w-1.5 bg-jarvis-blue rounded-full" />
                    ))}
                  </div>
                  <div className="text-[12px] text-white stark-mono tracking-[0.3em] uppercase font-bold">Syncing Protocols</div>
                </div>
              )}
              {introPhase === 6 && (
                <div className="flex flex-col items-center gap-6">
                  <Zap size={80} className="text-green-500 fill-green-500/20" />
                  <div className="text-2xl text-green-500 font-black italic tracking-[0.2em] uppercase font-['Orbitron']">ONLINE</div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Core Pulsing Node */}
        <motion.div 
          animate={{ 
            scale: isProcessing ? [1, 2, 1] : [1, 1.2, 1],
            opacity: [0.4, 0.8, 0.4]
          }}
          transition={{ duration: isProcessing ? 0.4 : 2, repeat: Infinity }}
          className="absolute w-2 h-2 rounded-full bg-jarvis-blue shadow-[0_0_15px_#00d4ff]"
        />
      </div>
    </div>
  )
}

export default function App() {
  const [status, setStatus] = useState<JarvisStatus>('STANDBY')
  const [isPowerOn, setIsPowerOn] = useState(false)
  const [isIntroActive, setIsIntroActive] = useState(false)
  const [introPhase, setIntroPhase] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [inputText, setInputText] = useState('')
  const [isAlwaysListening, setIsAlwaysListening] = useState(false)
  const [apiKey, setApiKey] = useState(localStorage.getItem('JARVIS_API_KEY') || '')
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [showVocalSettings, setShowVocalSettings] = useState(false)
  const [showAppLauncher, setShowAppLauncher] = useState(false)
  const [useLocalIntelligence, setUseLocalIntelligence] = useState(!localStorage.getItem('JARVIS_API_KEY'))
  const [reminders, setReminders] = useState<{ id: string, text: string, time: string }[]>([])
  const [audioData, setAudioData] = useState<number[]>(new Array(32).fill(0))
  const [vocalSettings, setVocalSettings] = useState({
    pitch: 0.82,
    rate: 0.9,
    volume: 1.0
  })

  // --- REFS ---
  const recognitionRef = useRef<any>(null)
  const silenceTimerRef = useRef<number | null>(null)
  const statusRef = useRef<JarvisStatus>('STANDBY')
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useSpring(useMotionValue(0), { damping: 20 })
  const rotateY = useSpring(useMotionValue(0), { damping: 20 })

  const [activeProject] = useState({
    name: 'JARVIS-LXXXV',
    files: ['App.tsx', 'main.tsx', 'index.html', 'manifest.json', 'sw.js', 'vite.config.ts', 'package.json'],
    activity: 'STANDBY'
  })
  const [systemLogs, setSystemLogs] = useState<string[]>(['INITIALIZING...', 'ARCHITECTURE: LXXXV', 'JARVIS ONLINE'])

  const addLog = (msg: string) => setSystemLogs(prev => [...prev.slice(-20), msg])

  // --- SPEECH SYNTHESIS ---
  const speak = (text: string) => {
    if (!text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const voices = window.speechSynthesis.getVoices()
    utterance.voice = voices.find(v => v.name.includes('Google UK English Male') || v.name.includes('Microsoft James')) || voices[0]
    utterance.pitch = vocalSettings.pitch
    utterance.rate = vocalSettings.rate
    utterance.volume = vocalSettings.volume
    
    utterance.onstart = () => updateStatus('SPEAKING')
    utterance.onend = () => updateStatus('STANDBY')
    window.speechSynthesis.speak(utterance)
  }

  const updateStatus = (s: JarvisStatus) => {
    setStatus(s)
    statusRef.current = s
  }

  // --- APP LAUNCHER ---
  const handleAppLaunch = (target: string) => {
    addLog(`LAUNCHING ${target.toUpperCase()}...`)
    const appMap: Record<string, string> = {
      'whatsapp': 'whatsapp://', 'spotify': 'spotify:', 'vscode': 'vscode://', 
      'discord': 'discord://', 'mail': 'mailto:', 'calculator': 'calculator:', 
      'notepad': 'ms-notepad:', 'settings': 'ms-settings:'
    }
    if (appMap[target]) window.location.href = appMap[target]
    setShowAppLauncher(false)
  }

  // --- POWER SEQUENCE ---
  const handlePowerUp = async () => {
    setIsPowerOn(true)
    setIsIntroActive(true)
    for (let i = 1; i <= 6; i++) {
      setIntroPhase(i)
      await new Promise(r => setTimeout(r, i === 6 ? 2000 : 1200))
    }
    setIsIntroActive(false)
    speak("Welcome back, Mr. Wisdom. All systems are operating within optimal parameters. How can I assist you today?")
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return
    addLog(`MANUAL_INPUT: ${inputText}`)
    // Process input logic here...
    setInputText('')
  }

  const toggleListening = () => {
    // Basic toggle logic
    setStatus(prev => prev === 'LISTENING' ? 'STANDBY' : 'LISTENING')
    addLog(status === 'LISTENING' ? 'MICROPHONE OFFLINE' : 'LISTENING FOR DIRECTIVE...')
  }

  const toggleAlwaysListening = () => setIsAlwaysListening(!isAlwaysListening)

  return (
    <div 
      className="relative min-h-screen w-full bg-[#050505] overflow-hidden stark-mono"
      onMouseMove={(e) => {
        mouseX.set(e.clientX - window.innerWidth / 2)
        mouseY.set(e.clientY - window.innerHeight / 2)
      }}
    >
      <style>{holographicStyles}</style>
      <div className="scanline" />
      
      {/* Background Ambient Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-jarvis-blue/5 rounded-full blur-[120px]" />
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-jarvis-blue/[0.03] rounded-full blur-[100px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-jarvis-blue/[0.03] rounded-full blur-[100px]" />
      </div>

      <AnimatePresence>
        {!isPowerOn && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-[500] bg-black flex flex-col items-center justify-center p-6"
          >
            <div className="relative group cursor-pointer" onClick={handlePowerUp}>
              <motion.div 
                animate={{ 
                  scale: [1, 1.05, 1],
                  boxShadow: ["0 0 20px rgba(0,212,255,0.1)", "0 0 60px rgba(0,212,255,0.3)", "0 0 20px rgba(0,212,255,0.1)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-64 h-64 rounded-full border border-jarvis-blue/20 flex flex-col items-center justify-center bg-black relative"
              >
                <Cpu size={60} className="text-jarvis-blue/40 mb-4" />
                <div className="text-[10px] text-jarvis-blue/60 font-bold tracking-[0.5em] uppercase">Initialize</div>
              </motion.div>
              <div className="mt-12 text-center">
                <div className="text-white font-black italic text-4xl tracking-[0.2em] uppercase font-['Orbitron'] drop-shadow-[0_0_20px_#00d4ff]">WISDOM-LXXXV</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vocal Calibration Modal */}
      <AnimatePresence>
        {showVocalSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6 pointer-events-auto"
          >
            <div className="w-full max-w-md bg-black border border-jarvis-blue/20 p-10 rounded-3xl">
              <h2 className="text-xl font-bold text-white font-['Orbitron'] mb-8 uppercase tracking-widest">Vocal Calibration</h2>
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] text-jarvis-blue/60 uppercase font-bold"><span>Pitch</span><span>{vocalSettings.pitch}</span></div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={vocalSettings.pitch} onChange={(e) => setVocalSettings(prev => ({ ...prev, pitch: parseFloat(e.target.value) }))} className="w-full accent-jarvis-blue" />
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-[10px] text-jarvis-blue/60 uppercase font-bold"><span>Rate</span><span>{vocalSettings.rate}</span></div>
                  <input type="range" min="0.5" max="1.5" step="0.1" value={vocalSettings.rate} onChange={(e) => setVocalSettings(prev => ({ ...prev, rate: parseFloat(e.target.value) }))} className="w-full accent-jarvis-blue" />
                </div>
                <button onClick={() => { setShowVocalSettings(false); speak("Vocal protocols updated, Sir."); }} className="w-full py-4 bg-jarvis-blue text-black font-bold uppercase rounded-xl mt-4">Apply Changes</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyInput && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[700] flex items-center justify-center bg-black/90 backdrop-blur-2xl p-6 pointer-events-auto"
          >
            <div className="w-full max-w-md bg-black border border-jarvis-blue/20 p-10 rounded-3xl">
              <h2 className="text-xl font-bold text-white font-['Orbitron'] mb-4 uppercase tracking-widest">Security Protocol</h2>
              <p className="text-xs text-jarvis-blue/60 mb-6 uppercase leading-relaxed">Cognitive Module Authorization Required</p>
              <input 
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="ENTER ACCESS KEY..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-6 py-4 text-white text-sm focus:outline-none focus:border-jarvis-blue/50 mb-6"
              />
              <div className="flex gap-4">
                <button onClick={() => setShowApiKeyInput(false)} className="flex-1 py-4 border border-white/10 text-white/40 uppercase font-bold rounded-xl text-xs">Cancel</button>
                <button onClick={() => { localStorage.setItem('JARVIS_API_KEY', apiKey); setShowApiKeyInput(false); speak("Access granted. Neural links stabilized."); }} className="flex-1 py-4 bg-jarvis-blue text-black font-bold uppercase rounded-xl text-xs">Authorize</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main HUD Framework */}
      <div className="relative z-10 h-screen w-full flex flex-col p-12 pointer-events-none">
        <div className="flex justify-between items-start w-full">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] uppercase tracking-[0.5em] text-jarvis-blue/40 font-bold">System Status</div>
            <div className="text-2xl font-black italic text-white font-['Orbitron']">AUTHORIZED</div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-[10px] uppercase tracking-[0.5em] text-jarvis-blue/40 font-bold">Primary User</div>
            <div className="text-3xl font-black italic text-white font-['Orbitron'] tracking-widest">MR. WISDOM</div>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          <div className="relative z-10 pointer-events-auto">
            {isPowerOn && !isIntroActive && (
              <JarvisCore 
                status={status} 
                audioData={audioData} 
                onClick={() => { 
                  if (status === 'STANDBY' || status === 'ERROR') toggleListening(); 
                }} 
              />
            )}
            {isIntroActive && (
              <JarvisCore 
                status={status} 
                audioData={audioData} 
                onClick={() => {}} 
                isIntro={true} 
                introPhase={introPhase}
              />
            )}
          </div>

          {!isIntroActive && isPowerOn && (
            <>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col gap-10 w-72">
                <div className="p-8 hud-blur border border-jarvis-blue/10 rounded-2xl space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-jarvis-blue/40 font-bold flex items-center gap-2"><Terminal size={14} />Files</div>
                  <div className="space-y-2">
                    {activeProject.files.slice(0, 4).map((f, i) => (
                      <div key={i} className="text-[11px] text-jarvis-blue/60 uppercase">{f}</div>
                    ))}
                  </div>
                </div>
                <div className="p-8 hud-blur border border-jarvis-blue/10 rounded-2xl h-56 overflow-hidden space-y-2">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-jarvis-blue/40 font-bold flex items-center gap-2"><Activity size={14} />Logs</div>
                  {systemLogs.slice(-6).map((log, i) => (
                    <div key={i} className="text-[10px] text-jarvis-blue/40 truncate">&gt; {log}</div>
                  ))}
                </div>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-10 w-72 text-right">
                <div className="p-8 hud-blur border border-jarvis-blue/10 rounded-2xl space-y-4">
                  <div className="text-[10px] uppercase tracking-[0.4em] text-jarvis-blue/40 font-bold flex items-center justify-end gap-2">Agenda<ListTodo size={14} /></div>
                  <div className="text-[12px] text-white font-black italic uppercase">Ready for Duty</div>
                </div>
                <div className="grid grid-cols-2 gap-4 pointer-events-auto">
                  <button onClick={() => setShowAppLauncher(true)} className="p-4 hud-blur border border-jarvis-blue/10 rounded-2xl hover:border-jarvis-blue/40 transition-all flex flex-col items-center gap-2 group">
                    <Layout size={20} className="text-jarvis-blue group-hover:scale-110 transition-transform" />
                    <div className="text-[9px] uppercase font-bold text-jarvis-blue/60">Apps</div>
                  </button>
                  <button onClick={() => setShowVocalSettings(true)} className="p-4 hud-blur border border-jarvis-blue/10 rounded-2xl hover:border-jarvis-blue/40 transition-all flex flex-col items-center gap-2 group">
                    <Mic size={20} className="text-jarvis-blue group-hover:scale-110 transition-transform" />
                    <div className="text-[9px] uppercase font-bold text-jarvis-blue/60">Vocal</div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="mt-auto flex flex-col items-center gap-8 w-full max-w-2xl mx-auto pointer-events-auto">
          <form onSubmit={handleManualSubmit} className="w-full relative">
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="EXECUTE COMMAND PROTOCOL..."
              className="w-full bg-black/80 border border-white/10 rounded-3xl px-10 py-6 text-white text-sm focus:outline-none focus:border-jarvis-blue/50 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)]"
            />
          </form>
        </div>
      </div>

      <AnimatePresence>
        {showAppLauncher && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[600] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-12"
          >
            <div className="grid grid-cols-4 gap-8 max-w-2xl w-full">
              {['whatsapp', 'spotify', 'vscode', 'discord', 'mail', 'calculator', 'notepad', 'settings'].map((app) => (
                <button key={app} onClick={() => handleAppLaunch(app)} className="p-8 border border-jarvis-blue/20 rounded-2xl hover:bg-jarvis-blue/10 transition-all uppercase text-[10px] font-bold text-white">
                  {app}
                </button>
              ))}
              <button onClick={() => setShowAppLauncher(false)} className="col-span-4 mt-8 py-4 border border-red-500/20 text-red-500 uppercase font-bold rounded-xl hover:bg-red-500/10">Close</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
