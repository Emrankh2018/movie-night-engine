import { useId } from 'react';

type Option<T extends string | number> = { value: T; label: string; disabled?: boolean };
export function Options<T extends string | number>({ label, options, value, onChange }: {
  label: string; options: Option<T>[]; value: T; onChange: (value: T) => void;
}) {
  const name = useId();
  return <fieldset className="option-field"><legend>{label}</legend><div className="options">
    {options.map(option => <label className="option" key={option.value}>
      <input type="radio" name={name} checked={value === option.value} disabled={option.disabled} onChange={() => onChange(option.value)} />
      <span>{option.label}</span>
    </label>)}
  </div></fieldset>;
}

export function Check({ label, checked, onChange, disabled = false }: { label: string; checked: boolean; onChange: () => void; disabled?: boolean }) {
  return <label className="check"><input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} /><span>{label}</span></label>;
}
