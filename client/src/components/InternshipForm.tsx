import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Send } from "lucide-react";
import { SkillsAutocomplete } from "./SkillsAutocomplete";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function InternshipForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requiredSkills: [] as string[],
    location: "",
    positions: 1,
    stipend: ""
  });

  const createInternshipMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/internships", {
        ...data,
        stipend: parseInt(data.stipend) || 0
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/internships"] });
      toast({
        title: "Internship posted",
        description: "Your internship has been successfully posted.",
      });
      // Reset form
      setFormData({
        title: "",
        description: "",
        requiredSkills: [],
        location: "",
        positions: 1,
        stipend: ""
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to post internship",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createInternshipMutation.mutate(formData);
  };

  const locations = [
    "Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad", 
    "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Gurgaon"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <PlusCircle className="h-5 w-5 mr-2 text-primary" />
          Post New Internship
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">Job Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Data Science Intern"
              required
              data-testid="input-job-title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and expectations..."
              rows={4}
              className="resize-none"
              data-testid="textarea-description"
            />
          </div>

          <div>
            <Label>Required Skills</Label>
            <SkillsAutocomplete
              value={formData.requiredSkills}
              onChange={(skills) => setFormData({ ...formData, requiredSkills: skills })}
              placeholder="Type skills and press Enter..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Select 
                value={formData.location} 
                onValueChange={(value) => setFormData({ ...formData, location: value })}
              >
                <SelectTrigger data-testid="select-location">
                  <SelectValue placeholder="Select location" />
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
            <div>
              <Label htmlFor="positions">Positions</Label>
              <Input
                id="positions"
                type="number"
                min="1"
                value={formData.positions}
                onChange={(e) => setFormData({ ...formData, positions: parseInt(e.target.value) || 1 })}
                data-testid="input-positions"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="stipend">Monthly Stipend (₹)</Label>
            <Input
              id="stipend"
              type="number"
              value={formData.stipend}
              onChange={(e) => setFormData({ ...formData, stipend: e.target.value })}
              placeholder="25000"
              data-testid="input-stipend"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={createInternshipMutation.isPending}
            data-testid="button-post-internship"
          >
            <Send className="h-4 w-4 mr-2" />
            {createInternshipMutation.isPending ? "Posting..." : "Post Internship"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
