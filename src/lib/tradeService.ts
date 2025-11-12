import { supabase } from '@/integrations/supabase/client';
import { Trade, TradeInput } from '@/types/trade';

export const getUserTrades = async (userId: string): Promise<Trade[]> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('open_time', { ascending: false });

    if (error) throw error;

    console.log('Raw trades from database:', data); // Debug log

    // Convert string dates to Date objects and map ALL fields explicitly
    return (data || []).map(trade => {
      const mappedTrade = {
        id: trade.id,
        userId: trade.user_id,
        symbol: trade.symbol,
        direction: trade.direction,
        entry: trade.entry,
        exit: trade.exit,
        stopLoss: trade.stop_loss,
        takeProfit: trade.take_profit,
        quantity: trade.quantity,
        pnl: trade.pnl || 0,
        rMultiple: trade.r_multiple || 0,
        openTime: new Date(trade.open_time),
        closeTime: trade.close_time ? new Date(trade.close_time) : null,
        status: trade.status,
        setup: trade.setup || '',
        tags: trade.tags || [],
        broker: trade.broker || '',
        commission: trade.commission || 0,
        notes: trade.notes || '',
        screenshotUrl: trade.screenshot_url,
        createdAt: new Date(trade.created_at),
        updatedAt: new Date(trade.updated_at)
      };
      
      console.log('Mapped trade:', mappedTrade); // Debug log
      return mappedTrade;
    });
  } catch (error) {
    console.error('Error fetching trades:', error);
    return [];
  }
};

export const createTrade = async (trade: TradeInput): Promise<Trade | null> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .insert([{
        user_id: (await supabase.auth.getUser()).data.user?.id,
        symbol: trade.symbol,
        direction: trade.direction,
        entry: trade.entry,
        exit: trade.exit,
        stop_loss: trade.stopLoss,
        take_profit: trade.takeProfit,
        quantity: trade.quantity,
        pnl: trade.pnl || 0,
        r_multiple: 0, // Will be calculated
        open_time: trade.openTime.toISOString(),
        close_time: trade.closeTime?.toISOString() || null,
        status: trade.status,
        setup: trade.setup,
        tags: trade.tags,
        broker: trade.broker,
        commission: trade.commission,
        notes: trade.notes,
        screenshot_url: trade.screenshotUrl
      }])
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Trade;
  } catch (error) {
    console.error('Error creating trade:', error);
    return null;
  }
};

export const updateTrade = async (id: string, updates: Partial<TradeInput>): Promise<Trade | null> => {
  try {
    const { data, error } = await supabase
      .from('trades')
      .update({
        ...updates,
        ...(updates.openTime && { open_time: updates.openTime }),
        ...(updates.closeTime && { close_time: updates.closeTime }),
        ...(updates.stopLoss && { stop_loss: updates.stopLoss }),
        ...(updates.takeProfit && { take_profit: updates.takeProfit }),
        ...(updates.screenshotUrl && { screenshot_url: updates.screenshotUrl }),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as unknown as Trade;
  } catch (error) {
    console.error('Error updating trade:', error);
    return null;
  }
};

export const deleteTrade = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting trade:', error);
    return false;
  }
};