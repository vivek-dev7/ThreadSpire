
import React from 'react';
import { Link } from 'react-router-dom';
import { Thread } from '../../types';
import { useApp } from '../../contexts/AppContext';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';
import { BookmarkIcon, GitFork, Eye, MoreVertical } from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeUtils';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ThreadCardProps {
  thread: Thread;
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const { state, bookmarkThread, addThreadToCollection, incrementViews } = useApp();
  const isBookmarked = state.user && thread.bookmarks.includes(state.user.id);
  const userCollections = state.collections.filter(c => c.userId === state.user?.id);

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!state.user) {
      toast.error('Please log in to bookmark');
      return;
    }
    
    try {
      await bookmarkThread(thread.id);
      toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const handleViewThread = () => {
    // Only increment views when actually navigating to thread detail
    incrementViews(thread.id);
  };

  const handleAddToCollection = async (collectionId: string) => {
    if (!state.user) {
      toast.error('Please log in to add to collection');
      return;
    }
    
    try {
      await addThreadToCollection(collectionId, thread.id);
      toast.success('Added to collection');
    } catch (error) {
      toast.error('Failed to add to collection');
    }
  };

  // Get total reactions count
  const totalReactions = thread.segments.reduce((total, segment) => {
    return total + Object.values(segment.reactions).flat().length;
  }, 0);

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Link to={`/thread/${thread.id}`} onClick={handleViewThread} className="block">
              <h3 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-2 line-clamp-2">
                {thread.title}
              </h3>
            </Link>
            <div className="flex items-center text-sm text-gray-600 mb-3">
              <span className="font-medium">{thread.authorName}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(thread.createdAt)}</span>
              {thread.originalThreadId && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600">Forked</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {thread.tags.map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          {state.user && (
            <div className="flex items-center gap-2 ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBookmark}
                className={isBookmarked ? 'text-blue-600' : 'text-gray-400'}
              >
                <BookmarkIcon className="w-4 h-4" />
              </Button>
              
              {userCollections.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white shadow-lg border">
                    {userCollections.map(collection => (
                      <DropdownMenuItem
                        key={collection.id}
                        onClick={() => handleAddToCollection(collection.id)}
                        className="cursor-pointer hover:bg-gray-50"
                      >
                        Add to "{collection.name}"
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3 mb-4">
          {thread.segments.slice(0, 2).map((segment, index) => (
            <p key={segment.id} className="text-gray-700 leading-relaxed">
              {index === 1 && segment.content.length > 150 
                ? `${segment.content.substring(0, 150)}...` 
                : segment.content}
            </p>
          ))}
          {thread.segments.length > 2 && (
            <p className="text-gray-500 text-sm">
              +{thread.segments.length - 2} more segments
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
          <div className="flex items-center space-x-4">
            <span className="flex items-center hover:text-gray-700 transition-colors">
              <Eye className="w-4 h-4 mr-1" />
              {thread.views}
            </span>
            <span className="flex items-center hover:text-gray-700 transition-colors">
              <BookmarkIcon className="w-4 h-4 mr-1" />
              {thread.bookmarks.length}
            </span>
            <span className="flex items-center hover:text-gray-700 transition-colors">
              <GitFork className="w-4 h-4 mr-1" />
              {thread.forks.length}
            </span>
            {totalReactions > 0 && (
              <span className="hover:text-gray-700 transition-colors">
                {totalReactions} reactions
              </span>
            )}
          </div>
          <Link 
            to={`/thread/${thread.id}`}
            onClick={handleViewThread}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            Read more →
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
