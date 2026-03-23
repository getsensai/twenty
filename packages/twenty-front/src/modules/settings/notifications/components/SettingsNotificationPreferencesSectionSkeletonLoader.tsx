import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledSkeletonContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const StyledSkeletonRow = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} 0;
`;

const SKELETON_ROWS = [{ width: 200 }, { width: 180 }, { width: 220 }];

export const SettingsNotificationPreferencesSectionSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);
  return (
    <Section>
      <SkeletonTheme
        baseColor={theme.background.tertiary}
        highlightColor={theme.background.transparent.lighter}
        borderRadius={4}
      >
        <Skeleton
          height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
          width={160}
          style={{ marginBottom: themeCssVariables.spacing[2] }}
        />
        <StyledSkeletonContainer>
          {SKELETON_ROWS.map((row, index) => (
            <StyledSkeletonRow key={index}>
              <Skeleton
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
                width={row.width}
              />
              <Skeleton
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.m}
                width={36}
              />
            </StyledSkeletonRow>
          ))}
        </StyledSkeletonContainer>
      </SkeletonTheme>
    </Section>
  );
};
