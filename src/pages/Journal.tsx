import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Plus,
  Search,
  Filter,
  BookOpen,
  Calendar,
  Tag,
  TrendingUp,
  TrendingDown,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Check,
  Lightbulb,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  fetchJournalEntries,
  fetchJournalLessons,
  createJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  createJournalLesson,
  updateJournalLesson,
  deleteJournalLesson,
} from '@/lib/supabase/journal';
import type {
  JournalEntryRecord,
  JournalEntryInput,
  JournalLesson,
  JournalLessonInput,
  JournalMood,
  JournalPerformance,
  LessonImportance
} from '@/types/journal';

type JournalEntryFormState = JournalEntryInput & { id?: string; newTag?: string };
type JournalLessonFormState = JournalLessonInput & { id?: string; newTag?: string };

const lessonCategories = [
  'All Categories',
  'Risk Management',
  'Entry Signals',
  'Psychology',
  'Technical Analysis',
  'Fundamentals',
  'Exit Strategy',
  'Position Sizing'
];

export default function Journal() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const userId = user?.id ?? null;

  const [activeTab, setActiveTab] = useState('entries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [journalEntries, setJournalEntries] = useState<JournalEntryRecord[]>([]);
  const [lessonsLibrary, setLessonsLibrary] = useState<JournalLesson[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<JournalEntryFormState | JournalLessonFormState | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [entryType, setEntryType] = useState<'journal' | 'lesson'>('journal');
  const [entriesLoading, setEntriesLoading] = useState(false);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const entryToFormState = (entry: JournalEntryRecord): JournalEntryFormState => ({
    id: entry.id,
    tradeId: entry.tradeId ?? null,
    date: entry.date,
    title: entry.title,
    content: entry.content,
    tags: [...entry.tags],
    mood: entry.mood,
    performance: entry.performance,
    pnl: entry.pnl,
    tradesCount: entry.tradesCount,
    lessons: entry.lessons,
    improvements: entry.improvements,
    hidden: entry.hidden,
    newTag: '',
  });

  const lessonToFormState = (lesson: JournalLesson): JournalLessonFormState => ({
    id: lesson.id,
    title: lesson.title,
    category: lesson.category,
    content: lesson.content,
    tags: [...lesson.tags],
    dateAdded: lesson.dateAdded,
    importance: lesson.importance,
    timesApplied: lesson.timesApplied,
    successRate: lesson.successRate,
    relatedEntries: [...lesson.relatedEntries],
    newTag: '',
  });

  const ensureAuthenticated = useCallback(() => {
    if (!userId) {
      toast({
        title: 'Sign in required',
        description: 'Please sign in to manage your journal entries.',
        variant: 'destructive',
      });
      return false;
    }
    return true;
  }, [toast, userId]);

  const loadEntries = useCallback(async () => {
    if (!userId) return;
    const entries = await fetchJournalEntries(userId);
    setJournalEntries(entries);
  }, [userId]);

  const loadLessons = useCallback(async () => {
    if (!userId) return;
    const lessons = await fetchJournalLessons(userId);
    setLessonsLibrary(lessons);
  }, [userId]);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setJournalEntries([]);
      setLessonsLibrary([]);
      setEntriesLoading(false);
      setLessonsLoading(false);
      return;
    }

    const loadData = async () => {
      setEntriesLoading(true);
      setLessonsLoading(true);
      try {
        await Promise.all([loadEntries(), loadLessons()]);
        setError(null);
      } catch (err) {
        console.error('Error loading journal data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load journal data.');
      } finally {
        setEntriesLoading(false);
        setLessonsLoading(false);
      }
    };

    void loadData();
  }, [authLoading, userId, loadEntries, loadLessons]);

  const filteredEntries = useMemo(() => {
    return journalEntries.filter((entry) => {
      if (entry.hidden && !showHidden) return false;

      const needle = searchTerm.trim().toLowerCase();
      const matchesSearch =
        needle.length === 0 ||
        entry.title.toLowerCase().includes(needle) ||
        entry.content.toLowerCase().includes(needle) ||
        entry.tags.some((tag) => tag.toLowerCase().includes(needle));

      const matchesFilter = selectedFilter === 'all' || entry.performance === selectedFilter;

      return matchesSearch && matchesFilter;
    });
  }, [journalEntries, searchTerm, selectedFilter, showHidden]);

  const filteredLessons = useMemo(() => {
    return lessonsLibrary.filter((lesson) => {
      const needle = searchTerm.trim().toLowerCase();
      const matchesSearch =
        needle.length === 0 ||
        lesson.title.toLowerCase().includes(needle) ||
        lesson.content.toLowerCase().includes(needle) ||
        lesson.tags.some((tag) => tag.toLowerCase().includes(needle));

      const matchesCategory = selectedCategory === 'All Categories' || lesson.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [lessonsLibrary, searchTerm, selectedCategory]);

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'confident': return 'text-green-400';
      case 'frustrated': return 'text-red-400';
      case 'focused': return 'text-blue-400';
      case 'neutral': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Good</Badge>;
      case 'average':
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">Average</Badge>;
      case 'poor':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Poor</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">{performance}</Badge>;
    }
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><Star className="h-3 w-3 mr-1" />High</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Medium</Badge>;
      case 'low':
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Low</Badge>;
      default:
        return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Normal</Badge>;
    }
  };

  const formatPnL = (pnl: number) => {
    if (pnl === 0) return '$0.00';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setCurrentEntry(null);
    setIsEditing(false);
  };

  const handleNewEntry = (type: 'journal' | 'lesson' = 'journal') => {
    if (!ensureAuthenticated()) return;

    if (type === 'lesson') {
      setCurrentEntry({
        title: '',
        category: 'Risk Management',
        content: '',
        tags: [],
        dateAdded: new Date().toISOString().split('T')[0],
        importance: 'medium',
        timesApplied: 0,
        successRate: 0,
        relatedEntries: [],
        newTag: '',
      });
    } else {
      setCurrentEntry({
        tradeId: null,
        date: new Date().toISOString().split('T')[0],
        title: '',
        content: '',
        tags: [],
        mood: 'neutral',
        performance: 'average',
        pnl: 0,
        tradesCount: 1,
        lessons: '',
        improvements: '',
        hidden: false,
        newTag: '',
      });
    }

    setEntryType(type);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry: JournalEntryRecord | JournalLesson, type: 'journal' | 'lesson') => {
    if (!ensureAuthenticated()) return;

    if (type === 'lesson') {
      setCurrentEntry(lessonToFormState(entry as JournalLesson));
    } else {
      setCurrentEntry(entryToFormState(entry as JournalEntryRecord));
    }

    setEntryType(type);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!currentEntry) return;
    if (!ensureAuthenticated()) return;

    setIsSaving(true);

    try {
      if (entryType === 'lesson') {
        const { id, newTag, ...lessonPayload } = currentEntry as JournalLessonFormState;
        const payload: JournalLessonInput = {
          ...lessonPayload,
          tags: lessonPayload.tags ?? [],
          relatedEntries: lessonPayload.relatedEntries ?? [],
        };

        if (id) {
          await updateJournalLesson(userId!, id, payload);
          toast({ title: 'Lesson updated' });
        } else {
          await createJournalLesson(userId!, payload);
          toast({ title: 'Lesson added' });
        }

        await loadLessons();
      } else {
        const { id, newTag, ...entryPayload } = currentEntry as JournalEntryFormState;
        const payload: JournalEntryInput = {
          ...entryPayload,
          tradeId: entryPayload.tradeId ?? null,
          tags: entryPayload.tags ?? [],
        };

        if (id) {
          await updateJournalEntry(userId!, id, payload);
          toast({ title: 'Journal entry updated' });
        } else {
          await createJournalEntry(userId!, payload);
          toast({ title: 'Journal entry added' });
        }

        await loadEntries();
      }

      closeDialog();
      setError(null);
    } catch (err) {
      console.error('Error saving journal data:', err);
      setError(err instanceof Error ? err.message : 'Unable to save your changes right now.');
      toast({
        title: 'Failed to save',
        description: err instanceof Error ? err.message : 'Unable to save your changes right now.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteEntry = async (id: string, type: 'journal' | 'lesson') => {
    if (!ensureAuthenticated()) return;

    setIsSaving(true);
    try {
      if (type === 'lesson') {
        await deleteJournalLesson(userId!, id);
        await loadLessons();
        toast({ title: 'Lesson removed' });
        setError(null);
      } else {
        await deleteJournalEntry(userId!, id);
        await loadEntries();
        toast({ title: 'Journal entry removed' });
        setError(null);
      }
    } catch (err) {
      console.error('Error deleting journal data:', err);
      setError(err instanceof Error ? err.message : 'Unable to delete this item.');
      toast({
        title: 'Failed to delete',
        description: err instanceof Error ? err.message : 'Unable to delete this item.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleHide = async (id: string) => {
    if (!ensureAuthenticated()) return;
    const entry = journalEntries.find((item) => item.id === id);
    if (!entry) return;

    try {
      await updateJournalEntry(userId!, id, { hidden: !entry.hidden });
      setJournalEntries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, hidden: !item.hidden } : item))
      );
      setError(null);
    } catch (err) {
      console.error('Error updating entry visibility:', err);
      setError(err instanceof Error ? err.message : 'Unable to update entry visibility.');
      toast({
        title: 'Failed to update entry',
        description: err instanceof Error ? err.message : 'Unable to update entry visibility.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background mobile-container section-padding">
      <div className="max-w-7xl mx-auto content-spacing">
        {/* Header */}
        <div className="trading-card section-padding mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Trading Journal</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Document your trading journey, lessons learned, and psychological insights
              </p>
            </div>

            <Button
              className="trading-gradient text-white touch-friendly w-full sm:w-auto"
              onClick={() => handleNewEntry(activeTab === 'lessons' ? 'lesson' : 'journal')}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span className="mobile-hidden">{activeTab === 'lessons' ? 'New Lesson' : 'New Entry'}</span>
              <span className="mobile-only">{activeTab === 'lessons' ? 'Add Lesson' : 'Add Entry'}</span>
            </Button>
          </div>
        </div>

        {error && (
          <div className="trading-card mb-6 border border-destructive/40 bg-destructive/10 text-sm text-destructive">
            <div>{error}</div>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card border-border">
            <TabsTrigger value="entries" className="data-[state=active]:bg-background text-xs sm:text-sm">
              <span className="mobile-hidden">Daily Entries</span>
              <span className="mobile-only">Entries</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="data-[state=active]:bg-background text-xs sm:text-sm">
              <span className="mobile-hidden">Lessons Library</span>
              <span className="mobile-only">Lessons</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-background text-xs sm:text-sm">
              <span className="mobile-hidden">Insights</span>
              <span className="mobile-only">Stats</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="entries" className="space-y-6">
            {/* Filters */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="responsive-flex gap-4">
                  <div className="flex-1 order-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search entries by title, content, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="responsive-flex gap-2 order-2">
                    <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                      <SelectTrigger className="w-full sm:w-[140px] bg-card border-border">
                        <SelectValue placeholder="Performance" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="all">All Performance</SelectItem>
                        <SelectItem value="excellent">Excellent</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      variant={showHidden ? "default" : "outline"}
                      onClick={() => setShowHidden(!showHidden)}
                      className={cn(
                        "touch-friendly",
                        showHidden ? "trading-gradient text-white" : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                      )}
                    >
                      <EyeOff className="h-4 w-4 mr-2 mobile-hidden" />
                      <span className="mobile-hidden">{showHidden ? "Hide Hidden" : "Show Hidden"}</span>
                      <span className="mobile-only">Hidden</span>
                    </Button>

                    <Button variant="outline" className="border border-input bg-background hover:bg-accent hover:text-accent-foreground touch-friendly mobile-hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Journal Entries */}
            <div className="space-y-4">
              {entriesLoading ? (
                <div className="py-12 text-center text-muted-foreground">Loading journal entries...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">
                  {searchTerm || selectedFilter !== 'all' || showHidden
                    ? 'No journal entries match your filters.'
                    : 'No journal entries yet. Add your first entry to get started.'}
                </div>
              ) : (
                filteredEntries.map((entry) => (
                  <Card key={entry.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg text-white">{entry.title}</CardTitle>
                            {getPerformanceBadge(entry.performance)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-slate-400">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            <span>{entry.tradesCount} trades</span>
                            <span className={cn('font-medium', getPnLColor(entry.pnl))}>
                              {formatPnL(entry.pnl)}
                            </span>
                            <span className={cn('capitalize', getMoodColor(entry.mood))}>
                              {entry.mood}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleHide(entry.id)}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            {entry.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(entry, 'journal')}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id, 'journal')}
                            className="hover:bg-destructive/20 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-slate-300">{entry.content}</p>

                        <div className="space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Tags</h4>
                            <div className="flex gap-2 flex-wrap">
                              {entry.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs border-slate-600">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <h4 className="font-medium mb-1 text-green-400">Lessons Learned</h4>
                              <p className="text-slate-400">{entry.lessons}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1 text-blue-400">Areas for Improvement</h4>
                              <p className="text-slate-400">{entry.improvements}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            {/* Lesson Filters */}
            <Card className="bg-card border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="responsive-flex gap-4">
                  <div className="flex-1 order-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        placeholder="Search lessons by title, content, or tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>
                  </div>

                  <div className="responsive-flex gap-2 order-2">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full sm:w-[160px] bg-card border-border">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {lessonCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button variant="outline" className="border border-input bg-background hover:bg-accent hover:text-accent-foreground touch-friendly mobile-hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      More Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lessons Library */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lessonsLoading ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  Loading lessons...
                </div>
              ) : filteredLessons.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  {searchTerm || selectedCategory !== 'All Categories'
                    ? 'No lessons match your filters.'
                    : 'No lessons saved yet. Add lessons to build your playbook.'}
                </div>
              ) : (
                filteredLessons.map((lesson) => (
                  <Card key={lesson.id} className="bg-card border-border">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg text-white flex items-center gap-2">
                            <Lightbulb className="h-5 w-5 text-yellow-400" />
                            {lesson.title}
                          </CardTitle>
                          <div className="flex items-center gap-2">
                            <CardDescription className="text-slate-400">{lesson.category}</CardDescription>
                            {getImportanceBadge(lesson.importance)}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEntry(lesson, 'lesson')}
                            className="hover:bg-accent hover:text-accent-foreground"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEntry(lesson.id, 'lesson')}
                            className="hover:bg-destructive/20 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-sm leading-relaxed text-slate-300">{lesson.content}</p>

                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <div className="text-lg font-bold text-blue-400">{lesson.timesApplied}</div>
                            <div className="text-xs text-slate-500">Times Applied</div>
                          </div>
                          <div>
                            <div className="text-lg font-bold text-green-400">{lesson.successRate}%</div>
                            <div className="text-xs text-slate-500">Success Rate</div>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          {lesson.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs border-slate-600">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <p className="text-xs text-slate-500">
                          Added {new Date(lesson.dateAdded).toLocaleDateString()}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Psychological Patterns</CardTitle>
                  <CardDescription className="text-slate-400">Insights into your trading psychology</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-green-400" />
                        <h4 className="font-medium text-green-400">Confidence Pattern</h4>
                      </div>
                      <p className="text-sm text-slate-300">
                        Your best trades happen when you express confidence in your journal entries. Focus on setups that align with your highest conviction levels.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingDown className="h-4 w-4 text-red-400" />
                        <h4 className="font-medium text-red-400">Emotional Trading</h4>
                      </div>
                      <p className="text-sm text-slate-300">
                        Entries tagged with "frustrated" mood correlate with 73% higher loss rates. Consider implementing cooling-off periods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-white">Learning Progress</CardTitle>
                  <CardDescription className="text-slate-400">Track your development over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Risk Management</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full">
                          <div className="w-4/5 h-full bg-green-400 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300">80%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Entry Timing</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full">
                          <div className="w-3/5 h-full bg-blue-400 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300">60%</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-300">Psychology Control</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full">
                          <div className="w-2/5 h-full bg-red-400 rounded-full"></div>
                        </div>
                        <span className="text-sm font-medium text-slate-300">40%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Dynamic Entry Form Dialog */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-card border-border rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {entryType === 'lesson'
                    ? (isEditing ? 'Edit Lesson' : 'New Lesson')
                    : (isEditing ? 'Edit Journal Entry' : 'New Journal Entry')
                  }
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDialog}
                  className="hover:bg-accent hover:text-accent-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid gap-4">
                {entryType === 'lesson' ? (
                  // Lesson Form
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Lesson Title*</label>
                        <Input
                          value={currentEntry?.title || ''}
                          onChange={(e) => setCurrentEntry((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                          placeholder="Key lesson or principle"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Category*</label>
                        <Select
                          value={currentEntry?.category || ''}
                          onValueChange={(value) => setCurrentEntry((prev) => (prev ? { ...prev, category: value } : prev))}
                        >
                          <SelectTrigger className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            {lessonCategories.slice(1).map((category) => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Lesson Content*</label>
                      <Textarea
                        rows={4}
                        value={currentEntry?.content || ''}
                        onChange={(e) => setCurrentEntry((prev) => (prev ? { ...prev, content: e.target.value } : prev))}
                        placeholder="Describe the lesson in detail, including context and application"
                        className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Importance Level*</label>
                        <Select
                          value={currentEntry?.importance || ''}
                          onValueChange={(value) => setCurrentEntry((prev) => (prev ? { ...prev, importance: value } : prev))}
                        >
                          <SelectTrigger className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground">
                            <SelectValue placeholder="Select importance" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="high">High</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Times Applied</label>
                        <Input
                          type="number"
                          value={currentEntry?.timesApplied || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) =>
                              prev ? { ...prev, timesApplied: parseInt(e.target.value, 10) || 0 } : prev
                            )
                          }
                          placeholder="0"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Success Rate (%)</label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={currentEntry?.successRate || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) =>
                              prev ? { ...prev, successRate: parseInt(e.target.value, 10) || 0 } : prev
                            )
                          }
                          placeholder="0"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Tags</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={currentEntry?.newTag || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, newTag: e.target.value } : prev))
                          }
                          placeholder="Add tag (press Enter)"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setCurrentEntry((prev) => {
                                if (!prev) return prev;
                                const tagValue = prev.newTag?.trim();
                                if (!tagValue) return prev;
                                return {
                                  ...prev,
                                  tags: [...(prev.tags || []), tagValue],
                                  newTag: '',
                                };
                              });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentEntry((prev) => {
                              if (!prev) return prev;
                              const tagValue = prev.newTag?.trim();
                              if (!tagValue) return prev;
                              return {
                                ...prev,
                                tags: [...(prev.tags || []), tagValue],
                                newTag: '',
                              };
                            });
                          }}
                          className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentEntry?.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1 border-slate-600">
                            {tag}
                            <button
                              onClick={() => {
                                setCurrentEntry((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    tags: prev.tags?.filter((_, i) => i !== index) ?? [],
                                  };
                                });
                              }}
                              className="ml-1 hover:text-red-400 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  // Journal Entry Form
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Title*</label>
                        <Input
                          value={currentEntry?.title || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                          }
                          placeholder="Trade setup description"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Date*</label>
                        <Input
                          type="date"
                          value={currentEntry?.date || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, date: e.target.value } : prev))
                          }
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Trade Details*</label>
                      <Textarea
                        rows={4}
                        value={currentEntry?.content || ''}
                        onChange={(e) =>
                          setCurrentEntry((prev) => (prev ? { ...prev, content: e.target.value } : prev))
                        }
                        placeholder="Describe your trade execution, strategy, and observations"
                        className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Performance Rating*</label>
                        <Select
                          value={currentEntry?.performance || ''}
                          onValueChange={(value) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, performance: value } : prev))
                          }
                        >
                          <SelectTrigger className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground">
                            <SelectValue placeholder="Select rating" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="excellent">Excellent</SelectItem>
                            <SelectItem value="good">Good</SelectItem>
                            <SelectItem value="average">Average</SelectItem>
                            <SelectItem value="poor">Poor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Number of Trades*</label>
                        <Input
                          type="number"
                          value={currentEntry?.tradesCount || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) =>
                              prev ? { ...prev, tradesCount: parseInt(e.target.value, 10) || 0 } : prev
                            )
                          }
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Profit/Loss ($)*</label>
                        <Input
                          type="number"
                          value={currentEntry?.pnl || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) =>
                              prev ? { ...prev, pnl: parseFloat(e.target.value) || 0 } : prev
                            )
                          }
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Mood/Confidence*</label>
                        <Select
                          value={currentEntry?.mood || ''}
                          onValueChange={(value) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, mood: value } : prev))
                          }
                        >
                          <SelectTrigger className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground">
                            <SelectValue placeholder="Select mood" />
                          </SelectTrigger>
                          <SelectContent className="bg-card border-border">
                            <SelectItem value="confident">Confident</SelectItem>
                            <SelectItem value="focused">Focused</SelectItem>
                            <SelectItem value="neutral">Neutral</SelectItem>
                            <SelectItem value="frustrated">Frustrated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Tags</label>
                      <div className="flex gap-2 items-center">
                        <Input
                          value={currentEntry?.newTag || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, newTag: e.target.value } : prev))
                          }
                          placeholder="Add tag (press Enter)"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              setCurrentEntry((prev) => {
                                if (!prev) return prev;
                                const tagValue = prev.newTag?.trim();
                                if (!tagValue) return prev;
                                return {
                                  ...prev,
                                  tags: [...(prev.tags || []), tagValue],
                                  newTag: '',
                                };
                              });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            setCurrentEntry((prev) => {
                              if (!prev) return prev;
                              const tagValue = prev.newTag?.trim();
                              if (!tagValue) return prev;
                              return {
                                ...prev,
                                tags: [...(prev.tags || []), tagValue],
                                newTag: '',
                              };
                            });
                          }}
                          className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                        >
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {currentEntry?.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1 border-slate-600">
                            {tag}
                            <button
                              onClick={() => {
                                setCurrentEntry((prev) => {
                                  if (!prev) return prev;
                                  return {
                                    ...prev,
                                    tags: prev.tags?.filter((_, i) => i !== index) ?? [],
                                  };
                                });
                              }}
                              className="ml-1 hover:text-red-400 transition-colors"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Lessons Learned*</label>
                        <Textarea
                          rows={3}
                          value={currentEntry?.lessons || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, lessons: e.target.value } : prev))
                          }
                          placeholder="What did you learn from this trading session?"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Areas for Improvement*</label>
                        <Textarea
                          rows={3}
                          value={currentEntry?.improvements || ''}
                          onChange={(e) =>
                            setCurrentEntry((prev) => (prev ? { ...prev, improvements: e.target.value } : prev))
                          }
                          placeholder="What could you do better next time?"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-700">
                  <Button
                    variant="outline"
                    onClick={closeDialog}
                    className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveEntry}
                    className="trading-gradient text-white"
                    disabled={isSaving}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    {isSaving ? 'Saving...' : `Save ${entryType === 'lesson' ? 'Lesson' : 'Entry'}`}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
import { JournalLesson } from '@/types/journal';
