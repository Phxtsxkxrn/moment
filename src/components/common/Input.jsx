import React from 'react';

const Input = ({
  label,
  id,
  error,
  className = '',
  ...props
}) => {
  return (
    <label className={`field ${className}`.trim()} htmlFor={id}>
      {label && <span className="field__label">{label}</span>}
      <input id={id} className={`input ${error ? 'input--error' : ''}`.trim()} {...props} />
      {error && <span className="field__error">{error}</span>}
    </label>
  );
};

export default Input;
