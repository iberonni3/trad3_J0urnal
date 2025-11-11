// @/hooks/useTrades.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Trade, TradeInput } from '@/types/trade';
import {
  getUserTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  closeTrade,
} from '@/lib/supabase/trades';
import { uploadTradeScreenshot } from '@/lib/supabase/storage';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to fetch all trades for the current user
 */
export const useTrades = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['trades', user?.uid],
    queryFn: async () => {
      if (!user?.uid) throw new Error('User not authenticated');
      return await getUserTrades(user.uid);
    },
    enabled: !!user?.uid,
  });
};

/**
 * Hook to create a new trade
 */
export const useCreateTrade = (onSuccessCallback?: () => void) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tradeInput: TradeInput) => {
      if (!user?.uid) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.group('📝 Creating Trade');
      console.log('Trade Input:', tradeInput);
      console.log('Has Screenshot:', !!tradeInput.screenshot);
      console.log('User ID:', user.id);
      
      try {
        // Create the trade first to get the trade ID
        console.log('Step 1: Creating trade in database...');
        const tradeId = await createTrade(user.id, tradeInput);
        console.log('✅ Trade created successfully with ID:', tradeId);
        
        // Upload screenshot if provided
        if (tradeInput.screenshot) {
          console.log('Step 2: Uploading screenshot...');
          
          try {
            const screenshotUrl = await uploadTradeScreenshot(
              tradeInput.screenshot,
              user.id,
              tradeId
            );
            console.log('✅ Screenshot uploaded successfully');
            
            // Update the trade with the screenshot URL
            console.log('Step 3: Updating trade with screenshot URL...');
            await updateTrade(user.id, tradeId, { screenshotUrl } as any);
            console.log('✅ Trade updated with screenshot URL');
            
          } catch (screenshotError) {
            console.error('❌ Error uploading screenshot:', screenshotError);
            
            toast({
              title: 'Warning',
              description: 'Trade created but screenshot upload failed. You can edit the trade to add a screenshot later.',
              variant: 'destructive',
              duration: 5000,
            });
          }
        } else {
          console.log('ℹ️ No screenshot provided, skipping upload');
        }
        
        console.groupEnd();
        return tradeId;
      } catch (error) {
        console.error('❌ Error in createTrade mutation:', error);
        console.groupEnd();
        throw error;
      }
    },
    onSuccess: () => {
      console.log('🔄 Invalidating queries and refetching trades...');
      queryClient.invalidateQueries({ queryKey: ['trades', user?.uid] });
      toast({
        title: 'Success',
        description: 'Trade created successfully',
      });
      // Call the success callback if provided
      if (onSuccessCallback) {
        onSuccessCallback();
      }
    },
    onError: (error: Error) => {
      console.error('❌ Create trade error:', error);
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
  const { user } = useAuth();
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
      if (!user?.uid) throw new Error('User not authenticated');
      
      console.log('📝 Updating trade:', tradeId);
      
      // Upload new screenshot if provided
      if (updates.screenshot) {
        console.log('📸 Uploading new screenshot...');
        const screenshotUrl = await uploadTradeScreenshot(
          updates.screenshot,
          user.uid,
          tradeId
        );
        console.log('✅ Screenshot uploaded:', screenshotUrl);
        updates = { ...updates, screenshotUrl } as any;
      }
      
      await updateTrade(user.uid, tradeId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.uid] });
      toast({
        title: 'Success',
        description: 'Trade updated successfully',
      });
    },
    onError: (error: Error) => {
      console.error('❌ Update trade error:', error);
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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tradeId: string) => {
      if (!user?.uid) throw new Error('User not authenticated');
      await deleteTrade(user.uid, tradeId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.uid] });
      toast({
        title: 'Success',
        description: 'Trade deleted successfully',
      });
    },
    onError: (error: Error) => {
      console.error('❌ Delete trade error:', error);
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
  const { user } = useAuth();
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
      if (!user?.uid) throw new Error('User not authenticated');
      await closeTrade(user.uid, tradeId, exitPrice, closeTime);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.uid] });
      toast({
        title: 'Success',
        description: 'Trade closed successfully',
      });
    },
    onError: (error: Error) => {
      console.error('❌ Close trade error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to close trade',
        variant: 'destructive',
      });
    },
  });
};