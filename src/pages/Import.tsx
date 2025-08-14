import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Upload,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Database,
  MapPin,
  Filter,
  Eye,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sample import history
const importHistory = [
  {
    id: '1',
    filename: 'MT5_Orders_March_2024.csv',
    date: '2024-03-15 14:30:00',
    status: 'completed',
    recordsProcessed: 156,
    recordsImported: 142,
    recordsSkipped: 14,
    errors: [],
    summary: {
      totalTrades: 142,
      profitable: 89,
      losing: 53,
      totalPnL: 4890
    }
  },
  {
    id: '2',
    filename: 'MT5_Orders_February_2024.csv',
    date: '2024-02-28 16:45:00',
    status: 'completed',
    recordsProcessed: 198,
    recordsImported: 185,
    recordsSkipped: 13,
    errors: [],
    summary: {
      totalTrades: 185,
      profitable: 112,
      losing: 73,
      totalPnL: 3240
    }
  },
  {
    id: '3',
    filename: 'MT5_Orders_January_2024.csv',
    date: '2024-01-31 12:20:00',
    status: 'error',
    recordsProcessed: 89,
    recordsImported: 0,
    recordsSkipped: 89,
    errors: ['Invalid date format in row 23', 'Missing symbol in row 45', 'Duplicate ticket ID: 12345678']
  }
];

// Sample field mapping data
const sampleData = [
  { ticket: '12345678', openTime: '2024.03.15 09:30:00', symbol: 'EURUSD', type: 'buy', volume: '1.00', openPrice: '1.08750', sl: '1.08550', tp: '1.09150', profit: '450.00' },
  { ticket: '12345679', openTime: '2024.03.15 11:15:00', symbol: 'GBPJPY', type: 'sell', volume: '0.50', openPrice: '189.450', sl: '189.950', tp: '188.450', profit: '-120.00' },
  { ticket: '12345680', openTime: '2024.03.15 14:20:00', symbol: 'XAUUSD', type: 'buy', volume: '0.10', openPrice: '2018.75', sl: '2010.00', tp: '2035.00', profit: '680.00' }
];

export default function Import() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadStep, setUploadStep] = useState('select'); // select, mapping, preview, import
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [fieldMappings, setFieldMappings] = useState({
    ticket: 'Ticket',
    openTime: 'Open Time',
    closeTime: 'Close Time',
    symbol: 'Symbol',
    type: 'Type',
    volume: 'Volume',
    openPrice: 'Open Price',
    closePrice: 'Close Price',
    sl: 'S/L',
    tp: 'T/P',
    profit: 'Profit',
    commission: 'Commission',
    swap: 'Swap',
    comment: 'Comment'
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-danger" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-warning animate-pulse" />;
      default:
        return <FileText className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success/10 text-success border-success/20">Completed</Badge>;
      case 'error':
        return <Badge className="bg-danger/10 text-danger border-danger/20">Error</Badge>;
      case 'processing':
        return <Badge className="bg-warning/10 text-warning border-warning/20">Processing</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStep('mapping');
    }
  };

  const handleImportStart = () => {
    setUploadStep('import');
    setImportProgress(0);
    
    // Simulate import progress
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStep('select');
          setSelectedFile(null);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">MT5 Import</h1>
          <p className="text-muted-foreground">
            Import your MetaTrader 5 trading data and automatically sync with your journal
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Sample CSV
          </Button>
          <Button variant="outline">
            <Database className="h-4 w-4 mr-2" />
            Field Guide
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Import</TabsTrigger>
          <TabsTrigger value="history">Import History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          {uploadStep === 'select' && (
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload MT5 Data
                </CardTitle>
                <CardDescription>
                  Select your MetaTrader 5 CSV file to import trading data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* File Upload Area */}
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Drag and drop your CSV file here</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      or click to browse and select a file
                    </p>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload">
                      <Button variant="outline" className="cursor-pointer">
                        Select File
                      </Button>
                    </label>
                  </div>

                  {/* Instructions */}
                  <div className="space-y-4">
                    <h4 className="font-medium">How to export from MT5:</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      <li>Open MetaTrader 5 and go to the "History" tab</li>
                      <li>Right-click and select "Order History" or "Deal History"</li>
                      <li>Choose your date range and click "Report"</li>
                      <li>Save the report as CSV format</li>
                      <li>Upload the CSV file using the button above</li>
                    </ol>
                  </div>

                  {/* Supported Formats */}
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Supported Formats:</h4>
                    <div className="flex gap-2 flex-wrap">
                      <Badge variant="outline">Order History</Badge>
                      <Badge variant="outline">Deal History</Badge>
                      <Badge variant="outline">Position History</Badge>
                      <Badge variant="outline">CSV Format</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadStep === 'mapping' && selectedFile && (
            <Card className="trading-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Field Mapping
                </CardTitle>
                <CardDescription>
                  Map your CSV columns to TradeJournal fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
                    <p className="text-sm">
                      <strong>File:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {Object.entries(fieldMappings).map(([field, csvColumn]) => (
                      <div key={field} className="space-y-2">
                        <Label className="text-sm font-medium capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </Label>
                        <Select 
                          value={csvColumn} 
                          onValueChange={(value) => setFieldMappings(prev => ({ ...prev, [field]: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select CSV column" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ticket">Ticket</SelectItem>
                            <SelectItem value="Open Time">Open Time</SelectItem>
                            <SelectItem value="Close Time">Close Time</SelectItem>
                            <SelectItem value="Symbol">Symbol</SelectItem>
                            <SelectItem value="Type">Type</SelectItem>
                            <SelectItem value="Volume">Volume</SelectItem>
                            <SelectItem value="Open Price">Open Price</SelectItem>
                            <SelectItem value="Close Price">Close Price</SelectItem>
                            <SelectItem value="S/L">S/L</SelectItem>
                            <SelectItem value="T/P">T/P</SelectItem>
                            <SelectItem value="Profit">Profit</SelectItem>
                            <SelectItem value="Commission">Commission</SelectItem>
                            <SelectItem value="Swap">Swap</SelectItem>
                            <SelectItem value="Comment">Comment</SelectItem>
                            <SelectItem value="(skip)">(Skip this field)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadStep('select')}
                    >
                      Back
                    </Button>
                    <Button 
                      onClick={() => setUploadStep('preview')}
                      className="trading-gradient text-white"
                    >
                      Preview Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadStep === 'preview' && (
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Data Preview</CardTitle>
                <CardDescription>
                  Review the first few records before importing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">Ticket</th>
                          <th className="text-left p-2">Symbol</th>
                          <th className="text-left p-2">Type</th>
                          <th className="text-left p-2">Volume</th>
                          <th className="text-left p-2">Open Price</th>
                          <th className="text-left p-2">Profit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sampleData.map((row, index) => (
                          <tr key={index} className="border-b hover:bg-muted/50">
                            <td className="p-2 font-mono">{row.ticket}</td>
                            <td className="p-2">{row.symbol}</td>
                            <td className="p-2 capitalize">{row.type}</td>
                            <td className="p-2">{row.volume}</td>
                            <td className="p-2">{row.openPrice}</td>
                            <td className={cn('p-2 font-medium', 
                              parseFloat(row.profit) > 0 ? 'text-success' : 
                              parseFloat(row.profit) < 0 ? 'text-danger' : 'text-muted-foreground'
                            )}>
                              {parseFloat(row.profit) > 0 ? '+' : ''}${row.profit}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-medium mb-2">Import Summary:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total Records:</span>
                        <span className="font-medium ml-2">156</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Valid:</span>
                        <span className="font-medium ml-2 text-success">142</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duplicates:</span>
                        <span className="font-medium ml-2 text-warning">8</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors:</span>
                        <span className="font-medium ml-2 text-danger">6</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setUploadStep('mapping')}
                    >
                      Back to Mapping
                    </Button>
                    <Button 
                      onClick={handleImportStart}
                      className="trading-gradient text-white"
                    >
                      Start Import
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {uploadStep === 'import' && (
            <Card className="trading-card">
              <CardHeader>
                <CardTitle>Importing Data...</CardTitle>
                <CardDescription>
                  Please wait while we process your trading data
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Import Progress</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>

                  <div className="text-center py-8">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Processing {selectedFile?.name}...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                Review all your previous data imports and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importHistory.map((import_) => (
                  <div key={import_.id} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(import_.status)}
                        <div>
                          <h4 className="font-medium">{import_.filename}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(import_.date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(import_.status)}
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processed:</span>
                        <span className="font-medium ml-2">{import_.recordsProcessed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Imported:</span>
                        <span className="font-medium ml-2 text-success">{import_.recordsImported}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Skipped:</span>
                        <span className="font-medium ml-2 text-warning">{import_.recordsSkipped}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Errors:</span>
                        <span className="font-medium ml-2 text-danger">{import_.errors.length}</span>
                      </div>
                    </div>

                    {import_.summary && (
                      <div className="mt-3 p-3 rounded bg-muted/50 text-sm">
                        <strong>Summary:</strong> {import_.summary.totalTrades} trades imported, 
                        {import_.summary.profitable} profitable, {import_.summary.losing} losing, 
                        Total P&L: <span className={import_.summary.totalPnL > 0 ? 'text-success' : 'text-danger'}>
                          ${import_.summary.totalPnL}
                        </span>
                      </div>
                    )}

                    {import_.errors.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <h5 className="text-sm font-medium text-danger">Errors:</h5>
                        {import_.errors.map((error, index) => (
                          <p key={index} className="text-xs text-danger bg-danger/10 p-2 rounded">
                            {error}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="trading-card">
            <CardHeader>
              <CardTitle>Import Settings</CardTitle>
              <CardDescription>
                Configure default import behavior and preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Default Field Mappings</h4>
                  <p className="text-sm text-muted-foreground">
                    Save your field mappings as defaults for future imports
                  </p>
                  <Button variant="outline">Save Current Mappings</Button>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Duplicate Handling</h4>
                  <Select defaultValue="skip">
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="How to handle duplicates" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Skip duplicates</SelectItem>
                      <SelectItem value="update">Update existing</SelectItem>
                      <SelectItem value="create">Create new entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Auto-Import Settings</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Auto-calculate R multiples</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Auto-detect trade setups from comments</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Send notification on import completion</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}