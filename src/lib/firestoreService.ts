import { app } from './firebase';
import { 
    getFirestore, 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    query,
    orderBy,
    limit,
} from 'firebase/firestore';
import type { Player, Match } from '@/types';

const db = getFirestore(app);

const playersCollection = collection(db, 'players');
const matchesCollection = collection(db, 'matches');

// Player Functions
export const getPlayers = async (): Promise<Player[]> => {
    const snapshot = await getDocs(query(playersCollection, orderBy('points', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
};

export const addPlayer = async (playerData: Omit<Player, 'id'>): Promise<Player> => {
    const docRef = await addDoc(playersCollection, playerData);
    const newPlayer = { id: docRef.id, ...playerData, status: 'undecided', waitingTimestamp: null } as Player;
    return newPlayer;
};

export const updatePlayer = async (player: Player): Promise<void> => {
    const { id, ...playerData } = player;
    if (!id) throw new Error("Player ID is required for update.");
    const playerDoc = doc(db, 'players', id);
    // Ensure we don't save UI state like status to the DB
    const dataToSave = { ...playerData };
    delete (dataToSave as any).status;
    delete (dataToSave as any).waitingTimestamp;
    await updateDoc(playerDoc, dataToSave);
};

export const deletePlayer = async (playerId: string): Promise<void> => {
    const playerDoc = doc(db, 'players', playerId);
    await deleteDoc(playerDoc);
};


// Match Functions
export const getMatches = async (): Promise<Match[]> => {
    const snapshot = await getDocs(query(matchesCollection, orderBy('date', 'desc'), limit(50)));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Match));
};

export const addMatch = async (matchData: Omit<Match, 'id'>): Promise<Match> => {
    const docRef = await addDoc(matchesCollection, matchData);
    return { id: docRef.id, ...matchData };
};
