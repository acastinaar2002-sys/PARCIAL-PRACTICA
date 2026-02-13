
import React, { useState, useCallback, useMemo } from 'react';
import { MODULES, FINAL_EXAM_QUESTIONS, TRUE_FALSE_QUESTIONS } from './data';
import { Module, Flashcard, InteractiveCase } from './types';

// --- UTILIDADES Y COMPONENTES BASE ---

const TechnicalTerm: React.FC<{ term: string; definition: string; children: React.ReactNode }> = ({ term, definition, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <span 
      className="relative inline-block cursor-help border-b-2 border-dotted border-blue-400 text-blue-700 font-semibold px-0.5"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-[100] animate-in fade-in zoom-in duration-200 pointer-events-none text-center">
          <p className="font-bold mb-1 text-blue-300 uppercase tracking-tighter">{term}</p>
          <p className="leading-relaxed font-normal">{definition}</p>
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-800" />
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
  if (terms.length === 0) return <>{text}</>;

  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapedTerms = terms.map(escapeRegExp);
  const regex = new RegExp(`(\\b${escapedTerms.join('\\b|\\b')}\\b)`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const lowerPart = part.toLowerCase();
        const matchedTerm = terms.find(t => t.toLowerCase() === lowerPart);
        if (matchedTerm) {
          return <TechnicalTerm key={i} term={matchedTerm} definition={glossary[matchedTerm]}>{part}</TechnicalTerm>;
        }
        return <span key={i}>{part}</span>;
      })}
    </>
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
    <div className="p-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-black text-slate-900 mb-2">Virtual ER Lab: Veterinaria</h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Diseña la base de datos conectando entidades</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {entities.map(e => (
          <div key={e.id} onClick={() => setSelectedEntity(e.id)} className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all shadow-xl relative ${selectedEntity === e.id ? 'border-blue-600 bg-blue-50' : 'border-white bg-white hover:border-blue-200'}`}>
            <p className="font-black text-slate-900 mb-4 uppercase text-sm">{e.name}</p>
            {e.attributes.map(a => <div key={a} className="text-[10px] font-bold text-slate-400 bg-slate-50 p-2 rounded-lg mb-1">{a}</div>)}
            {selectedEntity && selectedEntity !== e.id && (
              <div className="absolute inset-0 bg-blue-600/10 rounded-[2rem] flex items-center justify-center gap-2 backdrop-blur-sm z-10">
                {['1:1', '1:N', 'N:N'].map(t => (
                  <button key={t} onClick={(ev) => { ev.stopPropagation(); handleConnect(e.id, t); }} className="px-3 py-1.5 bg-white shadow-lg rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all">{t}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white mb-6">
        <p className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-[0.3em]">Relaciones Establecidas</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connections.length === 0 ? <p className="text-slate-600 italic">No hay conexiones aún...</p> : connections.map((c, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <span className="font-bold text-xs uppercase text-blue-300">{c.from}</span>
              <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-black">{c.type}</span>
              <span className="font-bold text-xs uppercase text-blue-300">{c.to}</span>
              <button onClick={() => setConnections(prev => prev.filter((_, idx) => idx !== i))} className="ml-auto text-red-400 font-bold hover:text-red-300">ELIMINAR</button>
            </div>
          ))}
        </div>
      </div>
      {feedback && <div className={`p-6 rounded-2xl mb-6 font-bold shadow-sm ${feedback.isSuccess ? 'bg-green-50 text-green-800 border-2 border-green-200' : 'bg-red-50 text-red-800 border-2 border-red-200'}`}>{feedback.message}</div>}
      <div className="flex gap-4">
        <button onClick={checkDesign} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-95 transition-all">Verificar Diseño</button>
        <button onClick={onExit} className="px-10 py-5 bg-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-300 active:scale-95 transition-all">Cerrar</button>
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
    <div className="p-12 text-center bg-white rounded-[4rem] shadow-2xl max-w-2xl mx-auto border border-slate-100">
      <p className="text-[10px] font-black text-blue-600 mb-4 uppercase tracking-[0.4em]">Resultado Final</p>
      <h2 className="text-6xl font-black mb-8 text-slate-900">{Math.round((score/TRUE_FALSE_QUESTIONS.length)*100)}%</h2>
      <button onClick={onExit} className="w-full py-6 bg-slate-950 text-white font-black rounded-3xl hover:bg-blue-600 transition-all">Volver al Menú</button>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 mb-8 text-center">
        <p className="text-[10px] font-black text-amber-500 mb-6 uppercase tracking-[0.4em]">Pregunta {index + 1}/{TRUE_FALSE_QUESTIONS.length}</p>
        <p className="text-3xl font-bold text-slate-800 leading-tight mb-12 italic">"{current.statement}"</p>
        {answered === null ? (
          <div className="grid grid-cols-2 gap-6">
            <button onClick={() => { setAnswered(true); if (current.isTrue) setScore(s => s + 1); }} className="py-8 bg-green-500 text-white font-black rounded-3xl text-xl shadow-lg shadow-green-500/20 hover:scale-105 transition-all">Verdadero</button>
            <button onClick={() => { setAnswered(false); if (!current.isTrue) setScore(s => s + 1); }} className="py-8 bg-red-500 text-white font-black rounded-3xl text-xl shadow-lg shadow-red-500/20 hover:scale-105 transition-all">Falso</button>
          </div>
        ) : (
          <div className={`p-8 rounded-[2rem] text-left animate-in zoom-in ${answered === current.isTrue ? 'bg-green-50 text-green-900 border-2 border-green-100' : 'bg-red-50 text-red-900 border-2 border-red-100'}`}>
            <p className="text-lg font-black leading-relaxed">{current.explanation}</p>
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={() => { if (index < TRUE_FALSE_QUESTIONS.length - 1) { setIndex(index + 1); setAnswered(null); } else setDone(true); }} className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl shadow-xl active:scale-95 transition-all">SIGUIENTE</button>
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
      <div className="p-16 text-center bg-white rounded-[4rem] shadow-2xl max-w-2xl mx-auto border border-slate-100 animate-in zoom-in">
        <p className="text-[10px] font-black text-blue-600 mb-4 uppercase tracking-[0.4em]">Simulacro Finalizado</p>
        <h2 className="text-7xl font-black mb-8 text-slate-900">{score}/{questions.length}</h2>
        <button onClick={() => { resetExam(); setMode('menu'); }} className="w-full py-6 bg-blue-600 text-white font-black rounded-3xl hover:bg-slate-900 transition-all shadow-xl">Volver al Centro de Evaluación</button>
      </div>
    );

    const q = questions[idx];
    return (
      <div className="p-8 max-w-4xl mx-auto animate-in slide-in-from-right duration-500">
        <div className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
          <div className="p-12 bg-slate-50/50 border-b border-slate-100">
            <p className="text-[10px] font-black text-blue-500 mb-4 uppercase tracking-[0.4em]">Caso de Estudio {idx + 1}</p>
            <h3 className="text-3xl font-black text-slate-900 mb-6 leading-tight">{q.question}</h3>
            <p className="text-slate-500 italic font-medium leading-relaxed">"{q.scenario}"</p>
          </div>
          <div className="p-12 space-y-4">
            {q.options.map((opt, i) => (
              <button key={i} disabled={answered} onClick={() => { setSelected(i); setAnswered(true); if(i === q.correctAnswer) setScore(s => s + 1); }} 
                className={`w-full p-7 rounded-[1.8rem] text-left font-bold transition-all border-2 text-lg ${answered ? (i === q.correctAnswer ? 'bg-green-100 border-green-500 text-green-900' : (i === selected ? 'bg-red-100 border-red-500 text-red-900' : 'opacity-40 grayscale')) : 'bg-white border-slate-100 hover:border-blue-400 hover:translate-x-2'}`}>
                {opt}
              </button>
            ))}
          </div>
          {answered && (
            <div className="p-12 bg-slate-900 text-white border-t border-slate-100">
              <p className="font-bold text-xl mb-8 leading-relaxed opacity-90 italic">"{q.explanation}"</p>
              <button onClick={() => { if(idx < questions.length - 1) { setIdx(idx + 1); setSelected(null); setAnswered(false); } else setDone(true); }} className="w-full py-6 bg-blue-600 text-white font-black rounded-[1.5rem] shadow-xl hover:bg-blue-700 active:scale-95 transition-all uppercase tracking-widest">Continuar</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'lab') return <VirtualERLab onExit={() => setMode('menu')} />;
  if (mode === 'tf') return <TrueFalseQuiz onExit={() => setMode('menu')} />;

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 text-center animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-4 mb-12">
        <h2 className="text-4xl font-black text-slate-950 tracking-tighter">Centro de Evaluación Avanzada</h2>
        <div className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">v6.0</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'standard', title: 'Simulador Pro', desc: 'Casos integrales de opción múltiple.', iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', colorClasses: 'text-blue-600 bg-blue-100 group-hover:bg-blue-600' },
          { id: 'lab', title: 'Virtual E-R', desc: 'Diseña el esquema de la veterinaria.', iconPath: 'M13 10V3L4 14h7v7l9-11h-7z', colorClasses: 'text-indigo-600 bg-indigo-100 group-hover:bg-indigo-600' },
          { id: 'tf', title: 'Desafío V/F', desc: 'Quiz veloz sobre mitos y conceptos.', iconPath: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', colorClasses: 'text-amber-600 bg-amber-100 group-hover:bg-amber-600' }
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id as any)} className="p-12 bg-white rounded-[4rem] border-4 border-transparent hover:border-slate-900 shadow-xl transition-all group flex flex-col items-center">
            <div className={`w-20 h-20 rounded-[2rem] flex items-center justify-center mb-8 transition-all group-hover:text-white group-hover:rotate-6 ${m.colorClasses}`}>
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={m.iconPath}/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">{m.title}</h3>
            <p className="text-slate-400 text-sm font-bold leading-relaxed">{m.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={onExit} className="mt-16 text-slate-400 font-black uppercase tracking-[0.4em] text-[10px] hover:text-slate-900 transition-colors flex items-center gap-4 mx-auto">
        <div className="w-8 h-px bg-slate-200"></div> Volver al Panel de Estudio <div className="w-8 h-px bg-slate-200"></div>
      </button>
    </div>
  );
};

// --- COMPONENTES DE ESTUDIO (FLASHCARDS Y LABS DE UNIDAD) ---

const ModuleInteractiveLab: React.FC<{ cases: InteractiveCase[]; onExit: () => void; glossary: Record<string, string>; }> = ({ cases, onExit, glossary }) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const current = cases[idx];

  return (
    <div className="max-w-4xl mx-auto p-10 animate-in slide-in-from-bottom-8 duration-500">
      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-14 bg-indigo-700 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 opacity-60">Laboratorio de Unidad: Caso {idx + 1}/{cases.length}</p>
          <h3 className="text-4xl font-black leading-tight">{current.question}</h3>
        </div>
        <div className="p-14 space-y-5">
          {current.options.map((opt, i) => (
            <button key={i} disabled={answered} onClick={() => { setSelected(i); setAnswered(true); }} 
              className={`w-full p-8 rounded-[2rem] text-left font-black transition-all border-2 text-xl ${answered ? (i === current.correctAnswer ? 'bg-green-100 border-green-500 text-green-900' : (i === selected ? 'bg-red-100 border-red-500 text-red-900' : 'opacity-40 grayscale scale-95')) : 'bg-white border-slate-100 hover:border-indigo-400 hover:translate-x-2 shadow-sm'}`}>
              {opt}
            </button>
          ))}
        </div>
        {answered && (
          <div className="p-14 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-bottom-4">
            <div className="text-2xl font-bold text-slate-800 mb-10 leading-relaxed italic border-l-8 border-indigo-600 pl-8"><HighlightedText text={current.explanation} glossary={glossary} /></div>
            <button onClick={() => { if(idx < cases.length - 1) { setIdx(idx + 1); setSelected(null); setAnswered(false); } else onExit(); }} className="w-full py-7 bg-indigo-700 text-white font-black rounded-3xl shadow-2xl shadow-indigo-700/30 hover:bg-slate-900 transition-all active:scale-95 uppercase tracking-widest">Continuar Entrenamiento</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CardView: React.FC<{ card: Flashcard; currentIndex: number; total: number; isFlipped: boolean; onFlip: () => void; onNext: () => void; onPrev: () => void; onExit: () => void; onStartLab?: () => void; hasLab?: boolean; glossary: Record<string, string>; }> = ({ card, currentIndex, total, isFlipped, onFlip, onNext, onPrev, onExit, onStartLab, hasLab, glossary }) => {
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  
  const typeMap: Record<string, { label: string, color: string }> = {
    definition: { label: "Definición Técnica", color: "bg-blue-50 text-blue-600" },
    conceptual: { label: "Pilar de Diseño", color: "bg-purple-50 text-purple-600" },
    practical: { label: "Escenario Real", color: "bg-orange-50 text-orange-600" },
    exam: { label: "Reactivo de Examen", color: "bg-red-50 text-red-600" }
  };

  const currentType = typeMap[card.type] || typeMap.definition;

  return (
    <div className="max-w-5xl mx-auto p-12 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onExit} className="text-slate-400 font-black text-[10px] uppercase tracking-[0.4em] hover:text-slate-950 transition-all flex items-center gap-4">
          <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400">←</div> PANEL PRINCIPAL
        </button>
        <div className="bg-white px-6 py-2 rounded-full border border-slate-100 shadow-sm">
           <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{currentIndex + 1} DE {total} COMPLETADOS</span>
        </div>
      </div>
      
      <div className="w-full h-3 bg-slate-200/50 rounded-full mb-14 overflow-hidden shadow-inner">
        <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <div className="w-full h-[550px] perspective-1000 cursor-pointer group" onClick={onFlip}>
        <div className={`relative w-full h-full transition-all duration-1000 preserve-3d shadow-2xl rounded-[4rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 bg-white backface-hidden rounded-[4rem] p-20 flex flex-col items-center justify-center text-center border-4 border-slate-50">
            <span className={`px-6 py-2 rounded-2xl text-[11px] font-black uppercase mb-14 tracking-[0.3em] shadow-sm ${currentType.color}`}>{currentType.label}</span>
            <div className="text-4xl font-black text-slate-950 leading-[1.2] max-w-2xl"><HighlightedText text={card.front} glossary={glossary} /></div>
            <div className="absolute bottom-16 flex flex-col items-center gap-4 text-slate-300 group-hover:text-blue-500 transition-colors">
               <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">Toca para dar la vuelta</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-slate-950 backface-hidden rounded-[4rem] p-20 flex flex-col items-center justify-center text-center rotate-y-180 shadow-inner border-8 border-slate-900">
            <div className="w-20 h-2 bg-blue-600 rounded-full mb-16 shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
            <div className="text-3xl font-bold text-white italic leading-relaxed max-w-3xl px-6 opacity-95"><HighlightedText text={card.back} glossary={glossary} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mt-14">
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={currentIndex === 0} className="py-7 bg-white border-2 border-slate-100 font-black rounded-[2rem] text-slate-700 hover:border-slate-300 disabled:opacity-30 disabled:grayscale transition-all shadow-lg active:scale-95 uppercase tracking-widest">Anterior</button>
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="py-7 bg-blue-600 text-white font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 hover:bg-slate-900 transition-all active:scale-95 uppercase tracking-widest">Siguiente</button>
      </div>
      
      {hasLab && (
        <button onClick={onStartLab} className="w-full mt-10 py-7 bg-indigo-600 text-white font-black rounded-[2rem] uppercase tracking-[0.3em] text-sm hover:bg-slate-950 transition-all shadow-2xl flex items-center justify-center gap-4 group">
          <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z"/></svg>
          MODO LABORATORIO INTERACTIVO
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
      "1FN": "Atomicidad total: Cada celda contiene un solo valor indivisible y las filas son únicas.",
      "2FN": "Elimina dependencias parciales: Todo atributo debe depender de TODA la llave primaria.",
      "3FN": "Elimina dependencias transitivas: Atributos no clave no pueden depender entre sí.",
      "PK": "Llave Primaria: Identificador único de un registro.",
      "FK": "Llave Foránea: Vincula una tabla con la PK de otra.",
      "ACID": "Atomicidad, Consistencia, Aislamiento y Durabilidad."
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 overflow-x-hidden">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-default">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-blue-500/20 text-2xl group-hover:rotate-3 transition-transform">DB</div>
            <div>
              <h1 className="text-2xl font-black text-slate-950 leading-none tracking-tighter">Master Quizlet</h1>
              <p className="text-[10px] uppercase font-black tracking-[0.4em] text-blue-600 mt-1">Especialista v6.0</p>
            </div>
          </div>
          <button 
            onClick={() => setGlossaryOpen(true)} 
            className="text-xs font-black uppercase tracking-[0.2em] text-slate-700 bg-white border-2 border-slate-100 px-6 py-3 rounded-2xl hover:bg-slate-950 hover:text-white transition-all shadow-sm"
          >
            Diccionario Técnico
          </button>
        </div>
      </header>

      <main className="flex-1 pb-24">
        {isExamActive ? <GlobalExam questions={FINAL_EXAM_QUESTIONS} onExit={() => setIsExamActive(false)} /> :
         !activeModule ? (
          <div className="max-w-6xl mx-auto px-6 py-16 animate-in fade-in duration-700">
            <div className="bg-white p-16 rounded-[4.5rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] mb-20 flex flex-col md:flex-row items-center gap-14 relative overflow-hidden group">
               <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] group-hover:bg-blue-600/10 transition-colors"></div>
              <div className="flex-1 text-center md:text-left relative z-10">
                <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.4em] mb-6 block">Plataforma de Certificación ITSE</span>
                <h2 className="text-6xl font-black text-slate-950 mb-8 leading-[1.1] tracking-tighter">Arquitectura y Gestión de Datos</h2>
                <p className="text-slate-500 font-bold text-xl leading-relaxed max-w-xl">Domina 150 tarjetas interactivas diseñadas específicamente para el examen parcial 2024.</p>
              </div>
              <button 
                onClick={() => setIsExamActive(true)} 
                className="px-16 py-8 bg-slate-950 text-white font-black rounded-[2.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <span className="relative z-10 uppercase tracking-[0.3em] text-sm">INICIAR CENTRO DE EVALUACIÓN</span>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {MODULES.map(m => (
                <button 
                  key={m.id} 
                  onClick={() => { setActiveModule(m); setCurrentIdx(0); setFlipped(false); setLabActive(false); }} 
                  className="p-12 bg-white border-l-[14px] border-blue-600 rounded-[3.5rem] shadow-xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-3 transition-all text-left group flex flex-col min-h-[350px]"
                >
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 block group-hover:text-blue-600 transition-colors">{m.unit}</span>
                  <h3 className="text-3xl font-black text-slate-950 mb-auto leading-tight group-hover:tracking-tight transition-all">{m.title}</h3>
                  <div className="flex items-center justify-between pt-10 border-t border-slate-50 w-full">
                     <span className="text-[11px] font-black uppercase text-blue-600 tracking-widest">{m.cards.length} TARJETAS ACTIVAS</span>
                     <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-45">→</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
         ) : labActive && activeModule.interactiveCases ? (
           <ModuleInteractiveLab cases={activeModule.interactiveCases} onExit={() => setLabActive(false)} glossary={glossary} />
         ) : (
           <CardView card={activeModule.cards[currentIdx]} currentIndex={currentIdx} total={activeModule.cards.length} isFlipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={() => { setFlipped(false); setCurrentIdx(currentIdx - 1); }} onExit={() => setActiveModule(null)} onStartLab={() => setLabActive(true)} hasLab={!!activeModule.interactiveCases} glossary={glossary} />
         )}
      </main>

      {glossaryOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-3xl max-h-[85vh] rounded-[4rem] overflow-hidden flex flex-col shadow-2xl border border-white/20">
            <div className="p-10 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-3xl font-black tracking-tight">Diccionario Técnico Maestro</h2>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Glosario Contextual ITSE 2024</p>
              </div>
              <button onClick={() => setGlossaryOpen(false)} className="w-12 h-12 bg-white rounded-2xl border border-slate-200 flex items-center justify-center text-2xl font-black hover:bg-red-50 hover:text-red-500 transition-all">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-6 bg-gradient-to-b from-white to-slate-50">
              {Object.keys(glossary).sort().map(k => (
                <div key={k} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                   <p className="text-[11px] font-black text-blue-600 mb-3 uppercase tracking-[0.2em] group-hover:tracking-[0.3em] transition-all">{k}</p>
                   <p className="text-lg font-bold text-slate-900 leading-relaxed">{glossary[k]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <footer className="py-12 bg-white border-t border-slate-100 mt-auto">
         <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 bg-slate-900 rounded-lg"></div>
               <span className="text-[11px] font-black uppercase tracking-widest">Master-Quizlet DB Pro</span>
            </div>
            <p className="text-[10px] font-bold text-slate-400">© 2024 PROYECTO ACADÉMICO PARA EL PARCIAL DE BASES DE DATOS</p>
            <div className="flex gap-4">
               <div className="w-3 h-3 rounded-full bg-blue-500"></div>
               <div className="w-3 h-3 rounded-full bg-amber-500"></div>
               <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
         </div>
      </footer>
    </div>
  );
}
