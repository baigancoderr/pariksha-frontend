import React from 'react';
import { Input } from './Input';
import { BilingualText } from '@/types';

interface BilingualInputProps {
  label: string;
  value: BilingualText;
  onChange: (value: BilingualText) => void;
  error?: { en?: string; hi?: string };
  required?: boolean;
  placeholder?: { en?: string; hi?: string };
  type?: 'input' | 'textarea';
}

export const BilingualInput: React.FC<BilingualInputProps> = ({
  label,
  value,
  onChange,
  error,
  required = false,
  placeholder,
  type = 'input',
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <span className="text-xs text-gray-500">Bilingual Input</span>
      </div>
      
      {/* English Input */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <label className="block text-sm font-semibold text-blue-900 mb-2">
          🇬🇧 English {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'input' ? (
          <Input
            value={value.en}
            onChange={(e) => onChange({ ...value, en: e.target.value })}
            placeholder={placeholder?.en || 'Enter English text...'}
            error={error?.en}
          />
        ) : (
          <div>
            <textarea
              value={value.en}
              onChange={(e) => onChange({ ...value, en: e.target.value })}
              placeholder={placeholder?.en || 'Enter English text...'}
              rows={3}
              className={`
                block w-full rounded-lg border 
                ${error?.en ? 'border-red-300' : 'border-gray-300'}
                px-3 py-2 text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              `}
            />
            {error?.en && <p className="mt-1 text-sm text-red-600">{error.en}</p>}
          </div>
        )}
      </div>
      
      {/* Hindi Input */}
      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
        <label className="block text-sm font-semibold text-orange-900 mb-2">
          🇮🇳 हिंदी (Hindi) <span className="text-xs text-gray-500">(Optional)</span>
        </label>
        {type === 'input' ? (
          <Input
            value={value.hi || ''}
            onChange={(e) => onChange({ ...value, hi: e.target.value })}
            placeholder={placeholder?.hi || 'हिंदी में टेक्स्ट डालें...'}
            error={error?.hi}
          />
        ) : (
          <div>
            <textarea
              value={value.hi || ''}
              onChange={(e) => onChange({ ...value, hi: e.target.value })}
              placeholder={placeholder?.hi || 'हिंदी में टेक्स्ट डालें...'}
              rows={3}
              className={`
                block w-full rounded-lg border 
                ${error?.hi ? 'border-red-300' : 'border-gray-300'}
                px-3 py-2 text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
              `}
            />
            {error?.hi && <p className="mt-1 text-sm text-red-600">{error.hi}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
