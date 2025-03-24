import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion";
import { Input } from "./input";
import { Button } from "./button";
import { useState } from "react";

interface TweetFiltersProps {
  onFiltersChange: (filters: FilterOptions) => void;
}

export interface FilterOptions {
  minEngagement: number;
  topics: string[];
  excludeReplies: boolean;
  onlyVerified: boolean;
  minViralPotential: number;
}

export function TweetFilters({ onFiltersChange }: TweetFiltersProps) {
  const [minEngagement, setMinEngagement] = useState(100);
  const [topics, setTopics] = useState<string[]>([]);
  const [topicInput, setTopicInput] = useState("");
  const [excludeReplies, setExcludeReplies] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [minViralPotential, setMinViralPotential] = useState(50);

  const handleAddTopic = () => {
    if (topicInput && !topics.includes(topicInput)) {
      const newTopics = [...topics, topicInput];
      setTopics(newTopics);
      setTopicInput("");
      
      updateFilters({
        topics: newTopics,
      });
    }
  };

  const handleRemoveTopic = (topic: string) => {
    const newTopics = topics.filter(t => t !== topic);
    setTopics(newTopics);
    
    updateFilters({
      topics: newTopics,
    });
  };

  const updateFilters = (partialFilters: Partial<FilterOptions>) => {
    onFiltersChange({
      minEngagement,
      topics,
      excludeReplies,
      onlyVerified,
      minViralPotential,
      ...partialFilters
    });
  };

  return (
    <div className="w-full max-w-xs">
      <h3 className="font-medium text-lg mb-2">Filters</h3>
      <Accordion type="multiple" defaultValue={["engagement", "topics", "advanced"]} className="w-full">
        <AccordionItem value="engagement">
          <AccordionTrigger className="py-3">Engagement</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Minimum Engagement: {minEngagement}
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs">0</span>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    value={minEngagement}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setMinEngagement(value);
                      updateFilters({ minEngagement: value });
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs">1000+</span>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Viral Potential: {minViralPotential}%
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs">0%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={minViralPotential}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      setMinViralPotential(value);
                      updateFilters({ minViralPotential: value });
                    }}
                    className="flex-1"
                  />
                  <span className="text-xs">100%</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="topics">
          <AccordionTrigger className="py-3">Topics</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="flex gap-2">
                <Input 
                  placeholder="Add topic..." 
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddTopic();
                    }
                  }}
                />
                <Button onClick={handleAddTopic} type="button" variant="outline" size="sm">Add</Button>
              </div>
              {topics.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {topics.map((topic) => (
                    <div 
                      key={topic} 
                      className="flex items-center bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-xs"
                    >
                      {topic}
                      <button 
                        onClick={() => handleRemoveTopic(topic)}
                        className="ml-1 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="advanced">
          <AccordionTrigger className="py-3">Advanced</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="exclude-replies" 
                  checked={excludeReplies}
                  onChange={(e) => {
                    setExcludeReplies(e.target.checked);
                    updateFilters({ excludeReplies: e.target.checked });
                  }}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="exclude-replies" className="text-sm">
                  Exclude replies
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="only-verified" 
                  checked={onlyVerified}
                  onChange={(e) => {
                    setOnlyVerified(e.target.checked);
                    updateFilters({ onlyVerified: e.target.checked });
                  }}
                  className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="only-verified" className="text-sm">
                  Only verified accounts
                </label>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
} 