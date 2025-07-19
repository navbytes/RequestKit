import { useState, useCallback } from 'preact/hooks';

interface ValidationRule<T> {
  validate: (value: T) => boolean;
  message: string;
}

interface FormValidationOptions<T> {
  initialValues: T;
  validationRules: Partial<Record<keyof T, ValidationRule<T[keyof T]>[]>>;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface FormValidationReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setFieldTouched: (field: keyof T, touched?: boolean) => void;
  validateField: (field: keyof T) => boolean;
  validateForm: () => boolean;
  resetForm: () => void;
  resetField: (field: keyof T) => void;
}

/**
 * Custom hook for form validation with field-level validation
 */
export function useFormValidation<T extends Record<string, unknown>>(
  options: FormValidationOptions<T>
): FormValidationReturn<T> {
  const {
    initialValues,
    validationRules,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const validateField = useCallback(
    (field: keyof T): boolean => {
      const fieldRules = validationRules[field];
      if (!fieldRules) return true;

      const value = values[field];
      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          setErrors(prev => ({ ...prev, [field]: rule.message }));
          return false;
        }
      }

      setErrors(prev => ({ ...prev, [field]: undefined }));
      return true;
    },
    [values, validationRules]
  );

  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    const newErrors: Partial<Record<keyof T, string>> = {};

    Object.keys(validationRules).forEach(field => {
      const fieldKey = field as keyof T;
      const fieldRules = validationRules[fieldKey];
      if (!fieldRules) return;

      const value = values[fieldKey];
      for (const rule of fieldRules) {
        if (!rule.validate(value)) {
          newErrors[fieldKey] = rule.message;
          isFormValid = false;
          break;
        }
      }
    });

    setErrors(newErrors);
    return isFormValid;
  }, [values, validationRules]);

  const setValue = useCallback(
    (field: keyof T, value: T[keyof T]) => {
      setValues(prev => ({ ...prev, [field]: value }));

      if (validateOnChange) {
        setTimeout(() => validateField(field), 0);
      }
    },
    [validateOnChange, validateField]
  );

  const setFieldTouched = useCallback(
    (field: keyof T, isTouched: boolean = true) => {
      setTouched(prev => ({ ...prev, [field]: isTouched }));

      if (validateOnBlur && isTouched) {
        validateField(field);
      }
    },
    [validateOnBlur, validateField]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  const resetField = useCallback(
    (field: keyof T) => {
      setValues(prev => ({ ...prev, [field]: initialValues[field] }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
      setTouched(prev => ({ ...prev, [field]: false }));
    },
    [initialValues]
  );

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setFieldTouched,
    validateField,
    validateForm,
    resetForm,
    resetField,
  };
}
