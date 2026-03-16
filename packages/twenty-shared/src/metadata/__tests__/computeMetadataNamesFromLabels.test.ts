import { computeMetadataNamesFromLabels } from '@/metadata/utils/compute-metadata-names-from-labels.util';

describe('computeMetadataNamesFromLabels', () => {
  it('should compute different names from different labels', () => {
    expect(
      computeMetadataNamesFromLabels({
        labelSingular: 'Company',
        labelPlural: 'Companies',
      }),
    ).toEqual({
      nameSingular: 'company',
      namePlural: 'companies',
    });
  });

  it('should append "s" to plural name when labels produce identical names', () => {
    expect(
      computeMetadataNamesFromLabels({
        labelSingular: 'Sheep',
        labelPlural: 'Sheep',
      }),
    ).toEqual({
      nameSingular: 'sheep',
      namePlural: 'sheeps',
    });
  });

  it('should handle German words with identical singular and plural', () => {
    expect(
      computeMetadataNamesFromLabels({
        labelSingular: 'Unternehmen',
        labelPlural: 'Unternehmen',
      }),
    ).toEqual({
      nameSingular: 'unternehmen',
      namePlural: 'unternehmens',
    });
  });

  it('should not append "s" when labels produce different names', () => {
    expect(
      computeMetadataNamesFromLabels({
        labelSingular: 'Person',
        labelPlural: 'People',
      }),
    ).toEqual({
      nameSingular: 'person',
      namePlural: 'people',
    });
  });

  it('should handle empty labels gracefully', () => {
    expect(
      computeMetadataNamesFromLabels({
        labelSingular: '',
        labelPlural: '',
      }),
    ).toEqual({
      nameSingular: '',
      namePlural: '',
    });
  });

  it('should apply custom suffix for reserved words by default', () => {
    const result = computeMetadataNamesFromLabels({
      labelSingular: 'Job',
      labelPlural: 'Jobs',
    });

    expect(result.nameSingular).toBe('jobCustom');
    expect(result.namePlural).toBe('jobsCustom');
  });

  it('should skip custom suffix when applyCustomSuffix is false', () => {
    const result = computeMetadataNamesFromLabels({
      labelSingular: 'Job',
      labelPlural: 'Jobs',
      applyCustomSuffix: false,
    });

    expect(result.nameSingular).toBe('job');
    expect(result.namePlural).toBe('jobs');
  });

  it('should handle case-insensitive collision after camelCase conversion', () => {
    expect(
      computeMetadataNamesFromLabels({
        labelSingular: 'Aircraft',
        labelPlural: 'Aircraft',
      }),
    ).toEqual({
      nameSingular: 'aircraft',
      namePlural: 'aircrafts',
    });
  });
});
