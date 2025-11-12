export type AnalysisType = 'forecast' | 'weekly';

export interface AnalysisEntry {
  id: string;
  userId: string;
  title: string;
  type: AnalysisType;
  note: string;
  imageUrl?: string;
  imagePath?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AnalysisInput {
  title: string;
  type: AnalysisType;
  note: string;
  image?: File;
}

