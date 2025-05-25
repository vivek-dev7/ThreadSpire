
import React, { useMemo, useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, BookMarked, GitFork, Eye, Heart, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

type TimePeriod = '1m' | '3m' | '6m' | '1y';

export default function Analytics() {
  const { state } = useApp();
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('3m');

  const analytics = useMemo(() => {
    if (!state.user) return null;

    const userThreads = state.threads.filter(t => t.authorId === state.user.id && !t.isDraft);
    
    // Filter threads by time period
    const now = new Date();
    const periodStart = new Date();
    
    switch (selectedPeriod) {
      case '1m':
        periodStart.setMonth(now.getMonth() - 1);
        break;
      case '3m':
        periodStart.setMonth(now.getMonth() - 3);
        break;
      case '6m':
        periodStart.setMonth(now.getMonth() - 6);
        break;
      case '1y':
        periodStart.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filteredThreads = userThreads.filter(thread => 
      new Date(thread.createdAt) >= periodStart
    );
    
    const totalBookmarks = filteredThreads.reduce((sum, thread) => sum + thread.bookmarks.length, 0);
    const totalReactions = filteredThreads.reduce((sum, thread) => 
      sum + thread.segments.reduce((segSum, segment) => 
        segSum + Object.values(segment.reactions).flat().length, 0
      ), 0
    );
    const totalViews = filteredThreads.reduce((sum, thread) => sum + thread.views, 0);
    const totalForks = filteredThreads.reduce((sum, thread) => sum + thread.forks.length, 0);

    const mostEngagedThread = filteredThreads.reduce((prev, current) => {
      const prevScore = prev.bookmarks.length + prev.forks.length + prev.views;
      const currentScore = current.bookmarks.length + current.forks.length + current.views;
      return currentScore > prevScore ? current : prev;
    }, filteredThreads[0]);

    // Generate activity data based on the selected period
    const getActivityData = () => {
      const data = [];
      const days = selectedPeriod === '1m' ? 30 : selectedPeriod === '3m' ? 90 : selectedPeriod === '6m' ? 180 : 365;
      const interval = selectedPeriod === '1m' ? 1 : selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 7 : 30;
      
      for (let i = days; i >= 0; i -= interval) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const dayThreads = filteredThreads.filter(thread => {
          const threadDate = new Date(thread.createdAt);
          return Math.abs(threadDate.getTime() - date.getTime()) < (interval * 24 * 60 * 60 * 1000);
        });

        const label = selectedPeriod === '1m' 
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : selectedPeriod === '3m'
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : selectedPeriod === '6m'
          ? `Week ${Math.ceil((days - i) / 7)}`
          : date.toLocaleDateString('en-US', { month: 'short' });

        data.push({
          period: label,
          threads: dayThreads.length,
          views: dayThreads.reduce((sum, t) => sum + t.views, 0),
          bookmarks: dayThreads.reduce((sum, t) => sum + t.bookmarks.length, 0),
        });
      }
      
      return data;
    };

    return {
      threadsCreated: filteredThreads.length,
      totalBookmarks,
      totalReactions,
      totalViews,
      totalForks,
      mostEngagedThread,
      activityData: getActivityData(),
      filteredThreads,
    };
  }, [state.user, state.threads, selectedPeriod]);

  if (!state.isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics   hiiii  </h1>
          <p className="text-gray-600">Please sign in to view your analytics.</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      label: 'Threads Created',
      value: analytics.threadsCreated,
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Total Bookmarks',
      value: analytics.totalBookmarks,
      icon: BookMarked,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Reactions',
      value: analytics.totalReactions,
      icon: Heart,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      label: 'Total Views',
      value: analytics.totalViews,
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Total Forks',
      value: analytics.totalForks,
      icon: GitFork,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  const timePeriods = [
    { value: '1m', label: '1M' },
    { value: '3m', label: '3M' },
    { value: '6m', label: '6M' },
    { value: '1y', label: '1Y' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Track your impact and engagement on ThreadSpire</p>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex space-x-2">
          {timePeriods.map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedPeriod(period.value as TimePeriod)}
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`${stat.bgColor} rounded-lg p-3`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.activityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="threads" stroke="#3b82f6" strokeWidth={2} name="Threads" />
                  <Line type="monotone" dataKey="views" stroke="#10b981" strokeWidth={2} name="Views" />
                  <Line type="monotone" dataKey="bookmarks" stroke="#f59e0b" strokeWidth={2} name="Bookmarks" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Thread Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Threads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.filteredThreads.slice(0, 5)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="title" 
                    tick={{ fontSize: 12 }}
                    interval={0}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#3b82f6" name="Views" />
                  <Bar dataKey="bookmarks.length" fill="#10b981" name="Bookmarks" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Most Engaged Thread */}
      {analytics.mostEngagedThread && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="w-5 h-5 text-yellow-500 mr-2" />
              Most Engaged Thread
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-medium text-gray-900 mb-2">{analytics.mostEngagedThread.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{analytics.mostEngagedThread.forks.length} forks</span>
                <span>{analytics.mostEngagedThread.bookmarks.length} bookmarks</span>
                <span>{analytics.mostEngagedThread.views} views</span>
                <span>
                  {analytics.mostEngagedThread.segments.reduce((sum, seg) => 
                    sum + Object.values(seg.reactions).flat().length, 0
                  )} reactions
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
