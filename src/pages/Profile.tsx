import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out."
    });
    navigate('/login');
  };

  return (
    <>
      <Helmet>
        <title>Profile - Paradise Pulse</title>
        <meta name="description" content="Manage your Paradise Pulse profile and account settings." />
      </Helmet>
      
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Profile
              </CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <div className="p-3 bg-muted rounded-md">
                  {user?.email || 'Not available'}
                </div>
              </div>
              
              {user?.name && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <div className="p-3 bg-muted rounded-md">
                    {user.name}
                  </div>
                </div>
              )}
              
              <div className="pt-4 border-t space-y-3">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/memberspass/groups')}
                  className="w-full"
                >
                  View Membersgroups
                </Button>
                
                <Button 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

export default Profile;