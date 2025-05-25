
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { ThreadCard } from '../Threads/ThreadCard';
import { Button } from '../ui/button';
import { PenTool } from 'lucide-react';
import { Link } from 'react-router-dom';

export function DraftFeed() {
  const { state } = useApp();

  const userDrafts = state.threads.filter(
    thread => thread.isDraft && thread.authorId === state.user?.id
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Draft Threads</h1>
            <p className="text-gray-600">Your unpublished wisdom threads</p>
          </div>
          <Button asChild>
            <Link to="/create">
              <PenTool className="w-4 h-4 mr-2" />
              New Thread
            </Link>
          </Button>
        </div>
      </div>

      {userDrafts.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <PenTool className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 text-lg mb-4">No draft threads yet</p>
          <Button asChild>
            <Link to="/create">Start Writing</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {userDrafts.map(thread => (
            <div key={thread.id} className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded">
                  Draft
                </span>
              </div>
              <ThreadCard thread={thread} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
