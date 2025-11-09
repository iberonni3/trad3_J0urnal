import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Trade, TradeInput } from '@/types/trade';
import { calculatePnL, calculateRMultiple } from '@/lib/calculations';

/**
 * Get all trades for a user
 */
export const getUserTrades = async (userId: string): Promise<Trade[]> => {
  const tradesRef = collection(db, `users/${userId}/trades`);
  const q = query(tradesRef, orderBy('openTime', 'desc'));
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    userId,
    ...doc.data(),
    openTime: doc.data().openTime?.toDate?.() || doc.data().openTime,
    closeTime: doc.data().closeTime?.toDate?.() || doc.data().closeTime,
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
  })) as Trade[];
};

/**
 * Get trades with filtering
 */
export const getFilteredTrades = async (
  userId: string,
  filters: {
    status?: 'open' | 'closed';
    direction?: 'long' | 'short';
    symbol?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): Promise<Trade[]> => {
  const tradesRef = collection(db, `users/${userId}/trades`);
  const constraints: QueryConstraint[] = [];
  
  if (filters.status) {
    constraints.push(where('status', '==', filters.status));
  }
  
  if (filters.direction) {
    constraints.push(where('direction', '==', filters.direction));
  }
  
  if (filters.symbol) {
    constraints.push(where('symbol', '==', filters.symbol.toUpperCase()));
  }
  
  if (filters.dateFrom) {
    constraints.push(where('openTime', '>=', Timestamp.fromDate(filters.dateFrom)));
  }
  
  if (filters.dateTo) {
    constraints.push(where('openTime', '<=', Timestamp.fromDate(filters.dateTo)));
  }
  
  constraints.push(orderBy('openTime', 'desc'));
  
  const q = query(tradesRef, ...constraints);
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    userId,
    ...doc.data(),
    openTime: doc.data().openTime?.toDate?.() || doc.data().openTime,
    closeTime: doc.data().closeTime?.toDate?.() || doc.data().closeTime,
    createdAt: doc.data().createdAt?.toDate?.() || doc.data().createdAt,
    updatedAt: doc.data().updatedAt?.toDate?.() || doc.data().updatedAt,
  })) as Trade[];
};

/**
 * Get a single trade by ID
 */
export const getTrade = async (userId: string, tradeId: string): Promise<Trade | null> => {
  const tradeRef = doc(db, `users/${userId}/trades`, tradeId);
  const snapshot = await getDoc(tradeRef);
  
  if (!snapshot.exists()) {
    return null;
  }
  
  return {
    id: snapshot.id,
    userId,
    ...snapshot.data(),
    openTime: snapshot.data().openTime?.toDate?.() || snapshot.data().openTime,
    closeTime: snapshot.data().closeTime?.toDate?.() || snapshot.data().closeTime,
    createdAt: snapshot.data().createdAt?.toDate?.() || snapshot.data().createdAt,
    updatedAt: snapshot.data().updatedAt?.toDate?.() || snapshot.data().updatedAt,
  } as Trade;
};

/**
 * Create a new trade
 */
export const createTrade = async (userId: string, tradeInput: TradeInput): Promise<string> => {
  try {
    const tradesRef = collection(db, `users/${userId}/trades`);
    
    // Ensure dates are Date objects
    const openTimeDate = tradeInput.openTime instanceof Date 
      ? tradeInput.openTime 
      : new Date(tradeInput.openTime);
    const closeTimeDate = tradeInput.closeTime 
      ? (tradeInput.closeTime instanceof Date 
          ? tradeInput.closeTime 
          : new Date(tradeInput.closeTime))
      : null;
    
    // Validate dates
    if (isNaN(openTimeDate.getTime())) {
      throw new Error('Invalid open time date');
    }
    if (closeTimeDate && isNaN(closeTimeDate.getTime())) {
      throw new Error('Invalid close time date');
    }
    
    console.log('createTrade called with tradeInput:', tradeInput);
    
    // Use manually entered P&L if provided, otherwise default to 0
    // For open trades, P&L can be 0 or the manually entered unrealized P&L
    // For closed trades, P&L should be provided or calculated
    let pnl = tradeInput.pnl !== undefined && tradeInput.pnl !== null ? tradeInput.pnl : 0;
    let rMultiple = 0;
    
    console.log('Initial P&L value:', pnl, 'Status:', tradeInput.status);
    
    // If P&L is not manually provided and trade is closed, calculate it
    if (tradeInput.pnl === undefined && tradeInput.status === 'closed' && tradeInput.exit) {
      console.log('Calculating P&L for closed trade...');
      try {
        const partialTrade: Partial<Trade> = {
          ...tradeInput,
          userId,
          exit: tradeInput.exit || null,
          closeTime: closeTimeDate,
          pnl: 0,
          rMultiple: 0,
        };
        pnl = calculatePnL(partialTrade as Trade);
        rMultiple = calculateRMultiple(partialTrade as Trade);
        console.log('Calculated P&L:', pnl, 'R-multiple:', rMultiple);
      } catch (error) {
        console.error('Error calculating P&L or R-multiple:', error);
        // Default to 0 if calculation fails
        pnl = 0;
      }
    } else if (tradeInput.pnl !== undefined && tradeInput.status === 'closed' && tradeInput.exit) {
      // Calculate R-multiple based on manually entered P&L
      console.log('Calculating R-multiple for manually entered P&L...');
      try {
        const partialTrade: Partial<Trade> = {
          ...tradeInput,
          userId,
          exit: tradeInput.exit || null,
          closeTime: closeTimeDate,
          pnl: tradeInput.pnl,
          rMultiple: 0,
        };
        rMultiple = calculateRMultiple(partialTrade as Trade);
        console.log('Calculated R-multiple:', rMultiple);
      } catch (error) {
        console.error('Error calculating R-multiple:', error);
      }
    }
    
    console.log('Final P&L:', pnl, 'Final R-multiple:', rMultiple);
    
    // Create partial trade object
    const partialTrade: Partial<Trade> = {
      ...tradeInput,
      userId,
      exit: tradeInput.exit || null,
      closeTime: closeTimeDate,
      pnl,
      rMultiple,
    };
    
    const tradeData = {
      ...partialTrade,
      openTime: Timestamp.fromDate(openTimeDate),
      closeTime: closeTimeDate ? Timestamp.fromDate(closeTimeDate) : null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    
    // Remove screenshot from Firestore data (it's handled separately in Storage)
    const { screenshot, ...firestoreData } = tradeData as any;
    
    console.log('Attempting to write to Firestore...');
    console.log('Trade data:', JSON.stringify(firestoreData, null, 2));
    
    try {
      const docRef = await addDoc(tradesRef, firestoreData);
      console.log('Trade created successfully with ID:', docRef.id);
      return docRef.id;
    } catch (writeError: any) {
      console.error('Firestore write error:', writeError);
      console.error('Error code:', writeError?.code);
      console.error('Error message:', writeError?.message);
      
      // Check for blocked request
      if (writeError?.message?.includes('blocked') || 
          writeError?.code === 'unavailable' ||
          writeError?.message?.includes('network')) {
        throw new Error('Connection blocked by browser or extension. Please disable ad blockers and try again.');
      }
      
      throw writeError;
    }
  } catch (error) {
    console.error('Error creating trade:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create trade';
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing trade
 */
export const updateTrade = async (
  userId: string,
  tradeId: string,
  updates: Partial<TradeInput>
): Promise<void> => {
  const tradeRef = doc(db, `users/${userId}/trades`, tradeId);
  
  // Get existing trade data
  const existingTrade = await getTrade(userId, tradeId);
  if (!existingTrade) {
    throw new Error('Trade not found');
  }
  
  // Merge updates with existing data
  const updatedTrade: Partial<Trade> = {
    ...existingTrade,
    ...updates,
  };
  
  // Use manually entered P&L if provided in updates, otherwise calculate it
  let pnl = (updates as any).pnl !== undefined ? (updates as any).pnl : updatedTrade.pnl || 0;
  let rMultiple = updatedTrade.rMultiple || 0;
  
  // If P&L is not manually provided in updates and trade is closed, calculate it
  if ((updates as any).pnl === undefined && updatedTrade.status === 'closed' && updatedTrade.exit) {
    try {
      pnl = calculatePnL(updatedTrade as Trade);
      rMultiple = calculateRMultiple(updatedTrade as Trade);
    } catch (error) {
      console.error('Error calculating P&L or R-multiple:', error);
    }
  } else if ((updates as any).pnl !== undefined && updatedTrade.status === 'closed' && updatedTrade.exit) {
    // Calculate R-multiple based on manually entered P&L
    try {
      const tradeForCalc: Partial<Trade> = {
        ...updatedTrade,
        pnl: (updates as any).pnl,
      };
      rMultiple = calculateRMultiple(tradeForCalc as Trade);
    } catch (error) {
      console.error('Error calculating R-multiple:', error);
    }
  }
  
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  
  // Only update P&L and R-multiple if they were explicitly provided or calculated
  if ((updates as any).pnl !== undefined || (updatedTrade.status === 'closed' && updatedTrade.exit)) {
    updateData.pnl = pnl;
    updateData.rMultiple = rMultiple;
  }
  
  // Convert dates to Timestamps
  if (updates.openTime) {
    updateData.openTime = Timestamp.fromDate(new Date(updates.openTime));
  }
  if (updates.closeTime) {
    updateData.closeTime = Timestamp.fromDate(new Date(updates.closeTime));
  }
  
  // Remove screenshot field (handled separately)
  delete updateData.screenshot;
  
  await updateDoc(tradeRef, updateData);
};

/**
 * Delete a trade
 */
export const deleteTrade = async (userId: string, tradeId: string): Promise<void> => {
  const tradeRef = doc(db, `users/${userId}/trades`, tradeId);
  await deleteDoc(tradeRef);
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
  const trade = await getTrade(userId, tradeId);
  if (!trade) {
    throw new Error('Trade not found');
  }
  
  if (trade.status === 'closed') {
    throw new Error('Trade is already closed');
  }
  
  const updatedTrade: Partial<Trade> = {
    ...trade,
    exit: exitPrice,
    closeTime,
    status: 'closed',
  };
  
  updatedTrade.pnl = calculatePnL(updatedTrade as Trade);
  updatedTrade.rMultiple = calculateRMultiple(updatedTrade as Trade);
  
  const tradeRef = doc(db, `users/${userId}/trades`, tradeId);
  await updateDoc(tradeRef, {
    exit: exitPrice,
    closeTime: Timestamp.fromDate(closeTime),
    status: 'closed',
    pnl: updatedTrade.pnl,
    rMultiple: updatedTrade.rMultiple,
    updatedAt: Timestamp.now(),
  });
};

/**
 * Get trade count by status
 */
export const getTradeCountByStatus = async (
  userId: string,
  status: 'open' | 'closed'
): Promise<number> => {
  const tradesRef = collection(db, `users/${userId}/trades`);
  const q = query(tradesRef, where('status', '==', status));
  const snapshot = await getDocs(q);
  return snapshot.size;
};
