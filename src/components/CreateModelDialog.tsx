import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Plus, Loader2 } from "lucide-react";
import type { CreateModelRequest } from "@/services/models-service";

interface CreateModelDialogProps {
  onCreateModel: (request: CreateModelRequest) => Promise<void>;
  isCreating: boolean;
}

export const CreateModelDialog = ({
  onCreateModel,
  isCreating,
}: CreateModelDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !startDate || !endDate) return;

    try {
      await onCreateModel({
        name,
        trainingDataStart: startDate.toISOString(),
        trainingDataEnd: endDate.toISOString(),
      });

      // Reset form and close dialog
      setName("");
      setStartDate(undefined);
      setEndDate(undefined);
      setOpen(false);
    } catch (error) {
      console.error("Failed to create model:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create New Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create & Train New Model</DialogTitle>
            <DialogDescription>
              Create a new regression model and start training immediately with
              your specified date range.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Model Name</Label>
              <Input
                id="name"
                placeholder="e.g., Growth Prediction Model Q4"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="startDate">Training Data Start Date</Label>
              <DatePicker
                date={startDate}
                onDateChange={setStartDate}
                placeholder="Select start date"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Training Data End Date</Label>
              <DatePicker
                date={endDate}
                onDateChange={setEndDate}
                placeholder="Select end date"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isCreating || !name || !startDate || !endDate}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create & Train
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
