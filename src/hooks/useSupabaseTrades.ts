import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Trade, TradeInput } from '@/types/trade';

/**
 * Hook to fetch all trades for the current user
 */
export const useTrades = () => {
  return useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .order('open_time', { ascending: false });

      if (error) throw error;
      
      // Map Supabase snake_case to our camelCase Trade type
      return (data || []).map(trade => ({
        id: trade.id,
        userId: trade.user_id,
        symbol: trade.symbol,
        direction: trade.direction as 'long' | 'short',
        status: trade.status as 'open' | 'closed',
        entry: trade.entry,
        quantity: trade.quantity,
        stopLoss: trade.stop_loss,
        takeProfit: trade.take_profit,
        exit: trade.exit || undefined,
        commission: trade.commission,
        pnl: trade.pnl,
        rMultiple: trade.r_multiple,
        broker: trade.broker,
        setup: trade.setup,
        tags: trade.tags,
        notes: trade.notes,
        screenshotUrl: trade.screenshot_url,
        openTime: new Date(trade.open_time),
        closeTime: trade.close_time ? new Date(trade.close_time) : undefined,
        createdAt: new Date(trade.created_at),
        updatedAt: new Date(trade.updated_at),
      })) as Trade[];
    },
  });
};

/**
 * Hook to create a new trade
 */
export const useCreateTrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tradeInput: TradeInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Handle screenshot upload if provided
      let screenshotUrl = null;
      if (tradeInput.screenshot) {
        const fileExt = tradeInput.screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError, data } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, tradeInput.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      // Prepare trade data
      const tradeData = {
        user_id: user.id,
        symbol: tradeInput.symbol.toUpperCase(),
        direction: tradeInput.direction,
        status: tradeInput.status,
        entry: tradeInput.entry,
        quantity: tradeInput.quantity,
        stop_loss: tradeInput.stopLoss,
        take_profit: tradeInput.takeProfit,
        exit: tradeInput.exit || null,
        commission: tradeInput.commission || 0,
        pnl: tradeInput.pnl || 0,
        r_multiple: 0, // Will be calculated
        broker: tradeInput.broker,
        setup: tradeInput.setup,
        tags: tradeInput.tags || [],
        notes: tradeInput.notes,
        screenshot_url: screenshotUrl,
        open_time: tradeInput.openTime instanceof Date 
          ? tradeInput.openTime.toISOString() 
          : tradeInput.openTime,
        close_time: tradeInput.closeTime 
          ? (tradeInput.closeTime instanceof Date 
              ? tradeInput.closeTime.toISOString() 
              : tradeInput.closeTime)
          : null,
      };

      const { data, error } = await supabase
        .from('trades')
        .insert([tradeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast({
        title: 'Success',
        description: 'Trade created successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create trade',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to update an existing trade
 */
export const useUpdateTrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      tradeId,
      updates,
    }: {
      tradeId: string;
      updates: Partial<TradeInput>;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Handle screenshot upload if provided
      let screenshotUrl;
      if (updates.screenshot) {
        const fileExt = updates.screenshot.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('trade-screenshots')
          .upload(fileName, updates.screenshot);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('trade-screenshots')
          .getPublicUrl(fileName);
        
        screenshotUrl = publicUrl;
      }

      const updateData: any = {};
      if (updates.symbol) updateData.symbol = updates.symbol.toUpperCase();
      if (updates.direction) updateData.direction = updates.direction;
      if (updates.status) updateData.status = updates.status;
      if (updates.entry) updateData.entry = updates.entry;
      if (updates.quantity) updateData.quantity = updates.quantity;
      if (updates.stopLoss !== undefined) updateData.stop_loss = updates.stopLoss;
      if (updates.takeProfit !== undefined) updateData.take_profit = updates.takeProfit;
      if (updates.exit !== undefined) updateData.exit = updates.exit;
      if (updates.commission !== undefined) updateData.commission = updates.commission;
      if (updates.pnl !== undefined) updateData.pnl = updates.pnl;
      if (updates.broker) updateData.broker = updates.broker;
      if (updates.setup) updateData.setup = updates.setup;
      if (updates.tags) updateData.tags = updates.tags;
      if (updates.notes) updateData.notes = updates.notes;
      if (screenshotUrl) updateData.screenshot_url = screenshotUrl;
      if (updates.openTime) updateData.open_time = updates.openTime;
      if (updates.closeTime) updateData.close_time = updates.closeTime;

      const { error } = await supabase
        .from('trades')
        .update(updateData)
        .eq('id', tradeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast({
        title: 'Success',
        description: 'Trade updated successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update trade',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to delete a trade
 */
export const useDeleteTrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (tradeId: string) => {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast({
        title: 'Success',
        description: 'Trade deleted successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete trade',
        variant: 'destructive',
      });
    },
  });
};

/**
 * Hook to close an open trade
 */
export const useCloseTrade = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      tradeId,
      exitPrice,
      closeTime,
    }: {
      tradeId: string;
      exitPrice: number;
      closeTime: Date;
    }) => {
      const { error } = await supabase
        .from('trades')
        .update({
          exit: exitPrice,
          close_time: closeTime.toISOString(),
          status: 'closed',
        })
        .eq('id', tradeId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades'] });
      toast({
        title: 'Success',
        description: 'Trade closed successfully',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to close trade',
        variant: 'destructive',
      });
    },
  });
};
