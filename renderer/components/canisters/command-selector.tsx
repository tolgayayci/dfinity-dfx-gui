import { useState, useEffect } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@components/ui/select";
import { Button } from "@components/ui/button";
import { Input } from "@components/ui/input";
import { AlertCircle, ThumbsUpIcon, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@components/ui/alert";
import { commands } from "@lib/commands";
import { Checkbox } from "@components/ui/checkbox";
import { Label } from "@components/ui/label";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@components/ui/accordion";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@components/ui/tooltip";

import { ScrollArea, ScrollBar } from "@components/ui/scroll-area";
import { SelectSeparator } from "@components/ui/select";

import useProject from "renderer/hooks/useProject";

const CliCommandSelector = ({ canister }) => {
  const defaultCommand = commands.length > 0 ? commands[0].value : "";

  const [selectedCommand, setSelectedCommand] = useState(defaultCommand);
  const [commandArgs, setCommandArgs] = useState({});
  const [commandOptions, setCommandOptions] = useState({});
  const [isRunningCommand, setIsRunningCommand] = useState(false);
  const [commandOutput, setCommandOutput] = useState("");
  const [commandError, setCommandError] = useState("");
  const [latestCommand, setLatestCommand] = useState(""); // State to hold the latest command

  const { project } = useProject();

  const updateLatestCommand = () => {
    const selectedCommandDetails = commands.find(
      (c) => c.value === selectedCommand
    );
    if (!selectedCommandDetails) {
      setLatestCommand("");
      return;
    }

    // Only values of the arguments separated by spaces
    const argsString = Object.values(commandArgs)
      .filter((value) => value)
      .join(" ");

    const optionsString = Object.entries(commandOptions)
      .filter(([key, value]) => {
        const optionDetails = selectedCommandDetails.options.find(
          (o) => o.name === key
        );
        return (
          optionDetails &&
          ((optionDetails.type === "flag" && value) ||
            (optionDetails.type === "argument" && value))
        );
      })
      .map(([key, value]) => {
        const optionDetails = selectedCommandDetails.options.find(
          (o) => o.name === key
        );
        return (
          optionDetails &&
          (optionDetails.type === "flag" ? `${key}` : `${key} ${value}`)
        );
      })
      .join(" ");

    setLatestCommand(
      `dfx canister ${selectedCommandDetails.value} ${argsString} ${optionsString}`
    );
  };

  useEffect(() => {
    updateLatestCommand();
  }, [selectedCommand, commandArgs, commandOptions]);

  const handleCommandChange = (commandValue) => {
    setSelectedCommand(commandValue);
    const command = commands.find((c) => c.value === commandValue);

    // Initialize arguments
    if (command && command.args) {
      const argsInitialState = {};
      command.args.forEach((arg) => {
        argsInitialState[arg.name] = "";
      });
      setCommandArgs(argsInitialState);
    } else {
      setCommandArgs({});
    }

    // Initialize options
    if (command && command.options) {
      const optionsInitialState = {};
      command.options.forEach((option) => {
        optionsInitialState[option.name] = "";
      });
      setCommandOptions(optionsInitialState);
    } else {
      setCommandOptions({});
    }
  };

  const handleRunCommand = async () => {
    setIsRunningCommand(true);
    try {
      await runCli(selectedCommand, Object.values(commandArgs)).then(() => {
        // toast success message
        console.log("Command executed successfully");
      });
    } catch (error) {
      // toast error message
      console.error("Error executing command:", error);
    } finally {
      setIsRunningCommand(false);
    }
  };

  const runCli = async (command, args) => {
    try {
      const selectedCommandDetails = commands.find((c) => c.value === command);

      // Construct the options array, including -- for options and flags
      const optionsArray = selectedCommandDetails.options.reduce(
        (acc, option) => {
          const value = commandOptions[option.name];
          if (option.type === "flag" && value) {
            // If it's a flag and it's set, add the key
            acc.push(`${option.name}`);
          } else if (option.type === "argument" && value) {
            // If it's an argument and it has a value, add both key and value
            acc.push(`${option.name}`, value);
          }
          return acc;
        },
        []
      );

      // Convert string arguments to integers if necessary
      const processedArgs = args.map((arg) =>
        isNaN(arg) ? arg : parseInt(arg, 10)
      );

      const result = await window.awesomeApi.runDfxCommand(
        "canister",
        command,
        [canister.name, ...processedArgs], // Use processedArgs instead of args
        optionsArray,
        project?.path
      );

      console.log(result);
      setCommandError("");
      setCommandOutput(result);
    } catch (error) {
      setCommandError(`${error.message}`);
      setCommandOutput(""); // Clear any previous output
    }
  };

  return (
    <div className="flex flex-col">
      <div className="bg-gray-200 p-4 rounded-md mb-4">
        <code>{latestCommand}</code>
      </div>
      <ScrollArea className="max-h-[800px] overflow-y-auto">
        <div className="flex flex-col space-y-4">
          <Select
            value={selectedCommand}
            onValueChange={(e) => handleCommandChange(e)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a canister command" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup className="h-[150px]">
                {commands.map((command) => (
                  <SelectItem key={command.value} value={command.value}>
                    {command.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <Accordion type="multiple" className="w-full space-y-2">
            {selectedCommand &&
              commands.find((c) => c.value === selectedCommand)?.args?.length >
                0 && (
                <AccordionItem value="args" className="border px-3 rounded-lg">
                  <AccordionTrigger className="text-sm">
                    Arguments
                  </AccordionTrigger>
                  <AccordionContent>
                    <SelectSeparator />
                    {selectedCommand &&
                      commands
                        .find((c) => c.value === selectedCommand)
                        ?.args?.map((arg) => (
                          <div key={arg.name} className="space-y-2 my-4">
                            <Tooltip key={arg.name}>
                              <div className="space-y-2 my-4">
                                <div className="flex items-center my-4">
                                  <Label htmlFor={arg.name}>{arg.name}</Label>
                                  <TooltipTrigger asChild>
                                    <span className="inline-block ml-1">
                                      <QuestionMarkCircledIcon className="h-4 w-4 text-gray-500" />
                                    </span>
                                  </TooltipTrigger>
                                </div>
                              </div>
                              <TooltipContent side="right">
                                <p>
                                  {arg.description ||
                                    "No description available"}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                            <Input
                              type="text"
                              id={arg.name}
                              value={commandArgs[arg.name] || ""}
                              placeholder={arg.placeholder || arg.name}
                              onChange={(e) => {
                                setCommandArgs({
                                  ...commandArgs,
                                  [arg.name]: e.target.value,
                                });
                              }}
                            />
                          </div>
                        ))}
                    <SelectSeparator className="-mt-4" />
                  </AccordionContent>
                </AccordionItem>
              )}
            {selectedCommand &&
              commands.find((c) => c.value === selectedCommand)?.options
                ?.length > 0 && (
                <AccordionItem
                  value="options"
                  className="border px-3 rounded-lg"
                >
                  <AccordionTrigger className="text-sm">
                    Options & Flags
                  </AccordionTrigger>
                  <AccordionContent>
                    <SelectSeparator />
                    <div className="flex flex-wrap -mx-2 my-3">
                      {selectedCommand &&
                        commands
                          .find((c) => c.value === selectedCommand)
                          ?.options?.filter((option) => option.type === "flag")
                          .map((option, index) => (
                            <div
                              key={option.name}
                              className={`w-1/3 px-2 mb-4 space-x-2 items-center flex ${
                                index % 3 === 0 ? "clear-left" : ""
                              }`} // Adjust width as per your design
                            >
                              <Checkbox
                                id={option.name}
                                checked={!!commandOptions[option.name]}
                                onCheckedChange={(checked) => {
                                  setCommandOptions({
                                    ...commandOptions,
                                    [option.name]: checked,
                                  });
                                }}
                              />
                              <Tooltip key={option.name}>
                                <Label htmlFor={option.name}>
                                  {option.name}
                                </Label>
                                <TooltipTrigger asChild>
                                  <span className="inline-block ml-1">
                                    <QuestionMarkCircledIcon className="h-4 w-4 text-gray-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>
                                    {option.description ||
                                      "No description available"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </div>
                          ))}
                    </div>

                    <SelectSeparator className="-mt-4" />

                    {selectedCommand &&
                      commands
                        .find((c) => c.value === selectedCommand)
                        ?.options?.filter(
                          (option) => option.type === "argument"
                        )
                        .map((option) => (
                          <div key={option.name} className="space-y-2 my-4">
                            <Tooltip key={option.name}>
                              <div className="flex items-center my-4">
                                <Label htmlFor={option.name}>
                                  {option.name}
                                </Label>
                                <TooltipTrigger asChild>
                                  <span className="inline-block ml-1">
                                    <QuestionMarkCircledIcon className="h-4 w-4 text-gray-500" />
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                  <p>
                                    {option.description ||
                                      "No description available"}
                                  </p>
                                </TooltipContent>
                              </div>
                            </Tooltip>
                            <Input
                              type="text"
                              id={option.name}
                              value={commandOptions[option.name] || ""}
                              placeholder={option.placeholder || option.name}
                              onChange={(e) => {
                                setCommandOptions({
                                  ...commandOptions,
                                  [option.name]: e.target.value,
                                });
                              }}
                            />
                          </div>
                        ))}
                  </AccordionContent>
                </AccordionItem>
              )}
          </Accordion>
        </div>
        <ScrollBar />
      </ScrollArea>
      {isRunningCommand ? (
        <Button className="mt-4" disabled>
          {" "}
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Command Running...
        </Button>
      ) : (
        <Button
          className={selectedCommand ? "mt-4" : ""}
          onClick={handleRunCommand}
        >
          Run Command
        </Button>
      )}
      <div className="mt-4">
        {commandOutput && (
          <Alert variant="success">
            <ThumbsUpIcon className="h-4 w-4 text-green-600" />
            <AlertTitle>Command Output</AlertTitle>
            <AlertDescription>{commandOutput}</AlertDescription>
          </Alert>
        )}
        {commandError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{commandError}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
};

export default CliCommandSelector;
