import { createDockerDesktopClient } from "@docker/extension-api-client";
import { Divider, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import React, { useEffect, useState } from "react";
import { Container, StartArgs } from "./models";
import Stopped from "./Stopped";

const WATCHTOWER_IMAGE = "containrrr/watchtower";
const WATCHTOWER_CONTAINER = "watchtower";

// Note: This line relies on Docker Desktop's presence as a host application.
// If you're running this React app in a browser, it won't work properly.
const client = createDockerDesktopClient();

function useDockerDesktopClient() {
  return client;
}

function pollingIntervalToSeconds(args: StartArgs) {
  if (args.pollingDuration === "seconds") {
    return args.pollingUnit;
  }
  if (args.pollingDuration === "mins") {
    return args.pollingUnit * 60;
  }
  // hours
  return args.pollingUnit * 60 * 60;
}

export function App() {
  const [isRunning, setRunning] = useState<boolean>(false);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [runningContainers, setRunningContainers] = useState<Container[]>([]);
  const ddClient = useDockerDesktopClient();

  const getAllRunningContainers = async (): Promise<Container[]> => {
    const containers = (await ddClient.docker.listContainers({
      filters: JSON.stringify({ status: ["running"] }),
    })) as Container[];

    return containers;
  };

  const checkWatchTowerRunning = async () => {
    const result = await getAllRunningContainers();
    setRunningContainers(result);
    setRunning(
      result.some(
        (c) =>
          c.Names[0] === WATCHTOWER_CONTAINER || c.Image === WATCHTOWER_IMAGE
      )
    );
  };

  /**
   * docker run --rm --detach --name watchtower \
   *  --volume /var/run/docker.sock:/var/run/docker.sock \
   *  containrrr/watchtower
   */
  const startWatchTower = async (args: StartArgs) => {
    console.log("starting", args);
    const interval = pollingIntervalToSeconds(args);
    setLoading(true);
    await ddClient.docker.cli.exec("run", [
      "--rm",
      "--detach",
      "-v",
      "/var/run/docker.sock:/var/run/docker.sock",
      "--interval",
      interval.toString(),
      WATCHTOWER_IMAGE,
    ]);
    setLoading(false);
  };

  function Running() {
    return (
      <>
        <Stack direction="row" spacing={2}>
          <Typography variant="h2">WatchTower is running</Typography>
          <Button variant="outlined">Stop Watchtower</Button>
        </Stack>
      </>
    );
  }

  useEffect(() => {
    checkWatchTowerRunning();
  });

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
      {isRunning ? (
        <Running></Running>
      ) : (
        <Stopped
          onStart={startWatchTower}
          containers={runningContainers}
        ></Stopped>
      )}
    </>
  );
}
