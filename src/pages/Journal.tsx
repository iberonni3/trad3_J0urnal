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
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample journal entries
const journalEntries = [
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
    improvements: 'Could have sized up slightly given the strong conviction level.'
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
    improvements: 'Take a 30-minute break after any significant loss before considering next trade.'
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
    improvements: 'Could document the specific confluence factors for future reference.'
  }
];

// Sample lessons library
const lessonsLibrary = [
  {
    id: '1',
    title: 'Risk Management is Everything',
    category: 'Risk Management',
    content: 'Never risk more than 1% per trade. Position sizing is more important than entry timing.',
    tags: ['risk', 'psychology', 'fundamentals'],
    dateAdded: '2024-03-10'
  },
  {
    id: '2',
    title: 'Wait for Confirmation',
    category: 'Entry Signals',
    content: 'Always wait for candle close confirmation before entering breakout trades. Reduces false breakouts by 60%.',
    tags: ['breakout', 'confirmation', 'entry'],
    dateAdded: '2024-03-08'
  },
  {
    id: '3',
    title: 'News Event Buffer',
    category: 'Fundamentals',
    content: 'Close all trades 30 minutes before high-impact news events. Market becomes unpredictable.',
    tags: ['news', 'risk', 'volatility'],
    dateAdded: '2024-03-05'
  }
];

export default function Journal() {
  const [activeTab, setActiveTab] = useState('entries');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isAddingEntry, setIsAddingEntry] = useState(false);

  const filteredEntries = journalEntries.filter(entry => {
    const matchesSearch = entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || entry.performance === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'confident': return 'text-success';
      case 'frustrated': return 'text-danger';
      case 'focused': return 'text-primary';
      case 'neutral': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent':
        return <Badge className="bg-success/10 text-success border-success/20">Excellent</Badge>;
      case 'good':
        return <Badge className="bg-primary/10 text-primary border-primary/20">Good</Badge>;
      case 'average':
        return <Badge variant="secondary">Average</Badge>;
      case 'poor':
        return <Badge className="bg-danger/10 text-danger border-danger/20">Poor</Badge>;
      default:
        return <Badge variant="secondary">{performance}</Badge>;
    }
  };

  const formatPnL = (pnl: number) => {
    if (pnl === 0) return '$0.00';
    const sign = pnl > 0 ? '+' : '';
    return `${sign}$${pnl.toFixed(2)}`;
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Trading Journal</h1>
          <p className="text-muted-foreground">
            Document your trading journey, lessons learned, and psychological insights
          </p>
        </div>
        
        <Button 
          className="trading-gradient text-white"
          onClick={() => setIsAddingEntry(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">Daily Entries</TabsTrigger>
          <TabsTrigger value="lessons">Lessons Library</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search entries by title, content, or tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={selectedFilter} onValueChange={setSelectedFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Performance</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Journal Entries */}
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="trading-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{entry.title}</CardTitle>
                        {getPerformanceBadge(entry.performance)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm leading-relaxed">{entry.content}</p>
                    
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tags</h4>
                        <div className="flex gap-2 flex-wrap">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-1 text-success">Lessons Learned</h4>
                          <p className="text-muted-foreground">{entry.lessons}</p>
                        </div>
                        <div>
                          <h4 className="font-medium mb-1 text-primary">Areas for Improvement</h4>
                          <p className="text-muted-foreground">{entry.improvements}</p>
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {lessonsLibrary.map((lesson) => (
              <Card key={lesson.id} className="trading-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{lesson.title}</CardTitle>
                      <CardDescription>{lesson.category}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm">
                      <BookOpen className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm leading-relaxed">{lesson.content}</p>
                    <div className="flex gap-2 flex-wrap">
                      {lesson.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
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
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Psychological Patterns</CardTitle>
                <CardDescription>Insights into your trading psychology</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <h4 className="font-medium text-success">Confidence Pattern</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Your best trades happen when you express confidence in your journal entries. Focus on setups that align with your highest conviction levels.
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-lg bg-danger/10 border border-danger/20">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-danger" />
                      <h4 className="font-medium text-danger">Emotional Trading</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Entries tagged with "frustrated" mood correlate with 73% higher loss rates. Consider implementing cooling-off periods.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Learning Progress</CardTitle>
                <CardDescription>Track your development over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Risk Management</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-4/5 h-full bg-success rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">80%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Entry Timing</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-3/5 h-full bg-primary rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">60%</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Psychology Control</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full">
                        <div className="w-2/5 h-full bg-danger rounded-full"></div>
                      </div>
                      <span className="text-sm font-medium">40%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}