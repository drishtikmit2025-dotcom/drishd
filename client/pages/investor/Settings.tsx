import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  Target,
  Upload,
  Save,
  Eye,
  EyeOff,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import { toast } from "sonner";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6
    }
  }
};

const categories = ["AI/ML", "EdTech", "FinTech", "HealthTech", "GreenTech", "IoT", "SaaS", "Consumer"];
const stages = ["Idea", "Prototype", "Early Customers", "Growth", "Scaling"];
const locations = ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East & Africa"];

export default function InvestorSettings() {
  const { user, updateUser } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  // Profile settings
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "Experienced venture capitalist with 10+ years in tech investments. Focus on early-stage AI and SaaS companies with strong growth potential.",
    company: "Tech Ventures Capital",
    title: "Senior Partner",
    location: "San Francisco, CA",
    website: "https://techventures.com",
    linkedin: "https://linkedin.com/in/investor",
    aum: "500M"
  });

  // Investment preferences
  const [investmentPrefs, setInvestmentPrefs] = useState({
    categories: ["AI/ML", "EdTech", "HealthTech"],
    stages: ["Prototype", "Early Customers", "Growth"],
    regions: ["North America", "Europe"],
    minScore: 75,
    maxInvestment: 10000000,
    minInvestment: 100000,
    dealFlow: "high_quality"
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newHighScoreIdeas: true,
    entrepreneurResponses: true,
    weeklyDigest: true,
    marketUpdates: true,
    dailyRecommendations: false
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showInvestmentHistory: false,
    allowDirectContact: true,
    showInDirectory: true
  });

  const handleProfileUpdate = () => {
    updateUser({ name: profileData.name, email: profileData.email });
    toast.success("Profile updated successfully!");
  };

  const handleInvestmentPrefsUpdate = () => {
    // API call to update investment preferences
    toast.success("Investment preferences updated!");
  };

  const handleNotificationUpdate = () => {
    // API call to update notification preferences
    toast.success("Notification preferences updated!");
  };

  const handlePrivacyUpdate = () => {
    // API call to update privacy settings
    toast.success("Privacy settings updated!");
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center gap-3 mb-2">
              <Settings className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Investor Settings</h1>
            </div>
            <p className="text-gray-600">Manage your investment preferences and account settings</p>
          </motion.div>

          {/* Profile Settings */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Profile Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Section */}
                <div className="flex items-center gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="text-lg">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Upload className="w-4 h-4 mr-2" />
                      Change Avatar
                    </Button>
                    <p className="text-sm text-gray-500 mt-1">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell entrepreneurs about your investment focus and experience..."
                    value={profileData.bio}
                    onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                    rows={4}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="company">Company/Fund</Label>
                    <Input
                      id="company"
                      placeholder="Investment firm or fund name"
                      value={profileData.company}
                      onChange={(e) => setProfileData({...profileData, company: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Your role/title"
                      value={profileData.title}
                      onChange={(e) => setProfileData({...profileData, title: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="City, Country"
                      value={profileData.location}
                      onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      placeholder="https://company.com"
                      value={profileData.website}
                      onChange={(e) => setProfileData({...profileData, website: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aum">AUM (Assets Under Management)</Label>
                    <Input
                      id="aum"
                      placeholder="e.g., 100M"
                      value={profileData.aum}
                      onChange={(e) => setProfileData({...profileData, aum: e.target.value})}
                    />
                  </div>
                </div>

                <Button onClick={handleProfileUpdate} className="bg-gradient-to-r from-purple-500 to-blue-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Profile Changes
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Investment Preferences */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Investment Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categories */}
                <div className="space-y-3">
                  <Label>Preferred Categories</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {categories.map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={investmentPrefs.categories.includes(category)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInvestmentPrefs({
                                ...investmentPrefs,
                                categories: [...investmentPrefs.categories, category]
                              });
                            } else {
                              setInvestmentPrefs({
                                ...investmentPrefs,
                                categories: investmentPrefs.categories.filter(c => c !== category)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={category} className="text-sm">{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Stages */}
                <div className="space-y-3">
                  <Label>Preferred Stages</Label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {stages.map((stage) => (
                      <div key={stage} className="flex items-center space-x-2">
                        <Checkbox
                          id={stage}
                          checked={investmentPrefs.stages.includes(stage)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setInvestmentPrefs({
                                ...investmentPrefs,
                                stages: [...investmentPrefs.stages, stage]
                              });
                            } else {
                              setInvestmentPrefs({
                                ...investmentPrefs,
                                stages: investmentPrefs.stages.filter(s => s !== stage)
                              });
                            }
                          }}
                        />
                        <Label htmlFor={stage} className="text-sm">{stage}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Investment Range */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="min-investment">Minimum Investment ($)</Label>
                    <Input
                      id="min-investment"
                      type="number"
                      placeholder="100000"
                      value={investmentPrefs.minInvestment}
                      onChange={(e) => setInvestmentPrefs({...investmentPrefs, minInvestment: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max-investment">Maximum Investment ($)</Label>
                    <Input
                      id="max-investment"
                      type="number"
                      placeholder="10000000"
                      value={investmentPrefs.maxInvestment}
                      onChange={(e) => setInvestmentPrefs({...investmentPrefs, maxInvestment: parseInt(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Minimum Score */}
                <div className="space-y-3">
                  <Label>Minimum AI Score: {investmentPrefs.minScore}</Label>
                  <Slider
                    value={[investmentPrefs.minScore]}
                    onValueChange={(value) => setInvestmentPrefs({...investmentPrefs, minScore: value[0]})}
                    max={100}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                </div>

                <Button onClick={handleInvestmentPrefsUpdate} className="bg-gradient-to-r from-green-500 to-teal-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save Investment Preferences
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Notification Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, emailNotifications: checked})
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">New High-Score Ideas</p>
                      <p className="text-sm text-gray-600">When ideas matching your criteria score highly</p>
                    </div>
                    <Switch
                      checked={notificationSettings.newHighScoreIdeas}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, newHighScoreIdeas: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Entrepreneur Responses</p>
                      <p className="text-sm text-gray-600">When entrepreneurs respond to your interests</p>
                    </div>
                    <Switch
                      checked={notificationSettings.entrepreneurResponses}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, entrepreneurResponses: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Weekly Digest</p>
                      <p className="text-sm text-gray-600">Weekly summary of investment opportunities</p>
                    </div>
                    <Switch
                      checked={notificationSettings.weeklyDigest}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, weeklyDigest: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Market Updates</p>
                      <p className="text-sm text-gray-600">Industry trends and market insights</p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, marketUpdates: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Daily Recommendations</p>
                      <p className="text-sm text-gray-600">Personalized daily idea recommendations</p>
                    </div>
                    <Switch
                      checked={notificationSettings.dailyRecommendations}
                      onCheckedChange={(checked) => 
                        setNotificationSettings({...notificationSettings, dailyRecommendations: checked})
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleNotificationUpdate} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Privacy Settings */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Privacy & Visibility
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Public Profile</p>
                      <p className="text-sm text-gray-600">Allow entrepreneurs to view your profile</p>
                    </div>
                    <Switch
                      checked={privacySettings.profileVisibility}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, profileVisibility: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Show Investment History</p>
                      <p className="text-sm text-gray-600">Display your past investments (if any)</p>
                    </div>
                    <Switch
                      checked={privacySettings.showInvestmentHistory}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, showInvestmentHistory: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Allow Direct Contact</p>
                      <p className="text-sm text-gray-600">Let entrepreneurs contact you directly</p>
                    </div>
                    <Switch
                      checked={privacySettings.allowDirectContact}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, allowDirectContact: checked})
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Investor Directory</p>
                      <p className="text-sm text-gray-600">Show your profile in public investor directory</p>
                    </div>
                    <Switch
                      checked={privacySettings.showInDirectory}
                      onCheckedChange={(checked) => 
                        setPrivacySettings({...privacySettings, showInDirectory: checked})
                      }
                    />
                  </div>
                </div>

                <Button onClick={handlePrivacyUpdate} variant="outline">
                  <Save className="w-4 h-4 mr-2" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Security */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-purple-600" />
                  Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter current password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>

                <Button className="bg-gradient-to-r from-green-500 to-teal-600">
                  <Shield className="w-4 h-4 mr-2" />
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
