import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import {
  MenuItem,
  Stack,
  Link,
  TextField,
  Card,
  Switch,
  CardContent,
  Select,
  Typography,
} from "@mui/material";
import { Container } from "./models";

export default function Stopped(props: { containers: Container[] }) {
  const [pollingUnit, setPollingUnit] = useState<string>("mins");
  const [pollingDuration, setPollingDuration] = useState<number>(10);
  const [notificationType, setNotificationType] = useState<string>("slack");
  const [notificationChannel, setNotificationChannel] = useState<string>("");
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [areAllSelected, setAll] = useState<boolean>(true);

  const getPlaceholder = (): string => {
    if (notificationType === "slack") {
      return "slack://[botname@]token-a/token-b/token-c";
    }
    if (notificationType === "discord") {
      return "discord://token@id";
    }
    return "custom://";
  };

  const start = () => {
    console.log({
      pollingUnit,
      pollingDuration,
      notificationChannel,
      areAllSelected,
      selectedCards,
    });
  };

  const ts = (d: Date) => `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
  const isCardSelected = (id: string) => selectedCards.includes(id);

  const toggleCardSelection = (id: string) => {
    if (isCardSelected(id)) {
      setSelectedCards(selectedCards.filter((s) => s !== id));
    } else {
      setSelectedCards([...selectedCards, id]);
    }
  };

  return (
    <>
      <Stack direction="column" spacing={4}>
        <Stack direction="row" justifyContent="space-between">
          <Typography variant="h2">Configuration</Typography>
          <Button variant="contained" onClick={start}>
            Start Watchtower
          </Button>
        </Stack>

        <Stack>
          <Typography variant="h3">Containers</Typography>
          <Stack>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Choose containers that you want Watchtower to monitor.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Monitor all containers
              <Switch onChange={() => setAll(!areAllSelected)} />
            </Typography>
          </Stack>
          {areAllSelected ? (
            <></>
          ) : (
            <Stack
              direction="row"
              spacing={1}
              sx={{ mt: 2, minWidth: 800 }}
              style={{ overflow: "auto" }}
            >
              {props.containers.map((container, i) => (
                <Card
                  sx={{
                    minWidth: 100,
                    borderColor: isCardSelected(container.Id)
                      ? "primary.main"
                      : "",
                  }}
                  variant="outlined"
                  key={i}
                  style={{ cursor: "pointer" }}
                  onClick={() => toggleCardSelection(container.Id)}
                >
                  <CardContent style={{ wordBreak: "break-word" }}>
                    <Typography
                      sx={{ fontSize: 14 }}
                      color="text.secondary"
                      gutterBottom
                    >
                      {container.Image}
                    </Typography>
                    <Typography sx={{ fontSize: 8 }} color="text.secondary">
                      Created: {ts(new Date(container.Created * 1000))}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack>
          <Typography variant="h3">Polling interval</Typography>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Configure how frequently WatchTower should poll for updates.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Poll once every
            </Typography>
            <TextField
              placeholder="10"
              sx={{ maxWidth: 50 }}
              type="number"
              value={pollingDuration}
              onChange={(e) => setPollingDuration(Number(e.target.value))}
              variant="standard"
            />
            <Select
              label="mins"
              value={pollingUnit}
              size="small"
              onChange={(e) => setPollingUnit(e.target.value)}
            >
              <MenuItem value={"mins"}>Minutes</MenuItem>
              <MenuItem value={"hours"}>Hours</MenuItem>
              <MenuItem value={"seconds"}>Seconds</MenuItem>
            </Select>
          </Stack>
        </Stack>

        <Stack>
          <Typography variant="h3">Notifications (optional)</Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mt: 2, mb: 2 }}
          >
            Specify a notification channel. Use Shouterr to send the
            notification.{" "}
            <Link href="https://containrrr.dev/watchtower/notifications/">
              Read more
            </Link>
          </Typography>
          <Stack direction="row" spacing={2}>
            <Select
              label="Slack"
              value={notificationType}
              size="small"
              onChange={(e) => {
                setNotificationType(e.target.value);
                setNotificationChannel("");
              }}
            >
              <MenuItem value={"slack"}>Slack</MenuItem>
              <MenuItem value={"discord"}>Discord</MenuItem>
              <MenuItem value={"custom"}>Custom</MenuItem>
            </Select>
            <TextField
              value={notificationChannel}
              placeholder={getPlaceholder()}
              sx={{ minWidth: 400 }}
              variant="standard"
              onChange={(e) => setNotificationChannel(e.target.value)}
            />
          </Stack>
        </Stack>
      </Stack>
    </>
  );
}
