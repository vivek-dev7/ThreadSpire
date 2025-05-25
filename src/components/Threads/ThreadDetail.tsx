
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { ArrowLeft, BookmarkIcon, GitFork, Eye, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { formatTimeAgo } from '../../utils/timeUtils';
import { ThreadCard } from './ThreadCard';

const REACTION_EMOJIS = ['🤯', '💡', '😌', '🔥', '🫶'];

export function ThreadDetail() {
  const { id } = useParams<{ id: string }>();
  const { state, reactToSegment, bookmarkThread, forkThread, incrementViews } = useApp();
  const navigate = useNavigate();
  
  const thread = state.threads.find(t => t.id === id);
  
  if (!thread) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Thread not found</h1>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to feed
          </Link>
        </div>
      </div>
    );
  }

  const isBookmarked = state.user && thread.bookmarks.includes(state.user.id);
  
  // Get related threads by tags (excluding current thread)
  const relatedThreads = state.threads
    .filter(t => 
      t.id !== thread.id && 
      !t.isDraft && 
      t.tags.some(tag => thread.tags.includes(tag))
    )
    .slice(0, 3);

  const handleReaction = async (segmentId: string, emoji: string) => {
    if (!state.user) {
      toast.error('Please log in to react');
      return;
    }
    await reactToSegment(thread.id, segmentId, emoji);
  };

  const handleBookmark = async () => {
    if (!state.user) {
      toast.error('Please log in to bookmark');
      return;
    }
    await bookmarkThread(thread.id);
    toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const handleFork = async () => {
    if (!state.user) {
      toast.error('Please log in to fork');
      return;
    }
    
    try {
      const forkedThreadId = await forkThread(thread.id);
      toast.success('Thread forked! Redirecting to editor...');
      navigate(`/create?fork=${forkedThreadId}`);
    } catch (error) {
      toast.error('Failed to fork thread');
    }
  };

  const handleThreadView = () => {
    // Only increment views once when thread is opened, not continuously
    if (thread && id) {
      incrementViews(id);
    }
  };

  // Call handleThreadView only once when component mounts
  React.useEffect(() => {
    handleThreadView();
  }, []); // Empty dependency array ensures this runs only once

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to feed
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{thread.title}</h1>
            <div className="flex items-center text-sm text-gray-600 mb-4">
              <span className="font-medium">{thread.authorName}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(thread.createdAt)}</span>
              <span className="mx-2">•</span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {thread.views} views
              </span>
              {thread.originalThreadId && (
                <>
                  <span className="mx-2">•</span>
                  <span className="text-blue-600">Forked Thread</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {thread.tags.map(tag => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          {state.user && (
            <div className="flex gap-2 ml-4">
              <Button
                onClick={handleBookmark}
                variant={isBookmarked ? "default" : "outline"}
                size="sm"
              >
                <BookmarkIcon className="w-4 h-4 mr-2" />
                {isBookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button onClick={handleFork} variant="outline" size="sm">
                <GitFork className="w-4 h-4 mr-2" />
                Fork
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Thread Content */}
      <div className="space-y-8 mb-12">
        {thread.segments.map((segment, index) => (
          <Card key={segment.id} className="relative">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  Segment {index + 1}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-800 leading-relaxed text-lg mb-6 whitespace-pre-wrap">
                {segment.content}
              </p>
              
              {/* Reactions */}
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {REACTION_EMOJIS.map(emoji => {
                      const count = segment.reactions[emoji]?.length || 0;
                      const hasReacted = state.user && segment.reactions[emoji]?.includes(state.user.id);
                      
                      return (
                        <button
                          key={emoji}
                          onClick={() => handleReaction(segment.id, emoji)}
                          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                            hasReacted 
                              ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                          }`}
                          disabled={!state.user}
                        >
                          <span>{emoji}</span>
                          {count > 0 && <span>{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Thread Stats */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex gap-6">
              <span className="flex items-center">
                <BookmarkIcon className="w-4 h-4 mr-1" />
                {thread.bookmarks.length} bookmarks
              </span>
              <span className="flex items-center">
                <GitFork className="w-4 h-4 mr-1" />
                {thread.forks.length} forks
              </span>
              <span className="flex items-center">
                <Eye className="w-4 h-4 mr-1" />
                {thread.views} views
              </span>
            </div>
            {thread.originalThreadId && (
              <Link 
                to={`/thread/${thread.originalThreadId}`}
                className="text-blue-600 hover:text-blue-800"
              >
                View original thread →
              </Link>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Related Threads */}
      {relatedThreads.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Threads</h2>
          <div className="space-y-6">
            {relatedThreads.map(relatedThread => (
              <ThreadCard key={relatedThread.id} thread={relatedThread} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
