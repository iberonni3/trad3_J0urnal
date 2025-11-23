import { supabase } from '@/integrations/supabase/client';
import type { AnalysisEntry, AnalysisInput } from '@/types/analysis';

type AnalysisRow = {
  id: string;
  user_id: string;
  title: string;
  type: string;
  note: string;
  image_url: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
};

const mapEntry = (row: AnalysisRow): AnalysisEntry => ({
  id: row.id,
  userId: row.user_id,
  title: row.title,
  type: row.type as AnalysisEntry['type'],
  note: row.note,
  imageUrl: row.image_url ?? undefined,
  imagePath: row.image_path ?? undefined,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const missingTableError = (error: any) => {
  if (error?.code === '42P01') {
    const err = new Error('Supabase table "analysis_entries" not found. Apply the analysis SQL migration.');
    (err as any).code = 'TABLE_NOT_FOUND';
    return err;
  }
  return error;
};

const uploadImage = async (userId: string, file: File) => {
  const path = `${userId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('analysis-images').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from('analysis-images').getPublicUrl(path);
  return { url: data.publicUrl, path };
};

export const fetchAnalysisEntries = async (userId: string): Promise<AnalysisEntry[]> => {
  const { data, error } = await supabase
    .from('analysis_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw missingTableError(error);
  return (data ?? []).map(mapEntry);
};

export const createAnalysisEntry = async (userId: string, input: AnalysisInput): Promise<AnalysisEntry> => {
  let uploadResult: { url: string; path: string } | null = null;
  if (input.image) {
    try {
      uploadResult = await uploadImage(userId, input.image);
    } catch (uploadError) {
      console.error('❌ Failed to upload analysis image (likely missing bucket):', uploadError);
      // Proceed without image, but maybe we should warn the caller?
      // For now, we just log it and save the note without the image.
    }
  }

  const { data, error } = await supabase
    .from('analysis_entries')
    .insert({
      user_id: userId,
      title: input.title,
      type: input.type,
      note: input.note,
      image_url: uploadResult?.url ?? null,
      image_path: uploadResult?.path ?? null,
    })
    .select()
    .single();

  if (error) throw missingTableError(error);
  if (!data) throw new Error('Failed to create analysis entry.');

  return mapEntry(data);
};

export const deleteAnalysisEntry = async (userId: string, entryId: string) => {
  const { error } = await supabase
    .from('analysis_entries')
    .delete()
    .eq('id', entryId)
    .eq('user_id', userId);

  if (error) throw missingTableError(error);
};

