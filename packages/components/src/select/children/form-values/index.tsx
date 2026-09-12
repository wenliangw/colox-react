export interface FormSelectValuesProps {
  name?: string;
  /** The current selection ('', a value, or the value array). */
  values: string | string[];
}

/**
 * The form-facing value channel: hidden native inputs carrying the
 * selection into FormData — one in single mode, one per value in
 * multiple mode (the same channel as Checkbox.Group). Renders nothing
 * without `name`.
 */
export const FormSelectValues = ({ name, values }: FormSelectValuesProps) => {
  if (name === undefined) {
    return null;
  }
  if (!Array.isArray(values)) {
    return <input type="hidden" className="colox-select__hidden" name={name} value={values} />;
  }
  return (
    <>
      {values.map((value) => (
        <input
          key={value}
          type="hidden"
          className="colox-select__hidden"
          name={name}
          value={value}
        />
      ))}
    </>
  );
};

FormSelectValues.displayName = 'FormSelectValues';
