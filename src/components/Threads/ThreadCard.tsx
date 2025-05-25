import React from 'react';
import { Thread } from '../../types';
import { useApp } from '../../context/AppContext';

interface ThreadCardProps {
  thread: Thread;
  onClick?: () => void;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ thread, onClick }) => {
  const { state, deleteThread } = useApp();
  const currentUser = state.user;

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this thread?')) {
      deleteThread(thread.id);
    }
  };

  return (
    <div
      onClick={onClick}
      className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition cursor-pointer relative"
    >
      <h2 className="text-lg font-semibold">{thread.title}</h2>
      <p className="text-sm text-gray-500">
        by {thread.authorName} • {new Date(thread.createdAt).toLocaleDateString()}
      </p>
      <p className="mt-2 text-sm text-gray-700 line-clamp-2">{thread.segments[0]?.text}</p>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-400">
          Views: {thread.views} • Bookmarks: {thread.bookmarks.length}
        </span>

        {currentUser?.id === thread.authorId && (
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent card click
              handleDelete();
            }}
            className="text-red-600 hover:underline text-sm"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};

export default ThreadCard;
