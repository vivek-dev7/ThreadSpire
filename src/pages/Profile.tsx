
import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { ThreadCard } from '../components/Threads/ThreadCard';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { User, Settings, Edit2, BookMarked, GitFork, PenTool, FileText } from 'lucide-react';

export default function Profile() {
  const { state } = useApp();

  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile</h1>
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  const userThreads = state.threads.filter(t => t.authorId === state.user.id && !t.isDraft);
  const userDrafts = state.threads.filter(t => t.authorId === state.user.id && t.isDraft);
  const userForks = state.threads.filter(t => t.authorId === state.user.id && t.originalThreadId);
  const bookmarkedThreads = state.threads.filter(t => t.bookmarks.includes(state.user.id) && !t.isDraft);

  const totalReactions = userThreads.reduce((sum, thread) => 
    sum + thread.segments.reduce((segSum, segment) => 
      segSum + Object.values(segment.reactions).flat().length, 0
    ), 0
  );

  const stats = [
    { label: 'Published Threads', value: userThreads.length, icon: PenTool },
    { label: 'Total Reactions', value: totalReactions, icon: '❤️' },
    { label: 'Bookmarks Received', value: userThreads.reduce((sum, t) => sum + t.bookmarks.length, 0), icon: BookMarked },
    { label: 'Forks Created', value: userForks.length, icon: GitFork },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{state.user.username}</h1>
              <p className="text-gray-600">{state.user.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                Member since {new Date(state.user.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </p>
            </div>
          </div>
          
          <Button variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          {stats.map((stat) => {
            const IconComponent = typeof stat.icon === 'string' ? null : stat.icon;
            return (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="flex items-center justify-center space-x-1 text-sm text-gray-600">
                  {typeof stat.icon === 'string' ? (
                    <span>{stat.icon}</span>
                  ) : (
                    IconComponent && <IconComponent className="w-4 h-4" />
                  )}
                  <span>{stat.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="published" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="published" className="flex items-center space-x-1">
            <PenTool className="w-4 h-4" />
            <span className="hidden sm:inline">Published</span>
          </TabsTrigger>
          <TabsTrigger value="drafts" className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Drafts</span>
          </TabsTrigger>
          <TabsTrigger value="forks" className="flex items-center space-x-1">
            <GitFork className="w-4 h-4" />
            <span className="hidden sm:inline">Forks</span>
          </TabsTrigger>
          <TabsTrigger value="bookmarks" className="flex items-center space-x-1">
            <BookMarked className="w-4 h-4" />
            <span className="hidden sm:inline">Saved</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="published" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Published Threads</h2>
            <span className="text-sm text-gray-500">{userThreads.length} threads</span>
          </div>
          
          {userThreads.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <PenTool className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No published threads yet</h3>
              <p className="text-gray-600 mb-4">Share your wisdom with the community</p>
              <Button asChild>
                <a href="/create">Write Your First Thread</a>
              </Button>
            </div>
          ) : (
            userThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </TabsContent>

        <TabsContent value="drafts" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Draft Threads</h2>
            <span className="text-sm text-gray-500">{userDrafts.length} drafts</span>
          </div>
          
          {userDrafts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts</h3>
              <p className="text-gray-600">Your unpublished threads will appear here</p>
            </div>
          ) : (
            userDrafts.map((thread) => (
              <div key={thread.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{thread.title}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Draft</span>
                    <Button size="sm" variant="outline">
                      <Edit2 className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  Last updated {new Date(thread.updatedAt).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="forks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Forked Threads</h2>
            <span className="text-sm text-gray-500">{userForks.length} forks</span>
          </div>
          
          {userForks.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <GitFork className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forks yet</h3>
              <p className="text-gray-600">Threads you've forked and remixed will appear here</p>
            </div>
          ) : (
            userForks.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </TabsContent>

        <TabsContent value="bookmarks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Bookmarked Threads</h2>
            <span className="text-sm text-gray-500">{bookmarkedThreads.length} bookmarks</span>
          </div>
          
          {bookmarkedThreads.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <BookMarked className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookmarks yet</h3>
              <p className="text-gray-600 mb-4">Save threads you want to read later</p>
              <Button asChild>
                <a href="/">Explore Threads</a>
              </Button>
            </div>
          ) : (
            bookmarkedThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
