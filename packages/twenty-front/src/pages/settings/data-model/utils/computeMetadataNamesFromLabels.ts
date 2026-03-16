import { computeMetadataNamesFromLabels as computeMetadataNamesFromLabelsCore } from 'twenty-shared/metadata';

// Frontend-specific wrapper that returns empty strings on error instead of throwing
export const computeMetadataNamesFromLabels = (
  labelSingular: string,
  labelPlural: string,
): { nameSingular: string; namePlural: string } => {
  try {
    return computeMetadataNamesFromLabelsCore({ labelSingular, labelPlural });
  } catch {
    return { nameSingular: '', namePlural: '' };
  }
};
