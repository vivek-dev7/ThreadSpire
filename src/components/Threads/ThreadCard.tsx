import React from "react";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../../contexts/AppContext";
import { Button } from "../ui/button";
import axios from "axios";

interface Thread {
  _id: string;
  title: string;
  content: string;
  createdBy: {
    _id: string;
    username: string;
  };
  createdAt: string;
}

interface Props {
  thread: Thread;
  onDelete?: () => void; // Callback after deletion (optional)
}

const ThreadCard: React.FC<Props> = ({ thread, onDelete }) => {
  const navigate = useNavigate();
  const { user } = useAppContext();

  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this thread?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`/api/threads/${thread._id}`);
      alert("Thread deleted successfully.");
      if (onDelete) onDelete(); // optional refresh callback
    } catch (error) {
      console.error("Failed to delete thread:", error);
      alert("Failed to delete thread.");
    }
  };

  return (
    <div className="border p-4 rounded shadow-sm mb-4 bg-white">
      <h3 className="text-lg font-bold">{thread.title}</h3>
      <p className="text-sm text-gray-600">{thread.content}</p>
      <p className="text-xs text-gray-400 mt-2">
        Posted by {thread.createdBy.username} on {new Date(thread.createdAt).toLocaleString()}
      </p>

      {user && user._id === thread.createdBy._id && (
        <div className="mt-2 flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/threads/${thread._id}`)}>
            View
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};

export default ThreadCard;
