import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Container } from "./models";

export default function Running(props: {container: Container, logs: string[], onStop: () => any}) {
  return (
    <>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h2">WatchTower is running</Typography>
        <Button onClick={props.onStop}>Stop Watchtower</Button>
      </Stack>
      <Stack direction="row" spacing={4} justifyContent="space-between">
        <Stack spacing={2}>
          <Typography variant="h3">Configuration</Typography>
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