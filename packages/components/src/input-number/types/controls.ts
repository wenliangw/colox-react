export interface StepperProps {
  /** Steps the editor value: `1` = increase, `-1` = decrease. */
  onStep: (direction: 1 | -1) => void;
  disabled: boolean;
}
