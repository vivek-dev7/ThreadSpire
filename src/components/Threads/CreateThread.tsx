import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '../../contexts/AppContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Trash2, Save, Send, Moon, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface ThreadSegment {
  id: string;
  content: string;
  order: number;
}

export function CreateThread() {
  const { state, createThread, updateThread } = useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const forkId = searchParams.get('fork');
  
  const [title, setTitle] = useState('');
  const [segments, setSegments] = useState<ThreadSegment[]>([
    { id: '1', content: '', order: 1 }
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Auto-enable dark mode when component mounts
    setIsDarkMode(true);
    document.documentElement.classList.add('dark');
    
    // If fork ID is provided, load the forked thread
    if (forkId) {
      const forkedThread = state.threads.find(t => t.id === forkId);
      if (forkedThread) {
        setTitle(forkedThread.title);
        setSegments(forkedThread.segments.map(seg => ({
          id: seg.id,
          content: seg.content,
          order: seg.order
        })));
        setTags([...forkedThread.tags]);
        setIsEditing(true);
      }
    }
    
    return () => {
      // Clean up dark mode when component unmounts
      document.documentElement.classList.remove('dark');
    };
  }, [forkId, state.threads]);

  if (!state.user) {
    navigate('/login');
    return null;
  }

  const addSegment = () => {
    const newSegment: ThreadSegment = {
      id: Date.now().toString(),
      content: '',
      order: segments.length + 1
    };
    setSegments([...segments, newSegment]);
  };

  const updateSegment = (id: string, content: string) => {
    setSegments(segments.map(seg => 
      seg.id === id ? { ...seg, content } : seg
    ));
  };

  const removeSegment = (id: string) => {
    if (segments.length > 1) {
      setSegments(segments.filter(seg => seg.id !== id));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async (isDraft: boolean) => {
    if (!title.trim()) {
      toast.error('Please add a title');
      return;
    }

    if (segments.some(seg => !seg.content.trim())) {
      toast.error('Please fill in all segments');
      return;
    }

    try {
      if (isEditing && forkId) {
        // Update existing draft
        await updateThread(forkId, {
          title: title.trim(),
          segments: segments.map(seg => ({
            ...seg,
            reactions: {}
          })),
          tags,
          isDraft,
        });
        
        if (isDraft) {
          toast.success('Draft updated successfully');
          navigate('/drafts');
        } else {
          toast.success('Thread published successfully!');
          navigate(`/thread/${forkId}`);
        }
      } else {
        // Create new thread
        const threadData = {
          title: title.trim(),
          authorId: state.user.id,
          authorName: state.user.username,
          segments: segments.map(seg => ({
            ...seg,
            reactions: {}
          })),
          tags,
          isDraft,
          bookmarks: [],
          forks: [],
          views: 0
        };

        const threadId = await createThread(threadData);
        
        if (isDraft) {
          toast.success('Thread saved as draft');
          navigate('/drafts');
        } else {
          toast.success('Thread published successfully!');
          navigate(`/thread/${threadId}`);
        }
      }
    } catch (error) {
      toast.error('Failed to save thread');
    }
  };

  return (
    <div className={`min-h-screen transition-colors ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-800 mb-4 inline-flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to feed
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {isEditing ? 'Edit Thread' : 'Create Wisdom Thread'}
              </h1>
              <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isEditing ? 'Modify your forked thread' : 'Share your thoughts and insights with the community'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center gap-2"
            >
              <Moon className="w-4 h-4" />
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
          </div>
        </div>

        <Card className={isDarkMode ? 'bg-gray-800 border-gray-700' : ''}>
          <CardHeader>
            <CardTitle className={isDarkMode ? 'text-white' : ''}>Thread Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your thread a compelling title..."
                className={`text-lg ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
              />
            </div>

            {/* Tags */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button onClick={() => removeTag(tag)} className="text-xs">×</button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  placeholder="Add a tag..."
                  className={`flex-1 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder:text-gray-400' : ''}`}
                />
                <Button onClick={addTag} variant="outline" size="sm">
                  Add
                </Button>
              </div>
            </div>

            {/* Segments */}
            <div>
              <label className={`block text-sm font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                Thread Segments
              </label>
              <div className="space-y-4">
                {segments.map((segment, index) => (
                  <div key={segment.id} className={`border rounded-lg p-4 ${isDarkMode ? 'border-gray-600 bg-gray-700' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Segment {index + 1}
                      </span>
                      {segments.length > 1 && (
                        <Button
                          onClick={() => removeSegment(segment.id)}
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    <Textarea
                      value={segment.content}
                      onChange={(e) => updateSegment(segment.id, e.target.value)}
                      placeholder="Write your thoughts here..."
                      className={`min-h-[120px] ${isDarkMode ? 'bg-gray-600 border-gray-500 text-white placeholder:text-gray-400' : ''}`}
                    />
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={addSegment} 
                variant="outline" 
                className="mt-4 w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Segment
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t">
              <Button 
                onClick={() => handleSave(true)} 
                variant="outline"
                className="flex-1"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </Button>
              <Button 
                onClick={() => handleSave(false)}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Publish Thread
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
