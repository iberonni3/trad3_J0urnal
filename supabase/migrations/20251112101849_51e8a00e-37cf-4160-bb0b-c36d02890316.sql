-- Create journal_entries table for trading journal
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  mood TEXT,
  performance TEXT,
  pnl NUMERIC DEFAULT 0,
  trades_count INTEGER DEFAULT 1,
  lessons TEXT,
  improvements TEXT,
  hidden BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own journal entries"
ON public.journal_entries
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own journal entries"
ON public.journal_entries
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own journal entries"
ON public.journal_entries
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own journal entries"
ON public.journal_entries
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_journal_entries_updated_at
BEFORE UPDATE ON public.journal_entries
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Create lessons_library table
CREATE TABLE IF NOT EXISTS public.lessons_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  importance TEXT DEFAULT 'medium',
  times_applied INTEGER DEFAULT 0,
  success_rate NUMERIC DEFAULT 0,
  related_entries UUID[] DEFAULT ARRAY[]::UUID[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.lessons_library ENABLE ROW LEVEL SECURITY;

-- Create policies for lessons library
CREATE POLICY "Users can view their own lessons"
ON public.lessons_library
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own lessons"
ON public.lessons_library
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own lessons"
ON public.lessons_library
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own lessons"
ON public.lessons_library
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_lessons_library_updated_at
BEFORE UPDATE ON public.lessons_library
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();