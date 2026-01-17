import React from 'react';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: 'Ít nhất 8 ký tự', regex: /.{8,}/ },
  { label: 'Ít nhất 1 chữ hoa', regex: /[A-Z]/ },
  { label: 'Ít nhất 1 chữ thường', regex: /[a-z]/ },
  { label: 'Ít nhất 1 số', regex: /[0-9]/ },
];

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  disabled = false,
  required = false,
  showRequirements = false,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const getRequirementsMet = () => {
    return passwordRequirements.map(req => ({
      ...req,
      met: req.regex.test(value),
    }));
  };

  const requirementsMet = getRequirementsMet();

  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            error ? 'border-red-500' : 'border-gray-300'
          } ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          disabled={disabled}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      
      {showRequirements && value && (
        <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-1">Yêu cầu mật khẩu:</p>
          {requirementsMet.map((req, idx) => (
            <div key={idx} className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-600'}`}>
              <span className="mr-1">{req.met ? '✓' : '○'}</span>
              {req.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
