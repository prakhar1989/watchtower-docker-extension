import React from "react";
import { Card, CardContent, Stack, Typography } from "@mui/material";
import Button from "@mui/material/Button";
import { Container, RunningArgs } from "./models";
import { DockerDesktopClient, ExecProcess } from "@docker/extension-api-client-types/dist/v1";

const WATCHTOWER_CONTAINER = "watchtower";
const WATCHTOWER_COMMAND_REGEX = /^\/watchtower (--interval (\d+))?([\s\w]+)*/;

type MyProps = {
  container: Container;
  ddClient: DockerDesktopClient;
  onStop: () => any;
};

type MyState = {
  runningArgs: RunningArgs | undefined;
  logs: string[];
};

const Config = (props: { runningArgs: RunningArgs }) => (
  <Stack direction="row" spacing={2}>
    <Stack direction="column">
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Polling intervals
      </Typography>
      <Typography>{props.runningArgs.pollingInterval} secs</Typography>
    </Stack>
    <Stack direction="column">
      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
        Monitoring Containers
      </Typography>
      <Typography>
        {props.runningArgs.runningContainerIds.length > 0
          ? props.runningArgs.runningContainerIds.join(", ")
          : "All"}
      </Typography>
    </Stack>
  </Stack>
);

export default class Running extends React.Component<MyProps, MyState> {
  subsciption: ExecProcess | undefined;

  constructor(props: {
    container: Container;
    ddClient: DockerDesktopClient;
    onStop: () => any;
  }) {
    super(props);
    this.state = {
      runningArgs: undefined,
      logs: [],
    };

    this.listenToLogs = this.listenToLogs.bind(this);
  }

  // Used when watchtower is already running and we need to figure out
  // what args it was started with
  parseConfigFromWatchtower(command: string) {
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
  }

  onOutput = (data: any) => {
    if (data.stdout) {
      console.error("stdout", data.stdout);
    } else {
      if (data.stderr) {
        console.log("data", data.stderr);
        this.setState({ logs: [...this.state.logs, data.stderr] });
      }
    }
  };

  listenToLogs = async () => {
    console.log("attempting to listen to logs");
    const listener = await this.props.ddClient.docker.cli.exec(
      "logs",
      [WATCHTOWER_CONTAINER],
      {
        stream: {
          onOutput: this.onOutput,
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

  componentDidMount() {
    if (this.props.container) {
      const runningArgs = this.parseConfigFromWatchtower(
        this.props.container.Command
      );
      this.setState({ runningArgs });

      this.listenToLogs().then((listener) => {
        this.subsciption = listener;
      });
    }
  }

  componentWillUnmount() {
    if (this.subsciption) {
      this.subsciption.close();
    }
  }

  render() {
    return (
      <>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h2">WatchTower is running</Typography>
          <Button onClick={this.props.onStop}>Stop Watchtower</Button>
        </Stack>
        <Stack direction="column" spacing={4} justifyContent="space-between">
          <Stack spacing={2}>
            <Typography variant="h3">Configuration</Typography>
            {this.state.runningArgs ? (
              <Config runningArgs={this.state.runningArgs}></Config>
            ) : (
              <></>
            )}
          </Stack>
          <Stack spacing={2}>
            <Typography variant="h3">Logs</Typography>
            <Stack direction="column" spacing={1}>
              {this.state.logs.map((log, i) => (
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
}
