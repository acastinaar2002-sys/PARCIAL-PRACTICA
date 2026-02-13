
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MODULES, FINAL_EXAM_QUESTIONS, TRUE_FALSE_QUESTIONS } from './data';
import { Module, Flashcard, InteractiveCase } from './types';

// --- UTILIDADES Y COMPONENTES BASE ---

const TechnicalTerm: React.FC<{ term: string; definition: string; children: React.ReactNode }> = ({ term, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block cursor-help border-b-2 border-dotted border-blue-600 text-blue-800 bg-blue-50/50 px-1 rounded-sm font-bold transition-colors hover:bg-blue-100"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onClick={(e) => { e.stopPropagation(); setIsVisible(!isVisible); }} 
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 p-4 bg-slate-900 text-white text-xs rounded-xl shadow-2xl z-[100] animate-in fade-in zoom-in duration-200 pointer-events-none text-center border border-white/10">
          <p className="font-black mb-2 text-blue-400 uppercase tracking-tighter border-b border-white/10 pb-1">{term}</p>
          <p className="leading-relaxed font-medium">{definition}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
        </div>
      )}
    </span>
  );
};

const HighlightedText: React.FC<{ text: string; glossary: Record<string, string> }> = ({ text, glossary }) => {
  const terms = useMemo(() => 
    Object.keys(glossary)
      .filter(t => t && t.trim().length > 0)
      .sort((a, b) => b.length - a.length),
    [glossary]
  );
  
  if (!text) return null;
  if (terms.length === 0) return <span className="text-inherit">{text}</span>;

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedTerms = terms.map(escapeRegExp);
  const regex = new RegExp(`(\\b${escapedTerms.join('\\b|\\b')}\\b)`, 'gi');
  const parts = text.split(regex);

  return (
    <span className="text-inherit">
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const matchedTerm = terms.find(t => t.toLowerCase() === lowerPart);
        if (matchedTerm) {
          return <TechnicalTerm key={i} term={matchedTerm} definition={glossary[matchedTerm]}>{part}</TechnicalTerm>;
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
};

// --- MODOS DE EXAMEN ---

const VirtualERLab: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [connections, setConnections] = useState<{from: string, to: string, type: string}[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{message: string, isSuccess: boolean} | null>(null);

  const entities = [
    { id: 'propietario', name: 'Propietario', attributes: ['ID_Prop (PK)', 'Nombre', 'Teléfono'] },
    { id: 'mascota', name: 'Mascota', attributes: ['ID_Mascota (PK)', 'Nombre', 'Especie'] },
    { id: 'cita', name: 'Cita', attributes: ['ID_Cita (PK)', 'Fecha', 'Motivo'] }
  ];

  const handleConnect = (to: string, type: string) => {
    if (!selectedEntity || selectedEntity === to) return;
    setConnections(prev => [...prev, { from: selectedEntity, to, type }]);
    setSelectedEntity(null);
    setFeedback(null);
  };

  const checkDesign = () => {
    const hasPropMascota = connections.some(c => 
      ((c.from === 'propietario' && c.to === 'mascota') || (c.from === 'mascota' && c.to === 'propietario')) && c.type === '1:N'
    );
    const hasMascotaCita = connections.some(c => 
      ((c.from === 'mascota' && c.to === 'cita') || (c.from === 'cita' && c.to === 'mascota')) && c.type === '1:N'
    );
    
    if (hasPropMascota && hasMascotaCita) {
      setFeedback({ message: "¡Excelente! Modelo de Veterinaria correcto: 1 Propietario -> N Mascotas y 1 Mascota -> N Citas.", isSuccess: true });
    } else {
      setFeedback({ message: "El modelo no es óptimo. Recuerda: Un dueño tiene muchas mascotas, y una mascota tiene muchas citas.", isSuccess: false });
    }
  };

  return (
    <div className="p-4 md:p-8 animate-in fade-in duration-500 max-w-5xl mx-auto text-slate-900">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-black text-slate-950 mb-2">Virtual ER Lab</h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Toca entidades para relacionarlas</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {entities.map(e => (
          <div key={e.id} onClick={() => setSelectedEntity(e.id)} className={`p-6 rounded-[2.5rem] border-4 cursor-pointer transition-all shadow-xl relative overflow-hidden ${selectedEntity === e.id ? 'border-blue-600 bg-blue-50' : 'border-white bg-white hover:border-blue-200'}`}>
            <p className="font-black text-slate-950 mb-4 uppercase text-sm">{e.name}</p>
            {e.attributes.map(a => <div key={a} className="text-[10px] font-bold text-slate-600 bg-slate-100 p-2 rounded-lg mb-1">{a}</div>)}
            {selectedEntity && selectedEntity !== e.id && (
              <div className="absolute inset-0 bg-blue-600/20 backdrop-blur-md flex items-center justify-center gap-2 z-10 px-2">
                {['1:1', '1:N', 'N:N'].map(t => (
                  <button key={t} onClick={(ev) => { ev.stopPropagation(); handleConnect(e.id, t); }} className="flex-1 py-3 bg-white shadow-2xl rounded-xl text-[10px] font-black text-slate-900 hover:bg-blue-600 hover:text-white transition-all">{t}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-slate-900 p-6 md:p-10 rounded-[3rem] text-white mb-8 border border-white/5">
        <p className="text-[10px] font-black text-blue-400 mb-6 uppercase tracking-[0.3em]">Relaciones en el Sistema</p>
        <div className="space-y-3">
          {connections.length === 0 ? <p className="text-slate-500 italic text-sm text-center py-4">No has creado relaciones aún...</p> : connections.map((c, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 animate-in slide-in-from-left">
              <span className="font-black text-xs uppercase text-blue-300 flex-1">{c.from}</span>
              <span className="bg-blue-600 px-3 py-1 rounded-lg text-[10px] font-black shadow-lg shadow-blue-500/20">{c.type}</span>
              <span className="font-black text-xs uppercase text-blue-300 flex-1 text-right">{c.to}</span>
              <button onClick={() => setConnections(prev => prev.filter((_, idx) => idx !== i))} className="ml-4 w-8 h-8 rounded-full bg-red-500/20 text-red-400 font-bold hover:bg-red-500 hover:text-white transition-all flex items-center justify-center">×</button>
            </div>
          ))}
        </div>
      </div>
      {feedback && <div className={`p-6 rounded-3xl mb-8 font-black text-center shadow-lg animate-in zoom-in ${feedback.isSuccess ? 'bg-green-100 text-green-900 border-2 border-green-500' : 'bg-red-100 text-red-900 border-2 border-red-500'}`}>{feedback.message}</div>}
      <div className="flex flex-col md:flex-row gap-4">
        <button onClick={checkDesign} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-3xl hover:bg-blue-700 shadow-xl active:scale-95 transition-all text-sm tracking-widest uppercase">Validar Estructura</button>
        <button onClick={onExit} className="px-12 py-5 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-3xl hover:bg-slate-100 active:scale-95 transition-all text-sm tracking-widest uppercase">Cerrar Lab</button>
      </div>
    </div>
  );
};

const TrueFalseQuiz: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [done, setDone] = useState(false);
  
  const current = TRUE_FALSE_QUESTIONS[index];

  if (done) return (
    <div className="p-8 md:p-12 text-center bg-white rounded-[3rem] md:rounded-[4.5rem] shadow-2xl max-w-2xl mx-auto border border-slate-200 mt-10 text-slate-900">
      <p className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-[0.5em]">Resultados Obtenidos</p>
      <h2 className="text-6xl md:text-8xl font-black mb-10 text-slate-950">{Math.round((score/TRUE_FALSE_QUESTIONS.length)*100)}%</h2>
      <button onClick={onExit} className="w-full py-6 bg-slate-950 text-white font-black rounded-[2rem] hover:bg-blue-600 transition-all shadow-xl text-sm tracking-widest uppercase">Regresar al Panel</button>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto text-slate-900">
      <div className="bg-white rounded-[3rem] p-8 md:p-14 shadow-2xl border border-slate-100 mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-slate-100">
          <div className="h-full bg-amber-500 transition-all duration-500" style={{width: `${((index+1)/TRUE_FALSE_QUESTIONS.length)*100}%`}} />
        </div>
        <p className="text-[10px] font-black text-amber-600 mb-8 uppercase tracking-[0.4em] mt-4">Desafío {index + 1} de {TRUE_FALSE_QUESTIONS.length}</p>
        <p className="text-2xl md:text-3xl font-black text-slate-950 leading-tight mb-12 italic">"{current.statement}"</p>
        {answered === null ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button onClick={() => { setAnswered(true); if (current.isTrue) setScore(s => s + 1); }} className="py-6 md:py-8 bg-green-600 text-white font-black rounded-3xl text-xl shadow-lg hover:bg-green-700 active:scale-95 transition-all uppercase tracking-widest">Verdadero</button>
            <button onClick={() => { setAnswered(false); if (!current.isTrue) setScore(s => s + 1); }} className="py-6 md:py-8 bg-red-600 text-white font-black rounded-3xl text-xl shadow-lg hover:bg-red-700 active:scale-95 transition-all uppercase tracking-widest">Falso</button>
          </div>
        ) : (
          <div className={`p-8 rounded-[2rem] text-left animate-in zoom-in border-4 ${answered === current.isTrue ? 'bg-green-50 text-green-950 border-green-500' : 'bg-red-50 text-red-950 border-red-500'}`}>
            <p className="text-lg font-black leading-relaxed">{current.explanation}</p>
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={() => { if (index < TRUE_FALSE_QUESTIONS.length - 1) { setIndex(index + 1); setAnswered(null); } else setDone(true); }} className="w-full py-6 bg-slate-950 text-white font-black rounded-3xl shadow-2xl hover:bg-blue-600 active:scale-95 transition-all text-sm tracking-[0.3em] uppercase">Siguiente Desafío</button>
      )}
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DE EXAMEN ---

const GlobalExam: React.FC<{ questions: InteractiveCase[]; onExit: () => void }> = ({ questions, onExit }) => {
  const [mode, setMode] = useState<'menu' | 'standard' | 'lab' | 'tf'>('menu');
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  const resetExam = () => {
    setIdx(0); setScore(0); setSelected(null); setAnswered(false); setDone(false);
  };

  if (mode === 'standard') {
    if (done) return (
      <div className="p-10 md:p-16 text-center bg-white rounded-[3.5rem] shadow-2xl max-w-2xl mx-auto border border-slate-200 animate-in zoom-in mt-10 text-slate-900">
        <p className="text-[10px] font-black text-blue-600 mb-6 uppercase tracking-[0.5em]">Evaluación Completada</p>
        <h2 className="text-6xl md:text-8xl font-black mb-10 text-slate-950">{score}/{questions.length}</h2>
        <button onClick={() => { resetExam(); setMode('menu'); }} className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-slate-900 transition-all shadow-xl uppercase tracking-widest">Volver al Centro</button>
      </div>
    );

    const q = questions[idx];
    return (
      <div className="p-4 md:p-8 max-w-4xl mx-auto animate-in slide-in-from-right duration-500 text-slate-900">
        <div className="bg-white rounded-[3rem] md:rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-8 md:p-14 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-black text-blue-600 mb-4 uppercase tracking-[0.5em]">Reactivo {idx + 1} de {questions.length}</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-950 mb-6 leading-tight">{q.question}</h3>
            <div className="bg-white p-6 rounded-2xl border-l-8 border-slate-300 italic text-slate-600 font-medium">"{q.scenario}"</div>
          </div>
          <div className="p-6 md:p-14 space-y-4">
            {q.options.map((opt, i) => (
              <button key={i} disabled={answered} onClick={() => { setSelected(i); setAnswered(true); if(i === q.correctAnswer) setScore(s => s + 1); }} 
                className={`w-full p-6 md:p-8 rounded-[1.8rem] text-left font-black transition-all border-4 text-sm md:text-lg ${answered ? (i === q.correctAnswer ? 'bg-green-100 border-green-600 text-green-950' : (i === selected ? 'bg-red-100 border-red-600 text-red-950' : 'opacity-70 grayscale bg-slate-50 border-slate-100')) : 'bg-white border-slate-100 text-slate-900 hover:border-blue-400 hover:bg-blue-50/30'}`}>
                <span className="inline-block w-8 h-8 rounded-full bg-slate-100 mr-4 text-center leading-8 text-xs font-black">{String.fromCharCode(65 + i)}</span> {opt}
              </button>
            ))}
          </div>
          {answered && (
            <div className="p-8 md:p-14 bg-slate-950 text-white">
              <p className="font-bold text-base md:text-lg mb-8 leading-relaxed italic opacity-90 border-l-4 border-blue-500 pl-6">"{q.explanation}"</p>
              <button onClick={() => { if(idx < questions.length - 1) { setIdx(idx + 1); setSelected(null); setAnswered(false); } else setDone(true); }} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-[0.3em] text-sm">Siguiente Pregunta</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'lab') return <VirtualERLab onExit={() => setMode('menu')} />;
  if (mode === 'tf') return <TrueFalseQuiz onExit={() => setMode('menu')} />;

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-12 text-center animate-in fade-in duration-500 text-slate-900">
      <div className="mb-14">
        <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter mb-4">Módulo de Evaluación Avanzada</h2>
        <div className="inline-block bg-blue-600 text-white px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-lg shadow-blue-500/20">v6.0 High Contrast</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { id: 'standard', title: 'Simulador Pro', desc: 'Casos integrales de opción múltiple.', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-blue-600' },
          { id: 'lab', title: 'Diseño E-R', desc: 'Conecta entidades de forma interactiva.', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'bg-indigo-600' },
          { id: 'tf', title: 'Desafío V/F', desc: 'Quiz rápido de conceptos clave.', iconPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'bg-amber-600' }
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id as any)} className="p-8 bg-white rounded-[3.5rem] border-4 border-transparent hover:border-slate-950 shadow-xl transition-all group flex flex-col items-center">
            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-6 transition-all group-hover:rotate-6 shadow-xl ${m.color} text-white`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={m.iconPath}/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-950 mb-2 uppercase tracking-tight">{m.title}</h3>
            <p className="text-slate-500 text-xs font-bold leading-relaxed">{m.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={onExit} className="mt-16 text-slate-500 font-black uppercase tracking-[0.5em] text-[10px] hover:text-slate-950 transition-colors flex items-center justify-center gap-6 mx-auto">
        <div className="w-12 h-px bg-slate-300"></div> Salir del Centro <div className="w-12 h-px bg-slate-300"></div>
      </button>
    </div>
  );
};

// --- COMPONENTE DE ESTUDIO (SWIPEABLE CARD VIEW) ---

const ModuleInteractiveLab: React.FC<{ cases: InteractiveCase[]; onExit: () => void; glossary: Record<string, string>; }> = ({ cases, onExit, glossary }) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const current = cases[idx];

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-10 animate-in slide-in-from-bottom-8 duration-500 text-slate-900">
      <div className="bg-white rounded-[3.5rem] md:rounded-[5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="p-10 md:p-16 bg-indigo-800 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 opacity-60">Laboratorio Especializado: Caso {idx + 1}/{cases.length}</p>
          <h3 className="text-3xl md:text-5xl font-black leading-tight">{current.question}</h3>
        </div>
        <div className="p-6 md:p-16 space-y-4">
          {current.options.map((opt, i) => (
            <button key={i} disabled={answered} onClick={() => { setSelected(i); setAnswered(true); }} 
              className={`w-full p-6 md:p-10 rounded-[2rem] md:rounded-[2.5rem] text-left font-black transition-all border-4 text-sm md:text-xl ${answered ? (i === current.correctAnswer ? 'bg-green-100 border-green-600 text-green-950' : (i === selected ? 'bg-red-100 border-red-600 text-red-950' : 'opacity-60 grayscale bg-slate-50 border-slate-100')) : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-500 active:scale-[0.98]'}`}>
              {opt}
            </button>
          ))}
        </div>
        {answered && (
          <div className="p-10 md:p-16 bg-slate-50 border-t-4 border-indigo-200 animate-in slide-in-from-bottom-4">
            <div className="text-lg md:text-2xl font-bold text-slate-900 mb-10 leading-relaxed italic border-l-8 border-indigo-600 pl-8"><HighlightedText text={current.explanation} glossary={glossary} /></div>
            <button onClick={() => { if(idx < cases.length - 1) { setIdx(idx + 1); setSelected(null); setAnswered(false); } else onExit(); }} className="w-full py-6 md:py-8 bg-indigo-700 text-white font-black rounded-3xl shadow-2xl hover:bg-slate-950 transition-all uppercase tracking-widest text-sm md:text-base">Siguiente Desafío</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CardView: React.FC<{ card: Flashcard; currentIndex: number; total: number; isFlipped: boolean; onFlip: () => void; onNext: () => void; onPrev: () => void; onExit: () => void; onStartLab?: () => void; hasLab?: boolean; glossary: Record<string, string>; }> = ({ card, currentIndex, total, isFlipped, onFlip, onNext, onPrev, onExit, onStartLab, hasLab, glossary }) => {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchOffset, setTouchOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const progress = Math.round(((currentIndex + 1) / total) * 100);
  const swipeThreshold = 100;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    setTouchStart(clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (touchStart === null) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const offset = clientX - touchStart;
    setTouchOffset(offset);
  };

  const handleTouchEnd = () => {
    if (touchOffset > swipeThreshold) {
      onPrev();
    } else if (touchOffset < -swipeThreshold) {
      onNext();
    }
    setTouchStart(null);
    setTouchOffset(0);
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (Math.abs(touchOffset) < 10) {
      onFlip();
    }
  };

  const typeMap: Record<string, { label: string, color: string }> = {
    definition: { label: "Definición Técnica", color: "bg-blue-600 text-white" },
    conceptual: { label: "Pilar de Diseño", color: "bg-purple-600 text-white" },
    practical: { label: "Escenario Aplicado", color: "bg-orange-600 text-white" },
    exam: { label: "Reactivo de Examen", color: "bg-red-600 text-white" }
  };

  const currentType = typeMap[card.type] || typeMap.definition;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-12 animate-in fade-in duration-500 text-slate-900 select-none touch-none">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-500 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-950 transition-all flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center text-slate-900">←</div> INICIO
        </button>
        <div className="bg-slate-900 px-6 py-2.5 rounded-full shadow-lg border border-white/10">
           <span className="text-[10px] font-black text-white uppercase tracking-widest">{currentIndex + 1} de {total} Tarjetas</span>
        </div>
      </div>
      
      <div className="w-full h-3 bg-slate-200 rounded-full mb-10 overflow-hidden shadow-inner border border-slate-300">
        <div className="h-full bg-blue-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]" style={{ width: `${progress}%` }} />
      </div>

      <div 
        className="w-full min-h-[450px] md:h-[580px] perspective-1000 cursor-grab active:cursor-grabbing mb-12 touch-pan-y"
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div 
          className={`relative w-full h-full preserve-3d shadow-2xl rounded-[3rem] md:rounded-[5rem] transition-all ${isDragging ? 'duration-0' : 'duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)]'} ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{
            transform: `translateX(${touchOffset}px) rotate(${touchOffset * 0.05}deg) ${isFlipped ? 'rotateY(180deg)' : ''}`,
            opacity: 1 - Math.abs(touchOffset) / 800
          }}
          onClick={handleClick}
        >
          <div className="absolute inset-0 bg-white backface-hidden rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 flex flex-col items-center justify-center text-center border-8 border-slate-50 shadow-inner">
            <span className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase mb-12 tracking-[0.4em] shadow-lg ${currentType.color}`}>{currentType.label}</span>
            <div className="text-2xl md:text-5xl font-black text-slate-950 leading-tight max-w-3xl pointer-events-none"><HighlightedText text={card.front} glossary={glossary} /></div>
            <div className="absolute bottom-12 flex flex-col items-center gap-4 text-slate-400">
               <svg className="w-8 h-8 animate-bounce text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
               <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-500">Toca para girar • Desliza para navegar</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-slate-950 backface-hidden rounded-[3rem] md:rounded-[5rem] p-10 md:p-24 flex flex-col items-center justify-center text-center rotate-y-180 shadow-2xl border-8 border-slate-900">
            <div className="w-24 h-2.5 bg-blue-600 rounded-full mb-16 shadow-[0_0_30px_rgba(37,99,235,0.6)]"></div>
            <div className="text-xl md:text-3xl font-bold text-white italic leading-relaxed max-w-4xl px-4 opacity-95 pointer-events-none"><HighlightedText text={card.back} glossary={glossary} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={currentIndex === 0} className="py-6 md:py-8 bg-white border-4 border-slate-200 font-black rounded-[2.5rem] text-slate-950 hover:border-slate-400 hover:bg-slate-50 disabled:opacity-30 disabled:grayscale transition-all shadow-xl active:scale-95 uppercase tracking-widest text-xs">Anterior</button>
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="py-6 md:py-8 bg-blue-600 text-white font-black rounded-[2.5rem] shadow-2xl hover:bg-slate-900 transition-all active:scale-95 uppercase tracking-widest text-xs">Siguiente</button>
      </div>
      
      {hasLab && (
        <button onClick={(e) => { e.stopPropagation(); onStartLab && onStartLab(); }} className="w-full mt-8 py-6 md:py-8 bg-indigo-700 text-white font-black rounded-[2.5rem] uppercase tracking-[0.4em] text-xs md:text-sm hover:bg-slate-950 transition-all shadow-2xl flex items-center justify-center gap-4 group border-4 border-indigo-600">
          <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z"/></svg>
          Activar Laboratorio Táctico
        </button>
      )}
    </div>
  );
};

// --- APLICACIÓN PRINCIPAL ---

export default function App() {
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [labActive, setLabActive] = useState(false);
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const glossary = useMemo(() => {
    const map: Record<string, string> = {
      "1FN": "Atomicidad total: Cada celda contiene un solo valor indivisible.",
      "2FN": "Elimina dependencias parciales de la llave primaria.",
      "3FN": "Elimina dependencias transitivas entre atributos.",
      "PK": "Llave Primaria: Identificador único.",
      "FK": "Llave Foránea: Vínculo con otra tabla.",
      "ACID": "Propiedades de transacciones (Atomicidad, Consistencia, Aislamiento, Durabilidad)."
    };
    MODULES.forEach(m => m.cards.forEach(c => {
      if(c.type === 'definition') {
        const term = c.front.replace(/¿Qué es |Definición de |el |la |una |\?/gi, '').trim();
        if(term.length > 2 && term.length < 35) map[term] = c.back;
      }
    }));
    return map;
  }, []);

  const handleNext = useCallback(() => {
    setFlipped(false);
    if (activeModule && currentIdx < activeModule.cards.length - 1) setCurrentIdx(idx => idx + 1);
    else setCurrentIdx(0);
  }, [activeModule, currentIdx]);

  const handlePrev = useCallback(() => {
    setFlipped(false);
    if (activeModule && currentIdx > 0) setCurrentIdx(idx => idx - 1);
    else if (activeModule) setCurrentIdx(activeModule.cards.length - 1);
  }, [activeModule, currentIdx]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 overflow-x-hidden text-slate-900">
      <header className="bg-white/95 backdrop-blur-lg border-b-4 border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 md:py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => { setActiveModule(null); setIsExamActive(false); }}>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-700 to-indigo-900 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/30 text-2xl">DB</div>
            <div className="hidden sm:block">
              <h1 className="text-2xl font-black text-slate-950 leading-none tracking-tighter">Master Quizlet</h1>
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-blue-600 mt-1">SGBD Pro v6.0</p>
            </div>
          </div>
          <button 
            onClick={() => setGlossaryOpen(true)} 
            className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-900 bg-white border-4 border-slate-200 px-6 py-3 rounded-2xl hover:bg-slate-950 hover:text-white transition-all shadow-md active:scale-95"
          >
            Diccionario
          </button>
        </div>
      </header>

      <main className="flex-1 pb-16 md:pb-24">
        {isExamActive ? <GlobalExam questions={FINAL_EXAM_QUESTIONS} onExit={() => setIsExamActive(false)} /> :
         !activeModule ? (
          <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-20 animate-in fade-in duration-700">
            <div className="bg-white p-10 md:p-20 rounded-[4rem] md:rounded-[5rem] border-4 border-slate-100 shadow-2xl mb-16 md:mb-24 flex flex-col md:flex-row items-center gap-12 md:gap-16 relative overflow-hidden">
               <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-600/5 rounded-full blur-[100px]"></div>
              <div className="flex-1 text-center md:text-left relative z-10">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-8 block">Entrenamiento Certificado 2024</span>
                <h2 className="text-4xl md:text-7xl font-black text-slate-950 mb-8 leading-[1.1] tracking-tighter">Domina tus Datos</h2>
                <p className="text-slate-600 font-bold text-lg md:text-2xl leading-relaxed max-w-2xl">Explora 150 tarjetas diseñadas para transformar datos en conocimiento experto.</p>
              </div>
              <button 
                onClick={() => setIsExamActive(true)} 
                className="w-full md:w-auto px-12 md:px-20 py-8 md:py-10 bg-slate-950 text-white font-black rounded-[2.5rem] md:rounded-[3rem] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl relative z-10 border-4 border-white/10"
              >
                <span className="uppercase tracking-[0.4em] text-xs md:text-base">Iniciar Evaluación</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
              {MODULES.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => { setActiveModule(m); setCurrentIdx(0); setFlipped(false); setLabActive(false); }} 
                  className={`p-10 md:p-14 bg-white border-l-[16px] rounded-[3rem] md:rounded-[4rem] shadow-xl hover:shadow-2xl hover:-translate-y-3 transition-all text-left group flex flex-col min-h-[320px] md:min-h-[380px] border-y-2 border-r-2 border-slate-100 ${
                    m.color === 'blue' ? 'border-blue-600' : 
                    m.color === 'amber' ? 'border-amber-500' : 
                    m.color === 'red' ? 'border-red-600' : 'border-purple-600'
                  }`}
                >
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block group-hover:text-blue-600 transition-colors">{m.unit}</span>
                  <h3 className="text-3xl font-black text-slate-950 mb-auto leading-tight transition-all">{m.title}</h3>
                  <div className="flex items-center justify-between pt-10 border-t-2 border-slate-50 w-full mt-6">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${
                       m.color === 'blue' ? 'text-blue-600' : 
                       m.color === 'amber' ? 'text-amber-500' : 
                       m.color === 'red' ? 'text-red-600' : 'text-purple-600'
                     }`}>{m.cards.length} TARJETAS</span>
                     <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-45 shadow-sm">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
         ) : labActive && activeModule.interactiveCases ? (
           <ModuleInteractiveLab cases={activeModule.interactiveCases} onExit={() => setLabActive(false)} glossary={glossary} />
         ) : (
           <CardView card={activeModule.cards[currentIdx]} currentIndex={currentIdx} total={activeModule.cards.length} isFlipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={handlePrev} onExit={() => setActiveModule(null)} onStartLab={() => setLabActive(true)} hasLab={!!activeModule.interactiveCases} glossary={glossary} />
         )}
      </main>

      {glossaryOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/95 backdrop-blur-sm flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] md:rounded-[5rem] overflow-hidden flex flex-col shadow-2xl border-4 border-white/20">
            <div className="p-8 md:p-12 border-b-4 border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-950">Glosario de Términos</h2>
              <button onClick={() => setGlossaryOpen(false)} className="w-12 h-12 bg-white rounded-2xl border-4 border-slate-200 flex items-center justify-center text-2xl font-black hover:bg-red-50 hover:text-red-600 transition-all text-slate-900">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 md:p-12 space-y-6">
              {Object.keys(glossary).sort().map(k => (
                <div key={k} className="p-8 bg-white rounded-3xl border-4 border-slate-100 shadow-sm transition-all hover:border-blue-200">
                   <p className="text-[10px] font-black text-blue-600 mb-3 uppercase tracking-[0.3em]">{k}</p>
                   <p className="text-base md:text-lg font-bold text-slate-950 leading-relaxed">{glossary[k]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 bg-white border-t-4 border-slate-100 mt-auto">
         <div className="max-w-6xl mx-auto px-6 flex flex-col items-center gap-6 text-center">
            <div className="flex items-center gap-4 grayscale opacity-40">
              <div className="w-10 h-10 bg-slate-950 rounded-xl"></div>
              <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900">Master-Quizlet DB Pro</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">© 2024 Proyecto Académico • Especialización en Gestión de Datos</p>
         </div>
      </footer>
    </div>
  );
}
