import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { UserCog, Save } from "lucide-react";
import { SkillsAutocomplete } from "./SkillsAutocomplete";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    skills: [] as string[],
    cgpa: 8.5,
    location: "",
    diversityFlag: false
  });

  const { data: profile, isLoading } = useQuery({
    queryKey: ["/api/students/profile"],
    enabled: user?.role === 'student',
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("PUT", "/api/students/profile", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        skills: profile.skills || [],
        cgpa: parseFloat(profile.cgpa) || 8.5,
        location: profile.location || "",
        diversityFlag: profile.diversityFlag || false
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const calculateProfileCompletion = () => {
    let completed = 0;
    let total = 5;

    if (formData.name) completed++;
    if (formData.skills.length > 0) completed++;
    if (formData.cgpa > 0) completed++;
    if (formData.location) completed++;
    if (formData.diversityFlag !== undefined) completed++;

    return Math.round((completed / total) * 100);
  };

  const locations = [
    "Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", 
    "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Gurgaon"
  ];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <UserCog className="h-5 w-5 mr-2 text-primary" />
            Your Profile
          </CardTitle>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            {calculateProfileCompletion()}% Complete
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
              data-testid="input-name"
            />
          </div>

          <div>
            <Label>Skills</Label>
            <SkillsAutocomplete
              value={formData.skills}
              onChange={(skills) => setFormData({ ...formData, skills })}
              placeholder="Type to add skills..."
            />
          </div>

          <div>
            <Label>CGPA: {formData.cgpa}</Label>
            <div className="px-3 mt-2">
              <Slider
                value={[formData.cgpa]}
                onValueChange={(value) => setFormData({ ...formData, cgpa: value[0] })}
                max={10}
                min={0}
                step={0.1}
                className="w-full"
                data-testid="slider-cgpa"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>0.0</span>
                <span className="font-medium text-primary">{formData.cgpa}</span>
                <span>10.0</span>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Select 
              value={formData.location} 
              onValueChange={(value) => setFormData({ ...formData, location: value })}
            >
              <SelectTrigger data-testid="select-location">
                <SelectValue placeholder="Select your location" />
              </SelectTrigger>
              <SelectContent>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="diversity"
              checked={formData.diversityFlag}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, diversityFlag: !!checked })
              }
              data-testid="checkbox-diversity"
            />
            <Label htmlFor="diversity" className="text-sm">
              Eligible for diversity considerations
            </Label>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={updateProfileMutation.isPending}
            data-testid="button-update-profile"
          >
            <Save className="h-4 w-4 mr-2" />
            {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
