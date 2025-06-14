import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash } from "lucide-react";
import { PayoutPlace } from '@/types/types'; // Assuming PayoutPlace type is defined

interface PayoutStructureSectionProps {
  payoutPlaces: PayoutPlace[];
  addPayoutPlace: () => void;
  removePayoutPlace: (position: number) => void;
  updatePayoutPercentage: (position: number, percentage: number) => void;
  totalPayoutPercentage: number;
}

const PayoutStructureSection: React.FC<PayoutStructureSectionProps> = ({
  payoutPlaces,
  addPayoutPlace,
  removePayoutPlace,
  updatePayoutPercentage,
  totalPayoutPercentage,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm">
          Total:{" "}
          <span
            className={
              Math.abs(totalPayoutPercentage - 100) < 0.01
                ? "text-poker-green font-medium"
                : "text-poker-red font-medium"
            }
          >
            {totalPayoutPercentage.toFixed(1)}%
          </span>
          {payoutPlaces.length > 0 && Math.abs(totalPayoutPercentage - 100) >= 0.01 && (
            <span className="text-poker-red ml-2">
              (Must equal 100%)
            </span>
          )}
        </div>

        <Button variant="outline" onClick={addPayoutPlace}>
          <Plus className="mr-2 h-4 w-4" />
          Add Place
        </Button>
      </div>

      <div className="border rounded-md">
        <div className="bg-muted/50 border-b px-4 py-3 flex items-center">
          <div className="w-20 font-medium">Position</div>
          <div className="w-60 font-medium">Percentage (%)</div>
          <div className="flex-1"></div>
        </div>

        <div className="divide-y">
          {payoutPlaces.map((place) => (
            <div key={place.position} className="px-4 py-3 flex items-center">
              <div className="w-20">{place.position}</div>

              <div className="w-60">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={place.percentage}
                  onChange={(e) =>
                    updatePayoutPercentage(
                      place.position,
                      Number(e.target.value)
                    )
                  }
                  className="h-8"
                />
              </div>

              <div className="flex-1 flex justify-end">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removePayoutPlace(place.position)}
                  className="h-8 w-8"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {payoutPlaces.length === 0 && (
            <div className="px-4 py-3 text-muted-foreground text-center">No payout places added yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayoutStructureSection;
