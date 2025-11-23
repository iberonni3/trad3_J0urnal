import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/context/AccountContext';
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

// helper to normalize user id (support id or uid)
const getUserId = (user: any) => user?.id ?? user?.uid ?? null;

// helper to invalidate trade-related queries
const invalidateTradeRelatedQueries = (queryClient: any, userId: string | null, accountId: string | null) => {
  if (!queryClient) return;
  console.log('🔁 Invalidating trade-related queries for user:', userId, 'account:', accountId);
  // primary trades query
  if (userId) queryClient.invalidateQueries({ queryKey: ['trades', userId, accountId] });
  // invalidate any query whose key contains known dashboard/analytics/calendar identifiers
  const keysToInvalidate = new Set([
    'analytics',
    'calendar',
    'trades',
    'account-equity',
    'activity',
    'recent-trades',
    'dashboard',
  ]);
  queryClient.invalidateQueries({
    predicate: (query) => {
      const qk = query.queryKey;
      if (!Array.isArray(qk)) return false;
      return qk.some(k => typeof k === 'string' && keysToInvalidate.has(k));
    },
  });
  // dispatch a browser event for non-react listeners
  try {
    window.dispatchEvent(new CustomEvent('trades:updated', { detail: { userId } }));
  } catch (e) {
    // noop
  }
};

/**
 * Hook to fetch all trades for the current user
 */
export const useTrades = () => {
  const { user } = useAuth();
  const { selectedAccount } = useAccount();
  const userId = getUserId(user);
  const accountId = selectedAccount?.id ?? null;

  return useQuery({
    queryKey: ['trades', userId, accountId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      if (!accountId) return [];
      return await getUserTrades(userId, accountId);
    },
    enabled: !!userId && !!accountId,
    placeholderData: [] as Trade[],
  });
};

/**
 * Hook to create a new trade
 */
export const useCreateTrade = (onSuccessCallback?: () => void) => {
  const { user } = useAuth();
  const { selectedAccount } = useAccount();
  const userId = getUserId(user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const accountId = selectedAccount?.id ?? null;

  return useMutation({
    mutationFn: async (tradeInput: TradeInput) => {
      if (!userId) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }
      if (!accountId) {
        console.error('❌ No active account selected');
        throw new Error('Account not selected');
      }

      console.group('📝 Creating Trade');
      console.log('Trade Input:', tradeInput);
      console.log('Has Screenshot:', !!tradeInput.screenshot);
      console.log('User ID:', userId);

      try {
        // Create the trade first to get the trade ID
        console.log('Step 1: Creating trade in database...');

        // Add a timeout to the DB call to prevent indefinite hanging
        const createPromise = createTrade(userId, { ...tradeInput, accountId });
        const timeoutPromise = new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Trade creation timed out')), 15000)
        );

        const tradeId = await Promise.race([createPromise, timeoutPromise]);
        console.log('✅ Trade created successfully with ID:', tradeId);

        // Upload screenshot if provided
        if (tradeInput.screenshot) {
          console.log('Step 2: Uploading screenshot...');

          try {
            const screenshotUrl = await uploadTradeScreenshot(
              tradeInput.screenshot,
              userId,
              tradeId
            );
            console.log('✅ Screenshot uploaded successfully');

            // Update the trade with the screenshot URL
            console.log('Step 3: Updating trade with screenshot URL...');
            await updateTrade(userId, tradeId, { screenshotUrl } as any);
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
      console.log('🔄 CreateTrade onSuccess — refresh related queries');
      invalidateTradeRelatedQueries(queryClient, userId, accountId);
      toast({
        title: 'Success',
        description: 'Trade created successfully',
      });
      if (onSuccessCallback) onSuccessCallback();
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
  const { selectedAccount } = useAccount();
  const userId = getUserId(user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const accountId = selectedAccount?.id ?? null;

  return useMutation({
    mutationFn: async ({
      tradeId,
      updates,
    }: {
      tradeId: string;
      updates: Partial<TradeInput>;
    }) => {
      if (!userId) throw new Error('User not authenticated');

      console.log('📝 Updating trade:', tradeId);

      // Upload new screenshot if provided
      if (updates.screenshot) {
        console.log('📸 Uploading new screenshot...');
        const screenshotUrl = await uploadTradeScreenshot(
          updates.screenshot,
          userId,
          tradeId
        );
        console.log('✅ Screenshot uploaded:', screenshotUrl);
        updates = { ...updates, screenshotUrl } as any;
      }

      await updateTrade(userId, tradeId, updates);
    },
    onSuccess: () => {
      console.log('🔄 UpdateTrade onSuccess — refresh related queries');
      invalidateTradeRelatedQueries(queryClient, userId, accountId);
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
  const { selectedAccount } = useAccount();
  const userId = getUserId(user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const accountId = selectedAccount?.id ?? null;

  return useMutation({
    mutationFn: async (tradeId: string) => {
      if (!userId) throw new Error('User not authenticated');
      await deleteTrade(userId, tradeId);
    },
    onSuccess: () => {
      console.log('🔄 DeleteTrade onSuccess — refresh related queries');
      invalidateTradeRelatedQueries(queryClient, userId, accountId);
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
  const { selectedAccount } = useAccount();
  const userId = getUserId(user);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const accountId = selectedAccount?.id ?? null;

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
      if (!userId) throw new Error('User not authenticated');
      await closeTrade(userId, tradeId, exitPrice, closeTime);
    },
    onSuccess: () => {
      console.log('🔄 CloseTrade onSuccess — refresh related queries');
      invalidateTradeRelatedQueries(queryClient, userId, accountId);
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