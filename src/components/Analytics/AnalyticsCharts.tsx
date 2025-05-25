
import React from 'react';
import { useApp } from '../../contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, BookmarkIcon, Heart, GitFork, Eye } from 'lucide-react';

export function AnalyticsCharts() {
  const { state } = useApp();

  // Calculate user's thread statistics
  const userThreads = state.threads.filter(t => t.authorId === state.user?.id && !t.isDraft);
  const totalBookmarks = userThreads.reduce((sum, thread) => sum + thread.bookmarks.length, 0);
  const totalForks = userThreads.reduce((sum, thread) => sum + thread.forks.length, 0);
  const totalViews = userThreads.reduce((sum, thread) => sum + thread.views, 0);
  const totalReactions = userThreads.reduce((sum, thread) => 
    sum + thread.segments.reduce((segSum, segment) => 
      segSum + Object.values(segment.reactions).flat().length, 0
    ), 0
  );

  // Generate activity data for the last 30 days
  const activityData = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    
    // Simulate some activity based on actual threads
    const threadsOnDay = userThreads.filter(thread => {
      const threadDate = new Date(thread.createdAt);
      return threadDate.toDateString() === date.toDateString();
    }).length;

    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      threads: threadsOnDay,
      reactions: threadsOnDay * Math.floor(Math.random() * 5),
      views: threadsOnDay * Math.floor(Math.random() * 20) + 10
    };
  });

  // Most successful thread
  const mostSuccessfulThread = userThreads.reduce((best, current) => {
    const currentScore = current.bookmarks.length + current.forks.length + (current.views / 10);
    const bestScore = best ? best.bookmarks.length + best.forks.length + (best.views / 10) : 0;
    return currentScore > bestScore ? current : best;
  }, null);

  const stats = [
    {
      title: "Total Threads",
      value: userThreads.length,
      icon: TrendingUp,
      color: "text-blue-600"
    },
    {
      title: "Total Bookmarks",
      value: totalBookmarks,
      icon: BookmarkIcon,
      color: "text-green-600"
    },
    {
      title: "Total Reactions",
      value: totalReactions,
      icon: Heart,
      color: "text-red-600"
    },
    {
      title: "Total Forks",
      value: totalForks,
      icon: GitFork,
      color: "text-purple-600"
    },
    {
      title: "Total Views",
      value: totalViews,
      icon: Eye,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                <span className="text-sm font-medium text-gray-600">{stat.title}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Over Time (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="threads" stroke="#3b82f6" strokeWidth={2} name="Threads Created" />
              <Line type="monotone" dataKey="reactions" stroke="#ef4444" strokeWidth={2} name="Reactions Received" />
              <Line type="monotone" dataKey="views" stroke="#f59e0b" strokeWidth={2} name="Views" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Thread Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Thread Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={userThreads.slice(0, 5)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="title" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookmarks.length" fill="#3b82f6" name="Bookmarks" />
              <Bar dataKey="views" fill="#10b981" name="Views" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Most Successful Thread */}
      {mostSuccessfulThread && (
        <Card>
          <CardHeader>
            <CardTitle>Most Successful Thread</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">{mostSuccessfulThread.title}</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{mostSuccessfulThread.bookmarks.length}</p>
                  <p className="text-sm text-gray-600">Bookmarks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{mostSuccessfulThread.forks.length}</p>
                  <p className="text-sm text-gray-600">Forks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-600">{mostSuccessfulThread.views}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {mostSuccessfulThread.segments.reduce((sum, seg) => 
                      sum + Object.values(seg.reactions).flat().length, 0
                    )}
                  </p>
                  <p className="text-sm text-gray-600">Reactions</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
