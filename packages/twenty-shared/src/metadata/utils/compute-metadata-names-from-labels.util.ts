import { computeMetadataNameFromLabel } from '@/metadata/utils/compute-metadata-name-from-label.util';

const IDENTIFIER_MAX_CHAR_LENGTH = 63;

export const computeMetadataNamesFromLabels = ({
  labelSingular,
  labelPlural,
  applyCustomSuffix = true,
}: {
  labelSingular: string;
  labelPlural: string;
  applyCustomSuffix?: boolean;
}): { nameSingular: string; namePlural: string } => {
  const nameSingular = computeMetadataNameFromLabel({
    label: labelSingular,
    applyCustomSuffix,
  });

  let namePlural = computeMetadataNameFromLabel({
    label: labelPlural,
    applyCustomSuffix,
  });

  if (namePlural !== '' && namePlural === nameSingular) {
    namePlural = (namePlural + 's').slice(0, IDENTIFIER_MAX_CHAR_LENGTH);
  }

  return { nameSingular, namePlural };
};
