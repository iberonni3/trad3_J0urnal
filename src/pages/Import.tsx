import { useState, useEffect } from 'react';
import { 
  Upload, FileText, CheckCircle, XCircle, AlertCircle, Download, 
  Database, MapPin, Filter, Eye, Trash2, Save, Settings, Calendar,
  TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, X
} from 'lucide-react';

// Sample import history with more detailed data
const initialImportHistory = [
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
      totalPnL: 4890,
      winRate: 62.7,
      avgWin: 125.30,
      avgLoss: -87.20
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
      totalPnL: 3240,
      winRate: 60.5,
      avgWin: 98.45,
      avgLoss: -76.80
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
    errors: [
      'Invalid date format in row 23: "2024/01/15" should be "2024.01.15"',
      'Missing symbol in row 45',
      'Duplicate ticket ID: 12345678 found in rows 12 and 34',
      'Invalid trade type "BUY_LIMIT" in row 56, expected "buy" or "sell"'
    ]
  },
  {
    id: '4',
    filename: 'MT5_Orders_December_2023.csv',
    date: '2023-12-31 09:15:00',
    status: 'processing',
    recordsProcessed: 45,
    recordsImported: 0,
    recordsSkipped: 0,
    errors: []
  }
];

// Enhanced sample data with more realistic trading data
const samplePreviewData = [
  { 
    ticket: '12345678', 
    openTime: '2024.03.15 09:30:00', 
    closeTime: '2024.03.15 11:45:00',
    symbol: 'EURUSD', 
    type: 'buy', 
    volume: '1.00', 
    openPrice: '1.08750', 
    closePrice: '1.09200',
    sl: '1.08550', 
    tp: '1.09150', 
    profit: '450.00',
    commission: '-7.50',
    swap: '0.00',
    comment: 'Bullish breakout'
  },
  { 
    ticket: '12345679', 
    openTime: '2024.03.15 11:15:00', 
    closeTime: '2024.03.15 13:20:00',
    symbol: 'GBPJPY', 
    type: 'sell', 
    volume: '0.50', 
    openPrice: '189.450', 
    closePrice: '189.950',
    sl: '189.950', 
    tp: '188.450', 
    profit: '-250.00',
    commission: '-5.25',
    swap: '-2.30',
    comment: 'Failed resistance test'
  },
  { 
    ticket: '12345680', 
    openTime: '2024.03.15 14:20:00', 
    closeTime: '2024.03.15 16:30:00',
    symbol: 'XAUUSD', 
    type: 'buy', 
    volume: '0.10', 
    openPrice: '2018.75', 
    closePrice: '2035.20',
    sl: '2010.00', 
    tp: '2035.00', 
    profit: '164.50',
    commission: '-3.20',
    swap: '0.00',
    comment: 'Gold momentum play'
  },
  { 
    ticket: '12345681', 
    openTime: '2024.03.15 15:45:00', 
    closeTime: '2024.03.15 17:10:00',
    symbol: 'USDJPY', 
    type: 'sell', 
    volume: '0.75', 
    openPrice: '149.850', 
    closePrice: '149.320',
    sl: '150.200', 
    tp: '149.200', 
    profit: '397.50',
    commission: '-6.75',
    swap: '-1.50',
    comment: 'Yen strength'
  }
];

// Available CSV columns for mapping
const availableColumns = [
  'Ticket', 'Order', 'Time', 'Open Time', 'Close Time', 'Type', 'Size', 'Volume',
  'Item', 'Symbol', 'Price', 'Open Price', 'Close Price', 'S/L', 'Stop Loss',
  'T/P', 'Take Profit', 'Profit', 'Balance', 'Commission', 'Taxes', 'Swap',
  'Comment', 'Magic', 'Reason', 'Entry', 'Exit'
];

export default function MT5ImportSystem() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadStep, setUploadStep] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [importProgress, setImportProgress] = useState(0);
  const [importHistory, setImportHistory] = useState(initialImportHistory);
  const [isDragging, setIsDragging] = useState(false);
  const [importStatus, setImportStatus] = useState('');
  const [previewData, setPreviewData] = useState(samplePreviewData);
  const [validationResults, setValidationResults] = useState({
    total: 156,
    valid: 142,
    duplicates: 8,
    errors: 6
  });

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

  const [importSettings, setImportSettings] = useState({
    duplicateHandling: 'skip',
    autoCalculateR: true,
    autoDetectSetups: true,
    sendNotifications: false
  });

  const [showFieldGuideModal, setShowFieldGuideModal] = useState(false);

  // File handling
  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadStep('mapping');
      // Simulate file analysis
      setTimeout(() => {
        setValidationResults({
          total: Math.floor(Math.random() * 200) + 100,
          valid: Math.floor(Math.random() * 150) + 80,
          duplicates: Math.floor(Math.random() * 20),
          errors: Math.floor(Math.random() * 15)
        });
      }, 1000);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // Import process
  const handleImportStart = () => {
    setUploadStep('import');
    setImportProgress(0);
    setImportStatus('Initializing import...');
    
    const stages = [
      { progress: 20, status: 'Parsing CSV file...' },
      { progress: 40, status: 'Validating data format...' },
      { progress: 60, status: 'Checking for duplicates...' },
      { progress: 80, status: 'Processing trades...' },
      { progress: 90, status: 'Calculating statistics...' },
      { progress: 100, status: 'Import completed!' }
    ];

    let currentStage = 0;
    const interval = setInterval(() => {
      if (currentStage < stages.length) {
        setImportProgress(stages[currentStage].progress);
        setImportStatus(stages[currentStage].status);
        currentStage++;
      } else {
        clearInterval(interval);
        // Add new import to history
        const newImport = {
          id: Date.now().toString(),
          filename: selectedFile.name,
          date: new Date().toISOString().slice(0, 19).replace('T', ' '),
          status: 'completed',
          recordsProcessed: validationResults.total,
          recordsImported: validationResults.valid,
          recordsSkipped: validationResults.duplicates + validationResults.errors,
          errors: [],
          summary: {
            totalTrades: validationResults.valid,
            profitable: Math.floor(validationResults.valid * 0.6),
            losing: Math.floor(validationResults.valid * 0.4),
            totalPnL: Math.floor(Math.random() * 5000) + 1000,
            winRate: 60 + Math.random() * 20,
            avgWin: 80 + Math.random() * 50,
            avgLoss: -(50 + Math.random() * 40)
          }
        };
        setImportHistory(prev => [newImport, ...prev]);
        setTimeout(() => {
          setUploadStep('select');
          setSelectedFile(null);
          setImportProgress(0);
          setActiveTab('history');
        }, 2000);
      }
    }, 800);
  };

  // Helper functions
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case 'completed':
        return <span className={`${baseClasses} bg-green-100 text-green-800`}>Completed</span>;
      case 'error':
        return <span className={`${baseClasses} bg-red-100 text-red-800`}>Error</span>;
      case 'processing':
        return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Processing</span>;
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const formatCurrency = (value) => {
    const num = parseFloat(value) || 0;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(num);
  };

  const formatPercent = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  const deleteImport = (id) => {
    setImportHistory(prev => prev.filter(imp => imp.id !== id));
  };

  // Additional functionality implementations
  const downloadSampleCSV = () => {
    const sampleData = [
      ['Ticket', 'Open Time', 'Close Time', 'Symbol', 'Type', 'Volume', 'Open Price', 'Close Price', 'S/L', 'T/P', 'Profit', 'Commission', 'Swap', 'Comment'],
      ['12345678', '2024.03.15 09:30:00', '2024.03.15 11:45:00', 'EURUSD', 'buy', '1.00', '1.08750', '1.09200', '1.08550', '1.09150', '450.00', '-7.50', '0.00', 'Bullish breakout'],
      ['12345679', '2024.03.15 11:15:00', '2024.03.15 13:20:00', 'GBPJPY', 'sell', '0.50', '189.450', '189.950', '189.950', '188.450', '-250.00', '-5.25', '-2.30', 'Failed resistance test'],
      ['12345680', '2024.03.15 14:20:00', '2024.03.15 16:30:00', 'XAUUSD', 'buy', '0.10', '2018.75', '2035.20', '2010.00', '2035.00', '164.50', '-3.20', '0.00', 'Gold momentum play']
    ];
    
    const csvContent = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'MT5_Sample_Import.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const showFieldGuide = () => {
    setShowFieldGuideModal(true);
  };

  const applyFilter = () => {
    // Get current filter value from select
    const filterSelect = document.querySelector('select');
    const filterValue = filterSelect?.value || 'All Status';
    
    if (filterValue === 'All Status') {
      // Reset to show all imports
      setImportHistory(initialImportHistory);
    } else {
      // Filter by status
      const filtered = initialImportHistory.filter(imp => 
        imp.status === filterValue.toLowerCase()
      );
      setImportHistory(filtered);
    }
  };

  const viewImportDetails = (importData) => {
    const details = `Import Details:

Filename: ${importData.filename}
Date: ${new Date(importData.date).toLocaleString()}
Status: ${importData.status}
Records Processed: ${importData.recordsProcessed}
Records Imported: ${importData.recordsImported}
Records Skipped: ${importData.recordsSkipped}
Errors: ${importData.errors.length}

${importData.summary ? 
      `Trading Summary:
Total Trades: ${importData.summary.totalTrades}
Winning Trades: ${importData.summary.profitable}
Losing Trades: ${importData.summary.losing}
Total P&L: ${formatCurrency(importData.summary.totalPnL)}
Win Rate: ${formatPercent(importData.summary.winRate)}
Average Win: ${formatCurrency(importData.summary.avgWin)}
Average Loss: ${formatCurrency(importData.summary.avgLoss)}` 
      : 'No trading summary available'}`;
    
    alert(details);
  };

  const saveCurrentMappings = () => {
    // Save mappings to localStorage
    localStorage.setItem('mt5_field_mappings', JSON.stringify(fieldMappings));
    alert('Field mappings saved successfully! They will be used as defaults for future imports.');
  };

  const resetToDefaultMappings = () => {
    const defaultMappings = {
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
    };
    
    setFieldMappings(defaultMappings);
    localStorage.removeItem('mt5_field_mappings');
    alert('Field mappings reset to default values.');
  };

  const saveSettings = () => {
    // Save settings to localStorage
    localStorage.setItem('mt5_import_settings', JSON.stringify(importSettings));
    alert('Import settings saved successfully!');
  };

  const exportAsCSV = () => {
    if (importHistory.length === 0) {
      alert('No import data available to export.');
      return;
    }
    
    const headers = ['Filename', 'Date', 'Status', 'Records Processed', 'Records Imported', 'Records Skipped', 'Errors', 'Total P&L', 'Win Rate'];
    const csvData = [headers];
    
    importHistory.forEach(imp => {
      csvData.push([
        imp.filename,
        imp.date,
        imp.status,
        imp.recordsProcessed.toString(),
        imp.recordsImported.toString(),
        imp.recordsSkipped.toString(),
        imp.errors.length.toString(),
        imp.summary ? imp.summary.totalPnL.toString() : 'N/A',
        imp.summary ? `${imp.summary.winRate.toFixed(1)}%` : 'N/A'
      ]);
    });
    
    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MT5_Import_History_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const exportAsExcel = () => {
    // For Excel export, we'll create a more detailed CSV that can be opened in Excel
    if (importHistory.length === 0) {
      alert('No import data available to export.');
      return;
    }
    
    let excelContent = 'MT5 Import History Report\n\n';
    excelContent += 'Generated on: ' + new Date().toLocaleString() + '\n\n';
    
    excelContent += 'Summary:\n';
    excelContent += `Total Imports: ${importHistory.length}\n`;
    excelContent += `Successful Imports: ${importHistory.filter(i => i.status === 'completed').length}\n`;
    excelContent += `Failed Imports: ${importHistory.filter(i => i.status === 'error').length}\n`;
    excelContent += `Processing: ${importHistory.filter(i => i.status === 'processing').length}\n\n`;
    
    excelContent += 'Detailed Report:\n';
    excelContent += 'Filename,Date,Status,Records Processed,Records Imported,Records Skipped,Errors,Total Trades,Total P&L,Win Rate\n';
    
    importHistory.forEach(imp => {
      excelContent += `"${imp.filename}","${imp.date}","${imp.status}",${imp.recordsProcessed},${imp.recordsImported},${imp.recordsSkipped},${imp.errors.length}`;
      if (imp.summary) {
        excelContent += `,${imp.summary.totalTrades},${imp.summary.totalPnL},${imp.summary.winRate.toFixed(1)}%`;
      } else {
        excelContent += ',N/A,N/A,N/A';
      }
      excelContent += '\n';
    });
    
    const blob = new Blob([excelContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MT5_Import_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const createBackupNow = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      importHistory: importHistory,
      fieldMappings: fieldMappings,
      importSettings: importSettings
    };
    
    const backupContent = JSON.stringify(backupData, null, 2);
    const blob = new Blob([backupContent], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MT5_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    alert('Backup created successfully!');
  };

  // Load saved settings on component mount
  useEffect(() => {
    const savedMappings = localStorage.getItem('mt5_field_mappings');
    if (savedMappings) {
      setFieldMappings(JSON.parse(savedMappings));
    }
    
    const savedSettings = localStorage.getItem('mt5_import_settings');
    if (savedSettings) {
      setImportSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Field Guide Data
  const fieldGuideData = [
    {
      field: 'Ticket',
      description: 'Unique trade identifier from MT5',
      example: '12345678',
      required: true
    },
    {
      field: 'Open Time',
      description: 'When the trade was opened',
      example: '2024.03.15 09:30:00',
      required: false
    },
    {
      field: 'Close Time',
      description: 'When the trade was closed',
      example: '2024.03.15 11:45:00',
      required: false
    },
    {
      field: 'Symbol',
      description: 'Trading pair/instrument',
      example: 'EURUSD, GBPJPY, XAUUSD',
      required: true
    },
    {
      field: 'Type',
      description: 'Trade direction',
      example: 'buy, sell',
      required: true
    },
    {
      field: 'Volume',
      description: 'Trade size in lots',
      example: '1.00, 0.50, 0.10',
      required: true
    },
    {
      field: 'Open Price',
      description: 'Price at which trade was opened',
      example: '1.08750',
      required: false
    },
    {
      field: 'Close Price',
      description: 'Price at which trade was closed',
      example: '1.09200',
      required: false
    },
    {
      field: 'S/L',
      description: 'Stop Loss level',
      example: '1.08550',
      required: false
    },
    {
      field: 'T/P',
      description: 'Take Profit level',
      example: '1.09150',
      required: false
    },
    {
      field: 'Profit',
      description: 'Trade profit/loss in account currency',
      example: '450.00, -250.00',
      required: false
    },
    {
      field: 'Commission',
      description: 'Broker commission charged',
      example: '-7.50',
      required: false
    },
    {
      field: 'Swap',
      description: 'Overnight interest charges',
      example: '0.00, -2.30',
      required: false
    },
    {
      field: 'Comment',
      description: 'Trade notes or strategy description',
      example: 'Bullish breakout, Failed resistance test',
      required: false
    }
  ];

  return (
    <div className="min-h-screen bg-background mobile-container section-padding">
      <div className="max-w-7xl mx-auto content-spacing">
        {/* Header */}
        <div className="trading-card section-padding">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">MT5 Import</h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Import your MetaTrader 5 trading data and automatically sync with your journal
              </p>
            </div>
            
            <div className="responsive-flex gap-3">
              <button 
                onClick={downloadSampleCSV}
                className="flex items-center gap-2 touch-friendly px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-foreground"
              >
                <Download className="h-4 w-4" />
                <span className="mobile-hidden">Sample CSV</span>
                <span className="mobile-only">Sample</span>
              </button>
              <button 
                onClick={showFieldGuide}
                className="flex items-center gap-2 touch-friendly px-4 py-2 border border-border rounded-md hover:bg-accent transition-colors text-foreground"
              >
                <Database className="h-4 w-4" />
                <span className="mobile-hidden">Field Guide</span>
                <span className="mobile-only">Guide</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="trading-card">
          <div className="border-b border-border">
            <nav className="flex flex-row overflow-x-auto mobile-container" aria-label="Tabs">
              {[
                { id: 'upload', label: 'Upload & Import', shortLabel: 'Upload', icon: Upload },
                { id: 'history', label: 'Import History', shortLabel: 'History', icon: Clock },
                { id: 'settings', label: 'Settings', shortLabel: 'Settings', icon: Settings }
              ].map(({ id, label, shortLabel, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2 touch-friendly whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${
                    activeTab === id
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="mobile-hidden">{label}</span>
                  <span className="mobile-only">{shortLabel}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Upload & Import Tab */}
            {activeTab === 'upload' && (
              <div className="space-y-6">
                {uploadStep === 'select' && (
                  <div className="space-y-6">
                    {/* File Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                        isDragging
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Drag and drop your CSV file here
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        or click to browse and select a file
                      </p>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileInputChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload">
                        <span className="inline-flex items-center px-4 py-2 border border-border rounded-md bg-card text-sm font-medium text-foreground hover:bg-accent cursor-pointer transition-colors">
                          Select File
                        </span>
                      </label>
                    </div>

                    {/* Instructions */}
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
                      <h4 className="font-medium text-primary mb-4 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        How to export from MT5:
                      </h4>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-foreground">
                        <li>Open MetaTrader 5 and go to the "History" tab</li>
                        <li>Right-click and select "Order History" or "Deal History"</li>
                        <li>Choose your date range and click "Report"</li>
                        <li>Save the report as CSV format</li>
                        <li>Upload the CSV file using the button above</li>
                      </ol>
                    </div>

                    {/* Supported Formats */}
                    <div className="bg-muted rounded-lg p-4">
                      <h4 className="font-medium text-foreground mb-3">Supported Formats:</h4>
                      <div className="flex gap-2 flex-wrap">
                        {['Order History', 'Deal History', 'Position History', 'CSV Format'].map((format) => (
                          <span key={format} className="px-2 py-1 bg-card border border-border rounded text-sm text-foreground">
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {uploadStep === 'mapping' && selectedFile && (
                  <div className="space-y-6">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                      <p className="text-sm text-foreground">
                        <strong>File:</strong> {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                      </p>
                    </div>

                    <div className="responsive-grid gap-4">
                      {Object.entries(fieldMappings).map(([field, csvColumn]) => (
                        <div key={field} className="space-y-2">
                          <label className="text-sm font-medium text-foreground capitalize">
                            {field.replace(/([A-Z])/g, ' $1').trim()}
                            {['ticket', 'symbol', 'type', 'volume'].includes(field) && (
                              <span className="text-destructive ml-1">*</span>
                            )}
                          </label>
                          <select
                            value={csvColumn}
                            onChange={(e) => setFieldMappings(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full touch-friendly bg-input border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                          >
                            <option value="">Select CSV column</option>
                            {availableColumns.map((column) => (
                              <option key={column} value={column}>{column}</option>
                            ))}
                            <option value="(skip)">(Skip this field)</option>
                          </select>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setUploadStep('select')}
                        className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setUploadStep('preview')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Preview Data
                      </button>
                    </div>
                  </div>
                )}

                {uploadStep === 'preview' && (
                  <div className="space-y-6">
                    <div className="responsive-table-container">
                      <table className="responsive-table">
                        <thead className="bg-muted">
                          <tr>
                            <th className="table-header">Ticket</th>
                            <th className="table-header">Symbol</th>
                            <th className="table-header">Type</th>
                            <th className="table-header">Volume</th>
                            <th className="table-header mobile-hidden">Open Price</th>
                            <th className="table-header mobile-hidden">Close Price</th>
                            <th className="table-header">Profit</th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {previewData.map((row, index) => (
                            <tr key={index} className="hover:bg-muted/50">
                              <td className="table-cell font-mono text-xs sm:text-sm">{row.ticket}</td>
                              <td className="table-cell text-xs sm:text-sm">{row.symbol}</td>
                              <td className="table-cell">
                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  row.type === 'buy' 
                                    ? 'bg-success/20 text-success'
                                    : 'bg-destructive/20 text-destructive'
                                }`}>
                                  {row.type.toUpperCase()}
                                </span>
                              </td>
                              <td className="table-cell text-xs sm:text-sm">{row.volume}</td>
                              <td className="table-cell mobile-hidden text-xs sm:text-sm">{row.openPrice}</td>
                              <td className="table-cell mobile-hidden text-xs sm:text-sm">{row.closePrice}</td>
                              <td className={`table-cell font-medium text-xs sm:text-sm ${
                                parseFloat(row.profit) > 0 ? 'text-success' : 
                                parseFloat(row.profit) < 0 ? 'text-destructive' : 'text-muted-foreground'
                              }`}>
                                {formatCurrency(row.profit)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Validation Summary */}
                    <div className="bg-muted rounded-lg p-6">
                      <h4 className="font-medium text-foreground mb-4">Import Summary:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground">{validationResults.total}</div>
                          <div className="text-sm text-muted-foreground">Total Records</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">{validationResults.valid}</div>
                          <div className="text-sm text-muted-foreground">Valid</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-yellow-400">{validationResults.duplicates}</div>
                          <div className="text-sm text-muted-foreground">Duplicates</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-destructive">{validationResults.errors}</div>
                          <div className="text-sm text-muted-foreground">Errors</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setUploadStep('mapping')}
                        className="px-4 py-2 border border-border rounded-md text-foreground hover:bg-accent transition-colors"
                      >
                        Back to Mapping
                      </button>
                      <button
                        onClick={handleImportStart}
                        className="px-4 py-2 bg-success text-white rounded-md hover:bg-success/90 transition-colors"
                      >
                        Start Import
                      </button>
                    </div>
                  </div>
                )}

                {uploadStep === 'import' && (
                  <div className="space-y-6">
                    <div className="text-center py-8">
                      <div className="animate-spin h-16 w-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
                      <h3 className="text-lg font-medium text-foreground mb-2">Importing Data...</h3>
                      <p className="text-muted-foreground mb-6">{importStatus}</p>
                      
                      <div className="max-w-md mx-auto">
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span>Progress</span>
                          <span>{importProgress}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${importProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Import History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-foreground">Import History</h3>
                  <div className="flex items-center gap-2">
                    <select className="px-3 py-1 bg-input border border-border rounded text-sm text-foreground">
                      <option>All Status</option>
                      <option>Completed</option>
                      <option>Error</option>
                      <option>Processing</option>
                    </select>
                    <button 
                      onClick={applyFilter}
                      className="p-2 text-muted-foreground hover:text-foreground"
                    >
                      <Filter className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {importHistory.map((import_) => (
                    <div key={import_.id} className="bg-card border border-border rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(import_.status)}
                          <div>
                            <h4 className="font-medium text-foreground">{import_.filename}</h4>
                            <p className="text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 inline mr-1" />
                              {new Date(import_.date).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(import_.status)}
                          <button 
                            onClick={() => viewImportDetails(import_)}
                            className="p-1 text-muted-foreground hover:text-foreground"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteImport(import_.id)}
                            className="p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      {/* Import Statistics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Processed:</span>
                          <span className="font-medium ml-2 text-foreground">{import_.recordsProcessed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Imported:</span>
                          <span className="font-medium ml-2 text-success">{import_.recordsImported}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Skipped:</span>
                          <span className="font-medium ml-2 text-yellow-400">{import_.recordsSkipped}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Errors:</span>
                          <span className="font-medium ml-2 text-destructive">{import_.errors.length}</span>
                        </div>
                      </div>

                      {/* Trading Summary */}
                      {import_.summary && import_.status === 'completed' && (
                        <div className="bg-muted rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Trading Summary
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
                            <div className="text-center">
                              <div className="text-lg font-bold text-foreground">{import_.summary.totalTrades}</div>
                              <div className="text-muted-foreground">Total Trades</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-success flex items-center justify-center gap-1">
                                <TrendingUp className="h-4 w-4" />
                                {import_.summary.profitable}
                              </div>
                              <div className="text-muted-foreground">Winners</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-destructive flex items-center justify-center gap-1">
                                <TrendingDown className="h-4 w-4" />
                                {import_.summary.losing}
                              </div>
                              <div className="text-muted-foreground">Losers</div>
                            </div>
                            <div className="text-center">
                              <div className={`text-lg font-bold flex items-center justify-center gap-1 ${
                                import_.summary.totalPnL > 0 ? 'text-success' : 'text-destructive'
                              }`}>
                                <DollarSign className="h-4 w-4" />
                                {formatCurrency(import_.summary.totalPnL)}
                              </div>
                              <div className="text-muted-foreground">Total P&L</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-primary">
                                {formatPercent(import_.summary.winRate)}
                              </div>
                              <div className="text-muted-foreground">Win Rate</div>
                            </div>
                            <div className="text-center">
                              <div className="text-sm text-foreground">
                                <div className="text-success font-medium">
                                  +{formatCurrency(import_.summary.avgWin)}
                                </div>
                                <div className="text-destructive font-medium">
                                  {formatCurrency(import_.summary.avgLoss)}
                                </div>
                              </div>
                              <div className="text-muted-foreground">Avg Win/Loss</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Error Messages */}
                      {import_.errors.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                          <h5 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                            <XCircle className="h-4 w-4" />
                            Import Errors ({import_.errors.length})
                          </h5>
                          <div className="space-y-1 max-h-32 overflow-y-auto">
                            {import_.errors.map((error, index) => (
                              <div key={index} className="text-xs text-destructive bg-destructive/10 p-2 rounded font-mono">
                                {error}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Processing Status */}
                      {import_.status === 'processing' && (
                        <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <AlertCircle className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-medium">Import in progress...</span>
                          </div>
                          <div className="mt-2">
                            <div className="w-full bg-yellow-400/20 rounded-full h-1">
                              <div className="bg-yellow-400 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {importHistory.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No imports yet</h3>
                      <p className="text-muted-foreground mb-4">Start by uploading your first MT5 CSV file</p>
                      <button 
                        onClick={() => setActiveTab('upload')}
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Upload Data
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Field Mapping Settings */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      Default Field Mappings
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Save your field mappings as defaults for future imports
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      {Object.entries(fieldMappings).slice(0, 6).map(([field, mapping]) => (
                        <div key={field} className="flex justify-between items-center text-sm">
                          <span className="font-medium capitalize text-foreground">
                            {field.replace(/([A-Z])/g, ' $1').trim()}:
                          </span>
                          <span className="text-muted-foreground bg-muted px-2 py-1 rounded">
                            {mapping || '(not mapped)'}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={saveCurrentMappings}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        <Save className="h-4 w-4" />
                        Save Current Mappings
                      </button>
                      <button 
                        onClick={resetToDefaultMappings}
                        className="px-4 py-2 border border-border text-foreground rounded-md hover:bg-accent transition-colors"
                      >
                        Reset to Default
                      </button>
                    </div>
                  </div>

                  {/* Import Behavior Settings */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Import Behavior
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Duplicate Handling
                        </label>
                        <select
                          value={importSettings.duplicateHandling}
                          onChange={(e) => setImportSettings(prev => ({ ...prev, duplicateHandling: e.target.value }))}
                          className="w-full p-2 bg-input border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                        >
                          <option value="skip">Skip duplicates</option>
                          <option value="update">Update existing records</option>
                          <option value="create">Create new entries</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-foreground">Automatic Processing</h4>
                        
                        {[
                          { id: 'autoCalculateR', label: 'Auto-calculate R multiples', key: 'autoCalculateR' },
                          { id: 'autoDetectSetups', label: 'Auto-detect trade setups from comments', key: 'autoDetectSetups' },
                          { id: 'sendNotifications', label: 'Send notification on import completion', key: 'sendNotifications' }
                        ].map(({ id, label, key }) => (
                          <label key={id} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              id={id}
                              checked={importSettings[key]}
                              onChange={(e) => setImportSettings(prev => ({ ...prev, [key]: e.target.checked }))}
                              className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                            />
                            <span className="text-sm text-foreground">{label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-border">
                      <button 
                        onClick={saveSettings}
                        className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                      >
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>

                {/* Data Validation Rules */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">Data Validation Rules</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Required Fields</h4>
                      <div className="space-y-2 text-sm">
                        {['Ticket ID', 'Symbol', 'Trade Type', 'Volume'].map((field) => (
                          <div key={field} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{field}</span>
                            <CheckCircle className="h-4 w-4 text-success" />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-foreground">Validation Checks</h4>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div>✓ Date format validation</div>
                        <div>✓ Numeric field validation</div>
                        <div>✓ Symbol format checking</div>
                        <div>✓ Duplicate ticket detection</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Export Settings */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-medium text-foreground mb-4">Export & Backup</h3>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Data Export</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Export your imported trading data in various formats
                      </p>
                      <div className="space-y-2">
                        <button 
                          onClick={exportAsCSV}
                          className="w-full px-4 py-2 border border-border text-foreground rounded-md hover:bg-accent transition-colors"
                        >
                          Export as CSV
                        </button>
                        <button 
                          onClick={exportAsExcel}
                          className="w-full px-4 py-2 border border-border text-foreground rounded-md hover:bg-accent transition-colors"
                        >
                          Export as Excel
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Backup Settings</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        Configure automatic backups of your import history
                      </p>
                      <label className="flex items-center space-x-3 mb-3">
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                        />
                        <span className="text-sm text-foreground">Enable automatic backups</span>
                      </label>
                      <button 
                        onClick={createBackupNow}
                        className="w-full px-4 py-2 border border-border text-foreground rounded-md hover:bg-accent transition-colors"
                      >
                        Create Backup Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Field Guide Modal */}
        {showFieldGuideModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-card rounded-lg shadow-xl border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Database className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-foreground">MT5 Field Guide</h2>
                    <p className="text-sm text-muted-foreground">Understanding your MetaTrader 5 export fields</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFieldGuideModal(false)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid gap-4">
                  {fieldGuideData.map((field, index) => (
                    <div 
                      key={field.field}
                      className="bg-muted/30 border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{field.field}</h3>
                          {field.required && (
                            <span className="px-2 py-1 bg-destructive/20 text-destructive text-xs rounded-full font-medium">
                              Required
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                          #{index + 1}
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground text-sm mb-3">
                        {field.description}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Example:
                        </span>
                        <code className="text-xs bg-primary/10 text-primary px-2 py-1 rounded font-mono">
                          {field.example}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Export Instructions
                  </h4>
                  <ol className="list-decimal list-inside space-y-1 text-sm text-foreground">
                    <li>Open MetaTrader 5 and go to the "History" tab</li>
                    <li>Right-click and select "Order History" or "Deal History"</li>
                    <li>Choose your date range and click "Report"</li>
                    <li>Save the report as CSV format</li>
                    <li>Upload the CSV file using the import tool above</li>
                  </ol>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-border bg-muted/20">
                <button
                  onClick={downloadSampleCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download Sample CSV
                </button>
                <button
                  onClick={() => setShowFieldGuideModal(false)}
                  className="px-4 py-2 border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
