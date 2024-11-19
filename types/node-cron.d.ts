declare module "node-cron" {
  type ScheduleOptions = {
    scheduled?: boolean; // If false, the task will not start automatically
    timezone?: string; // Timezone for the scheduled task
  };

  type ScheduledTask = {
    start: () => void; // Start the scheduled task
    stop: () => void; // Stop the scheduled task
    destroy: () => void; // Destroy the scheduled task
    getStatus: () => string; // Get the status of the task (e.g., running, stopped)
  };

  export function schedule(
    expression: string,
    func: () => void,
    options?: ScheduleOptions
  ): ScheduledTask;

  export function validate(expression: string): boolean;
}
