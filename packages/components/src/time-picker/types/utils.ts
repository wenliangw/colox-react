/** The hour/minute coordinates of a canonical time word. */
export interface TimeParts {
  hour: number;
  minute: number;
}

/** Which column of the panel an option belongs to. */
export type TimeColumnUnit = 'hour' | 'minute';
