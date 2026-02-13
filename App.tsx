
import React, { useState, useCallback, useMemo } from 'react';
import { MODULES, FINAL_EXAM_QUESTIONS, TRUE_FALSE_QUESTIONS } from './data';
import { Module, Flashcard, InteractiveCase } from './types';

// Tooltip Component for technical terms
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

// Component to parse text and wrap glossary terms
const HighlightedText: React.FC<{ text: string; glossary: Record<string, string> }> = ({ text, glossary }) => {
  const terms = useMemo(() => 
    Object.keys(glossary)
      .filter(t => t && typeof t === 'string' && t.trim().length > 0)
      .sort((a, b) => b.length - a.length),
    [glossary]
  );
  
  if (!text) return null;
  if (terms.length === 0) return <>{text}</>;

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const escapedTerms = terms.map(escapeRegExp);
  const regex = new RegExp(`(\\b${escapedTerms.join('\\b|\\b')}\\b)`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        if (part === undefined || part === null || typeof part !== 'string') return null;
        if (part === "") return null;

        const lowerPart = part.toLowerCase();
        const matchedTerm = terms.find(t => t.toLowerCase() === lowerPart);
        
        if (matchedTerm) {
          return (
            <TechnicalTerm key={i} term={matchedTerm} definition={glossary[matchedTerm]}>
              {part}
            </TechnicalTerm>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
};

// Virtual ER Lab Component
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
    const exists = connections.find(c => (c.from === selectedEntity && c.to === to) || (c.from === to && c.to === selectedEntity));
    if (exists) return;

    setConnections([...connections, { from: selectedEntity, to, type }]);
    setSelectedEntity(null);
    setFeedback(null);
  };

  const checkDesign = () => {
    const hasPropMascota = connections.find(c => 
      (c.from === 'propietario' && c.to === 'mascota' && c.type === '1:N') ||
      (c.from === 'mascota' && c.to === 'propietario' && c.type === '1:N')
    );
    const hasMascotaCita = connections.find(c => 
      (c.from === 'mascota' && c.to === 'cita' && c.type === '1:N') ||
      (c.from === 'cita' && c.to === 'mascota' && c.type === '1:N')
    );

    if (hasPropMascota && hasMascotaCita && connections.length === 2) {
      setFeedback({
        message: "¡Diseño Perfecto! Has modelado que un Dueño puede tener varias Mascotas y cada Mascota puede tener varias Citas (historial médico).",
        isSuccess: true
      });
    } else {
      setFeedback({
        message: "El diseño es incorrecto o faltan relaciones. Sugerencia: Un propietario tiene N mascotas, y una mascota tiene N citas.",
        isSuccess: false
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 font-black flex items-center gap-2 uppercase tracking-widest text-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Menu Exámenes
        </button>
        <span className="text-xs font-black text-blue-600 bg-blue-50 px-4 py-1 rounded-full uppercase tracking-widest">Laboratorio Virtual E-R</span>
      </div>

      <div className="text-center mb-12">
        <h3 className="text-4xl font-black text-slate-900 mb-4">Caso de Estudio: Veterinaria</h3>
        <p className="text-lg text-slate-600 font-medium max-w-2xl mx-auto">Conecta las entidades para crear el modelo lógico. Haz clic en una entidad y luego en otra para definir su cardinalidad.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {entities.map(e => (
          <div 
            key={e.id}
            onClick={() => setSelectedEntity(selectedEntity === e.id ? null : e.id)}
            className={`p-8 rounded-[2.5rem] border-4 transition-all relative shadow-xl ${selectedEntity === e.id ? 'border-blue-600 bg-blue-50 ring-8 ring-blue-100' : 'border-white bg-white hover:border-blue-200'}`}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
              </div>
              <span className="text-xl font-black text-slate-900 uppercase tracking-tight">{e.name}</span>
            </div>
            <div className="space-y-2">
              {e.attributes.map(attr => (
                <div key={attr} className="flex items-center gap-3 text-sm font-bold text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className={`w-2.5 h-2.5 rounded-full ${attr.includes('PK') ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  {attr}
                </div>
              ))}
            </div>
            {selectedEntity && selectedEntity !== e.id && (
              <div className="absolute inset-0 bg-blue-600/20 rounded-[2.5rem] flex items-center justify-center gap-3 p-4 backdrop-blur-sm animate-in zoom-in duration-200">
                <button onClick={(ev) => {ev.stopPropagation(); handleConnect(e.id, '1:1')}} className="px-4 py-2 bg-white shadow-2xl rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">1:1</button>
                <button onClick={(ev) => {ev.stopPropagation(); handleConnect(e.id, '1:N')}} className="px-4 py-2 bg-white shadow-2xl rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">1:N</button>
                <button onClick={(ev) => {ev.stopPropagation(); handleConnect(e.id, 'N:N')}} className="px-4 py-2 bg-white shadow-2xl rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110">N:N</button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-slate-950 rounded-[3rem] p-10 text-white shadow-2xl mb-12 border border-blue-500/20">
        <h4 className="text-xs font-black uppercase tracking-[0.4em] text-blue-400 mb-8 flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
          Diseño Lógico Actual
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connections.length === 0 ? (
            <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-3xl">
               <p className="text-slate-500 italic font-medium">No se han definido relaciones. Selecciona una entidad para comenzar.</p>
            </div>
          ) : (
            connections.map((c, i) => (
              <div key={i} className="flex items-center justify-between bg-white/5 border border-white/10 p-6 rounded-[1.5rem] animate-in slide-in-from-left-4">
                <div className="flex items-center gap-5">
                  <span className="font-black text-blue-400 uppercase tracking-widest text-sm">{c.from}</span>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black text-white bg-blue-600 px-2 py-1 rounded mb-1">{c.type}</span>
                    <div className="h-px w-12 bg-white/20"></div>
                  </div>
                  <span className="font-black text-blue-400 uppercase tracking-widest text-sm">{c.to}</span>
                </div>
                <button onClick={() => setConnections(connections.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {feedback && (
        <div className={`p-8 rounded-[2rem] mb-12 animate-in zoom-in duration-300 flex gap-6 items-center shadow-2xl ${feedback.isSuccess ? 'bg-green-50 text-green-900 border-4 border-green-200' : 'bg-red-50 text-red-900 border-4 border-red-200'}`}>
          <div className={`p-4 rounded-2xl shadow-inner ${feedback.isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <div>
            <p className="text-xl font-black mb-1">{feedback.isSuccess ? '¡Excelente Trabajo!' : 'Aún no es óptimo'}</p>
            <p className="font-bold leading-relaxed">{feedback.message}</p>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        <button onClick={checkDesign} className="flex-1 py-7 bg-blue-600 text-white font-black uppercase tracking-[0.2em] rounded-[1.5rem] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 active:scale-95 transition-all">Verificar Modelo de Datos</button>
        <button onClick={() => { setConnections([]); setFeedback(null); }} className="px-10 bg-slate-200 text-slate-700 font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-slate-300 transition-all">Limpiar</button>
      </div>
    </div>
  );
};

// True/False Quiz Component
const TrueFalseQuiz: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState<boolean | null>(null);
  const [finished, setFinished] = useState(false);

  const currentQ = TRUE_FALSE_QUESTIONS[currentIndex];

  const handleAnswer = (choice: boolean) => {
    if (answered !== null) return;
    setAnswered(choice);
    if (choice === currentQ.isTrue) setScore(s => s + 1);
  };

  const next = () => {
    if (currentIndex < TRUE_FALSE_QUESTIONS.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setAnswered(null);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    const percentage = Math.round((score/TRUE_FALSE_QUESTIONS.length)*100);
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-50 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-3xl font-black shadow-xl shadow-blue-500/40">{percentage}%</div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Quiz Finalizado</h2>
        <p className="text-lg text-slate-600 mb-10 font-bold">Has validado tus conocimientos teóricos sobre los pilares de las BD.</p>
        <button onClick={onExit} className="w-full py-6 bg-slate-950 text-white font-black uppercase rounded-[1.5rem] tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">Regresar al Inicio</button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-8 animate-in slide-in-from-right duration-500">
      <div className="text-center mb-12">
        <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-6 py-2 rounded-full uppercase tracking-[0.3em] mb-6 inline-block">Desafío: ¿Verdadero o Falso?</span>
        <h3 className="text-3xl font-black text-slate-900 leading-tight">Analiza la siguiente afirmación técnica:</h3>
      </div>

      <div className="bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 min-h-[350px] flex flex-col items-center justify-center text-center mb-10 transition-all relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50"></div>
        <p className="text-3xl font-bold text-slate-800 leading-relaxed mb-12 italic relative z-10 px-4 font-serif">"{currentQ.statement}"</p>
        
        {answered === null ? (
          <div className="grid grid-cols-2 gap-8 w-full relative z-10">
            <button onClick={() => handleAnswer(true)} className="py-7 bg-green-500 hover:bg-green-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group">
              VERDADERO
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
            </button>
            <button onClick={() => handleAnswer(false)} className="py-7 bg-red-500 hover:bg-red-600 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-2xl shadow-red-500/20 active:scale-95 transition-all flex items-center justify-center gap-3 group">
              FALSO
              <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        ) : (
          <div className={`w-full p-10 rounded-[2rem] animate-in zoom-in text-left shadow-inner border-2 ${answered === currentQ.isTrue ? 'bg-green-50 text-green-900 border-green-200' : 'bg-red-50 text-red-900 border-red-200'}`}>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[11px] font-black uppercase px-3 py-1 rounded-lg ${answered === currentQ.isTrue ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{answered === currentQ.isTrue ? 'ACIERTO' : 'ERROR'}</span>
            </div>
            <p className="font-black text-xl leading-relaxed">{currentQ.explanation}</p>
          </div>
        )}
      </div>

      {answered !== null && (
        <button onClick={next} className="w-full py-7 bg-slate-900 text-white font-black uppercase tracking-[0.4em] rounded-[1.5rem] shadow-2xl animate-in slide-in-from-bottom-4 transition-all hover:bg-blue-600 active:scale-95">
          SIGUIENTE PREGUNTA
        </button>
      )}
    </div>
  );
};

// Global Exam Component
const GlobalExam: React.FC<{ 
  questions: InteractiveCase[]; 
  onExit: () => void 
}> = ({ questions, onExit }) => {
  const [examMode, setExamMode] = useState<'menu' | 'standard' | 'virtual_lab' | 'true_false'>('menu');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentQuestion.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (examMode === 'menu') {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <button onClick={onExit} className="p-4 bg-white rounded-2xl border-2 border-slate-100 text-slate-400 hover:text-blue-600 shadow-sm transition-all group active:scale-90">
               <svg className="w-6 h-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            </button>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Centro de Evaluación</h2>
          </div>
          <div className="bg-blue-600/10 px-6 py-2.5 rounded-2xl border border-blue-100 flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
             <span className="text-xs font-black text-blue-700 uppercase tracking-widest">3 Modos de Práctica</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <button 
            onClick={() => setExamMode('standard')}
            className="p-10 bg-white border-4 border-white hover:border-blue-500 rounded-[3rem] text-left hover:shadow-2xl transition-all group flex flex-col min-h-[380px] shadow-xl relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors"></div>
            <div className="w-16 h-16 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-8 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-lg shadow-blue-500/10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Simulador Pro</h3>
            <p className="text-slate-500 font-bold mb-auto text-base leading-relaxed">Examen integrador con escenarios reales y lógica de bases de datos aplicada (150 ítems).</p>
            <span className="text-blue-600 font-black text-sm mt-8 inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">INICIAR RETO →</span>
          </button>

          <button 
            onClick={() => setExamMode('virtual_lab')}
            className="p-10 bg-white border-4 border-white hover:border-indigo-500 rounded-[3rem] text-left hover:shadow-2xl transition-all group flex flex-col min-h-[380px] shadow-xl relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-50 rounded-full blur-2xl group-hover:bg-indigo-100 transition-colors"></div>
            <div className="w-16 h-16 bg-indigo-100 rounded-3xl flex items-center justify-center text-indigo-600 mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-lg shadow-indigo-500/10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Virtual E-R Lab</h3>
            <p className="text-slate-500 font-bold mb-auto text-base leading-relaxed">Arrastra y conecta entidades para diseñar el esquema lógico de una clínica veterinaria real.</p>
            <span className="text-indigo-600 font-black text-sm mt-8 inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">DISEÑAR AHORA →</span>
          </button>

          <button 
            onClick={() => setExamMode('true_false')}
            className="p-10 bg-white border-4 border-white hover:border-amber-500 rounded-[3rem] text-left hover:shadow-2xl transition-all group flex flex-col min-h-[380px] shadow-xl relative overflow-hidden"
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-50 rounded-full blur-2xl group-hover:bg-amber-100 transition-colors"></div>
            <div className="w-16 h-16 bg-amber-100 rounded-3xl flex items-center justify-center text-amber-600 mb-8 group-hover:bg-amber-600 group-hover:text-white transition-all transform group-hover:rotate-6 shadow-lg shadow-amber-500/10">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-4 uppercase tracking-tighter">Desafío V/F</h3>
            <p className="text-slate-500 font-bold mb-auto text-base leading-relaxed">Prueba rápida de conceptos teóricos basados en el PDF de Quizlet. Ideal para un repaso veloz.</p>
            <span className="text-amber-600 font-black text-sm mt-8 inline-flex items-center gap-2 group-hover:translate-x-2 transition-transform">ACEPTAR RETO →</span>
          </button>
        </div>
      </div>
    );
  }

  if (examMode === 'virtual_lab') {
    return <VirtualERLab onExit={() => setExamMode('menu')} />;
  }

  if (examMode === 'true_false') {
    return <TrueFalseQuiz onExit={() => setExamMode('menu')} />;
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-in zoom-in duration-500">
        <div className="bg-slate-900 text-white rounded-[3.5rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-blue-500/30">
          <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-10 text-5xl font-black shadow-2xl shadow-blue-500/50 text-white">
            {grade}
          </div>
          <h2 className="text-4xl font-black mb-4 tracking-tight">Evaluación Finalizada</h2>
          <p className="text-slate-400 mb-12 text-lg">Resultados basados en la estructura del PDF Quizlet ITSE.</p>
          
          <div className="grid grid-cols-2 gap-6 mb-12">
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">Puntuación</p>
              <p className="text-4xl font-black text-green-400">{score} <span className="text-lg text-slate-600">/ {questions.length}</span></p>
            </div>
            <div className="bg-white/5 p-8 rounded-3xl border border-white/10 backdrop-blur-md">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black mb-2">Desempeño</p>
              <p className="text-4xl font-black text-blue-400">{percentage}%</p>
            </div>
          </div>

          <button 
            onClick={() => setExamMode('menu')}
            className="w-full py-7 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-[0.3em] rounded-[1.5rem] transition-all shadow-2xl shadow-blue-600/30 active:scale-95"
          >
            Menú de Exámenes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-5">
          <button onClick={() => setExamMode('menu')} className="text-slate-400 hover:text-slate-800 transition-all p-3 bg-white rounded-2xl border-2 border-slate-50 shadow-sm active:scale-90">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          </button>
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-5 py-2 rounded-full">Simulador Estándar</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{currentIndex + 1} de {questions.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden transition-all duration-500">
        <div className="p-12 border-b border-slate-50 bg-slate-50/30">
           <p className="text-[10px] font-black text-blue-600 uppercase mb-3 tracking-[0.4em]">{currentQuestion.title}</p>
           <h3 className="text-3xl font-black text-slate-900 leading-tight mb-6">{currentQuestion.question}</h3>
           <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
              <div className="w-1.5 h-12 bg-blue-600 rounded-full"></div>
              <p className="text-slate-600 text-lg italic leading-relaxed font-medium">"{currentQuestion.scenario}"</p>
           </div>
        </div>

        <div className="p-12 space-y-5">
          {currentQuestion.options.map((opt, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isSelected = selectedOption === idx;
            let btnClass = "bg-white border-2 border-slate-100 text-slate-900 hover:border-blue-400 hover:bg-blue-50/30 hover:translate-x-2 shadow-sm";
            
            if (isAnswered) {
              if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-900 shadow-lg shadow-green-500/10";
              else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-900 shadow-lg shadow-red-500/10";
              else btnClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60 grayscale scale-95";
            } else if (isSelected) {
              btnClass = "bg-blue-100 border-blue-600 text-blue-900 ring-4 ring-blue-50";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`w-full p-7 rounded-[1.5rem] text-left transition-all flex justify-between items-center group font-black text-xl ${btnClass}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-12 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-bottom-6 duration-500">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.4em]">Análisis Técnico</p>
            <p className="text-2xl text-slate-900 mb-10 leading-relaxed font-bold font-serif italic">"{currentQuestion.explanation}"</p>
            <button 
              onClick={nextQuestion}
              className="w-full py-7 bg-slate-950 text-white font-black rounded-[1.5rem] hover:bg-blue-600 transition-all active:scale-95 shadow-2xl tracking-[0.3em]"
            >
              {currentIndex === questions.length - 1 ? 'REVISAR RESULTADO FINAL' : 'CONTINUAR SIGUIENTE ITEM'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Interactive Lab Component for specific module cases
const InteractiveLab: React.FC<{ 
  cases: InteractiveCase[]; 
  onExit: () => void;
  glossary: Record<string, string>;
}> = ({ cases, onExit, glossary }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResults, setShowResults] = useState(false);

  const currentCase = cases[currentIndex];

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    setSelectedOption(idx);
    setIsAnswered(true);
    if (idx === currentCase.correctAnswer) {
      setScore(s => s + 1);
    }
  };

  const nextCase = () => {
    if (currentIndex < cases.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResults(true);
    }
  };

  if (showResults) {
    const percentage = Math.round((score / cases.length) * 100);
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white rounded-[3.5rem] shadow-2xl border-4 border-slate-50 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-8 text-white text-3xl font-black shadow-xl shadow-indigo-500/40">
          {percentage}%
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Módulo Completado</h2>
        <p className="text-lg text-slate-600 mb-10 font-bold">Has validado con éxito los casos prácticos de esta unidad técnica.</p>
        <button onClick={onExit} className="w-full py-6 bg-slate-950 text-white font-black uppercase rounded-[1.5rem] tracking-[0.3em] shadow-2xl hover:bg-blue-600 transition-all active:scale-95">Regresar a la Unidad</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-in slide-in-from-bottom-8 duration-500">
      <div className="flex justify-between items-center mb-10">
        <button onClick={onExit} className="text-slate-400 hover:text-slate-800 transition-all p-3 bg-white rounded-2xl border-2 border-slate-50 shadow-sm active:scale-90 flex items-center gap-2 font-black uppercase tracking-widest text-[10px]">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Cerrar Lab
        </button>
        <div className="text-right">
          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-600 bg-indigo-50 px-5 py-2 rounded-full">Laboratorio Práctico</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden transition-all">
        <div className="p-12 border-b border-slate-50 bg-slate-50/30">
          <p className="text-[10px] font-black text-indigo-600 uppercase mb-3 tracking-[0.4em]">CASO {currentIndex + 1} DE {cases.length}</p>
          <h3 className="text-3xl font-black text-slate-900 leading-tight mb-6">{currentCase.question}</h3>
          <div className="flex items-start gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-sm">
            <div className="w-1.5 h-12 bg-indigo-600 rounded-full"></div>
            <p className="text-slate-600 text-lg italic leading-relaxed font-medium">"{currentCase.scenario}"</p>
          </div>
        </div>

        <div className="p-12 space-y-4">
          {currentCase.options.map((opt, idx) => {
            const isCorrect = idx === currentCase.correctAnswer;
            const isSelected = selectedOption === idx;
            let btnClass = "bg-white border-2 border-slate-100 text-slate-900 hover:border-indigo-400 hover:bg-indigo-50/30 hover:translate-x-2";
            
            if (isAnswered) {
              if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-900 shadow-lg shadow-green-500/10";
              else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-900 shadow-lg shadow-red-500/10";
              else btnClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60 grayscale scale-95";
            } else if (isSelected) {
              btnClass = "bg-indigo-100 border-indigo-600 text-indigo-900 ring-4 ring-indigo-50";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`w-full p-7 rounded-[1.5rem] text-left transition-all flex justify-between items-center group font-black text-xl ${btnClass}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <svg className="w-7 h-7 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-12 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-bottom-6">
            <p className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-[0.4em]">Retroalimentación</p>
            <div className="text-2xl text-slate-900 mb-10 leading-relaxed font-bold font-serif italic">
               <HighlightedText text={currentCase.explanation} glossary={glossary} />
            </div>
            <button 
              onClick={nextCase}
              className="w-full py-7 bg-slate-950 text-white font-black rounded-[1.5rem] hover:bg-indigo-600 transition-all active:scale-95 shadow-2xl tracking-[0.3em]"
            >
              {currentIndex === cases.length - 1 ? 'REVISAR RESULTADO' : 'SIGUIENTE CASO'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const GlossaryModal: React.FC<{ isOpen: boolean; onClose: () => void; glossary: Record<string, string> }> = ({ isOpen, onClose, glossary }) => {
  if (!isOpen) return null;
  const sortedTerms = Object.keys(glossary).sort();
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-500 border border-white/20">
        <div className="p-10 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Glosario Técnico</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Conceptos Maestros PDF 2024</p>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-200 rounded-2xl transition-all shadow-sm active:scale-90">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-10 space-y-5 bg-gradient-to-b from-white to-slate-50">
          {sortedTerms.map(term => (
            <div key={term} className="group p-6 rounded-3xl hover:bg-white border-2 border-transparent hover:border-blue-100 transition-all shadow-sm hover:shadow-xl">
              <h3 className="font-black text-blue-600 text-sm uppercase tracking-[0.2em] mb-3">{term}</h3>
              <p className="text-slate-900 text-base leading-relaxed font-bold">{glossary[term]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ onOpenGlossary: () => void }> = ({ onOpenGlossary }) => (
  <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-2xl shadow-blue-500/20 text-2xl transform hover:rotate-3 transition-transform cursor-default">DB</div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter leading-none mb-1">Master Quizlet</h1>
          <p className="text-[10px] uppercase tracking-[0.4em] text-blue-600 font-black">Certificación ITSE 2024</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenGlossary}
          className="text-xs font-black uppercase tracking-widest text-slate-700 hover:text-white flex items-center gap-3 px-7 py-4 rounded-2xl hover:bg-blue-600 transition-all border-2 border-slate-100 hover:border-blue-600 shadow-sm bg-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          Diccionario PDF
        </button>
      </div>
    </div>
  </header>
);

const ModuleCard: React.FC<{ module: Module; onClick: () => void }> = ({ module, onClick }) => {
  const colorMap: Record<string, string> = {
    blue: "border-blue-500 hover:bg-blue-50 text-blue-700 shadow-blue-500/10",
    green: "border-green-500 hover:bg-green-50 text-green-700 shadow-green-500/10",
    amber: "border-amber-500 hover:bg-amber-50 text-amber-700 shadow-amber-500/10",
    red: "border-red-500 hover:bg-red-50 text-red-700 shadow-red-500/10",
  };

  return (
    <button 
      onClick={onClick}
      className={`p-10 border-l-[12px] rounded-[3rem] bg-white shadow-xl transition-all text-left flex flex-col gap-4 hover:shadow-2xl hover:-translate-y-2 active:scale-[0.98] group ${colorMap[module.color] || "border-slate-500"}`}
    >
      <span className="text-[11px] font-black uppercase tracking-[0.3em] opacity-50 group-hover:opacity-100 transition-opacity">{module.unit}</span>
      <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 tracking-tight">{module.title}</h3>
      <div className="mt-auto flex items-center justify-between w-full pt-8 border-t border-slate-50">
        <div className="flex gap-3">
          <span className="text-[10px] bg-slate-100 px-4 py-2 rounded-xl text-slate-600 font-black uppercase tracking-widest">{module.cards.length} TARJETAS</span>
          {module.interactiveCases && (
             <span className="text-[10px] bg-indigo-600 text-white px-4 py-2 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20">CASE LAB</span>
          )}
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:rotate-45">
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </div>
      </div>
    </button>
  );
};

const CardView: React.FC<{ card: Flashcard; currentIndex: number; total: number; isFlipped: boolean; onFlip: () => void; onNext: () => void; onPrev: () => void; onExit: () => void; onStartLab?: () => void; hasLab?: boolean; glossary: Record<string, string>; }> = ({ card, currentIndex, total, isFlipped, onFlip, onNext, onPrev, onExit, onStartLab, hasLab, glossary }) => {
  const typeLabels: Record<string, string> = { definition: "Definición Técnica", conceptual: "Pilar de Diseño", practical: "Escenario Real", exam: "Examen PDF" };
  const typeColors: Record<string, string> = { definition: "bg-blue-100 text-blue-700", conceptual: "bg-purple-100 text-purple-700", practical: "bg-orange-100 text-orange-700", exam: "bg-red-100 text-red-700" };
  const progressPercentage = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col items-center">
      <div className="w-full mb-12 animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <button onClick={onExit} className="text-slate-400 hover:text-slate-900 font-black uppercase tracking-[0.3em] text-[10px] flex items-center gap-3 group active:scale-90 transition-all">
            <svg className="w-6 h-6 transition-transform group-hover:-translate-x-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>PANEL PRINCIPAL
          </button>
          <div className="text-right">
             <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-6 py-2 rounded-full uppercase tracking-[0.3em] shadow-sm">Sesión Activa</span>
          </div>
        </div>
        <div className="relative w-full h-3 bg-slate-200/50 rounded-full overflow-hidden shadow-inner border border-white">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 bg-[length:200%_100%] animate-shimmer transition-all duration-1000 ease-out" style={{ width: `${progressPercentage}%` }} />
        </div>
        <div className="mt-3 text-right">
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{currentIndex + 1} DE {total} COMPLETADOS</span>
        </div>
      </div>

      <div className="w-full h-[550px] perspective-1000 cursor-pointer group" onClick={onFlip}>
        <div className={`relative w-full h-full transition-all duration-1000 preserve-3d shadow-[0_50px_100px_-30px_rgba(0,0,0,0.15)] rounded-[4rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 bg-white backface-hidden rounded-[4rem] p-16 flex flex-col items-center justify-center text-center border-4 border-slate-50">
            <span className={`px-6 py-2.5 rounded-2xl text-[11px] font-black uppercase mb-12 tracking-[0.4em] shadow-sm ${typeColors[card.type]}`}>{typeLabels[card.type]}</span>
            <div className="text-4xl font-black text-slate-900 leading-[1.3] max-w-xl"><HighlightedText text={card.front} glossary={glossary} /></div>
            <div className="absolute bottom-16 flex flex-col items-center gap-4 text-slate-300 group-hover:text-blue-400 transition-colors">
               <svg className="w-10 h-10 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
               <p className="text-[10px] font-black uppercase tracking-[0.5em]">Toca para ver Respuesta</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-slate-950 backface-hidden rounded-[4rem] p-16 flex flex-col items-center justify-center text-center rotate-y-180 border-8 border-slate-900 shadow-[inset_0_10px_60px_rgba(0,0,0,0.5)]">
            <div className="w-20 h-2 bg-blue-600 rounded-full mb-16 shadow-[0_0_20px_rgba(37,99,235,0.5)]"></div>
            <div className="text-3xl font-bold text-white leading-relaxed max-w-2xl italic px-4"><HighlightedText text={card.back} glossary={glossary} /></div>
            <div className="absolute bottom-16 text-[10px] font-black text-blue-500 uppercase tracking-[0.6em] border-t border-white/10 pt-6 w-1/2">Información Verificada</div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-8 mt-12">
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={currentIndex === 0} className={`py-6 rounded-[2rem] font-black uppercase tracking-[0.3em] border-2 transition-all shadow-xl ${currentIndex === 0 ? 'border-slate-100 text-slate-200 cursor-not-allowed bg-slate-50' : 'border-slate-100 text-slate-800 hover:border-blue-600 hover:text-blue-600 active:scale-95 bg-white'}`}>Anterior</button>
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="py-6 rounded-[2rem] bg-blue-600 text-white font-black uppercase tracking-[0.3em] transition-all hover:bg-indigo-700 active:scale-95 shadow-2xl shadow-blue-600/30">
           {currentIndex === total - 1 ? 'REINICIAR UNIDAD' : 'SIGUIENTE TARJETA'}
        </button>
      </div>

      {hasLab && (
         <button onClick={onStartLab} className="mt-10 w-full py-7 rounded-[2rem] bg-slate-950 text-white font-black uppercase tracking-[0.4em] transition-all hover:bg-blue-600 flex items-center justify-center gap-5 shadow-2xl group active:scale-95">
          <svg className="w-7 h-7 text-blue-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z"/></svg>
          MODO LABORATORIO PRÁCTICO
        </button>
      )}
    </div>
  );
};

export default function App() {
  const [activeModule, setActiveModule] = useState<Module | null>(null);
  const [isExamActive, setIsExamActive] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLabActive, setIsLabActive] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);

  const glossary = useMemo(() => {
    const map: Record<string, string> = {};
    MODULES.forEach(mod => {
      mod.cards.forEach(card => {
        if (card.type === 'definition' || card.type === 'conceptual') {
          const cleanTerm = card.front.replace(/¿Qué es (el |la |una )?/i, '').replace(/\?/g, '').replace(/Definición de /i, '').trim();
          if (cleanTerm.length > 2 && cleanTerm.length < 40) map[cleanTerm] = card.back;
        }
      });
    });
    const extras: Record<string, string> = {
      "1FN": "Atomicidad total: Cada celda contiene un solo valor indivisible y las filas son únicas.",
      "2FN": "Estar en 1FN y que todos los atributos dependan de TODA la llave primaria (sin dependencias parciales).",
      "3FN": "Estar en 2FN y que ningún atributo dependa de otro que no sea la clave primaria (sin transitividad).",
      "PK": "Llave Primaria: Identificador único e irrepetible de un registro en una tabla.",
      "FK": "Llave Foránea: Campo que vincula una tabla con la PK de otra tabla.",
      "SGBD": "Software que administra y controla el acceso a las bases de datos (DBMS).",
      "ACID": "Propiedades de transacciones: Atomicidad, Consistencia, Aislamiento y Durabilidad.",
      "E-R": "Modelo Entidad-Relación: Representación gráfica de la estructura lógica de los datos.",
      "Cardinalidad": "Número de instancias de una entidad que se relacionan con otra entidad asociada."
    };
    return { ...map, ...extras };
  }, []);

  const handleNext = useCallback(() => {
    if (!activeModule) return;
    setIsFlipped(false);
    if (currentCardIndex < activeModule.cards.length - 1) { setCurrentCardIndex(prev => prev + 1); }
    else { setCurrentCardIndex(0); }
  }, [activeModule, currentCardIndex]);

  const handlePrev = useCallback(() => {
    if (currentCardIndex > 0) { setIsFlipped(false); setCurrentCardIndex(prev => prev - 1); }
  }, [currentCardIndex]);

  const handleFlip = useCallback(() => { setIsFlipped(prev => !prev); }, []);

  const handleModuleSelect = (module: Module) => {
    setActiveModule(module);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsLabActive(false);
    setIsExamActive(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
      <Header onOpenGlossary={() => setIsGlossaryOpen(true)} />
      
      <main className="flex-1 w-full pb-12">
        {isExamActive ? (
          <GlobalExam questions={FINAL_EXAM_QUESTIONS} onExit={() => setIsExamActive(false)} />
        ) : !activeModule ? (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-16 text-center md:text-left bg-white p-14 rounded-[4rem] border border-slate-100 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-14 relative overflow-hidden group">
               <div className="absolute -top-32 -right-32 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px] group-hover:bg-blue-600/10 transition-colors"></div>
              <div className="flex-1 relative z-10">
                <div className="inline-flex items-center gap-3 bg-blue-50 px-5 py-2 rounded-full mb-8">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.4em]">Ecosistema Educativo ITSE</span>
                </div>
                <h2 className="text-6xl font-black text-slate-950 mb-8 leading-[1.1] tracking-tighter">Especialista en Bases de Datos</h2>
                <p className="text-slate-600 max-w-xl text-xl leading-relaxed font-bold mb-4">Domina el temario oficial basado en los 148 ítems del Quizlet PDF. Desde fundamentos hasta Normalización 3FN.</p>
                <div className="flex flex-wrap gap-4 mt-8">
                   <div className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">150+ Tarjetas</div>
                   <div className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">Simulador ACID</div>
                   <div className="px-5 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-100">Modelado E-R</div>
                </div>
              </div>
              <button 
                onClick={() => setIsExamActive(true)}
                className="w-full md:w-auto px-14 py-8 bg-slate-950 text-white font-black rounded-[2rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-5 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 text-blue-400 group-hover:rotate-12 transition-transform mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                  <span className="uppercase tracking-[0.3em] text-sm">INICIAR EXÁMENES</span>
                </div>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {MODULES.map(module => (
                <ModuleCard key={module.id} module={module} onClick={() => handleModuleSelect(module)} />
              ))}
            </div>

            <div className="mt-24 p-16 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[4rem] text-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
                  <svg className="w-80 h-80 rotate-12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.1c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
               </div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                  <div className="flex-1">
                    <h3 className="text-4xl font-black mb-8 tracking-tight">Metodología de Aprendizaje Dinámico</h3>
                    <p className="text-slate-300 text-xl leading-relaxed mb-10 font-bold">
                      Este sistema integra un glosario contextual inteligente. Al estudiar las tarjetas, los términos subrayados revelarán su definición técnica al pasar el mouse, facilitando la retención visual y cognitiva de la arquitectura de datos.
                    </p>
                    <div className="flex flex-wrap gap-6">
                       <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-blue-200 bg-white/5 px-7 py-4 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                          <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span> Tarjetas Quizlet PDF
                       </div>
                       <div className="flex items-center gap-4 text-xs font-black uppercase tracking-[0.2em] text-blue-200 bg-white/5 px-7 py-4 rounded-[1.5rem] border border-white/10 backdrop-blur-md">
                          <span className="w-2.5 h-2.5 bg-blue-400 rounded-full"></span> Análisis E-R Interactivo
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : isLabActive && activeModule.interactiveCases ? (
           <InteractiveLab cases={activeModule.interactiveCases} onExit={() => setIsLabActive(false)} glossary={glossary} />
        ) : (
          <CardView 
            card={activeModule.cards[currentCardIndex]}
            currentIndex={currentCardIndex}
            total={activeModule.cards.length}
            isFlipped={isFlipped}
            onFlip={handleFlip}
            onNext={handleNext}
            onPrev={handlePrev}
            onExit={() => setActiveModule(null)}
            onStartLab={() => setIsLabActive(true)}
            hasLab={!!activeModule.interactiveCases}
            glossary={glossary}
          />
        )}
      </main>

      <GlossaryModal isOpen={isGlossaryOpen} onClose={() => setIsGlossaryOpen(false)} glossary={glossary} />

      <footer className="py-16 bg-white border-t border-slate-100 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="flex items-center gap-4 opacity-50 hover:opacity-100 transition-opacity">
             <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg">DB</div>
             <p className="text-slate-950 text-base font-black tracking-tighter uppercase leading-none">DB-Master Pro v6.0</p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.5em] mb-2">PROYECTO ACADÉMICO ITSE 2024</p>
            <p className="text-slate-300 text-[9px] font-bold">Arquitectura de Software y Gestión de Datos Avanzada</p>
          </div>
          <div className="flex gap-5">
             <div className="w-3 h-3 rounded-full bg-blue-500 shadow-lg shadow-blue-500/20"></div>
             <div className="w-3 h-3 rounded-full bg-amber-500 shadow-lg shadow-amber-500/20"></div>
             <div className="w-3 h-3 rounded-full bg-red-500 shadow-lg shadow-red-500/20"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
