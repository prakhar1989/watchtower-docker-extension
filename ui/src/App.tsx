import React, { useEffect, useState } from "react";
import { createDockerDesktopClient } from "@docker/extension-api-client";
import {
  Divider,
  CircularProgress,
  Stack,
  Typography,
} from "@mui/material";
import Button from "@mui/material/Button";
import { Container, StartArgs } from "./models";
import Stopped from "./Stopped";
import Running from "./Running";

const WATCHTOWER_IMAGE = "containrrr/watchtower";
const WATCHTOWER_CONTAINER = "watchtower";
const WATCHTOWER_COMMAND_REGEX = /^\/watchtower (--interval (\d+))?([\s\w]+)*/;

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

function pollingIntervalToSeconds(args: StartArgs) {
  if (args.pollingUnit === "seconds") {
    return args.pollingDuration;
  }
  if (args.pollingUnit === "mins") {
    return args.pollingDuration * 60;
  }
  // hours
  return args.pollingDuration * 60 * 60;
}

export function App() {
  const [isRunning, setRunning] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [watchtowerContainer, setWatchtowerContainer] = useState<
    Container | undefined
  >(undefined);
  const [runningContainers, setRunningContainers] = useState<Container[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [runningArgs, setArgs] = useState<StartArgs | undefined>(undefined);

  const ddClient = useDockerDesktopClient();

  const listenToLogs = async () => {
    if (!isRunning) {
      return;
    }

    console.log("attempting to listen to logs");
    const listener = await ddClient.docker.cli.exec(
      "logs",
      [WATCHTOWER_CONTAINER],
      {
        stream: {
          onOutput(data) {
            if (data.stdout) {
              console.error("stdout", data.stdout);
            } else {
              if (data.stderr) {
                setLogs((logs) => [...logs, data.stderr]);
              }
            }
          },
          onError(error) {
            console.error("error", error);
          },
          onClose(exitCode) {
            console.log("onClose with exit code " + exitCode);
          },
          splitOutputLines: true,
        },
      }
    );
    return listener;
  };

  const getAllRunningContainers = async (): Promise<Container[]> => {
    const containers = (await ddClient.docker.listContainers({
      filters: JSON.stringify({ status: ["running"] }),
    })) as Container[];

    return containers;
  };

  const checkWatchTowerRunning = async () => {
    const result = await getAllRunningContainers();
    setRunningContainers(result);
    const watchtower = result.find(
      (c) => c.Names[0] === WATCHTOWER_CONTAINER || c.Image === WATCHTOWER_IMAGE
    );
    if (watchtower) {
      setRunning(true);
    } else {
      setRunning(false);
    }
  };

  const startWatchTower = async (args: StartArgs) => {
    console.log("starting", args);
    const interval = pollingIntervalToSeconds(args);
    const runArgs = [
      "--name",
      WATCHTOWER_CONTAINER,
      "--rm",
      "--detach",
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      WATCHTOWER_IMAGE,
      "--interval",
      interval.toString(),
    ];
    if (!args.areAllSelected) {
      const names = args.selectedCards.map((c) => c.replace("/", ""));
      runArgs.push(...names);
    }
    setLoading(true);
    await ddClient.docker.cli.exec("run", runArgs);
    setLoading(false);
  };

  // Used when watchtower is alraedy running and we need to figure out
  // what args it was started with
  const parseConfigFromWatchtower = (container: Container) => {
    // /watchtower --interval 600 nginx redis
    let m;
    const cmd = container.Command;
    if ((m = WATCHTOWER_COMMAND_REGEX.exec(cmd)) !== null) {
      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        console.log(`Found match, group ${groupIndex}: ${match}`);
      });
    }
    //console.log(watchtower);
  };

  const stop = async () => {
    //setLoading(true);
    console.log("stopping");
    //await ddClient.docker.cli.exec("stop", [WATCHTOWER_CONTAINER]);
    //setLoading(false);
  };

  useEffect(() => {
    checkWatchTowerRunning();
  });

  useEffect(() => {
    (async () => {
      const result = await getAllRunningContainers();
      const watchtower = result.find(
        (c) =>
          c.Names[0] === WATCHTOWER_CONTAINER || c.Image === WATCHTOWER_IMAGE
      );
      if (watchtower) {
        setWatchtowerContainer(watchtower);
        parseConfigFromWatchtower(watchtower);
      }
    })();

    return () => {
      // this now gets called when the component unmounts
    };
  }, [isRunning]);

  return (
    <>
      <Typography variant="h1">WatchTower</Typography>
      <Stack direction="row" justifyContent="space-between">
        <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
          A container based solution for automating Docker container base image
          updates
        </Typography>
        <Button variant="text" href="https://containrrr.dev/watchtower/">
          VIEW DOCS
        </Button>
      </Stack>
      <Divider sx={{ mt: 4, mb: 4 }}></Divider>
      {isLoading ? <CircularProgress></CircularProgress> : <></>}
      {isRunning ? (
        <Running
          container={watchtowerContainer}
          logs={logs}
          onStop={stop}
        ></Running>
      ) : (
        <Stopped
          onStart={startWatchTower}
          containers={runningContainers}
        ></Stopped>
      )}
    </>
  );
}
