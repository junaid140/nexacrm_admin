import FormInput from "./FormInput.jsx";
import SearchSelect from "./SearchSelect.jsx";
function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select an option",
  error,
  multiple = false,
  disabled = false,
}) {
  return (
    <FormInput label={label} error={error}>
      <SearchSelect
        aria-label={label}
        value={value}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            multiple
              ? Array.from(event.target.selectedOptions, (option) => option.value)
              : event.target.value,
          )
        }
      >
        {!multiple && <option value="">{placeholder}</option>}
        {options.map((option) => {
          const item =
            typeof option === "string" ? { value: option, label: option } : option;
          return (
            <option value={item.value} key={item.value}>
              {item.label}
            </option>
          );
        })}
      </SearchSelect>
    </FormInput>
  );
}
export default SelectField;
