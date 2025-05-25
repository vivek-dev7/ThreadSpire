
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Thread, Collection, ThreadSegment } from '../types';

interface AppState {
  user: User | null;
  threads: Thread[];
  collections: Collection[];
  isAuthenticated: boolean;
  loading: boolean;
}

type AppAction =
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_THREADS'; payload: Thread[] }
  | { type: 'ADD_THREAD'; payload: Thread }
  | { type: 'UPDATE_THREAD'; payload: Thread }
  | { type: 'DELETE_THREAD'; payload: string }
  | { type: 'SET_COLLECTIONS'; payload: Collection[] }
  | { type: 'ADD_COLLECTION'; payload: Collection }
  | { type: 'UPDATE_COLLECTION'; payload: Collection }
  | { type: 'DELETE_COLLECTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'REACT_TO_SEGMENT'; payload: { threadId: string; segmentId: string; emoji: string; userId: string } }
  | { type: 'BOOKMARK_THREAD'; payload: { threadId: string; userId: string } }
  | { type: 'INCREMENT_VIEWS'; payload: string };

const initialState: AppState = {
  user: null,
  threads: [],
  collections: [],
  isAuthenticated: false,
  loading: false,
};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  createThread: (thread: Omit<Thread, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateThread: (threadId: string, updates: Partial<Thread>) => Promise<void>;
  reactToSegment: (threadId: string, segmentId: string, emoji: string) => Promise<void>;
  bookmarkThread: (threadId: string) => Promise<void>;
  createCollection: (name: string) => Promise<string>;
  addThreadToCollection: (collectionId: string, threadId: string) => Promise<void>;
  removeThreadFromCollection: (collectionId: string, threadId: string) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  forkThread: (originalThreadId: string) => Promise<string>;
  incrementViews: (threadId: string) => void;
} | null>(null);

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
      };
    case 'SET_THREADS':
      return {
        ...state,
        threads: action.payload,
      };
    case 'ADD_THREAD':
      return {
        ...state,
        threads: [action.payload, ...state.threads],
      };
    case 'UPDATE_THREAD':
      return {
        ...state,
        threads: state.threads.map(thread =>
          thread.id === action.payload.id ? action.payload : thread
        ),
      };
    case 'DELETE_THREAD':
      return {
        ...state,
        threads: state.threads.filter(thread => thread.id !== action.payload),
      };
    case 'SET_COLLECTIONS':
      return {
        ...state,
        collections: action.payload,
      };
    case 'ADD_COLLECTION':
      return {
        ...state,
        collections: [...state.collections, action.payload],
      };
    case 'UPDATE_COLLECTION':
      return {
        ...state,
        collections: state.collections.map(collection =>
          collection.id === action.payload.id ? action.payload : collection
        ),
      };
    case 'DELETE_COLLECTION':
      return {
        ...state,
        collections: state.collections.filter(collection => collection.id !== action.payload),
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    case 'REACT_TO_SEGMENT':
      return {
        ...state,
        threads: state.threads.map(thread => {
          if (thread.id === action.payload.threadId) {
            return {
              ...thread,
              segments: thread.segments.map(segment => {
                if (segment.id === action.payload.segmentId) {
                  const reactions = { ...segment.reactions };
                  const emoji = action.payload.emoji;
                  const userId = action.payload.userId;
                  
                  // Remove user from all other reactions first
                  Object.keys(reactions).forEach(key => {
                    reactions[key] = reactions[key].filter(id => id !== userId);
                  });
                  
                  // Add to selected emoji
                  if (!reactions[emoji]) reactions[emoji] = [];
                  reactions[emoji].push(userId);
                  
                  return { ...segment, reactions };
                }
                return segment;
              }),
            };
          }
          return thread;
        }),
      };
    case 'BOOKMARK_THREAD':
      return {
        ...state,
        threads: state.threads.map(thread => {
          if (thread.id === action.payload.threadId) {
            const bookmarks = thread.bookmarks.includes(action.payload.userId)
              ? thread.bookmarks.filter(id => id !== action.payload.userId)
              : [...thread.bookmarks, action.payload.userId];
            return { ...thread, bookmarks };
          }
          return thread;
        }),
      };
    case 'INCREMENT_VIEWS':
      return {
        ...state,
        threads: state.threads.map(thread =>
          thread.id === action.payload
            ? { ...thread, views: thread.views + 1 }
            : thread
        ),
      };
    default:
      return state;
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load user from localStorage on app start
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch({ type: 'SET_USER', payload: JSON.parse(savedUser) });
    }
    
    const savedThreads = localStorage.getItem('threads');
    if (savedThreads) {
      dispatch({ type: 'SET_THREADS', payload: JSON.parse(savedThreads) });
    }

    const savedCollections = localStorage.getItem('collections');
    if (savedCollections) {
      dispatch({ type: 'SET_COLLECTIONS', payload: JSON.parse(savedCollections) });
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('threads', JSON.stringify(state.threads));
  }, [state.threads]);

  useEffect(() => {
    localStorage.setItem('collections', JSON.stringify(state.collections));
  }, [state.collections]);

  // Mock authentication functions
  const login = async (email: string, password: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Date.now().toString(),
      email,
      username: email.split('@')[0],
      createdAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const register = async (email: string, password: string, username: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Date.now().toString(),
      email,
      username,
      createdAt: new Date().toISOString(),
    };
    
    dispatch({ type: 'SET_USER', payload: user });
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const logout = () => {
    dispatch({ type: 'SET_USER', payload: null });
    localStorage.removeItem('user');
  };

  const createThread = async (threadData: Omit<Thread, 'id' | 'createdAt' | 'updatedAt'>) => {
    const thread: Thread = {
      ...threadData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarks: [],
      forks: [],
      views: 0,
    };
    
    dispatch({ type: 'ADD_THREAD', payload: thread });
    return thread.id;
  };

  const updateThread = async (threadId: string, updates: Partial<Thread>) => {
    const existingThread = state.threads.find(t => t.id === threadId);
    if (existingThread) {
      const updatedThread = {
        ...existingThread,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'UPDATE_THREAD', payload: updatedThread });
    }
  };

  const reactToSegment = async (threadId: string, segmentId: string, emoji: string) => {
    if (!state.user) return;
    
    dispatch({
      type: 'REACT_TO_SEGMENT',
      payload: { threadId, segmentId, emoji, userId: state.user.id },
    });
  };

  const bookmarkThread = async (threadId: string) => {
    if (!state.user) return;
    
    dispatch({
      type: 'BOOKMARK_THREAD',
      payload: { threadId, userId: state.user.id },
    });
  };

  const createCollection = async (name: string) => {
    if (!state.user) return '';
    
    const collection: Collection = {
      id: Date.now().toString(),
      name,
      userId: state.user.id,
      threadIds: [],
      createdAt: new Date().toISOString(),
      isPrivate: true,
    };
    
    dispatch({ type: 'ADD_COLLECTION', payload: collection });
    return collection.id;
  };

  const addThreadToCollection = async (collectionId: string, threadId: string) => {
    const collection = state.collections.find(c => c.id === collectionId);
    if (collection && !collection.threadIds.includes(threadId)) {
      const updatedCollection = {
        ...collection,
        threadIds: [...collection.threadIds, threadId],
      };
      dispatch({ type: 'UPDATE_COLLECTION', payload: updatedCollection });
    }
  };

  const removeThreadFromCollection = async (collectionId: string, threadId: string) => {
    const collection = state.collections.find(c => c.id === collectionId);
    if (collection) {
      const updatedCollection = {
        ...collection,
        threadIds: collection.threadIds.filter(id => id !== threadId),
      };
      dispatch({ type: 'UPDATE_COLLECTION', payload: updatedCollection });
    }
  };

  const deleteCollection = async (collectionId: string) => {
    dispatch({ type: 'DELETE_COLLECTION', payload: collectionId });
  };

  const forkThread = async (originalThreadId: string) => {
    if (!state.user) return '';
    
    const originalThread = state.threads.find(t => t.id === originalThreadId);
    if (!originalThread) return '';
    
    const forkedThread: Thread = {
      ...originalThread,
      id: Date.now().toString(),
      title: `${originalThread.title} (Fork)`,
      authorId: state.user.id,
      authorName: state.user.username,
      originalThreadId,
      isDraft: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      bookmarks: [],
      forks: [],
      views: 0,
    };
    
    dispatch({ type: 'ADD_THREAD', payload: forkedThread });
    
    // Update original thread's fork count
    const updatedOriginal = {
      ...originalThread,
      forks: [...originalThread.forks, forkedThread.id],
    };
    dispatch({ type: 'UPDATE_THREAD', payload: updatedOriginal });
    
    return forkedThread.id;
  };

  const incrementViews = (threadId: string) => {
    dispatch({ type: 'INCREMENT_VIEWS', payload: threadId });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        login,
        register,
        logout,
        createThread,
        updateThread,
        reactToSegment,
        bookmarkThread,
        createCollection,
        addThreadToCollection,
        removeThreadFromCollection,
        deleteCollection,
        forkThread,
        incrementViews,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
