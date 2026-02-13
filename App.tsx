
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { MODULES, FINAL_EXAM_QUESTIONS } from './data';
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

// Global Exam Component
const GlobalExam: React.FC<{ 
  questions: InteractiveCase[]; 
  onExit: () => void 
}> = ({ questions, onExit }) => {
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

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100);
    let grade = "F";
    if (percentage >= 90) grade = "A+";
    else if (percentage >= 80) grade = "A";
    else if (percentage >= 70) grade = "B";
    else if (percentage >= 60) grade = "C";

    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center animate-in zoom-in duration-500">
        <div className="bg-slate-900 text-white rounded-[2rem] p-12 shadow-2xl border border-blue-500/30">
          <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-black shadow-lg shadow-blue-500/50 text-white">
            {grade}
          </div>
          <h2 className="text-3xl font-bold mb-2">Simulacro Finalizado</h2>
          <p className="text-slate-400 mb-8">Evaluación técnica basada en los 148 ítems del PDF.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Aciertos</p>
              <p className="text-3xl font-bold text-green-400">{score} / {questions.length}</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
              <p className="text-xs uppercase tracking-widest text-slate-500 font-bold mb-1">Efectividad</p>
              <p className="text-3xl font-bold text-blue-400">{percentage}%</p>
            </div>
          </div>

          <button 
            onClick={onExit}
            className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg active:scale-95"
          >
            Volver al Panel de Estudio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onExit} className="text-slate-500 hover:text-slate-800 transition-colors">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
          <span className="text-xs font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Examen Quizlet PDF</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Pregunta {currentIndex + 1} de {questions.length}</span>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-10 border-b border-slate-100">
           <p className="text-xs font-bold text-blue-600 uppercase mb-2 tracking-widest">{currentQuestion.title}</p>
           <h3 className="text-2xl font-black text-slate-900 leading-tight">{currentQuestion.question}</h3>
           <p className="text-slate-600 mt-4 text-base italic font-medium">Escenario: {currentQuestion.scenario}</p>
        </div>

        <div className="p-10 space-y-4">
          {currentQuestion.options.map((opt, idx) => {
            const isCorrect = idx === currentQuestion.correctAnswer;
            const isSelected = selectedOption === idx;
            let btnClass = "bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50";
            
            if (isAnswered) {
              if (isCorrect) btnClass = "bg-green-100 border-green-500 text-green-900";
              else if (isSelected) btnClass = "bg-red-100 border-red-500 text-red-900";
              else btnClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
            } else if (isSelected) {
              btnClass = "bg-blue-100 border-blue-600 text-blue-900";
            }

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleSelect(idx)}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex justify-between items-center group font-black text-lg shadow-sm ${btnClass}`}
              >
                <span>{opt}</span>
                {isAnswered && isCorrect && <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>}
              </button>
            );
          })}
        </div>

        {isAnswered && (
          <div className="p-10 bg-slate-50 border-t border-slate-100 animate-in slide-in-from-bottom-2">
            <p className="text-xs font-black uppercase text-slate-500 mb-2 tracking-widest">Base de Conocimiento</p>
            <p className="text-lg text-slate-900 mb-8 leading-relaxed font-bold">{currentQuestion.explanation}</p>
            <button 
              onClick={nextQuestion}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
            >
              {currentIndex === questions.length - 1 ? 'Finalizar Examen' : 'Continuar al Siguiente Ítem'}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl max-h-[80vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-2xl font-black text-slate-800">Glosario Técnico PDF</h2>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Definiciones Maestro 2024</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 space-y-4">
          {sortedTerms.map(term => (
            <div key={term} className="group p-5 rounded-2xl hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all">
              <h3 className="font-black text-blue-700 text-sm uppercase tracking-wider mb-2">{term}</h3>
              <p className="text-slate-900 text-sm leading-relaxed font-bold">{glossary[term]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ onOpenGlossary: () => void }> = ({ onOpenGlossary }) => (
  <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
    <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white font-black shadow-lg">DB</div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Master Quizlet</h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-blue-600 font-black">Guía Completa PDF 2024</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button 
          onClick={onOpenGlossary}
          className="text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 flex items-center gap-2 px-5 py-3 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 shadow-sm bg-white"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          Glosario PDF
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
      className={`p-8 border-l-8 rounded-[2rem] bg-white shadow-xl transition-all text-left flex flex-col gap-3 hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] ${colorMap[module.color] || "border-slate-500"}`}
    >
      <span className="text-xs font-black uppercase tracking-widest opacity-60">{module.unit}</span>
      <h3 className="text-xl font-black text-slate-900 leading-tight">{module.title}</h3>
      <div className="mt-6 flex items-center justify-between w-full">
        <div className="flex gap-2">
          <span className="text-[11px] bg-slate-100 px-3 py-1.5 rounded-lg text-slate-600 font-black uppercase tracking-tighter">{module.cards.length} tarjetas</span>
          {module.interactiveCases && (
             <span className="text-[11px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-black uppercase tracking-tighter">Lab</span>
          )}
        </div>
        <span className="text-sm font-black text-blue-600">Explorar →</span>
      </div>
    </button>
  );
};

const InteractiveLab: React.FC<{ cases: InteractiveCase[]; onExit: () => void }> = ({ cases, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const currentCase = cases[currentIndex];

  const handleOptionSelect = (index: number) => { 
    if (isAnswered) return; 
    setSelectedOption(index); 
  };

  const checkAnswer = () => { 
    if (selectedOption === null) return; 
    setIsAnswered(true); 
  };

  const nextCase = () => {
    if (currentIndex < cases.length - 1) { 
      setCurrentIndex(prev => prev + 1); 
      setSelectedOption(null); 
      setIsAnswered(false); 
    } else { 
      onExit(); 
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 animate-in slide-in-from-right duration-300">
       <div className="flex justify-between items-center mb-8">
        <button onClick={onExit} className="text-slate-500 hover:text-slate-800 font-black flex items-center gap-2 uppercase tracking-widest text-xs">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Salir al Panel
        </button>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CASO DE LABORATORIO {currentIndex + 1} / {cases.length}</span>
      </div>
      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 p-10 text-white">
          <div className="flex items-center gap-3 mb-6">
             <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></div>
             <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em]">Laboratorio Interactivo</span>
          </div>
          <h3 className="text-3xl font-black mb-6 leading-tight text-white">{currentCase.title}</h3>
          <p className="text-slate-200 mb-8 leading-relaxed italic border-l-4 border-blue-600 pl-6 text-xl font-bold">"{currentCase.scenario}"</p>
          <div className="bg-blue-600/20 border-2 border-blue-500/30 p-6 rounded-2xl"><p className="font-black text-xl text-white">{currentCase.question}</p></div>
        </div>

        <div className="p-10 space-y-4">
          {currentCase.options.map((option, idx) => {
            const isCorrect = idx === currentCase.correctAnswer;
            const isSelected = selectedOption === idx;
            
            let btnClass = "bg-white border-slate-200 text-slate-900 hover:border-blue-400 hover:bg-blue-50";
            if (isAnswered) {
              if (isCorrect) {
                btnClass = "bg-green-100 border-green-600 text-green-900";
              } else if (isSelected) {
                btnClass = "bg-red-100 border-red-600 text-red-900";
              } else {
                btnClass = "bg-slate-50 border-slate-200 text-slate-500 opacity-60";
              }
            } else if (isSelected) {
              btnClass = "bg-blue-100 border-blue-600 text-blue-900";
            }

            return (
              <button 
                key={idx} 
                disabled={isAnswered} 
                onClick={() => handleOptionSelect(idx)}
                className={`w-full text-left p-6 rounded-2xl border-2 transition-all flex items-center justify-between group shadow-sm font-black text-lg ${btnClass}`}
              >
                <span>{option}</span>
                {isAnswered && isCorrect && (
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>

        <div className="px-10 pb-10 flex flex-col items-center">
          {!isAnswered ? (
            <button 
              onClick={checkAnswer} 
              disabled={selectedOption === null} 
              className={`w-full py-6 rounded-[1.5rem] font-black uppercase tracking-widest transition-all shadow-xl ${selectedOption === null ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
            >
              Confirmar Respuesta Final
            </button>
          ) : (
            <div className="w-full text-center">
              <div className={`mb-8 p-6 rounded-2xl text-base font-bold text-left animate-in fade-in slide-in-from-top-2 shadow-inner border-2 ${selectedOption === currentCase.correctAnswer ? 'bg-green-50 border-green-200 text-green-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-black uppercase tracking-widest ${selectedOption === currentCase.correctAnswer ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                    {selectedOption === currentCase.correctAnswer ? '¡Respuesta Exitosa!' : 'Necesitas Repasar'}
                  </span>
                </div>
                <p className="leading-relaxed font-black text-xl text-slate-900">{currentCase.explanation}</p>
                {selectedOption !== currentCase.correctAnswer && (
                  <div className="mt-4 p-5 bg-white/70 rounded-2xl border-2 border-red-100 flex items-start gap-4 shadow-sm">
                    <div className="p-2 bg-red-100 rounded-lg">
                       <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-red-800 uppercase tracking-tight mb-1">TIP DE REPASO</p>
                      <p className="text-sm font-black text-red-700 leading-snug">Vuelve al glosario y revisa el término clave de esta pregunta. Según el PDF, este concepto es vital para dominar la normalización y la calidad de datos.</p>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={nextCase} className="w-full py-6 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-slate-800 active:scale-95 transition-all shadow-lg">
                {currentIndex === cases.length - 1 ? 'Finalizar Laboratorio' : 'Siguiente Caso de Estudio'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const CardView: React.FC<{ card: Flashcard; currentIndex: number; total: number; isFlipped: boolean; onFlip: () => void; onNext: () => void; onPrev: () => void; onExit: () => void; onStartLab?: () => void; hasLab?: boolean; glossary: Record<string, string>; }> = ({ card, currentIndex, total, isFlipped, onFlip, onNext, onPrev, onExit, onStartLab, hasLab, glossary }) => {
  const typeLabels: Record<string, string> = { definition: "Definición", conceptual: "Concepto PDF", practical: "Práctica", exam: "Examen" };
  const typeColors: Record<string, string> = { definition: "bg-blue-100 text-blue-700", conceptual: "bg-purple-100 text-purple-700", practical: "bg-orange-100 text-orange-700", exam: "bg-red-100 text-red-700" };
  const progressPercentage = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 flex flex-col items-center">
      <div className="w-full mb-10">
        <div className="flex justify-between items-center mb-6">
          <button onClick={onExit} className="text-slate-500 hover:text-slate-800 font-black uppercase tracking-widest text-xs flex items-center gap-2 group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>Panel Principal
          </button>
          <div className="text-right">
             <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full mb-1 inline-block uppercase tracking-[0.2em]">Sesión de Estudio</span>
          </div>
        </div>
        <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out" style={{ width: `${progressPercentage}%` }} />
        </div>
        <div className="mt-2 text-right">
           <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{currentIndex + 1} de {total}</span>
        </div>
      </div>

      <div className="w-full h-[500px] perspective-1000 cursor-pointer group" onClick={onFlip}>
        <div className={`relative w-full h-full transition-transform duration-700 preserve-3d shadow-2xl rounded-[3rem] ${isFlipped ? 'rotate-y-180' : ''}`}>
          <div className="absolute inset-0 bg-white backface-hidden rounded-[3rem] p-12 flex flex-col items-center justify-center text-center border-2 border-slate-100">
            <span className={`px-5 py-2 rounded-full text-[11px] font-black uppercase mb-10 tracking-[0.3em] shadow-sm ${typeColors[card.type]}`}>{typeLabels[card.type]}</span>
            <div className="text-4xl font-black text-slate-900 leading-[1.3] max-w-lg"><HighlightedText text={card.front} glossary={glossary} /></div>
            <div className="absolute bottom-12 flex flex-col items-center gap-3 text-slate-300">
               <svg className="w-8 h-8 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"/></svg>
               <p className="text-[11px] font-black uppercase tracking-[0.4em]">Voltear Tarjeta</p>
            </div>
          </div>
          <div className="absolute inset-0 bg-slate-950 backface-hidden rounded-[3rem] p-12 flex flex-col items-center justify-center text-center rotate-y-180 border-4 border-slate-800 shadow-[inset_0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="w-16 h-1.5 bg-blue-600 rounded-full mb-12"></div>
            <div className="text-3xl font-black text-white leading-relaxed max-w-xl italic"><HighlightedText text={card.back} glossary={glossary} /></div>
            <div className="absolute bottom-12 text-[11px] font-black text-blue-500 uppercase tracking-[0.5em]">Definición Verificada</div>
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-6 mt-10">
        <button onClick={(e) => { e.stopPropagation(); onPrev(); }} disabled={currentIndex === 0} className={`py-5 rounded-2xl font-black uppercase tracking-widest border-2 transition-all ${currentIndex === 0 ? 'border-slate-100 text-slate-300 cursor-not-allowed' : 'border-slate-200 text-slate-700 hover:border-blue-600 hover:text-blue-600 active:scale-95 bg-white shadow-lg'}`}>Anterior</button>
        <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest transition-all hover:bg-blue-700 active:scale-95 shadow-2xl shadow-blue-600/30">
           {currentIndex === total - 1 ? 'Reiniciar Unidad' : 'Siguiente'}
        </button>
      </div>

      {hasLab && (
         <button onClick={onStartLab} className="mt-8 w-full py-6 rounded-[1.5rem] bg-slate-900 text-white font-black uppercase tracking-[0.2em] transition-all hover:bg-indigo-700 flex items-center justify-center gap-4 shadow-2xl group">
          <svg className="w-6 h-6 text-blue-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a2 2 0 00-1.96 1.414l-.477 2.387a2 2 0 00.547 1.022l1.428 1.428a2 2 0 001.022.547l2.387.477a2 2 0 001.96-1.414l.477-2.387a2 2 0 00-.547-1.022l-1.428-1.428z"/></svg>
          Resolver Laboratorios de la Unidad
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
          if (cleanTerm.length > 2) map[cleanTerm] = card.back;
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      <Header onOpenGlossary={() => setIsGlossaryOpen(true)} />
      
      <main className="flex-1 w-full pb-12">
        {isExamActive ? (
          <GlobalExam questions={FINAL_EXAM_QUESTIONS} onExit={() => setIsExamActive(false)} />
        ) : !activeModule ? (
          <div className="max-w-6xl mx-auto px-6 py-12">
            <div className="mb-12 text-center md:text-left bg-white p-12 rounded-[3rem] border border-slate-200 shadow-2xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
               <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
              <div className="flex-1 relative z-10">
                <span className="text-blue-600 font-black text-[11px] uppercase tracking-[0.4em] mb-4 block">Capacitación Técnica Avanzada</span>
                <h2 className="text-5xl font-black text-slate-900 mb-6 leading-tight tracking-tight">Especialista en Bases de Datos</h2>
                <p className="text-slate-700 max-w-lg text-lg leading-relaxed font-black">Domina los 148 ítems del Quizlet PDF 2024. Teoría, lógica y normalización 3FN en un solo lugar.</p>
              </div>
              <button 
                onClick={() => setIsExamActive(true)}
                className="w-full md:w-auto px-12 py-6 bg-slate-950 text-white font-black rounded-[1.5rem] shadow-2xl hover:bg-blue-600 transition-all active:scale-95 flex items-center justify-center gap-4 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <svg className="w-7 h-7 text-blue-400 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                INICIAR SIMULACRO FINAL
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MODULES.map(module => (
                <ModuleCard key={module.id} module={module} onClick={() => handleModuleSelect(module)} />
              ))}
            </div>

            <div className="mt-20 p-12 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] text-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] relative overflow-hidden">
               <div className="absolute top-0 right-0 p-12 opacity-10">
                  <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 12.1c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
               </div>
               <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                  <div className="flex-1">
                    <h3 className="text-3xl font-black mb-6">Metodología de Repetición Quizlet</h3>
                    <p className="text-slate-300 text-lg leading-relaxed mb-8 font-black">
                      Cada una de las 150 tarjetas está vinculada a un glosario inteligente. Si ves un término subrayado, pasa el mouse para ver su definición instantánea. Este sistema está diseñado para que asocies conceptos en lugar de memorizarlos.
                    </p>
                    <div className="flex flex-wrap gap-5">
                       <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-blue-200 bg-white/10 px-5 py-2.5 rounded-full border border-white/10">
                          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> 150 Tarjetas Activas
                       </div>
                       <div className="flex items-center gap-3 text-[11px] font-black uppercase tracking-widest text-blue-200 bg-white/10 px-5 py-2.5 rounded-full border border-white/10">
                          <span className="w-2 h-2 bg-blue-400 rounded-full"></span> Labs de Casos PDF
                       </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        ) : isLabActive && activeModule.interactiveCases ? (
           <InteractiveLab cases={activeModule.interactiveCases} onExit={() => setIsLabActive(false)} />
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

      <footer className="py-12 bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3 opacity-60">
             <div className="w-8 h-8 bg-slate-900 rounded-xl flex items-center justify-center text-white text-[11px] font-black">DB</div>
             <p className="text-slate-950 text-sm font-black tracking-tight uppercase">DB-Master Professional v5.0</p>
          </div>
          <p className="text-slate-700 text-[10px] font-black uppercase tracking-[0.3em] text-center italic">Basado en el Silabo Académico ITSE 2024</p>
          <div className="flex gap-4">
             <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
             <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
          </div>
        </div>
      </footer>
    </div>
  );
}
