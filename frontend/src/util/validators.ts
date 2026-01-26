export const required = (value: string): boolean => value.trim() !== "";

export const fileRequired = (value: File | string): boolean => {
  if (value instanceof File) {
    return value.size > 0;
  }
  return value.trim().length > 0;
};

export const length =
  (config: { min?: number; max?: number }) =>
  (value: string): boolean => {
    let isValid = true;
    if (config.min !== undefined) {
      isValid = isValid && value.trim().length >= config.min;
    }
    if (config.max !== undefined) {
      isValid = isValid && value.trim().length <= config.max;
    }
    return isValid;
  };

export const email = (value: string): boolean =>
  /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
    value,
  );
