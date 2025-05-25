
import React, { useState } from 'react';
import { useApp } from '../../contexts/AppContext';
import { ThreadCard } from '../Threads/ThreadCard';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { TrendingUp, Clock, BookmarkIcon, GitFork, PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

type SortOption = 'newest' | 'mostBookmarked' | 'mostForked' | 'featured';

export function ThreadFeed() {
  const { state } = useApp();
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [selectedTag, setSelectedTag] = useState<string>('all');

  const publishedThreads = state.threads.filter(thread => !thread.isDraft);

  // Get all unique tags from actual threads
  const allTags = Array.from(new Set(publishedThreads.flatMap(thread => thread.tags)));

  // Filter threads by tag
  const filteredThreads = selectedTag === 'all' 
    ? publishedThreads 
    : publishedThreads.filter(thread => thread.tags.includes(selectedTag));

  // Sort threads based on selected option
  const sortedThreads = [...filteredThreads].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'mostBookmarked':
        return b.bookmarks.length - a.bookmarks.length;
      case 'mostForked':
        return b.forks.length - a.forks.length;
      case 'featured':
        // Calculate engagement score: bookmarks * 2 + forks * 3 + views * 0.1 + reactions
        const getEngagementScore = (thread: any) => {
          const reactions = thread.segments.reduce((sum: number, segment: any) => 
            sum + Object.values(segment.reactions).flat().length, 0);
          return thread.bookmarks.length * 2 + thread.forks.length * 3 + thread.views * 0.1 + reactions;
        };
        return getEngagementScore(b) - getEngagementScore(a);
      default:
        return 0;
    }
  });

  const sortOptions = [
    { value: 'featured', label: 'Featured', icon: TrendingUp },
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'mostBookmarked', label: 'Most Bookmarked', icon: BookmarkIcon },
    { value: 'mostForked', label: 'Most Forked', icon: GitFork }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wisdom Threads</h1>
            <p className="text-gray-600 mt-2">Discover thoughtful insights and curated wisdom from our community</p>
          </div>
        </div>
        
        {/* Filters and Sorting */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <option.icon className="w-4 h-4 mr-2" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Tag Filter */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedTag === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTag('all')}
            >
              All
            </Button>
            {allTags.slice(0, 6).map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {sortedThreads.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {selectedTag === 'all' ? "No threads yet" : `No threads found with tag "${selectedTag}"`}
          </h3>
          <p className="text-gray-500 text-lg mb-4">
            {selectedTag === 'all' 
              ? "Be the first to share your wisdom!" 
              : "Try selecting a different tag or create a new thread."
            }
          </p>
          {selectedTag !== 'all' ? (
            <Button variant="outline" onClick={() => setSelectedTag('all')} className="mr-4">
              Show All Threads
            </Button>
          ) : null}
          <Button asChild>
            <Link to="/create">Create First Thread</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {sortedThreads.map(thread => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  );
}
