import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { AnalysisType } from '@/types/analysis';

interface AnalysisFormProps {
  onSubmit: (data: { title: string; type: AnalysisType; note: string; image?: File }) => Promise<void>;
  isSubmitting?: boolean;
}

export function AnalysisForm({ onSubmit, isSubmitting }: AnalysisFormProps) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<AnalysisType>('forecast');
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setType('forecast');
    setNote('');
    setImageFile(undefined);
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    if (!note.trim()) {
      setError('Note is required.');
      return;
    }

    try {
      await onSubmit({
        title: title.trim(),
        type,
        note: note.trim(),
        image: imageFile,
      });
      resetForm();
    } catch (err) {
      console.error('Failed to submit analysis entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to save analysis entry.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Analysis</CardTitle>
        <CardDescription>Capture trade forecasts or your weekly analysis for future reference.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="analysis-title">Title</Label>
            <Input
              id="analysis-title"
              placeholder="e.g., EURUSD Forecast"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="analysis-type">Category</Label>
            <select
              id="analysis-type"
              className="w-full bg-input border rounded px-3 py-2"
              value={type}
              onChange={(event) => setType(event.target.value as AnalysisType)}
            >
              <option value="forecast">Trade Forecast</option>
              <option value="weekly">Weekly Analysis</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="analysis-image">Image (optional)</Label>
            <Input
              id="analysis-image"
              type="file"
              accept="image/*"
              onChange={(event) => setImageFile(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">
              Upload a chart screenshot or any supporting visual you would like to store with this note.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="analysis-note">Notes</Label>
            <Textarea
              id="analysis-note"
              placeholder="Add your detailed analysis, expectations, and key levels..."
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={6}
              required
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Saving Analysis...' : 'Save Analysis'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

