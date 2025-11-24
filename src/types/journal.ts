export type JournalMood = 'confident' | 'focused' | 'neutral' | 'frustrated' | string;
export type JournalPerformance = 'excellent' | 'good' | 'average' | 'poor' | string;
export type LessonImportance = 'high' | 'medium' | 'low' | string;

export interface JournalEntryRecord {
  id: string;
  userId: string;
  accountId?: string | null;
  tradeId?: string | null;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood: JournalMood;
  performance: JournalPerformance;
  pnl: number;
  tradesCount: number;
  lessons: string;
  improvements: string;
  hidden: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalEntryInput extends Omit<JournalEntryRecord, 'id' | 'userId' | 'createdAt' | 'updatedAt'> { }

export interface JournalLesson {
  id: string;
  userId: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  dateAdded: string;
  importance: LessonImportance;
  timesApplied: number;
  successRate: number;
  relatedEntries: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface JournalLessonInput extends Omit<JournalLesson, 'id' | 'userId' | 'createdAt' | 'updatedAt'> { }

