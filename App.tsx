
import React, { useState, useCallback, useMemo } from 'react';
import { MODULES, FINAL_EXAM_QUESTIONS, TRUE_FALSE_QUESTIONS } from './data';
import { Module, Flashcard, InteractiveCase } from './types';

// Componente para resaltar términos técnicos con definiciones
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
      .filter(t => t && typeof t === 'string' && t.trim().length > 0)
      .sort((a, b) => b.length - a.length),
    [glossary]
  );
  
  if (!text) return null;
  if (terms.length === 0) return <>{text}</>;

  const escapeRegExp = (string: string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

// --- SUB-COMPONENTES DE EXAMEN ---

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
    setConnections([...connections, { from: selectedEntity, to, type }]);
    setSelectedEntity(null);
    setFeedback(null);
  };

  const checkDesign = () => {
    const hasPropMascota = connections.some(c => (c.from === 'propietario' && c.to === 'mascota' && c.type === '1:N') || (c.from === 'mascota' && c.to === 'propietario' && c.type === '1:N'));
    const hasMascotaCita = connections.some(c => (c.from === 'mascota' && c.to === 'cita' && c.type === '1:N') || (c.from === 'cita' && c.to === 'mascota' && c.type === '1:N'));
    
    if (hasPropMascota && hasMascotaCita) {
      setFeedback({ message: "¡Perfecto! Un Propietario tiene Varias Mascotas (1:N) y una Mascota tiene Varias Citas (1:N).", isSuccess: true });
    } else {
      setFeedback({ message: "Relaciones incorrectas. Sugerencia: 1 Propietario -> N Mascotas.", isSuccess: false });
    }
  };

  return (
    <div className="p-8 animate-in fade-in">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Laboratorio E-R: Veterinaria</h3>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Diseña la estructura lógica</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {entities.map(e => (
          <div key={e.id} onClick={() => setSelectedEntity(e.id)} className={`p-6 rounded-[2rem] border-4 cursor-pointer transition-all shadow-lg ${selectedEntity === e.id ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-100' : 'border-white bg-white hover:border-blue-200'}`}>
            <p className="font-black text-slate-900 mb-4 uppercase text-sm tracking-tighter">{e.name}</p>
            {e.attributes.map(a => <div key={a} className="text-xs font-bold text-slate-400 bg-slate-50 p-2 rounded-lg mb-1">{a}</div>)}
            {selectedEntity && selectedEntity !== e.id && (
              <div className="absolute inset-0 bg-blue-600/10 rounded-[2rem] flex items-center justify-center gap-2 backdrop-blur-sm">
                {['1:1', '1:N', 'N:N'].map(t => (
                  <button key={t} onClick={(ev) => { ev.stopPropagation(); handleConnect(e.id, t); }} className="px-3 py-1 bg-white rounded-lg text-[10px] font-black hover:bg-blue-600 hover:text-white">{t}</button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white mb-6">
        <p className="text-[10px] font-black text-blue-400 mb-4 uppercase tracking-[0.3em]">Relaciones Actuales</p>
        <div className="space-y-2">
          {connections.length === 0 ? <p className="text-slate-600 italic">No hay conexiones...</p> : connections.map((c, i) => (
            <div key={i} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl">
              <span className="font-bold text-xs uppercase">{c.from}</span>
              <span className="bg-blue-600 px-2 py-0.5 rounded text-[10px] font-black">{c.type}</span>
              <span className="font-bold text-xs uppercase">{c.to}</span>
              <button onClick={() => setConnections(connections.filter((_, idx) => idx !== i))} className="ml-auto text-red-400">×</button>
            </div>
          ))}
        </div>
      </div>
      {feedback && <div className={`p-6 rounded-2xl mb-6 font-bold ${feedback.isSuccess ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>{feedback.message}</div>}
      <div className="flex gap-4">
        <button onClick={checkDesign} className="flex-1 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700">Verificar</button>
        <button onClick={onExit} className="px-8 py-5 bg-slate-200 text-slate-700 font-black rounded-2xl">Salir</button>
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
    <div className="p-12 text-center bg-white rounded-[3rem] shadow-xl">
      <h2 className="text-4xl font-black mb-4">{Math.round((score/TRUE_FALSE_QUESTIONS.length)*100)}%</h2>
      <button onClick={onExit} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl">Finalizar</button>
    </div>
  );

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="bg-white rounded-[3rem] p-10 shadow-xl border border-slate-100 mb-6">
        <p className="text-xl font-bold text-slate-800 text-center italic mb-8">"{current.statement}"</p>
        {answered === null ? (
          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => { setAnswered(true); if (current.isTrue) setScore(s => s + 1); }} className="py-6 bg-green-500 text-white font-black rounded-2xl">Verdadero</button>
            <button onClick={() => { setAnswered(false); if (!current.isTrue) setScore(s => s + 1); }} className="py-6 bg-red-500 text-white font-black rounded-2xl">Falso</button>
          </div>
        ) : (
          <div className={`p-6 rounded-2xl mb-6 ${answered === current.isTrue ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
            <p className="font-bold">{current.explanation}</p>
          </div>
        )}
      </div>
      {answered !== null && (
        <button onClick={() => { if (index < TRUE_FALSE_QUESTIONS.length - 1) { setIndex(index + 1); setAnswered(null); } else setDone(true); }} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl">Siguiente</button>
      )}
    </div>
  );
};

const StandardExam: React.FC<{ questions: InteractiveCase[]; onExit: () => void }> = ({ questions, onExit }) => {
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);
  const q = questions[idx];

  if (done) return (
    <div className="p-12 text-center bg-white rounded-[3rem] shadow-xl">
      <h2 className="text-4xl font-black mb-4">Puntaje: {score}/{questions.length}</h2>
      <button onClick={onExit} className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl">Volver al Menú</button>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden">
        <div className="p-10 border-b border-slate-50 bg-slate-50/50">
          <h3 className="text-2xl font-black text-slate-900 mb-4">{q.question}</h3>
          <p className="text-slate-500 italic">"{q.scenario}"</p>
        </div>
        <div className="p-10 space-y-4">
          {q.options.map((opt, i) => (
            <button key={i} disabled={answered} onClick={() => { setSelected(i); setAnswered(true); if(i === q.correctAnswer) setScore(s => s + 1); }} 
              className={`w-full p-6 rounded-2xl text-left font-black transition-all border-2 ${answered ? (i === q.correctAnswer ? 'bg-green-100 border-green-500 text-green-900' : (i === selected ? 'bg-red-100 border-red-500 text-red-900' : 'opacity-40')) : 'bg-white border-slate-100 hover:border-blue-400'}`}>
              {opt}
            </button>
          ))}
        </div>
        {answered && (
          <div className="p-10 bg-slate-50 border-t border-slate-100">
            <p className="text-slate-700 font-bold mb-6 italic">{q.explanation}</p>
            <button onClick={() => { if(idx < questions.length - 1) { setIdx(idx + 1); setSelected(null); setAnswered(false); } else setDone(true); }} className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl">Continuar</button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DE EXAMEN ---

const GlobalExam: React.FC<{ questions: InteractiveCase[]; onExit: () => void }> = ({ questions, onExit }) => {
  const [mode, setMode] = useState<'menu' | 'standard' | 'lab' | 'tf'>('menu');

  if (mode === 'standard') return <StandardExam questions={questions} onExit={() => setMode('menu')} />;
  if (mode === 'lab') return <VirtualERLab onExit={() => setMode('menu')} />;
  if (mode === 'tf') return <TrueFalseQuiz onExit={() => setMode('menu')} />;

  return (
    <div className="max-w-4xl mx-auto p-12 text-center">
      <h2 className="text-4xl font-black text-slate-950 mb-12">Centro de Evaluación Avanzada</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { id: 'standard', title: 'Simulador', desc: 'Casos prácticos de opción múltiple.', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', color: 'blue' },
          { id: 'lab', title: 'Virtual Lab', desc: 'Diseño E-R interactivo.', icon: 'M13 10V3L4 14h7v7l9-11h-7z', color: 'indigo' },
          { id: 'tf', title: 'Quiz V/F', desc: 'Desafío rápido de conceptos.', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'amber' }
        ].map(m => (
          <button key={m.id} onClick={() => setMode(m.id as any)} className="p-10 bg-white rounded-[3rem] border-4 border-transparent hover:border-blue-500 shadow-xl transition-all group">
            <div className={`w-16 h-16 bg-${m.color}-100 rounded-3xl flex items-center justify-center text-${m.color}-600 mx-auto mb-6 group-hover:bg-${m.color}-600 group-hover:text-white transition-all`}>
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d={m.icon}/></svg>
            </div>
            <h3 className="text-xl font-black text-slate-900 mb-2 uppercase">{m.title}</h3>
            <p className="text-slate-400 text-sm font-bold">{m.desc}</p>
          </button>
        ))}
      </div>
      <button onClick={onExit} className="mt-12 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors">← Regresar al Panel Principal</button>
    </div>
  );
};

// --- COMPONENTES DE ESTUDIO (FLASHCARDS Y LABS DE UNIDAD) ---

const InteractiveLab: React.FC<{ cases: InteractiveCase[]; onExit: () => void; glossary: Record<string, string>; }> = ({ cases, onExit, glossary }) => {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const current = cases[idx];

  return (
    <div className="max-w-3xl mx-auto p-8 animate-in slide-in-from-bottom-4">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden">
        <div className="p-12 bg-indigo-600 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4 opacity-70">Caso Práctico {idx + 1}/{cases.length}</p>
          <h3 className="text-3xl font-black">{current.question}</h3>
        </div>
        <div className="p-12 space-y-4">
          {current.options.map((opt, i) => (
            <button key={i} disabled={answered} onClick={() => { setSelected(i); setAnswered(true); }} 
              className={`w-full p-6 rounded-2xl text-left font-black transition-all border-2 ${answered ? (i === current.correctAnswer ? 'bg-green-100 border-green-500 text-green-900' : (i === selected ? 'bg-red-100 border-red-500 text-red-900' : 'opacity-40')) : 'bg-white border-slate-100 hover:border-indigo-400'}`}>
              {opt}
            </button>
          ))}
        </div>
        {answered && (
          <div className="p-12 bg-slate-50 border-t border-slate-100">
            <div className="text-xl font-bold text-slate-800 mb-8 italic"><HighlightedText text={current.explanation} glossary={glossary} /></div>
            <button onClick={() => { if(idx < cases.length - 1) { setIdx(idx + 1); setSelected(null); setAnswered(false); } else onExit(); }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl">Continuar Repaso</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CardView: React.FC<{ card: Flashcard; currentIndex: number; total: number; isFlipped: boolean; onFlip: () => void; onNext: () => void; onPrev: () => void; onExit: () => void; onStartLab?: () => void; hasLab?: boolean; glossary: Record<string, string>; }> = ({ card, currentIndex, total, isFlipped, onFlip, onNext, onPrev, onExit, onStartLab, hasLab, glossary }) => {
  const progress = Math.round(((currentIndex + 1) / total) * 100);
  return (
    <div className="max-w-4xl mx-auto p-10">
      <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-400 font-black text-xs uppercase tracking-widest hover:text-slate-900">← Panel Principal</button>
        <div className="text-right"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{currentIndex + 1} de {total}</span></div>
      </div>
      <div className="w-full h-3 bg-slate-100 rounded-full mb-12"><div className="h-full bg-blue-600 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} /></div>
      <div className="w-full h-[500px] perspective-1000 cursor-pointer" onClick={onFlip}>
        <div className={`relative w-full h-full transition-all duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 bg-white backface-hidden rounded-[4rem] p-16 flex flex-col items-center justify-center text-center shadow-xl border border-slate-100">
            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-10">{card.type}</span>
            <div className="text-3xl font-black text-slate-900"><HighlightedText text={card.front} glossary={glossary} /></div>
          </div>
          <div className="absolute inset-0 bg-slate-950 backface-hidden rounded-[4rem] p-16 flex flex-col items-center justify-center text-center rotate-y-180 shadow-2xl border-8 border-slate-900">
            <div className="text-2xl font-bold text-white italic"><HighlightedText text={card.back} glossary={glossary} /></div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mt-12">
        <button onClick={onPrev} disabled={currentIndex === 0} className="py-6 bg-white border-2 border-slate-100 font-black rounded-3xl disabled:opacity-30">Anterior</button>
        <button onClick={onNext} className="py-6 bg-blue-600 text-white font-black rounded-3xl">Siguiente</button>
      </div>
      {hasLab && <button onClick={onStartLab} className="w-full mt-6 py-6 bg-slate-900 text-white font-black rounded-3xl uppercase tracking-widest text-sm hover:bg-indigo-600 transition-colors">Iniciar Laboratorio de Casos</button>}
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
        if(term.length > 2 && term.length < 30) map[term] = c.back;
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">DB</div>
            <div><h1 className="text-xl font-black text-slate-900 tracking-tighter">Master Quizlet</h1></div>
          </div>
          <button onClick={() => setGlossaryOpen(true)} className="text-xs font-black uppercase tracking-widest text-slate-700 bg-slate-100 px-4 py-2 rounded-xl">Diccionario</button>
        </div>
      </header>

      <main className="flex-1 pb-20">
        {isExamActive ? <GlobalExam questions={FINAL_EXAM_QUESTIONS} onExit={() => setIsExamActive(false)} /> :
         !activeModule ? (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-xl mb-12 flex flex-col md:flex-row items-center gap-10">
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-5xl font-black text-slate-950 mb-4 tracking-tighter">Especialista en Bases de Datos</h2>
                <p className="text-slate-500 font-bold">Domina 150 tarjetas basadas en el examen oficial.</p>
              </div>
              <button onClick={() => setIsExamActive(true)} className="px-12 py-6 bg-slate-950 text-white font-black rounded-3xl hover:bg-blue-600 transition-all active:scale-95 shadow-2xl">INICIAR EVALUACIONES</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MODULES.map(m => (
                <button key={m.id} onClick={() => { setActiveModule(m); setCurrentIdx(0); setFlipped(false); setLabActive(false); }} 
                  className="p-10 bg-white border-l-[12px] border-blue-500 rounded-[3rem] shadow-lg hover:shadow-2xl transition-all text-left group">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 block">{m.unit}</span>
                  <h3 className="text-2xl font-black text-slate-900 mb-6 group-hover:text-blue-600">{m.title}</h3>
                  <div className="text-[10px] font-black uppercase text-blue-600">{m.cards.length} Tarjetas →</div>
                </button>
              ))}
            </div>
          </div>
         ) : labActive && activeModule.interactiveCases ? (
           <InteractiveLab cases={activeModule.interactiveCases} onExit={() => setLabActive(false)} glossary={glossary} />
         ) : (
           <CardView card={activeModule.cards[currentIdx]} currentIndex={currentIdx} total={activeModule.cards.length} isFlipped={flipped} onFlip={() => setFlipped(!flipped)} onNext={handleNext} onPrev={() => { setFlipped(false); setCurrentIdx(currentIdx - 1); }} onExit={() => setActiveModule(null)} onStartLab={() => setLabActive(true)} hasLab={!!activeModule.interactiveCases} glossary={glossary} />
         )}
      </main>

      {glossaryOpen && (
        <div className="fixed inset-0 z-[60] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[3rem] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-8 border-b border-slate-100 flex justify-between bg-slate-50">
              <h2 className="text-2xl font-black">Diccionario Técnico</h2>
              <button onClick={() => setGlossaryOpen(false)} className="text-2xl font-bold">×</button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-4">
              {Object.keys(glossary).sort().map(k => (
                <div key={k} className="p-4 bg-slate-50 rounded-2xl"><p className="text-xs font-black text-blue-600 mb-1 uppercase">{k}</p><p className="font-bold text-slate-900">{glossary[k]}</p></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
