import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Upload, X, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { TradeInput } from '@/types/trade';
import { validateImageFile } from '@/lib/firebase/storage';

// Helper function to convert empty strings to undefined for number fields
const emptyStringToUndefined = (value: any) => {
  if (value === '' || value === null) return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
};

// Form validation schema
const tradeFormSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required').toUpperCase(),
  direction: z.enum(['long', 'short'], {
    required_error: 'Direction is required',
  }),
  entry: z.number({
    required_error: 'Entry price is required',
    invalid_type_error: 'Entry price must be a number',
  }).positive('Entry price must be positive'),
  exit: z.number().positive('Exit price must be positive').optional(),
  stopLoss: z.number({
    required_error: 'Stop loss is required',
    invalid_type_error: 'Stop loss must be a number',
  }).positive('Stop loss must be positive'),
  takeProfit: z.number({
    required_error: 'Take profit is required',
    invalid_type_error: 'Take profit must be a number',
  }).positive('Take profit must be positive'),
  quantity: z.number({
    required_error: 'Quantity is required',
    invalid_type_error: 'Quantity must be a number',
  }).positive('Quantity must be positive'),
  pnl: z.number({
    invalid_type_error: 'P&L must be a number',
  }).optional(),
  openTime: z.date({
    required_error: 'Open time is required',
  }),
  closeTime: z.date().optional(),
  status: z.enum(['open', 'closed']),
  setup: z.string().min(1, 'Setup is required'),
  tags: z.string(),
  broker: z.string().min(1, 'Broker is required'),
  commission: z.number().nonnegative('Commission cannot be negative').optional(),
  notes: z.string().default(''),
}).refine((data) => {
  // If status is closed, exit price and close time are required
  if (data.status === 'closed') {
    const hasExit = data.exit !== undefined && data.exit > 0;
    const hasCloseTime = data.closeTime !== undefined;
    return hasExit && hasCloseTime;
  }
  return true;
}, {
  message: 'Exit price and close time are required for closed trades',
  path: ['exit'],
}).refine((data) => {
  // If status is closed, P&L is required (must be a valid number, can be 0 or negative)
  if (data.status === 'closed') {
    return data.pnl !== undefined;
  }
  return true;
}, {
  message: 'P&L is required for closed trades (enter 0 if break-even)',
  path: ['pnl'],
}).refine((data) => {
  // Validate stop loss is on the correct side of entry
  if (data.direction === 'long') {
    return data.stopLoss < data.entry;
  } else {
    return data.stopLoss > data.entry;
  }
}, {
  message: 'Stop loss must be below entry for long trades and above entry for short trades',
  path: ['stopLoss'],
}).refine((data) => {
  // Validate take profit is on the correct side of entry
  if (data.direction === 'long') {
    return data.takeProfit > data.entry;
  } else {
    return data.takeProfit < data.entry;
  }
}, {
  message: 'Take profit must be above entry for long trades and below entry for short trades',
  path: ['takeProfit'],
});

type TradeFormValues = z.infer<typeof tradeFormSchema>;

interface TradeEntryFormProps {
  onSubmit: (data: TradeInput) => Promise<void>;
  onCancel: () => void;
  initialData?: Partial<TradeInput>;
  isLoading?: boolean;
}

export default function TradeEntryForm({
  onSubmit,
  onCancel,
  initialData,
  isLoading = false,
}: TradeEntryFormProps) {
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(tradeFormSchema),
    mode: 'onChange',
    defaultValues: {
      symbol: initialData?.symbol || '',
      direction: initialData?.direction || 'long',
      entry: initialData?.entry || undefined,
      exit: initialData?.exit || undefined,
      stopLoss: initialData?.stopLoss || undefined,
      takeProfit: initialData?.takeProfit || undefined,
      quantity: initialData?.quantity || undefined,
      pnl: initialData?.pnl || undefined,
      openTime: initialData?.openTime ? new Date(initialData.openTime) : new Date(),
      closeTime: initialData?.closeTime ? new Date(initialData.closeTime) : undefined,
      status: initialData?.status || 'open',
      setup: initialData?.setup || '',
      tags: initialData?.tags?.join(', ') || '',
      broker: initialData?.broker || '',
      commission: initialData?.commission || undefined,
      notes: initialData?.notes || '',
    },
  });

  const status = watch('status');
  const direction = watch('direction');
  const openTime = watch('openTime');
  const closeTime = watch('closeTime');

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      validateImageFile(file);
      setScreenshot(file);
      setUploadError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setUploadError((error as Error).message);
      setScreenshot(null);
      setScreenshotPreview(null);
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    setUploadError(null);
  };

  const onFormSubmit = async (data: TradeFormValues) => {
    console.log('Form submission started with data:', data);
    
    const tradeInput: TradeInput = {
      symbol: data.symbol.toUpperCase(),
      direction: data.direction,
      entry: data.entry,
      exit: data.exit || null,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      quantity: data.quantity,
      pnl: data.pnl,
      openTime: data.openTime,
      closeTime: data.closeTime || null,
      status: data.status,
      setup: data.setup,
      tags: data.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      broker: data.broker,
      commission: data.commission || 0,
      notes: data.notes || '',
      screenshot: screenshot || undefined,
    };

    console.log('Trade input prepared:', tradeInput);
    await onSubmit(tradeInput);
    console.log('Form submission completed successfully');
  };

  const onFormError = (errors: any) => {
    console.error('Form validation errors:', errors);
    console.error('Form errors object:', JSON.stringify(errors, null, 2));
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="symbol">
              Symbol <span className="text-destructive">*</span>
            </Label>
            <Input
              id="symbol"
              placeholder="e.g., EURUSD, XAUUSD"
              {...register('symbol')}
              className={cn(errors.symbol && 'border-destructive')}
            />
            {errors.symbol && (
              <p className="text-sm text-destructive">{errors.symbol.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="direction">
              Direction <span className="text-destructive">*</span>
            </Label>
            <Select
              value={direction}
              onValueChange={(value) => setValue('direction', value as 'long' | 'short')}
            >
              <SelectTrigger className={cn(errors.direction && 'border-destructive')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="long">Long (Buy)</SelectItem>
                <SelectItem value="short">Short (Sell)</SelectItem>
              </SelectContent>
            </Select>
            {errors.direction && (
              <p className="text-sm text-destructive">{errors.direction.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="broker">
              Broker <span className="text-destructive">*</span>
            </Label>
            <Input
              id="broker"
              placeholder="e.g., MetaTrader 5"
              {...register('broker')}
              className={cn(errors.broker && 'border-destructive')}
            />
            {errors.broker && (
              <p className="text-sm text-destructive">{errors.broker.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">
              Status <span className="text-destructive">*</span>
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as 'open' | 'closed')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Price Levels */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Price Levels
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="entry">
              Entry Price <span className="text-destructive">*</span>
            </Label>
            <Input
              id="entry"
              type="number"
              step="0.00001"
              placeholder="1.08750"
              {...register('entry', { 
                setValueAs: emptyStringToUndefined
              })}
              className={cn(errors.entry && 'border-destructive')}
            />
            {errors.entry && (
              <p className="text-sm text-destructive">{errors.entry.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity (Lots) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="quantity"
              type="number"
              step="0.01"
              placeholder="1.00"
              {...register('quantity', { 
                setValueAs: emptyStringToUndefined
              })}
              className={cn(errors.quantity && 'border-destructive')}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stopLoss">
              Stop Loss <span className="text-destructive">*</span>
            </Label>
            <Input
              id="stopLoss"
              type="number"
              step="0.00001"
              placeholder="1.08550"
              {...register('stopLoss', { 
                setValueAs: emptyStringToUndefined
              })}
              className={cn(errors.stopLoss && 'border-destructive')}
            />
            {errors.stopLoss && (
              <p className="text-sm text-destructive">{errors.stopLoss.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="takeProfit">
              Take Profit <span className="text-destructive">*</span>
            </Label>
            <Input
              id="takeProfit"
              type="number"
              step="0.00001"
              placeholder="1.09200"
              {...register('takeProfit', { 
                setValueAs: emptyStringToUndefined
              })}
              className={cn(errors.takeProfit && 'border-destructive')}
            />
            {errors.takeProfit && (
              <p className="text-sm text-destructive">{errors.takeProfit.message}</p>
            )}
          </div>

          {status === 'closed' && (
            <div className="space-y-2">
              <Label htmlFor="exit">
                Exit Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="exit"
                type="number"
                step="0.00001"
                placeholder="1.09200"
                {...register('exit', { 
                  setValueAs: emptyStringToUndefined
                })}
                className={cn(errors.exit && 'border-destructive')}
              />
              {errors.exit && (
                <p className="text-sm text-destructive">{errors.exit.message}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="pnl">
              P&L (Profit & Loss) {status === 'closed' && <span className="text-destructive">*</span>}
            </Label>
            <Input
              id="pnl"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('pnl', { 
                setValueAs: emptyStringToUndefined
              })}
              className={cn(errors.pnl && 'border-destructive')}
            />
            {errors.pnl && (
              <p className="text-sm text-destructive">{errors.pnl.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {status === 'closed' 
                ? 'Enter your profit or loss for this trade (required for closed trades)' 
                : 'Enter unrealized P&L for open trades (optional)'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="commission">
              Commission (Optional)
            </Label>
            <Input
              id="commission"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register('commission', { 
                setValueAs: emptyStringToUndefined
              })}
              className={cn(errors.commission && 'border-destructive')}
            />
            {errors.commission && (
              <p className="text-sm text-destructive">{errors.commission.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Broker fees (optional - for record keeping)
            </p>
          </div>
        </div>
      </div>

      {/* Timing */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Timing
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>
              Open Time <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !openTime && 'text-muted-foreground',
                    errors.openTime && 'border-destructive'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {openTime ? format(openTime, 'PPP p') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={openTime}
                  onSelect={(date) => setValue('openTime', date || new Date())}
                  initialFocus
                />
                <div className="p-3 border-t">
                  <Label htmlFor="openTimeInput" className="text-xs">Time</Label>
                  <Input
                    id="openTimeInput"
                    type="time"
                    value={openTime ? format(openTime, 'HH:mm') : ''}
                    onChange={(e) => {
                      if (openTime) {
                        const [hours, minutes] = e.target.value.split(':');
                        const newDate = new Date(openTime);
                        newDate.setHours(parseInt(hours), parseInt(minutes));
                        setValue('openTime', newDate);
                      }
                    }}
                    className="mt-1"
                  />
                </div>
              </PopoverContent>
            </Popover>
            {errors.openTime && (
              <p className="text-sm text-destructive">{errors.openTime.message}</p>
            )}
          </div>

          {status === 'closed' && (
            <div className="space-y-2">
              <Label>
                Close Time <span className="text-destructive">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !closeTime && 'text-muted-foreground',
                      errors.closeTime && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {closeTime ? format(closeTime, 'PPP p') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={closeTime || undefined}
                    onSelect={(date) => setValue('closeTime', date || undefined)}
                    initialFocus
                  />
                  <div className="p-3 border-t">
                    <Label htmlFor="closeTimeInput" className="text-xs">Time</Label>
                    <Input
                      id="closeTimeInput"
                      type="time"
                      value={closeTime ? format(closeTime, 'HH:mm') : ''}
                      onChange={(e) => {
                        if (closeTime) {
                          const [hours, minutes] = e.target.value.split(':');
                          const newDate = new Date(closeTime);
                          newDate.setHours(parseInt(hours), parseInt(minutes));
                          setValue('closeTime', newDate);
                        }
                      }}
                      className="mt-1"
                    />
                  </div>
                </PopoverContent>
              </Popover>
              {errors.closeTime && (
                <p className="text-sm text-destructive">{errors.closeTime.message}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Trade Analysis */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Trade Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="setup">
              Setup <span className="text-destructive">*</span>
            </Label>
            <Input
              id="setup"
              placeholder="e.g., Breakout, Reversal, Trend Following"
              {...register('setup')}
              className={cn(errors.setup && 'border-destructive')}
            />
            {errors.setup && (
              <p className="text-sm text-destructive">{errors.setup.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              placeholder="momentum, trend, breakout"
              {...register('tags')}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            placeholder="Trade analysis, market conditions, reasons for entry/exit..."
            {...register('notes')}
            rows={4}
          />
        </div>
      </div>

      {/* Screenshot Upload */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Screenshot
        </h3>
        
        <div className="space-y-2">
          <Label htmlFor="screenshot">Chart Screenshot (Optional)</Label>
          <div className="flex flex-col gap-3">
            {!screenshotPreview ? (
              <div className="flex items-center gap-2">
                <Input
                  id="screenshot"
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotChange}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('screenshot')?.click()}
                  className="w-full"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Screenshot
                </Button>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={screenshotPreview}
                  alt="Screenshot preview"
                  className="w-full h-48 object-cover rounded-md border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={removeScreenshot}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Accepted formats: JPEG, PNG, GIF, WebP (max 5MB)
            </p>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex flex-col gap-3 pt-4 border-t">
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || isSubmitting}
          >
            {(isLoading || isSubmitting) ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Trade'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}