
export interface Flashcard {
  id: string;
  front: string;
  back: string;
  type: 'definition' | 'conceptual' | 'practical' | 'exam';
}

export interface InteractiveCase {
  id: string;
  title: string;
  scenario: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  tableData?: any[];
}

export interface Module {
  id: number;
  title: string;
  unit: string;
  color: string;
  cards: Flashcard[];
  interactiveCases?: InteractiveCase[];
}
