import { useState } from 'react';
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

// Sample journal entries
const initialJournalEntries = [
  {
    id: '1',
    date: '2024-03-15',
    title: 'Strong EURUSD Breakout Setup',
    content: 'Perfect execution on the morning breakout. Waited for the 1-hour candle close above resistance before entering. Risk management was on point with 2:1 R/R achieved.',
    tags: ['breakout', 'EURUSD', 'success'],
    mood: 'confident',
    performance: 'excellent',
    pnl: 450,
    tradesCount: 3,
    lessons: 'Patience in waiting for confirmation paid off. The setup was textbook and execution was flawless.',
    improvements: 'Could have sized up slightly given the strong conviction level.',
    hidden: false
  },
  {
    id: '2',
    date: '2024-03-14',
    title: 'Revenge Trading After Early Loss',
    content: 'Started the day with a good XAUUSD trade, but then got stopped out on GBPJPY due to news event. Made the mistake of trying to "get back" immediately with oversized position.',
    tags: ['psychology', 'revenge-trading', 'lesson'],
    mood: 'frustrated',
    performance: 'poor',
    pnl: -120,
    tradesCount: 4,
    lessons: 'Emotional trading leads to poor decisions. Need to stick to the plan regardless of earlier outcomes.',
    improvements: 'Take a 30-minute break after any significant loss before considering next trade.',
    hidden: false
  },
  {
    id: '3',
    date: '2024-03-13',
    title: 'Multiple Timeframe Analysis Success',
    content: 'Excellent day using multiple timeframe analysis. Daily showed uptrend, 4H confirmed higher lows, and 1H provided clean entry signals.',
    tags: ['MTF-analysis', 'trend-following', 'success'],
    mood: 'focused',
    performance: 'excellent',
    pnl: 680,
    tradesCount: 2,
    lessons: 'Multiple timeframe analysis provides high-probability setups when all timeframes align.',
    improvements: 'Could document the specific confluence factors for future reference.',
    hidden: false
  }
];

// Sample lessons library with enhanced data
const initialLessonsLibrary = [
  {
    id: '1',
    title: 'Risk Management is Everything',
    category: 'Risk Management',
    content: 'Never risk more than 1% per trade. Position sizing is more important than entry timing. This fundamental rule has protected my account during multiple drawdown periods and allowed for consistent growth.',
    tags: ['risk', 'psychology', 'fundamentals'],
    dateAdded: '2024-03-10',
    importance: 'high',
    timesApplied: 47,
    successRate: 89,
    relatedEntries: ['1', '2']
  },
  {
    id: '2',
    title: 'Wait for Confirmation',
    category: 'Entry Signals',
    content: 'Always wait for candle close confirmation before entering breakout trades. Reduces false breakouts by 60%. This patience has saved me from countless bad trades.',
    tags: ['breakout', 'confirmation', 'entry'],
    dateAdded: '2024-03-08',
    importance: 'high',
    timesApplied: 23,
    successRate: 74,
    relatedEntries: ['1', '3']
  },
  {
    id: '3',
    title: 'News Event Buffer',
    category: 'Fundamentals',
    content: 'Close all trades 30 minutes before high-impact news events. Market becomes unpredictable and spreads widen significantly.',
    tags: ['news', 'risk', 'volatility'],
    dateAdded: '2024-03-05',
    importance: 'medium',
    timesApplied: 15,
    successRate: 93,
    relatedEntries: ['2']
  },
  {
    id: '4',
    title: 'Emotional Reset Protocol',
    category: 'Psychology',
    content: 'After any loss > 0.5% of account, take a mandatory 30-minute break. Walk away from screens, do breathing exercises, and only return with a clear mindset.',
    tags: ['psychology', 'emotional-control', 'discipline'],
    dateAdded: '2024-03-12',
    importance: 'high',
    timesApplied: 8,
    successRate: 100,
    relatedEntries: ['2']
  },
  {
    id: '5',
    title: 'Support and Resistance Confluence',
    category: 'Technical Analysis',
    content: 'Look for at least 3 confluence factors: S/R level, moving average, and Fibonacci level. Higher confluence = higher probability trades.',
    tags: ['technical-analysis', 'confluence', 'support-resistance'],
    dateAdded: '2024-03-07',
    importance: 'medium',
    timesApplied: 34,
    successRate: 67,
    relatedEntries: ['1', '3']
  }
];

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
  const [activeTab, setActiveTab] = useState('entries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [journalEntries, setJournalEntries] = useState(initialJournalEntries);
  const [lessonsLibrary, setLessonsLibrary] = useState(initialLessonsLibrary);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEntry, setCurrentEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showHidden, setShowHidden] = useState(false);
  const [entryType, setEntryType] = useState('journal'); // 'journal' or 'lesson'

  const filteredEntries = journalEntries.filter(entry => {
    if (entry.hidden && !showHidden) return false;
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || entry.performance === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const filteredLessons = lessonsLibrary.filter(lesson => {
    const matchesSearch = lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lesson.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All Categories' || lesson.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getMoodColor = (mood) => {
    switch (mood) {
      case 'confident': return 'text-green-400';
      case 'frustrated': return 'text-red-400';
      case 'focused': return 'text-blue-400';
      case 'neutral': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getPerformanceBadge = (performance) => {
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

  const getImportanceBadge = (importance) => {
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

  const formatPnL = (pnl) => {
    if (pnl === 0) return '$0.00';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  };

  const getPnLColor = (pnl) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-slate-400';
  };

  const handleNewEntry = (type = 'journal') => {
    if (type === 'lesson') {
      setCurrentEntry({
        id: Date.now().toString(),
        title: '',
        category: 'Risk Management',
        content: '',
        tags: [],
        dateAdded: new Date().toISOString().split('T')[0],
        importance: 'medium',
        timesApplied: 0,
        successRate: 0,
        relatedEntries: [],
        newTag: ''
      });
      setEntryType('lesson');
    } else {
      setCurrentEntry({
        id: Date.now().toString(),
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
        newTag: ''
      });
      setEntryType('journal');
    }
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEditEntry = (entry, type) => {
    setCurrentEntry({ ...entry, newTag: '' });
    setEntryType(type);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleSaveEntry = () => {
    if (entryType === 'lesson') {
      setLessonsLibrary(prev => 
        isEditing 
          ? prev.map(e => e.id === currentEntry.id ? currentEntry : e)
          : [...prev, currentEntry]
      );
    } else {
      setJournalEntries(prev => 
        isEditing 
          ? prev.map(e => e.id === currentEntry.id ? currentEntry : e)
          : [...prev, currentEntry]
      );
    }
    setIsDialogOpen(false);
  };

  const handleDeleteEntry = (id, type) => {
    if (type === 'lesson') {
      setLessonsLibrary(prev => prev.filter(e => e.id !== id));
    } else {
      setJournalEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleToggleHide = (id) => {
    setJournalEntries(prev => 
      prev.map(entry => 
        entry.id === id ? { ...entry, hidden: !entry.hidden } : entry
      )
    );
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
              <CardContent className="section-padding">
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
              {filteredEntries.map((entry) => (
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
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lessons" className="space-y-6">
            {/* Lesson Filters */}
            <Card className="bg-card border-border">
              <CardContent className="section-padding">
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
              {filteredLessons.map((lesson) => (
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
              ))}
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
                  onClick={() => setIsDialogOpen(false)}
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
                          onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                          placeholder="Key lesson or principle"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Category*</label>
                        <Select
                          value={currentEntry?.category || ''}
                          onValueChange={(value) => setCurrentEntry({...currentEntry, category: value})}
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
                        onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                        placeholder="Describe the lesson in detail, including context and application"
                       className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Importance Level*</label>
                        <Select
                          value={currentEntry?.importance || ''}
                          onValueChange={(value) => setCurrentEntry({...currentEntry, importance: value})}
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
                          onChange={(e) => setCurrentEntry({...currentEntry, timesApplied: parseInt(e.target.value) || 0})}
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
                          onChange={(e) => setCurrentEntry({...currentEntry, successRate: parseInt(e.target.value) || 0})}
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
                          onChange={(e) => setCurrentEntry({...currentEntry, newTag: e.target.value})}
                          placeholder="Add tag (press Enter)"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && currentEntry?.newTag?.trim()) {
                              setCurrentEntry({
                                ...currentEntry,
                                tags: [...(currentEntry?.tags || []), currentEntry.newTag.trim()],
                                newTag: ''
                              });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (currentEntry?.newTag?.trim()) {
                              setCurrentEntry({
                                ...currentEntry,
                                tags: [...(currentEntry?.tags || []), currentEntry.newTag.trim()],
                                newTag: ''
                              });
                            }
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
                                setCurrentEntry({
                                  ...currentEntry,
                                  tags: currentEntry.tags.filter((_, i) => i !== index)
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
                          onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                          placeholder="Trade setup description"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Date*</label>
                        <Input
                          type="date"
                          value={currentEntry?.date || ''}
                          onChange={(e) => setCurrentEntry({...currentEntry, date: e.target.value})}
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-slate-300">Trade Details*</label>
                      <Textarea
                        rows={4}
                        value={currentEntry?.content || ''}
                        onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                        placeholder="Describe your trade execution, strategy, and observations"
                       className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Performance Rating*</label>
                        <Select
                          value={currentEntry?.performance || ''}
                          onValueChange={(value) => setCurrentEntry({...currentEntry, performance: value})}
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
                          onChange={(e) => setCurrentEntry({...currentEntry, tradesCount: parseInt(e.target.value) || 0})}
                         className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Profit/Loss ($)*</label>
                        <Input
                          type="number"
                          value={currentEntry?.pnl || ''}
                          onChange={(e) => setCurrentEntry({...currentEntry, pnl: parseFloat(e.target.value) || 0})}
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Mood/Confidence*</label>
                        <Select
                          value={currentEntry?.mood || ''}
                          onValueChange={(value) => setCurrentEntry({...currentEntry, mood: value})}
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
                          onChange={(e) => setCurrentEntry({...currentEntry, newTag: e.target.value})}
                          placeholder="Add tag (press Enter)"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && currentEntry?.newTag?.trim()) {
                              setCurrentEntry({
                                ...currentEntry,
                                tags: [...(currentEntry?.tags || []), currentEntry.newTag.trim()],
                                newTag: ''
                              });
                            }
                          }}
                        />
                        <Button
                          variant="outline"
                          onClick={() => {
                            if (currentEntry?.newTag?.trim()) {
                              setCurrentEntry({
                                ...currentEntry,
                                tags: [...(currentEntry?.tags || []), currentEntry.newTag.trim()],
                                newTag: ''
                              });
                            }
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
                                setCurrentEntry({
                                  ...currentEntry,
                                  tags: currentEntry.tags.filter((_, i) => i !== index)
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
                          onChange={(e) => setCurrentEntry({...currentEntry, lessons: e.target.value})}
                          placeholder="What did you learn from this trading session?"
                          className="pl-10 bg-input border-input text-foreground placeholder:text-muted-foreground"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-slate-300">Areas for Improvement*</label>
                        <Textarea
                          rows={3}
                          value={currentEntry?.improvements || ''}
                          onChange={(e) => setCurrentEntry({...currentEntry, improvements: e.target.value})}
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
                    onClick={() => setIsDialogOpen(false)}
                   className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveEntry}
                   className="trading-gradient text-white"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Save {entryType === 'lesson' ? 'Lesson' : 'Entry'}
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