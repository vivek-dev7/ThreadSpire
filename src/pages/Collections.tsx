
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ThreadCard } from '../components/Threads/ThreadCard';
import { Plus, BookMarked, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';

export default function Collections() {
  const { state, createCollection, deleteCollection } = useApp();
  const [newCollectionName, setNewCollectionName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }
    
    setIsCreating(true);
    try {
      await createCollection(newCollectionName.trim());
      setNewCollectionName('');
      setIsDialogOpen(false);
      toast.success('Collection created successfully!');
    } catch (error) {
      console.error('Failed to create collection:', error);
      toast.error('Failed to create collection');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollection(collectionId);
      if (selectedCollection === collectionId) {
        setSelectedCollection(null);
      }
      toast.success('Collection deleted successfully!');
    } catch (error) {
      console.error('Failed to delete collection:', error);
      toast.error('Failed to delete collection');
    }
  };

  const getBookmarkedThreads = () => {
    if (!state.user) return [];
    
    return state.threads.filter(thread => 
      thread.bookmarks.includes(state.user!.id) && !thread.isDraft
    );
  };

  const getCollectionThreads = (collectionId: string) => {
    const collection = state.collections.find(c => c.id === collectionId);
    if (!collection) return [];
    
    return state.threads.filter(thread => 
      collection.threadIds.includes(thread.id) && !thread.isDraft
    );
  };

  if (!state.isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Collections</h1>
          <p className="text-gray-600">Please sign in to view your collections. hiii check</p>
        </div>
      </div>
    );
  }

  const userCollections = state.collections.filter(c => c.userId === state.user?.id);
  const bookmarkedThreads = getBookmarkedThreads();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Collections</h1>
          <p className="text-gray-600">Organize your favorite threads</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Collection name (e.g., 'Career Wisdom')"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateCollection()}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => {
                  setNewCollectionName('');
                  setIsDialogOpen(false);
                }}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleCreateCollection}
                  disabled={!newCollectionName.trim() || isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar - Collection List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Collections</h2>
            
            <div className="space-y-2">
              {/* All Bookmarks */}
              <button
                onClick={() => setSelectedCollection(null)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedCollection === null 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <BookMarked className="w-4 h-4" />
                    <span>All Bookmarks</span>
                  </div>
                  <span className="text-sm text-gray-500">{bookmarkedThreads.length}</span>
                </div>
              </button>

              {/* Custom Collections */}
              {userCollections.map((collection) => (
                <div
                  key={collection.id}
                  className={`p-3 rounded-lg transition-colors ${
                    selectedCollection === collection.id 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setSelectedCollection(collection.id)}
                      className="flex-1 text-left"
                    >
                      <span>{collection.name}</span>
                    </button>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">{collection.threadIds.length}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-6 h-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteCollection(collection.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {userCollections.length === 0 && (
                <div className="text-center py-6 text-gray-500">
                  <BookMarked className="w-8 h-8 mx-auto mb-2" />
                  <p className="text-sm">No collections yet</p>
                  <p className="text-xs">Create your first collection to organize threads</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Threads */}
        <div className="lg:col-span-2">
          <div className="space-y-6">
            {selectedCollection === null ? (
              <>
                <div className="flex items-center space-x-2 mb-4">
                  <BookMarked className="w-5 h-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">All Bookmarks</h2>
                  <span className="text-sm text-gray-500">({bookmarkedThreads.length})</span>
                </div>
                
                {bookmarkedThreads.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <BookMarked className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
                    <p className="text-gray-600 mb-4">Start bookmarking threads to build your collection</p>
                    <Button asChild>
                      <a href="/">Explore Threads</a>
                    </Button>
                  </div>
                ) : (
                  bookmarkedThreads.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))
                )}
              </>
            ) : (
              <>
                {(() => {
                  const collection = userCollections.find(c => c.id === selectedCollection);
                  const threads = getCollectionThreads(selectedCollection);
                  
                  return (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">{collection?.name}</h2>
                        <span className="text-sm text-gray-500">({threads.length})</span>
                      </div>
                      
                      {threads.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <BookMarked className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Collection is empty</h3>
                          <p className="text-gray-600 mb-4">Use the menu on thread cards to add bookmarked threads to this collection</p>
                        </div>
                      ) : (
                        threads.map((thread) => (
                          <ThreadCard key={thread.id} thread={thread} />
                        ))
                      )}
                    </>
                  );
                })()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
