export interface Container {
    Command: string;
    Created: number;
    Image: string;
    State: string;
    Status: string;
    Id: string;
    Names: string[];
}

export interface StartArgs {
  pollingDuration: number;
  pollingUnit: "mins" | "seconds" | "hours";
  notificationChannel: string;
  areAllSelected: boolean;
  selectedCards: string[];
}