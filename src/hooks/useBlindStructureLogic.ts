import { useState, useEffect, useCallback, useRef } from "react";
import { TournamentLevel } from "@/types/types"; // Assuming TournamentLevel type
import { generateDynamicBlinds } from "@/utils/blindStructureGenerator"; // Your generator function
import { calculateInitialStack } from "@/utils/stackCalculator"; // Your stack calculator function
import { toast } from "sonner"; // Assuming you use sonner for toasts

// Helper function to parse chipset string
const parseChipset = (chipsetString: string): number[] => {
  try {
    return chipsetString.split(',')
      .map(value => parseInt(value.trim()))
      .filter(val => !isNaN(val));
  } catch (error) {
    console.error('Error parsing chipset:', error);
    return [];
  }
};

// Define the shape of the state and functions exposed by the hook
interface UseBlindStructureLogicProps {
    initialPlayerCount: number;
    initialDurationHours: number;
    initialTournamentFormat: string;
    initialChipset: string;
    initialAllowRebuy: boolean; // This prop might not be needed if allowRebuy is managed outside
    initialMaxRebuys: number;
    initialIncludeAnte: boolean;
    initialLevels: TournamentLevel[];
    initialStartingChips: number; // Pass initial starting chips from context/DB
    initialRebuyChips: number; // Pass initial rebuy chips from context/DB
    initialAddOnChips: number; // Pass initial addon chips from context/DB
}

interface UseBlindStructureLogicReturn {
  playerCount: number;
  setPlayerCount: (count: number | ((prevCount: number) => number)) => void; // Expose setter
  durationHours: number;
  setDurationHours: (hours: number | ((prevHours: number) => number)) => void; // Expose setter
  tournamentFormat: string;
  setTournamentFormat: (format: string | ((prevFormat: string) => string)) => void; // Expose setter
  chipset: string;
  setChipset: (chipset: string | ((prevChipset: string) => string)) => void; // Expose setter for loading
  handleChipsetChange: (value: string) => void; // Keep specific handler for UI
  isCustomChipset: boolean;
  handleCustomChipsetChange: (value: string) => void; // Keep specific handler for UI
  chipsetValues: number[];
  initialChips: number;
  setInitialChips: (chips: number | ((prevChips: number) => number)) => void; // Expose setter
  handleInitialChipsChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Keep specific handler for UI
  rebuyChips: number;
  setRebuyChips: (chips: number | ((prevChips: number) => number)) => void; // Expose setter
  handleRebuyChipsChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Keep specific handler for UI
  addOnChips: number;
  setAddOnChips: (chips: number | ((prevChips: number) => number)) => void; // Expose setter
  handleAddOnChipsChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // Keep specific handler for UI
  smallBlind: number;
  bigBlind: number;
  levels: TournamentLevel[];
  setLevels: (levels: TournamentLevel[] | ((prevLevels: TournamentLevel[]) => TournamentLevel[])) => void; // Expose setter
  allowRebuy: boolean; // Still need this state in the hook for generation logic
  setAllowRebuy: (checked: boolean | ((prev: boolean) => boolean)) => void; // Expose setter if needed by parent
  maxRebuys: number; // Still need this state in the hook for generation logic
  setMaxRebuys: (count: number | ((prevCount: number) => number)) => void; // Expose setter (Fixes error 1)
  includeAnte: boolean; // Still need this state in the hook for generation logic
  setIncludeAnte: (checked: boolean | ((prev: boolean) => boolean)) => void; // Expose setter
  handleGenerateBlindStructure: () => void;
  canGenerateBlinds: boolean; // Derived state for button disabled status
}

const useBlindStructureLogic = ({
    initialPlayerCount,
    initialDurationHours,
    initialTournamentFormat,
    initialChipset,
    initialAllowRebuy, // Use this initial value
    initialMaxRebuys, // Use this initial value
    initialIncludeAnte, // Use this initial value
    initialLevels,
    initialStartingChips,
    initialRebuyChips,
    initialAddOnChips
}: UseBlindStructureLogicProps): UseBlindStructureLogicReturn => {
  // State variables managed by this hook
  const [playerCount, setPlayerCount] = useState(initialPlayerCount);
  const [durationHours, setDurationHours] = useState(initialDurationHours);
  const [tournamentFormat, setTournamentFormat] = useState(initialTournamentFormat);
  const [chipset, setChipset] = useState(initialChipset);
  const [isCustomChipset, setIsCustomChipset] = useState(false); // Derived from chipset state
  const [chipsetValues, setChipsetValues] = useState<number[]>(parseChipset(initialChipset)); // Derived from chipset state
  const [initialChips, setInitialChips] = useState(initialStartingChips);
  const [rebuyChips, setRebuyChips] = useState(initialRebuyChips);
  const [addOnChips, setAddOnChips] = useState(initialAddOnChips);
  const [smallBlind, setSmallBlind] = useState(0); // Initial blinds derived from generation
  const [bigBlind, setBigBlind] = useState(0); // Initial blinds derived from generation
  const [levels, setLevels] = useState<TournamentLevel[]>(initialLevels);
  const [allowRebuy, setAllowRebuy] = useState(initialAllowRebuy); // State for allowRebuy
  const [maxRebuys, setMaxRebuys] = useState(initialMaxRebuys); // State for maxRebuys
  const [includeAnte, setIncludeAnte] = useState(initialIncludeAnte); // State for includeAnte

  // Refs to track user modifications (move these into the hook)
  const userModifiedInitialChips = useRef(false);
  const userModifiedRebuyChips = useRef(false);
  const userModifiedAddOnChips = useRef(false);

  // Derived state for the Generate button disabled status
  const canGenerateBlinds = initialChips > 0 && playerCount > 0 && durationHours > 0 && chipsetValues.length > 0 && !!tournamentFormat;


  // Effect to parse chipset string whenever the 'chipset' state changes
  useEffect(() => {
      const matchedOption = [
          { value: "25,100,500,1000,5000", label: "25, 100, 500, 1000, 5000" },
          { value: "25,50,100,500,1000", label: "25, 50, 100, 500, 1000" },
          { value: "5,25,100,500,1000", label: "5, 25, 100, 500, 1000" },
          { value: "1,2,5,10,25,50", label: "1, 2, 5, 10, 25, 50" },
          { value: "custom", label: "Custom Chipset..." },
        ].find(option => option.value === chipset);
      setIsCustomChipset(!matchedOption || matchedOption.value === "custom");

      try {
        const values = parseChipset(chipset);
        if (values.length > 0) {
          setChipsetValues(values);
        } else {
           setChipsetValues([]); // Clear if parsing results in no valid chips
           console.warn("Chipset parsing resulted in no valid chips.");
        }
      } catch (error) {
        console.error("Error parsing chipset:", error);
        setChipsetValues([]); // Clear on error
      }
  }, [chipset]); // Depend on the chipset string state


  // Define the handleGenerateBlindStructure function
  const handleGenerateBlindStructure = useCallback(() => {
    try {
      if (!initialChips || initialChips <= 0 || playerCount <= 0 || durationHours <= 0 || chipsetValues.length === 0 || !tournamentFormat) {
         console.warn("Cannot generate blind structure: Missing required inputs.");
         toast.warning("Please provide valid inputs for players, duration, initial chips, format, and chipset to generate blinds.");
         setLevels([]);
         setSmallBlind(0);
         setBigBlind(0);
         return;
      }

      const targetDurationMinutes = durationHours * 60;

      let generatorFormat;
      switch (tournamentFormat.toLowerCase()) {
        case 'freezeout': generatorFormat = 'standard'; break;
        case 'deepstack': generatorFormat = 'deepstack'; break;
        case 'turbo': generatorFormat = 'turbo'; break;
        case 'hyper': case 'hyperturbo': generatorFormat = 'hyper'; break;
        case 'rebuy': case 'bounty': default: generatorFormat = 'standard';
      }

      const rebuyFactor = allowRebuy ? (1 + (maxRebuys / 2)) : 1;

      const generatedLevels = generateDynamicBlinds(
        playerCount,
        initialChips,
        targetDurationMinutes,
        {
          levelDurationMinutes: 20,
          tournamentFormat: generatorFormat,
          chipset: chipsetValues,
          anteStartLevel: includeAnte ? 4 : 999,
          breakIntervalLevels: 4,
          blindIncreaseFactor: tournamentFormat === 'deepstack' ? 1.3 :
                             tournamentFormat === 'turbo' ? 1.7 :
                             tournamentFormat === 'hyper' ? 2.0 :
                             1.5,
          rebuyAddonFactor: rebuyFactor,
          includeAnte: includeAnte
        }
      );

      setLevels(generatedLevels);

      if (generatedLevels.length > 0 && !generatedLevels[0].isBreak) {
        setSmallBlind(generatedLevels[0].smallBlind);
        setBigBlind(generatedLevels[0].bigBlind);
      } else {
         setSmallBlind(0);
         setBigBlind(0);
      }

      toast.success("Blind structure generated successfully");
    } catch (error) {
      console.error("Error generating blind structure:", error);
      toast.error("Failed to generate blind structure");
      setLevels([]);
      setSmallBlind(0);
      setBigBlind(0);
    }
  }, [
    initialChips,
    playerCount,
    durationHours,
    allowRebuy,
    maxRebuys,
    tournamentFormat,
    chipsetValues,
    includeAnte
  ]);


  // Effect to calculate the initial stack and blinds based on chipset and format
  // This effect also triggers a re-generation of the blind structure if inputs change
  useEffect(() => {
    // Only recalculate if user hasn't manually modified the initial chips AND inputs are valid for calculation
    // Also check if chipsetValues is not empty, as parsing can result in empty array
    if (!userModifiedInitialChips.current) {
      try {
        // Only proceed if chipset has values and essential parameters are set
        if (chipsetValues.length > 0 && playerCount > 0 && durationHours > 0 && tournamentFormat) {
          const result = calculateInitialStack(
            chipsetValues,
            tournamentFormat,
            durationHours
          );

          if (result) {
            console.log('Calculated stack values:', result,
              'from chipset:', chipsetValues,
              'format:', tournamentFormat,
              'duration:', durationHours);

            setInitialChips(result.startingStack);
            setSmallBlind(result.smallBlind);
            setBigBlind(result.bigBlind);

            // Only update rebuy/addon if user hasn't modified them
            if (!userModifiedRebuyChips.current) {
              setRebuyChips(result.startingStack); // Default rebuy chips to initial stack
            }

            if (!userModifiedAddOnChips.current) {
              // Default addon chips based on format
              if (tournamentFormat === 'deepstack') {
                setAddOnChips(Math.floor(result.startingStack * 1.5));
              } else if (tournamentFormat === 'turbo') {
                setAddOnChips(Math.floor(result.startingStack * 1.2));
              } else if (tournamentFormat === 'rebuy') {
                setAddOnChips(Math.floor(result.startingStack * 2));
              } else { // standard, freezeout, bounty
                setAddOnChips(result.startingStack);
              }
            }

            // Immediately generate blinds based on the new initial stack and parameters
            // Wrap in setTimeout to allow state updates (initialChips, smallBlind, bigBlind) to potentially finish
             setTimeout(() => {
                handleGenerateBlindStructure();
             }, 0); // Use 0ms delay to defer until current state updates are processed

          } else {
             console.warn("Stack calculation returned no result (invalid inputs?).");
             // Decide how to handle this case - perhaps reset dependent values
             // setInitialChips(0);
             // setSmallBlind(0);
             // setBigBlind(0);
             // setRebuyChips(0);
             // setAddOnChips(0);
             // setLevels([]);
          }
        } else {
           // Handle cases where parameters are missing/zero or chipset is empty
           console.log("Skipping stack calculation and generation due to missing parameters.");
           // Decide if you want to clear levels/chips in this case or keep previous state
           // setLevels([]);
           // setInitialChips(0);
           // setSmallBlind(0);
           // setBigBlind(0);
           // setRebuyChips(0);
           // setAddOnChips(0);
        }
      } catch (error) {
        console.error('Error calculating stack or generating blinds:', error);
        toast.error("Error calculating stack or generating blinds.");
        // Decide if you want to clear levels/chips on error
        // setLevels([]);
        // setInitialChips(0);
        // setSmallBlind(0);
        // setBigBlind(0);
        // setRebuyChips(0);
        // setAddOnChips(0);
      }
    }
  }, [
      chipsetValues, // Depend on the parsed values array
      tournamentFormat,
      durationHours,
      playerCount,
      handleGenerateBlindStructure, // Include the memoized function as a dependency
      // userModifiedInitialChips // Removed dependency on ref, check ref.current inside effect
  ]);


  // Handlers for state updates - these will be exposed by the hook

  const handlePlayerCountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      // Only update if it's a valid number or empty string for clearing
      if (!isNaN(value) || e.target.value === '') {
         setPlayerCount(isNaN(value) ? 0 : value); // Store 0 if input is cleared
      }
   }, []);

   const handleDurationHoursChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const value = Number(e.target.value);
      // Only update if it's a valid number or empty string for clearing
       if (!isNaN(value) || e.target.value === '') {
         setDurationHours(isNaN(value) ? 0 : value); // Store 0 if input is cleared
         // Reset user modification flags when duration changes, as it implies a desire for recalculation
         userModifiedInitialChips.current = false;
      }
   }, []);

   const handleFormatChange = useCallback((value: string) => {
        setTournamentFormat(value);
        // Reset user modification flags when format changes, as it implies a desire for recalculation
        userModifiedInitialChips.current = false;
        userModifiedRebuyChips.current = false;
        userModifiedAddOnChips.current = false;
    }, []);

    // This handler is for the Select component
    const handleChipsetChange = useCallback(
        (selectedChipsetValue: string) => {
            setChipset(selectedChipsetValue); // Update chipset state
             // The useEffect listening to 'chipset' will handle parsing and setting chipsetValues
            // Reset user modification flags when chipset changes, as it implies a desire for recalculation
            userModifiedInitialChips.current = false;
            userModifiedRebuyChips.current = false;
            userModifiedAddOnChips.current = false;
        },
        [] // No dependency on chipset here, useEffect handles parsing
    );

    // This handler is for the custom chipset Input component
    const handleCustomChipsetChange = useCallback(
        (customChipsetValue: string) => {
            setChipset(customChipsetValue); // Update chipset state immediately
             // The useEffect listening to 'chipset' will handle parsing and setting chipsetValues
            // Reset user modification flags when custom chipset changes, as it implies a desire for recalculation
            userModifiedInitialChips.current = false;
            userModifiedRebuyChips.current = false;
            userModifiedAddOnChips.current = false;
        },
        []
    );

  // Handler for manual change of initial chips
  const handleInitialChipsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
     // Only update state if it's a valid number or empty string for clearing
     if (!isNaN(value) || e.target.value === '') {
         setInitialChips(isNaN(value) ? 0 : value); // Store 0 if input is cleared
         // Mark as manually modified ONLY if a non-empty value was entered
         userModifiedInitialChips.current = e.target.value !== '';
     }
    // Note: Manual initial chips change does NOT automatically trigger blind regeneration here.
    // The user would typically adjust other parameters or click 'Generate' explicitly.
  }, []); // No dependencies needed

  // Handler for manual change of rebuy chips
  const handleRebuyChipsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
     if (!isNaN(value) || e.target.value === '') {
        setRebuyChips(isNaN(value) ? 0 : value);
        userModifiedRebuyChips.current = e.target.value !== '';
     }
  }, []); // No dependencies needed

  // Handler for manual change of addon chips
  const handleAddOnChipsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
     if (!isNaN(value) || e.target.value === '') {
       setAddOnChips(isNaN(value) ? 0 : value);
       userModifiedAddOnChips.current = e.target.value !== '';
     }
  }, []); // No dependencies needed

    const handleIncludeAnteChange = useCallback((checked: boolean | string) => {
        setIncludeAnte(!!checked);
        // Blind structure generation is handled by the useEffect triggered by includeAnte change
    }, []); // No dependencies needed


  // Expose state and handlers
  return {
    playerCount,
    setPlayerCount, // Expose setter
    durationHours,
    setDurationHours, // Expose setter
    tournamentFormat,
    setTournamentFormat, // Expose setter
    chipset,
    setChipset, // Expose setter for loading
    handleChipsetChange, // Keep specific handler for UI
    isCustomChipset,
    handleCustomChipsetChange, // Keep specific handler for UI
    chipsetValues, // Expose derived value
    initialChips,
    setInitialChips, // Expose setter
    handleInitialChipsChange, // Keep specific handler for UI
    rebuyChips,
    setRebuyChips, // Expose setter
    handleRebuyChipsChange, // Keep specific handler for UI
    addOnChips,
    setAddOnChips, // Expose setter
    handleAddOnChipsChange, // Keep specific handler for UI
    smallBlind, // Expose derived value
    bigBlind, // Expose derived value
    levels, // Expose state
    setLevels, // Expose setter for manual editing in BlindsSetupTab
    allowRebuy, // Expose state
    setAllowRebuy, // Expose setter
    maxRebuys, // Expose state
    setMaxRebuys, // Expose setter (Fixes error 1)
    includeAnte, // Expose state
    setIncludeAnte, // Expose setter
    handleGenerateBlindStructure, // Expose function
    canGenerateBlinds // Expose derived state
  };
};

export default useBlindStructureLogic;
