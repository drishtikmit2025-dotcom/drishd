import "dotenv/config";
import mongoose from 'mongoose';
import User from '../models/User';
import Idea from '../models/Idea';
import Notification from '../models/Notification';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/drishti';

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Idea.deleteMany({});
    await Notification.deleteMany({});
    console.log('Cleared existing data');

    // Create sample users
    const entrepreneur1 = new User({
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      password: 'password123',
      role: 'entrepreneur',
      bio: 'Passionate entrepreneur with 5+ years of experience in AI and education technology.',
      location: 'San Francisco, CA',
      website: 'https://sarahchen.com',
      linkedin: 'https://linkedin.com/in/sarahchen'
    });

    const entrepreneur2 = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      role: 'entrepreneur',
      bio: 'Serial entrepreneur focused on sustainable technology solutions.',
      location: 'Portland, OR',
      website: 'https://johndoe.com'
    });

    const investor1 = new User({
      name: 'Michael Chen',
      email: 'michael@techventures.com',
      password: 'password123',
      role: 'investor',
      company: 'Tech Ventures Capital',
      title: 'Senior Partner',
      bio: 'Experienced venture capitalist with 10+ years in tech investments.',
      location: 'Palo Alto, CA',
      aum: '500M',
      investmentPreferences: {
        categories: ['AI/ML', 'EdTech', 'HealthTech'],
        stages: ['Prototype', 'Early Customers', 'Growth'],
        regions: ['North America', 'Europe'],
        minScore: 75,
        maxInvestment: 10000000,
        minInvestment: 100000
      }
    });

    const investor2 = new User({
      name: 'Lisa Park',
      email: 'lisa@greencapital.com',
      password: 'password123',
      role: 'investor',
      company: 'Green Capital',
      title: 'Investment Director',
      bio: 'Focus on sustainable and green technology investments.',
      location: 'Seattle, WA',
      aum: '200M',
      investmentPreferences: {
        categories: ['GreenTech', 'IoT', 'SaaS'],
        stages: ['Early Customers', 'Growth'],
        regions: ['North America'],
        minScore: 80,
        maxInvestment: 5000000,
        minInvestment: 250000
      }
    });

    await entrepreneur1.save();
    await entrepreneur2.save();
    await investor1.save();
    await investor2.save();

    console.log('Created sample users');

    // Create sample ideas
    const idea1 = new Idea({
      title: 'AI-Powered Learning Platform',
      tagline: 'Personalized education through machine learning algorithms',
      category: 'EdTech',
      stage: 'Prototype',
      entrepreneur: entrepreneur1._id,
      problemStatement: 'Traditional education systems fail to adapt to individual learning styles and paces, leading to poor outcomes for many students. One-size-fits-all approaches don\'t work in our diverse world.',
      proposedSolution: 'Our AI-powered platform analyzes student behavior, learning patterns, and performance to create personalized curriculum paths. The system adapts in real-time to ensure optimal learning outcomes.',
      uniqueness: 'Unlike existing platforms, our solution uses advanced neural networks to predict learning difficulties before they occur and proactively adjusts content delivery.',
      targetAudience: 'Individuals',
      marketSize: 'Large (> $10B)',
      competitors: 'Khan Academy, Coursera, Udemy - but none offer true AI personalization',
      customerValidation: 'Conducted 50+ interviews with students and teachers. Built MVP with 200 beta users showing 40% improvement in learning outcomes.',
      currentProgress: 'prototype',
      businessModel: 'Subscription',
      teamBackground: 'Former Google AI researcher with Stanford PhD, experienced education technology team',
      demoUrl: 'https://demo.ailearning.com',
      visibility: 'public',
      status: 'active',
      featured: true
    });

    const idea2 = new Idea({
      title: 'Sustainable Food Delivery',
      tagline: 'Zero-waste food delivery using smart packaging',
      category: 'GreenTech',
      stage: 'Early Customers',
      entrepreneur: entrepreneur2._id,
      problemStatement: 'Food delivery generates massive waste through single-use packaging. Over 100 billion packages are thrown away annually, causing environmental damage.',
      proposedSolution: 'Smart reusable containers with IoT tracking, automated cleaning systems, and optimized logistics to eliminate packaging waste while maintaining food safety.',
      uniqueness: 'First fully integrated reusable packaging system with real-time tracking and automated logistics.',
      targetAudience: 'Individuals',
      marketSize: 'Medium ($1B - $10B)',
      competitors: 'Traditional delivery services like UberEats, DoorDash',
      customerValidation: 'Pilot program with 500 customers in Portland showing 95% satisfaction rate and 80% reuse rate.',
      currentProgress: 'early-users',
      businessModel: 'Commission',
      teamBackground: 'Background in logistics, environmental science, and food technology',
      visibility: 'public',
      status: 'active'
    });

    await idea1.save();
    await idea2.save();

    console.log('Created sample ideas');

    // Create sample notifications
    const notification1 = new Notification({
      recipient: entrepreneur1._id,
      type: 'interest',
      title: 'New investor interest in your idea',
      message: `${investor1.name} expressed interest in your '${idea1.title}' idea`,
      idea: idea1._id,
      relatedUser: investor1._id,
      data: {
        investorName: investor1.name,
        investorRole: investor1.title
      },
      actionRequired: true
    });

    const notification2 = new Notification({
      recipient: investor1._id,
      type: 'new_idea',
      title: 'New high-scoring idea in your focus area',
      message: `A new ${idea1.category} startup idea scored ${idea1.aiScore}/100 and matches your investment preferences`,
      idea: idea1._id,
      relatedUser: entrepreneur1._id,
      actionRequired: true
    });

    await notification1.save();
    await notification2.save();

    console.log('Created sample notifications');

    console.log('✅ Database seeded successfully!');
    console.log('\nSample accounts created:');
    console.log('Entrepreneurs:');
    console.log('- sarah@example.com / password123');
    console.log('- john@example.com / password123');
    console.log('\nInvestors:');
    console.log('- michael@techventures.com / password123');
    console.log('- lisa@greencapital.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
};

seedData();
