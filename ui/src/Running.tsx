import React, { useState, useEffect } from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Container, RunningArgs } from "./models";

const WATCHTOWER_COMMAND_REGEX = /^\/watchtower (--interval (\d+))?([\s\w]+)*/;

export default function Running(props: {
  container: Container;
  logs: string[];
  onStop: () => any;
}) {
  const [runningArgs, setRunningArgs] = useState<RunningArgs | undefined>(
    undefined
  );

  // Used when watchtower is already running and we need to figure out
  // what args it was started with
  const parseConfigFromWatchtower = (command: string) => {
    // /watchtower --interval 600 nginx redis
    let m;
    if ((m = WATCHTOWER_COMMAND_REGEX.exec(command)) !== null) {
      // The result can be accessed through the `m`-variable.
      if (m.length === 4) {
        // has interval and specific containers
        const pollingInterval = m[2] ? m[2].trim() : 86400;
        const containers = m[3] ? m[3].trim().split(" ") : [];
        const runningArgs: RunningArgs = {
          pollingInterval,
          runningContainerIds: containers,
        };
        return runningArgs;
      }
    }
    return undefined;
  };

  const Config = () => (
    <Stack direction="row" spacing={2}>
      <Stack direction="column">
        <Typography variant="subtitle1" sx={{fontWeight: 600}}>Polling intervals</Typography>
        <Typography>{runningArgs.pollingInterval} secs</Typography>
      </Stack>
      <Stack direction="column">
        <Typography variant="subtitle1" sx={{fontWeight: 600}}>Monitoring Containers</Typography>
        <Typography>
          {runningArgs.runningContainerIds.length > 0
            ? runningArgs.runningContainerIds.join(", ")
            : "All"}
        </Typography>
      </Stack>
    </Stack>
  );

  useEffect(() => {
    if (props.container) {
      const runningArgs = parseConfigFromWatchtower(props.container.Command);
      if (runningArgs) {
        console.log("runningArgs", runningArgs);
        setRunningArgs(runningArgs);
      }
    }
  }, []);

  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h2">WatchTower is running</Typography>
        <Button onClick={props.onStop}>Stop Watchtower</Button>
      </Stack>
      <Stack direction="column" spacing={4} justifyContent="space-between">
        <Stack spacing={2}>
          <Typography variant="h3">Configuration</Typography>
          {runningArgs ? <Config></Config> : <></>}
        </Stack>
        <Stack spacing={2}>
          <Typography variant="h3">Logs</Typography>
          <Stack direction="column" spacing={1}>
            {props.logs.map((log, i) => (
              <Card key={log}>
                <CardContent>{log}</CardContent>
              </Card>
            ))}
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
