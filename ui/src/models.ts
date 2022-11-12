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
  pollingUnit: number;
  pollingDuration: "mins" | "seconds" | "hours";
  notificationChannel: string;
  areAllSelected: boolean;
  selectedCards: string[];
}