// Demo data service for when MongoDB is not available
// Using shared state to enable real-time updates across requests

let sharedDemoIdeas = [
  {
    id: '1',
    title: 'AI-Powered Learning Platform',
    tagline: 'Personalized education through machine learning algorithms',
    entrepreneur: {
      id: 'ent1',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      bio: 'Passionate entrepreneur with 5+ years of experience in AI and education.',
      location: 'San Francisco, CA'
    },
    category: 'EdTech',
    score: 92,
    stage: 'Prototype',
    funding: '$2.5M',
    location: 'San Francisco, CA',
    interests: 8,
    views: 156,
    submittedAt: '2024-01-15',
    description: 'Revolutionary AI platform that adapts to individual learning styles and provides personalized curriculum paths for students of all ages.',
    tags: ['AI', 'Education', 'Machine Learning', 'SaaS'],
    teamSize: 5,
    revenue: 'Pre-revenue',
    featured: true
  },
  {
    id: '2',
    title: 'Sustainable Food Delivery',
    tagline: 'Zero-waste food delivery using smart packaging',
    entrepreneur: {
      id: 'ent2',
      name: 'Emma Wilson',
      email: 'emma@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      bio: 'Serial entrepreneur focused on sustainable technology solutions.',
      location: 'Portland, OR'
    },
    category: 'GreenTech',
    score: 85,
    stage: 'Early Customers',
    funding: '$5M',
    location: 'Portland, OR',
    interests: 12,
    views: 243,
    submittedAt: '2024-01-08',
    description: 'Innovative food delivery service that eliminates packaging waste through reusable smart containers and optimized logistics.',
    tags: ['Sustainability', 'Food Tech', 'Logistics', 'IoT'],
    teamSize: 8,
    revenue: '$50K MRR',
    featured: false
  },
  {
    id: '3',
    title: 'Virtual Reality Therapy',
    tagline: 'Mental health treatment through immersive VR experiences',
    entrepreneur: {
      id: 'ent3',
      name: 'Dr. Michael Rodriguez',
      email: 'michael@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      bio: 'Clinical psychologist and VR technology pioneer.',
      location: 'Boston, MA'
    },
    category: 'HealthTech',
    score: 91,
    stage: 'Growth',
    funding: '$8.5M',
    location: 'Boston, MA',
    interests: 15,
    views: 367,
    submittedAt: '2023-12-28',
    description: 'Cutting-edge VR therapy platform helping patients overcome phobias, PTSD, and anxiety disorders through controlled virtual environments.',
    tags: ['VR', 'Mental Health', 'Healthcare', 'B2B'],
    teamSize: 12,
    revenue: '$200K MRR',
    featured: true
  }
];

export const demoNotifications = [
  {
    id: '1',
    type: 'interest',
    title: 'New investor interest in your idea',
    message: 'Sarah Wilson expressed interest in your "AI-Powered Learning Platform" idea',
    investor: 'Sarah Wilson',
    investorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-wilson',
    investorRole: 'Senior Partner at Tech Ventures',
    ideaTitle: 'AI-Powered Learning Platform',
    time: '2 hours ago',
    unread: true,
    actionRequired: true
  },
  {
    id: '2',
    type: 'message',
    title: 'New message from investor',
    message: 'Michael Chen sent you a message about your EdTech startup idea',
    investor: 'Michael Chen',
    investorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael-chen',
    investorRole: 'Angel Investor',
    ideaTitle: 'AI-Powered Learning Platform',
    time: '5 hours ago',
    unread: true,
    actionRequired: true
  },
  {
    id: '3',
    type: 'score_update',
    title: 'AI score updated',
    message: 'Your "Sustainable Food Delivery" idea score improved to 87/100',
    ideaTitle: 'Sustainable Food Delivery',
    oldScore: 82,
    newScore: 87,
    time: '1 day ago',
    unread: false,
    actionRequired: false
  }
];

export const demoInvestorNotifications = [
  {
    id: '1',
    type: 'new_idea',
    title: 'New high-scoring idea in your focus area',
    message: 'A new AI/ML startup idea scored 94/100 and matches your investment preferences',
    entrepreneur: 'Sarah Chen',
    entrepreneurAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-chen',
    ideaTitle: 'Quantum Computing Simulator',
    category: 'AI/ML',
    score: 94,
    time: '1 hour ago',
    unread: true,
    actionRequired: true
  },
  {
    id: '2',
    type: 'response',
    title: 'Entrepreneur responded to your interest',
    message: 'John Doe accepted your connection request and sent a message',
    entrepreneur: 'John Doe',
    entrepreneurAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john-doe',
    ideaTitle: 'AI-Powered Learning Platform',
    time: '3 hours ago',
    unread: true,
    actionRequired: true
  }
];

// Export original data for fallback
export const demoIdeas = [...sharedDemoIdeas];

// Function to add new idea to shared state
export const addDemoIdea = (ideaData: any) => {
  const newIdea = {
    id: Date.now().toString(),
    ...ideaData,
    submittedAt: new Date().toISOString(),
    views: 0,
    interests: 0,
    featured: false,
    score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
  };

  sharedDemoIdeas.unshift(newIdea); // Add to beginning for newest first
  return newIdea;
};

// Function to get current shared ideas
export const getSharedDemoIdeas = () => [...sharedDemoIdeas];

// Function to update an idea in shared state
export const updateDemoIdea = (ideaId: string, updates: any) => {
  const ideaIndex = sharedDemoIdeas.findIndex(idea => idea.id === ideaId);
  if (ideaIndex !== -1) {
    sharedDemoIdeas[ideaIndex] = { ...sharedDemoIdeas[ideaIndex], ...updates, updatedAt: new Date().toISOString() };
    return sharedDemoIdeas[ideaIndex];
  }
  return null;
};

// Function to remove an idea from shared state
export const removeDemoIdea = (ideaId: string) => {
  const before = sharedDemoIdeas.length;
  sharedDemoIdeas = sharedDemoIdeas.filter(idea => idea.id !== ideaId);
  return sharedDemoIdeas.length < before;
};

export const getDemoIdeas = (filters?: any) => {
  let ideas = [...sharedDemoIdeas];
  
  if (filters?.category && filters.category !== 'All') {
    ideas = ideas.filter(idea => idea.category === filters.category);
  }
  
  if (filters?.stage && filters.stage !== 'All') {
    ideas = ideas.filter(idea => idea.stage === filters.stage);
  }
  
  if (filters?.minScore) {
    ideas = ideas.filter(idea => idea.score >= parseInt(filters.minScore));
  }
  
  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    ideas = ideas.filter(idea => 
      idea.title.toLowerCase().includes(searchTerm) ||
      idea.tagline.toLowerCase().includes(searchTerm) ||
      idea.description.toLowerCase().includes(searchTerm)
    );
  }
  
  if (filters?.featured === 'true') {
    ideas = ideas.filter(idea => idea.featured);
  }
  
  // Sort
  switch (filters?.sort) {
    case 'recent':
      ideas.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      break;
    case 'interests':
      ideas.sort((a, b) => b.interests - a.interests);
      break;
    case 'views':
      ideas.sort((a, b) => b.views - a.views);
      break;
    default:
      ideas.sort((a, b) => b.score - a.score);
  }
  
  return ideas;
};

export const getDemoNotifications = (role: 'entrepreneur' | 'investor') => {
  return role === 'entrepreneur' ? demoNotifications : demoInvestorNotifications;
};
