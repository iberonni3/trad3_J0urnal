import { supabase } from '@/integrations/supabase/client';

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  title: string;
  content: string;
  tags: string[];
  mood?: string;
  performance?: string;
  pnl: number;
  trades_count: number;
  lessons?: string;
  improvements?: string;
  hidden: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  user_id: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  importance: string;
  times_applied: number;
  success_rate: number;
  related_entries: string[];
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all journal entries for a user
 */
export const getUserJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }

  return data || [];
};

/**
 * Create a new journal entry
 */
export const createJournalEntry = async (entry: Omit<JournalEntry, 'id' | 'created_at' | 'updated_at'>): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .insert([entry])
    .select()
    .single();

  if (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }

  return data;
};

/**
 * Update a journal entry
 */
export const updateJournalEntry = async (id: string, updates: Partial<JournalEntry>): Promise<JournalEntry> => {
  const { data, error } = await supabase
    .from('journal_entries')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating journal entry:', error);
    throw error;
  }

  return data;
};

/**
 * Delete a journal entry
 */
export const deleteJournalEntry = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting journal entry:', error);
    throw error;
  }
};

/**
 * Fetch all lessons for a user
 */
export const getUserLessons = async (userId: string): Promise<Lesson[]> => {
  const { data, error } = await supabase
    .from('lessons_library')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lessons:', error);
    throw error;
  }

  return data || [];
};

/**
 * Create a new lesson
 */
export const createLesson = async (lesson: Omit<Lesson, 'id' | 'created_at' | 'updated_at'>): Promise<Lesson> => {
  const { data, error } = await supabase
    .from('lessons_library')
    .insert([lesson])
    .select()
    .single();

  if (error) {
    console.error('Error creating lesson:', error);
    throw error;
  }

  return data;
};

/**
 * Update a lesson
 */
export const updateLesson = async (id: string, updates: Partial<Lesson>): Promise<Lesson> => {
  const { data, error } = await supabase
    .from('lessons_library')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lesson:', error);
    throw error;
  }

  return data;
};

/**
 * Delete a lesson
 */
export const deleteLesson = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('lessons_library')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lesson:', error);
    throw error;
  }
};
