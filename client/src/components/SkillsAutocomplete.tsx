import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface SkillsAutocompleteProps {
  value: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
}

export function SkillsAutocomplete({ value, onChange, placeholder = "Type to add skills..." }: SkillsAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions = [] } = useQuery({
    queryKey: ["/api/skills/suggestions", { q: inputValue }],
    enabled: inputValue.length > 1,
  });

  useEffect(() => {
    if (inputValue.length > 1) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  }, [inputValue]);

  const addSkill = (skill: string) => {
    if (skill.trim() && !value.includes(skill.trim())) {
      onChange([...value, skill.trim()]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(value.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        addSkill(inputValue);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <div className="w-full space-y-2">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => inputValue.length > 1 && setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pr-10"
          data-testid="input-skills"
        />
        <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
        
        {/* Suggestions Dropdown */}
        {showSuggestions && (suggestions as string[]).length > 0 && (
          <div className="absolute z-10 w-full bg-card border border-border rounded-md mt-1 shadow-lg max-h-40 overflow-y-auto">
            {(suggestions as string[]).map((suggestion: string, index: number) => (
              <button
                key={index}
                className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                onClick={() => addSkill(suggestion)}
                data-testid={`suggestion-${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Selected Skills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((skill, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="flex items-center gap-1 skill-chip"
              data-testid={`skill-${skill}`}
            >
              {skill}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 ml-1 hover:bg-transparent"
                onClick={() => removeSkill(skill)}
                data-testid={`remove-skill-${skill}`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
