import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Trade, TradeInput } from '@/types/trade';
import {
  getUserTrades,
  createTrade,
  updateTrade,
  deleteTrade,
  closeTrade,
} from '@/lib/firestore/trades';
import { uploadTradeScreenshot } from '@/lib/firebase/storage';
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
export const useCreateTrade = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (tradeInput: TradeInput) => {
      if (!user?.uid) {
        console.error('User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('Mutation function called with tradeInput:', tradeInput);
      console.log('User UID:', user.uid);
      
      try {
        // Create the trade first to get the trade ID
        console.log('Calling createTrade function...');
        const tradeId = await createTrade(user.uid, tradeInput);
        console.log('Trade created successfully with ID:', tradeId);
        
        // Upload screenshot if provided (non-blocking - continue even if upload fails)
        if (tradeInput.screenshot) {
          try {
            console.log('Uploading screenshot...');
            const screenshotUrl = await uploadTradeScreenshot(
              tradeInput.screenshot,
              user.uid,
              tradeId
            );
            console.log('Screenshot uploaded, URL:', screenshotUrl);
            
            // Update the trade with the screenshot URL
            await updateTrade(user.uid, tradeId, { screenshotUrl } as any);
            console.log('Trade updated with screenshot URL');
          } catch (screenshotError) {
            console.error('Error uploading screenshot:', screenshotError);
            // Don't fail the entire operation if screenshot upload fails
            // The trade is already created successfully
          }
        }
        
        return tradeId;
      } catch (error) {
        console.error('Error in createTrade mutation:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
        });
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trades', user?.uid] });
      toast({
        title: 'Success',
        description: 'Trade created successfully',
      });
    },
    onError: (error: Error) => {
      console.error('Create trade error:', error);
      
      // Check if it's a blocked request error
      const errorMessage = error.message || '';
      const isBrave = /Brave/i.test(navigator.userAgent);
      
      if (errorMessage.includes('blocked') || errorMessage.includes('ERR_BLOCKED_BY_CLIENT') || errorMessage.includes('network')) {
        const description = isBrave
          ? 'Brave Shields is blocking Firestore. Click the shield icon in the address bar and disable Shields for this site, then refresh.'
          : 'Your browser or an extension is blocking Firestore requests. Please disable ad blockers or privacy extensions and try again.';
        
        toast({
          title: 'Connection Blocked',
          description: description,
          variant: 'destructive',
          duration: 15000,
        });
      } else {
        toast({
          title: 'Error',
          description: error.message || 'Failed to create trade',
          variant: 'destructive',
        });
      }
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
      
      // Upload new screenshot if provided
      if (updates.screenshot) {
        const screenshotUrl = await uploadTradeScreenshot(
          updates.screenshot,
          user.uid,
          tradeId
        );
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
      toast({
        title: 'Error',
        description: error.message || 'Failed to close trade',
        variant: 'destructive',
      });
    },
  });
};
