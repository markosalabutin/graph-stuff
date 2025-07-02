export const COLOR_PALETTE = [
  '#E52925',
  '#0540A3',
  '#6C840F',
  '#BC3CCD',
  '#075C22',
  '#940C4D',
  '#0087C0',
  '#6A4309',
  '#005F8B',
  '#00916E',
] as const;

export const getColorByIndex = (index: number): string => {
  return COLOR_PALETTE[index % COLOR_PALETTE.length];
};
