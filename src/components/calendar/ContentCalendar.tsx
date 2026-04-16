import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Plus, 
  Clock, 
  Instagram, 
  Youtube, 
  Twitter, 
  Linkedin,
  MoreHorizontal,
  Trash2,
  Edit3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduledPost {
  id: string;
  content: string;
  platform: 'instagram' | 'youtube' | 'twitter' | 'linkedin' | 'tiktok';
  scheduledDate: string;
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
  thumbnail?: string;
}

const platformIcons: Record<string, React.ElementType> = {
  instagram: Instagram,
  youtube: Youtube,
  twitter: Twitter,
  linkedin: Linkedin,
  tiktok: MoreHorizontal,
};

const platformColors: Record<string, string> = {
  instagram: '#E4405F',
  youtube: '#FF0000',
  twitter: '#1DA1F2',
  linkedin: '#0A66C2',
  tiktok: '#000000',
};

// Mock scheduled posts
const mockPosts: ScheduledPost[] = [
  {
    id: '1',
    content: 'New video dropping tomorrow! 🎬 Stay tuned for some behind-the-scenes content.',
    platform: 'instagram',
    scheduledDate: '2024-01-15',
    scheduledTime: '18:00',
    status: 'scheduled',
  },
  {
    id: '2',
    content: 'How I grew my channel to 100K subscribers in 6 months - full breakdown thread 🧵',
    platform: 'twitter',
    scheduledDate: '2024-01-16',
    scheduledTime: '12:00',
    status: 'draft',
  },
  {
    id: '3',
    content: 'Just posted a new tutorial on content creation workflows. Check it out!',
    platform: 'youtube',
    scheduledDate: '2024-01-14',
    scheduledTime: '10:00',
    status: 'published',
  },
];

// Generate calendar days
const generateCalendarDays = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();
  
  const days: (number | null)[] = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }
  
  return days;
};

export function ContentCalendar() {
  const [posts, setPosts] = useState<ScheduledPost[]>(mockPosts);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPost, setNewPost] = useState<Partial<ScheduledPost>>({
    platform: 'instagram',
    status: 'draft',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '12:00',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const calendarDays = generateCalendarDays(year, month);

  const getPostsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return posts.filter(post => post.scheduledDate === dateStr);
  };

  const handleAddPost = () => {
    if (!newPost.content) {
      toast.error('Please enter post content');
      return;
    }

    const post: ScheduledPost = {
      id: Date.now().toString(),
      content: newPost.content || '',
      platform: newPost.platform as ScheduledPost['platform'],
      scheduledDate: newPost.scheduledDate || new Date().toISOString().split('T')[0],
      scheduledTime: newPost.scheduledTime || '12:00',
      status: newPost.status as ScheduledPost['status'] || 'draft',
    };

    setPosts([...posts, post]);
    setIsDialogOpen(false);
    setNewPost({
      platform: 'instagram',
      status: 'draft',
      scheduledDate: new Date().toISOString().split('T')[0],
      scheduledTime: '12:00',
    });
    toast.success('Post scheduled successfully!');
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
    toast.success('Post deleted');
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(year, month + (direction === 'next' ? 1 : -1), 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigateMonth('prev')}>
            ←
          </Button>
          <h2 className="text-xl font-semibold text-[#0B0F19]">
            {monthName} {year}
          </h2>
          <Button variant="outline" size="icon" onClick={() => navigateMonth('next')}>
            →
          </Button>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white gap-2">
              <Plus className="w-4 h-4" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Schedule New Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Platform</Label>
                <Select 
                  value={newPost.platform} 
                  onValueChange={(value) => setNewPost({ ...newPost, platform: value as ScheduledPost['platform'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea 
                  placeholder="What's on your mind?"
                  value={newPost.content || ''}
                  onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <Input 
                    type="date"
                    value={newPost.scheduledDate}
                    onChange={(e) => setNewPost({ ...newPost, scheduledDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Time</Label>
                  <Input 
                    type="time"
                    value={newPost.scheduledTime}
                    onChange={(e) => setNewPost({ ...newPost, scheduledTime: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label>Status</Label>
                <Select 
                  value={newPost.status} 
                  onValueChange={(value) => setNewPost({ ...newPost, status: value as ScheduledPost['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full bg-[#00D4AA] hover:bg-[#00D4AA]/90 text-white"
                onClick={handleAddPost}
              >
                Schedule Post (3 VQT)
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Grid */}
      <Card className="border-[#E5E7EB]">
        <CardContent className="p-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-[#6B7280] py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }
              
              const dayPosts = getPostsForDay(day);
              const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
              
              return (
                <div 
                  key={day}
                  className={cn(
                    'aspect-square border rounded-lg p-1 overflow-hidden cursor-pointer hover:bg-[#F6F7F9] transition-colors',
                    isToday && 'border-[#00D4AA] bg-[#00D4AA]/5'
                  )}
                >
                  <div className="text-sm font-medium text-[#0B0F19] mb-1">{day}</div>
                  <div className="space-y-1">
                    {dayPosts.slice(0, 3).map(post => {
                      const Icon = platformIcons[post.platform];
                      return (
                        <div 
                          key={post.id}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Icon 
                            className="w-3 h-3" 
                            style={{ color: platformColors[post.platform] }} 
                          />
                          <span className={cn(
                            'truncate flex-1',
                            post.status === 'published' && 'text-[#00D4AA]'
                          )}>
                            {post.scheduledTime}
                          </span>
                        </div>
                      );
                    })}
                    {dayPosts.length > 3 && (
                      <div className="text-xs text-[#6B7280]">+{dayPosts.length - 3} more</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Posts List */}
      <Card className="border-[#E5E7EB]">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-[#0B0F19]">Upcoming Posts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {posts
              .filter(p => p.status !== 'published')
              .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
              .map(post => {
                const Icon = platformIcons[post.platform];
                return (
                  <div 
                    key={post.id}
                    className="flex items-start gap-3 p-3 rounded-xl bg-[#F6F7F9]"
                  >
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: `${platformColors[post.platform]}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: platformColors[post.platform] }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#0B0F19] line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="secondary" 
                          className={cn(
                            'text-xs',
                            post.status === 'scheduled' && 'bg-[#00D4AA]/10 text-[#00D4AA]'
                          )}
                        >
                          {post.status}
                        </Badge>
                        <span className="text-xs text-[#6B7280] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.scheduledDate} at {post.scheduledTime}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit3 className="w-4 h-4 text-[#6B7280]" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8"
                        onClick={() => handleDeletePost(post.id)}
                      >
                        <Trash2 className="w-4 h-4 text-[#EF4444]" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            {posts.filter(p => p.status !== 'published').length === 0 && (
              <p className="text-center text-[#6B7280] py-8">No upcoming posts</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
