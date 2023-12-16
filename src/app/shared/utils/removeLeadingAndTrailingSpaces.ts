export const removeLeadingAndTrailingSpaces = (object: any): void => {
  Object.keys(object).forEach((key) => {
    if (typeof object[key] === 'string') object[key] = object[key].trim();
  });
};
