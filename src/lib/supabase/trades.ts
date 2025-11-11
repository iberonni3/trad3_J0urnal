import { supabase } from '@/integrations/supabase/client';
import { Trade, TradeInput } from '@/types/trade';
import { calculatePnL, calculateRMultiple } from '@/lib/calculations';

/**
 * Get all trades for a user
 */
export const getUserTrades = async (userId: string): Promise<Trade[]> => {
  const { data, error } = await supabase
    .from('trades')
    .select('*')
    .eq('user_id', userId)
    .order('open_time', { ascending: false });

  if (error) throw error;

  return (data || []).map(trade => ({
    id: trade.id,
    userId: trade.user_id,
    symbol: trade.symbol,
    direction: trade.direction as 'long' | 'short',
    entry: Number(trade.entry),
    exit: trade.exit ? Number(trade.exit) : null,
    stopLoss: Number(trade.stop_loss),
    takeProfit: Number(trade.take_profit),
    quantity: Number(trade.quantity),
    pnl: Number(trade.pnl),
    rMultiple: Number(trade.r_multiple),
    openTime: new Date(trade.open_time),
    closeTime: trade.close_time ? new Date(trade.close_time) : null,
    status: trade.status as 'open' | 'closed',
    setup: trade.setup || '',
    tags: trade.tags || [],
    broker: trade.broker || '',
    commission: Number(trade.commission || 0),
    notes: trade.notes || '',
    screenshotUrl: trade.screenshot_url || undefined,
    createdAt: new Date(trade.created_at),
    updatedAt: new Date(trade.updated_at),
  }));
};

/**
 * Create a new trade
 */
export const createTrade = async (userId: string, tradeInput: TradeInput): Promise<string> => {
  // Calculate P&L and R-multiple for closed trades
  let pnl = tradeInput.pnl ?? 0;
  let rMultiple = 0;

  if (tradeInput.status === 'closed' && tradeInput.exit) {
    const tempTrade: Trade = {
      id: '',
      userId,
      ...tradeInput,
      exit: tradeInput.exit,
      closeTime: tradeInput.closeTime || new Date(),
      pnl: 0,
      rMultiple: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (tradeInput.pnl === undefined) {
      pnl = calculatePnL(tempTrade);
    }
    rMultiple = calculateRMultiple({ ...tempTrade, pnl });
  }

  const { data, error } = await supabase
    .from('trades')
    .insert({
      user_id: userId,
      symbol: tradeInput.symbol,
      direction: tradeInput.direction,
      entry: tradeInput.entry,
      exit: tradeInput.exit,
      stop_loss: tradeInput.stopLoss,
      take_profit: tradeInput.takeProfit,
      quantity: tradeInput.quantity,
      pnl,
      r_multiple: rMultiple,
      open_time: tradeInput.openTime.toISOString(),
      close_time: tradeInput.closeTime?.toISOString() || null,
      status: tradeInput.status,
      setup: tradeInput.setup,
      tags: tradeInput.tags,
      broker: tradeInput.broker,
      commission: tradeInput.commission,
      notes: tradeInput.notes,
      screenshot_url: tradeInput.screenshotUrl,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

/**
 * Update an existing trade
 */
export const updateTrade = async (
  userId: string,
  tradeId: string,
  updates: Partial<TradeInput>
): Promise<void> => {
  // Get existing trade
  const { data: existingTrade, error: fetchError } = await supabase
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  const merged = {
    ...existingTrade,
    ...updates,
  };

  let pnl = updates.pnl ?? Number(existingTrade.pnl);
  let rMultiple = Number(existingTrade.r_multiple);

  if (merged.status === 'closed' && merged.exit) {
    const tempTrade: Trade = {
      id: tradeId,
      userId,
      symbol: merged.symbol,
      direction: merged.direction,
      entry: Number(merged.entry),
      exit: Number(merged.exit),
      stopLoss: Number(merged.stop_loss),
      takeProfit: Number(merged.take_profit),
      quantity: Number(merged.quantity),
      pnl: 0,
      rMultiple: 0,
      openTime: new Date(merged.open_time),
      closeTime: merged.close_time ? new Date(merged.close_time) : null,
      status: merged.status,
      setup: merged.setup || '',
      tags: merged.tags || [],
      broker: merged.broker || '',
      commission: Number(merged.commission || 0),
      notes: merged.notes || '',
      createdAt: new Date(merged.created_at),
      updatedAt: new Date(),
    };

    if (updates.pnl === undefined) {
      pnl = calculatePnL(tempTrade);
    }
    rMultiple = calculateRMultiple({ ...tempTrade, pnl });
  }

  const updateData: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.symbol !== undefined) updateData.symbol = updates.symbol;
  if (updates.direction !== undefined) updateData.direction = updates.direction;
  if (updates.entry !== undefined) updateData.entry = updates.entry;
  if (updates.exit !== undefined) updateData.exit = updates.exit;
  if (updates.stopLoss !== undefined) updateData.stop_loss = updates.stopLoss;
  if (updates.takeProfit !== undefined) updateData.take_profit = updates.takeProfit;
  if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
  if (updates.openTime !== undefined) updateData.open_time = updates.openTime;
  if (updates.closeTime !== undefined) updateData.close_time = updates.closeTime;
  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.setup !== undefined) updateData.setup = updates.setup;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.broker !== undefined) updateData.broker = updates.broker;
  if (updates.commission !== undefined) updateData.commission = updates.commission;
  if (updates.notes !== undefined) updateData.notes = updates.notes;
  if (updates.screenshotUrl !== undefined) updateData.screenshot_url = updates.screenshotUrl;

  updateData.pnl = pnl;
  updateData.r_multiple = rMultiple;

  const { error } = await supabase
    .from('trades')
    .update(updateData)
    .eq('id', tradeId)
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Delete a trade
 */
export const deleteTrade = async (userId: string, tradeId: string): Promise<void> => {
  const { error } = await supabase
    .from('trades')
    .delete()
    .eq('id', tradeId)
    .eq('user_id', userId);

  if (error) throw error;
};

/**
 * Close an open trade
 */
export const closeTrade = async (
  userId: string,
  tradeId: string,
  exitPrice: number,
  closeTime: Date
): Promise<void> => {
  const { data: trade, error: fetchError } = await supabase
    .from('trades')
    .select('*')
    .eq('id', tradeId)
    .eq('user_id', userId)
    .single();

  if (fetchError) throw fetchError;

  const tempTrade: Trade = {
    id: tradeId,
    userId,
    symbol: trade.symbol,
    direction: trade.direction,
    entry: Number(trade.entry),
    exit: exitPrice,
    stopLoss: Number(trade.stop_loss),
    takeProfit: Number(trade.take_profit),
    quantity: Number(trade.quantity),
    pnl: 0,
    rMultiple: 0,
    openTime: new Date(trade.open_time),
    closeTime,
    status: 'closed',
    setup: trade.setup || '',
    tags: trade.tags || [],
    broker: trade.broker || '',
    commission: Number(trade.commission || 0),
    notes: trade.notes || '',
    createdAt: new Date(trade.created_at),
    updatedAt: new Date(),
  };

  const pnl = calculatePnL(tempTrade);
  const rMultiple = calculateRMultiple({ ...tempTrade, pnl });

  const { error } = await supabase
    .from('trades')
    .update({
      exit: exitPrice,
      close_time: closeTime.toISOString(),
      status: 'closed',
      pnl,
      r_multiple: rMultiple,
      updated_at: new Date().toISOString(),
    })
    .eq('id', tradeId)
    .eq('user_id', userId);

  if (error) throw error;
};
