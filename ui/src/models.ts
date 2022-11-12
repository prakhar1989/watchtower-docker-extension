export interface Container {
    Command: string;
    Created: number;
    Image: string;
    State: string;
    Status: string;
    Id: string;
    Names: string[];
}