import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// Removed unused imports: Card, CardContent, CardHeader, CardTitle, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Wand2
import { Plus, Trash } from "lucide-react";
import { TournamentLevel } from "@/types/types";
import { toast } from "sonner";

// Removed formatOptions as it's not used here

// Updated interface to include includeAnte
export interface BlindsSetupTabProps {
  levels: TournamentLevel[];
  onLevelsChange: (levels: TournamentLevel[]) => void;
  includeAnte: boolean; // Added - relevant for table display/manual ante input
  // Removed props related to generation parameters as they are not used in this component's UI
  // handleGenerateBlindStructure: () => void;
  // playerCount: number;
  // initialChips: number;
  // durationHours: number;
  // allowRebuy: boolean;
  // maxRebuys: number;
  // tournamentFormat: string;
  // chipsetValues: number[];
}

const BlindsSetupTab: React.FC<BlindsSetupTabProps> = ({
  levels,
  onLevelsChange,
  includeAnte, // Accept the includeAnte prop
}) => {
  const addLevel = () => {
    const lastLevel = levels.length > 0 ? levels[levels.length - 1] : null;
    const newLevel: TournamentLevel = {
      level: lastLevel ? lastLevel.level + 1 : 1,
      // Simple blind progression for manual add - might need refinement
      smallBlind: lastLevel && !lastLevel.isBreak ? lastLevel.smallBlind * 2 : 25, // Default starting blinds if no previous level or last was break
      bigBlind: lastLevel && !lastLevel.isBreak ? lastLevel.bigBlind * 2 : 50,   // Default starting blinds
      // Simple ante progression if includeAnte is true
      ante: lastLevel && !lastLevel.isBreak && includeAnte
        ? Math.floor((lastLevel.ante || 0) * 1.5) || Math.floor((lastLevel.bigBlind || 50) * 0.1) // Use previous ante or 10% of previous BB
        : (includeAnte ? Math.floor(50 * 0.1) : 0), // Default ante if first level or last was break
      duration: 20, // Default duration for manually added level
      isBreak: false
    };

    onLevelsChange([...levels, newLevel]);
  };

  const addBreak = () => {
    const lastLevel = levels.length > 0 ? levels[levels.length - 1] : null;
    const newBreak: TournamentLevel = {
      level: lastLevel ? lastLevel.level + 1 : 1,
      smallBlind: 0,
      bigBlind: 0,
      ante: 0,
      duration: 15, // Default break duration
      isBreak: true
    };

    onLevelsChange([...levels, newBreak]);
  };

  const removeLevel = (levelIndex: number) => {
    // Allow removing any level except the very first one if it's the only one
    if (levels.length === 1) {
       toast.error("Cannot remove the only level.");
       return;
    }
     // We could add more complex logic here, e.g., prevent removing the first level if the second is not a break
     // For now, disabling if only one level remains is sufficient to prevent an empty table.


    const newLevels = levels.filter((_, index) => index !== levelIndex);
    // Renumber levels based on their position in the new array
    const renumberedLevels = newLevels.map((level, index) => ({
      ...level,
      level: index + 1 // Level number is its index + 1
    }));

    onLevelsChange(renumberedLevels);
  };

  const updateLevel = (index: number, field: keyof TournamentLevel, value: number | boolean) => {
    // Ensure valid number inputs
    let safeValue = value;
    if (typeof value === 'number') {
        safeValue = Math.max(0, value); // Blinds/antes/duration should generally not be negative
    }

    const newLevels = [...levels];
    newLevels[index] = {
      ...newLevels[index],
      [field]: safeValue
    };
    onLevelsChange(newLevels);
  };

  return (
    <div className="space-y-4">
      {/* Removed the Card containing the generator inputs and button */}

      {/* Moved title/description here as they are part of the table section */}
      {/* Removed the flex container that previously wrapped the title/description and buttons */}
      {/* The buttons are now below the table header */}


      <div className="border rounded-md overflow-x-auto"> {/* Added overflow-x-auto for responsiveness */}
        <div className="bg-muted/50 border-b px-4 py-3 flex items-center min-w-max"> {/* min-w-max to prevent shrinking */}
          <div className="w-16 font-medium">Level</div>
          <div className="w-24 font-medium">Small Blind</div>
          <div className="w-24 font-medium">Big Blind</div>
          {includeAnte && <div className="w-24 font-medium">Ante</div>} {/* Conditionally render Ante header */}
          <div className="w-24 font-medium">Duration</div>
          <div className="w-20 font-medium">Break</div>
          <div className="flex-1 min-w-[40px]"></div> {/* Flex-1 for spacing, min-width to ensure button column */}
        </div>

        <div className="divide-y">
          {levels.length === 0 && (
             <div className="px-4 py-3 text-muted-foreground text-center">No blind levels defined. Use the generator or add manually.</div>
          )}
          {levels.map((level, index) => ( // Correct map callback signature
            <div key={index} className="px-4 py-3 flex items-center min-w-max"> {/* min-w-max to prevent shrinking */}
              <div className="w-16">{level.level}</div>

              <div className="w-24">
                {level.isBreak ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <Input
                    type="number"
                    value={level.smallBlind}
                    onChange={(e) => updateLevel(index, 'smallBlind', Number(e.target.value))}
                    className="h-8"
                    min="0"
                  />
                )}
              </div>

              <div className="w-24">
                {level.isBreak ? (
                  <span className="text-muted-foreground">-</span>
                ) : (
                  <Input
                    type="number"
                    value={level.bigBlind}
                    onChange={(e) => updateLevel(index, 'bigBlind', Number(e.target.value))}
                    className="h-8"
                    min="0"
                  />
                )}
              </div>

              {includeAnte && ( // Corrected conditional rendering syntax
                 <div className="w-24">
                   {level.isBreak ? (
                     <span className="text-muted-foreground">-</span>
                   ) : (
                     <Input
                       type="number"
                       value={level.ante || 0} // Use 0 if ante is undefined/null
                       onChange={(e) => updateLevel(index, 'ante', Number(e.target.value))}
                       className="h-8"
                       min="0"
                     />
                   )}
                 </div>
              )}


              <div className="w-24">
                <Input
                  type="number"
                  value={level.duration}
                  onChange={(e) => updateLevel(index, 'duration', Number(e.target.value))}
                  className="h-8"
                  min="1" // Duration should be at least 1 minute
                />
              </div>

              <div className="w-20 flex items-center ml-1">
                 {/* Using a native input checkbox for simplicity, replace with shadcn Checkbox if preferred */}
                <input
                  type="checkbox"
                  checked={level.isBreak}
                  onChange={(e) => updateLevel(index, 'isBreak', e.target.checked)}
                  className="mr-2 h-4 w-4" // Added size classes for consistency
                />
                {level.isBreak ? 'Yes' : 'No'}
              </div>

              <div className="flex-1 flex justify-end min-w-[40px]"> {/* min-width to ensure button fits */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLevel(index)}
                  disabled={levels.length === 1} // Disable if only one level remains
                  className="h-8 w-8"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

       {/* Add/Break buttons moved below the table */}
       <div className="flex justify-end space-x-2 mt-4">
           <Button variant="outline" onClick={addLevel}>
             <Plus className="mr-2 h-4 w-4" />
             Add Level
           </Button>
           <Button variant="outline" onClick={addBreak}>
             <Plus className="mr-2 h-4 w-4" />
             Add Break
           </Button>
       </div>

    </div>
  );
};

export default BlindsSetupTab;
