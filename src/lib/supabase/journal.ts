import { supabase } from '@/integrations/supabase/client';
import type {
  JournalEntryRecord,
  JournalEntryInput,
  JournalLesson,
  JournalLessonInput,
} from '@/types/journal';

type JournalEntryRow = {
  id: string;
  user_id: string;
  account_id?: string | null;
  trade_id: string | null;
  date: string;
  title: string;
  content: string;
  tags: string[] | null;
  mood: string | null;
  performance: string | null;
  pnl: number | null;
  trades_count: number | null;
  lessons: string | null;
  improvements: string | null;
  hidden: boolean | null;
  created_at?: string;
  updated_at?: string;
};

type JournalLessonRow = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  content: string;
  tags: string[] | null;
  date_added: string;
  importance: string | null;
  times_applied: number | null;
  success_rate: number | null;
  related_entries: string[] | null;
  created_at?: string;
  updated_at?: string;
};

const mapEntryRow = (row: JournalEntryRow): JournalEntryRecord => ({
  id: row.id,
  userId: row.user_id,
  accountId: row.account_id,
  tradeId: row.trade_id,
  date: row.date,
  title: row.title,
  content: row.content,
  tags: row.tags ?? [],
  mood: (row.mood ?? 'neutral') as JournalEntryRecord['mood'],
  performance: (row.performance ?? 'average') as JournalEntryRecord['performance'],
  pnl: Number(row.pnl ?? 0),
  tradesCount: Number(row.trades_count ?? 0),
  lessons: row.lessons ?? '',
  improvements: row.improvements ?? '',
  hidden: Boolean(row.hidden),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapLessonRow = (row: JournalLessonRow): JournalLesson => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  category: row.category,
  content: row.content,
  tags: row.tags ?? [],
  dateAdded: row.date_added,
  importance: (row.importance ?? 'medium') as JournalLesson['importance'],
  timesApplied: Number(row.times_applied ?? 0),
  successRate: Number(row.success_rate ?? 0),
  relatedEntries: row.related_entries ?? [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const toEntryInsert = (userId: string, entry: JournalEntryInput, accountId?: string | null) => ({
  user_id: userId,
  account_id: accountId ?? null,
  trade_id: entry.tradeId ?? null,
  date: entry.date,
  title: entry.title,
  content: entry.content,
  tags: entry.tags,
  mood: entry.mood,
  performance: entry.performance,
  pnl: entry.pnl,
  trades_count: entry.tradesCount,
  lessons: entry.lessons,
  improvements: entry.improvements,
  hidden: entry.hidden,
});

const isMissingTableError = (error: any) => error?.code === '42P01';

const createMissingTableError = (tableName: string) => {
  const err = new Error(
    `Supabase table "${tableName}" was not found. Add the journal schema migration or adjust the journal storage configuration.`,
  );
  (err as any).code = 'TABLE_NOT_FOUND';
  return err;
};

const toEntryUpdate = (updates: Partial<JournalEntryInput>) => ({
  trade_id: updates.tradeId === undefined ? undefined : updates.tradeId,
  date: updates.date ?? undefined,
  title: updates.title ?? undefined,
  content: updates.content ?? undefined,
  tags: updates.tags ?? undefined,
  mood: updates.mood ?? undefined,
  performance: updates.performance ?? undefined,
  pnl: updates.pnl ?? undefined,
  trades_count: updates.tradesCount ?? undefined,
  lessons: updates.lessons ?? undefined,
  improvements: updates.improvements ?? undefined,
  hidden: updates.hidden ?? undefined,
  updated_at: new Date().toISOString(),
});

const toLessonInsert = (userId: string, lesson: JournalLessonInput) => ({
  user_id: userId,
  title: lesson.title,
  category: lesson.category,
  content: lesson.content,
  tags: lesson.tags,
  date_added: lesson.dateAdded,
  importance: lesson.importance,
  times_applied: lesson.timesApplied,
  success_rate: lesson.successRate,
  related_entries: lesson.relatedEntries,
});

const toLessonUpdate = (updates: Partial<JournalLessonInput>) => ({
  title: updates.title ?? undefined,
  category: updates.category ?? undefined,
  content: updates.content ?? undefined,
  tags: updates.tags ?? undefined,
  date_added: updates.dateAdded ?? undefined,
  importance: updates.importance ?? undefined,
  times_applied: updates.timesApplied ?? undefined,
  success_rate: updates.successRate ?? undefined,
  related_entries: updates.relatedEntries ?? undefined,
  updated_at: new Date().toISOString(),
});

export const fetchJournalEntries = async (userId: string, accountId?: string | null): Promise<JournalEntryRecord[]> => {
  let query = supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId);

  if (accountId) {
    query = query.or(`account_id.eq.${accountId},account_id.is.null`);
  }

  const { data, error } = await query
    .order('date', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_entries');
    }
    throw new Error(error.message);
  }

  return (data ?? []).map(mapEntryRow);
};

export const createJournalEntry = async (
  userId: string,
  entry: JournalEntryInput,
  accountId?: string | null,
): Promise<JournalEntryRecord> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert(toEntryInsert(userId, entry, accountId))
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_entries');
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('Failed to create journal entry');

  return mapEntryRow(data);
};

export const updateJournalEntry = async (
  userId: string,
  entryId: string,
  updates: Partial<JournalEntryInput>,
): Promise<JournalEntryRecord> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(toEntryUpdate(updates))
    .eq('id', entryId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_entries');
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('Failed to update journal entry');

  return mapEntryRow(data);
};

export const deleteJournalEntry = async (userId: string, entryId: string) => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_entries');
    }
    throw new Error(error.message);
  }
};

export const fetchJournalLessons = async (userId: string): Promise<JournalLesson[]> => {
  const { data, error } = await supabase
    .from('journal_lessons')
    .select('*')
    .eq('user_id', userId)
    .order('date_added', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_lessons');
    }
    throw new Error(error.message);
  }

  return (data ?? []).map(mapLessonRow);
};

export const createJournalLesson = async (
  userId: string,
  lesson: JournalLessonInput,
): Promise<JournalLesson> => {
  const { data, error } = await supabase
    .from('journal_lessons')
    .insert(toLessonInsert(userId, lesson))
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_lessons');
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('Failed to create lesson');

  return mapLessonRow(data);
};

export const updateJournalLesson = async (
  userId: string,
  lessonId: string,
  updates: Partial<JournalLessonInput>,
): Promise<JournalLesson> => {
  const { data, error } = await supabase
    .from('journal_lessons')
    .update(toLessonUpdate(updates))
    .eq('id', lessonId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_lessons');
    }
    throw new Error(error.message);
  }
  if (!data) throw new Error('Failed to update lesson');

  return mapLessonRow(data);
};

export const deleteJournalLesson = async (userId: string, lessonId: string) => {
  const { error } = await supabase
    .from('journal_lessons')
    .delete()
    .eq('id', lessonId)
    .eq('user_id', userId);

  if (error) {
    if (isMissingTableError(error)) {
      throw createMissingTableError('journal_lessons');
    }
    throw new Error(error.message);
  }
};

