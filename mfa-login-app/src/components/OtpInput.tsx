import { useRef, useEffect, type KeyboardEvent, type ClipboardEvent } from 'react';
import { Input, type InputRef } from 'antd';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  numInputs: number;
  autoFocus?: boolean;
}

const OtpInput = ({ value, onChange, numInputs, autoFocus = false }: OtpInputProps) => {
  const inputRefs = useRef<(InputRef | null)[]>([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus?.();
    }
  }, [autoFocus]);

  const handleChange = (index: number, newValue: string) => {
    // Only allow digits
    const digit = newValue.replace(/\D/g, '').slice(-1);

    const newOtp = value.split('');
    newOtp[index] = digit;

    // Remove empty slots from the end
    const finalOtp = newOtp.join('').slice(0, numInputs);
    onChange(finalOtp);

    // Move to next input if digit was entered
    if (digit && index < numInputs - 1) {
      inputRefs.current[index + 1]?.focus?.();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // If current input is empty, move to previous and delete
        const newOtp = value.split('');
        newOtp[index - 1] = '';
        onChange(newOtp.join(''));
        inputRefs.current[index - 1]?.focus?.();
      } else {
        // Delete current digit
        const newOtp = value.split('');
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus?.();
    } else if (e.key === 'ArrowRight' && index < numInputs - 1) {
      inputRefs.current[index + 1]?.focus?.();
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, numInputs);
    onChange(pastedData);

    // Focus the next empty input or the last input
    const nextIndex = Math.min(pastedData.length, numInputs - 1);
    inputRefs.current[nextIndex]?.focus?.();
  };

  const handleFocus = (index: number) => {
    // Select the content when focused
    inputRefs.current[index]?.input?.select();
  };

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: numInputs }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          onFocus={() => handleFocus(index)}
          maxLength={1}
          style={{
            width: 48,
            height: 56,
            textAlign: 'center',
            fontSize: 24,
            fontWeight: 600
          }}
        />
      ))}
    </div>
  );
};

export default OtpInput;
