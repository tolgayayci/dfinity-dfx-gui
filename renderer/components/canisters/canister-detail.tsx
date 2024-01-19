import useCanister from "renderer/hooks/useCanister";
import { useState } from "react";
import Link from "next/link";

import CliCommandSelector from "@components/canisters/command-selector";
import CanisterStatusConfig from "@components/canisters/canister-status-config";
import { Button } from "@components/ui/button";
import { Separator } from "@components/ui/separator";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@components/ui/dialog";

import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";

export default function CanisterDetail({
  projectPath,
  canisterName,
}: {
  projectPath: string;
  canisterName: string;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [commandOutput, setCommandOutput] = useState();
  const [commandError, setCommandError] = useState();

  const { canisterData, isLoading, error } = useCanister(
    projectPath,
    canisterName
  );

  if (isLoading && !canisterData) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>There was an error: {error.message}</div>;
  }

  const handleRemoveClick = () => {
    console.log("Attempting to show dialog");
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false); // This will hide the dialog
  };

  if (canisterData && canisterData.name) {
    return (
      <>
        <div className="flex flex-col w-full">
          <div className="flex items-center justify-between space-y-2 mb-4">
            <h2 className="font-bold">{canisterName}</h2>
            <div className="space-x-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleRemoveClick}
              >
                Remove Canister
              </Button>
              <Link href={`/projects/${encodeURIComponent(projectPath)}`}>
                <Button>View Project</Button>
              </Link>
            </div>
          </div>
          <Separator className="w-full mb-4 -mx-4" />
          <div className="flex flex-row w-full">
            <div className="w-3/5 pr-4">
              <CliCommandSelector
                canister={canisterData}
                path={projectPath}
                setCommandError={setCommandError}
                setCommandOutput={setCommandOutput}
              />
            </div>

            <div className="w-2/5">
              <CanisterStatusConfig
                canister={canisterData}
                projectPath={projectPath}
                commandError={commandError}
                commandOutput={commandOutput}
              />
            </div>
          </div>
          {showDialog && (
            <Dialog open={showDialog} onOpenChange={() => setShowDialog(false)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Are you absolutely sure?</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your canister and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end space-x-2 mt-4">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={closeDialog}
                  >
                    Delete
                  </Button>
                  <Button type="button" onClick={closeDialog}>
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </>
    );
  } else {
    return <div>Canister not found or name is undefined.</div>;
  }
}
