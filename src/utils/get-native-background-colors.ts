import { ThemeVars as StorybookThemeOptions } from '@storybook/theming'
import { Parameters } from '../typings'

export function getNativeBackgroundColors(
  theme: StorybookThemeOptions,
  background?: Parameters.ThemeBackgroundsTypes
) {
  let { appBg } = theme
  let { appContentBg } = theme

  if (background && background !== 'normal') {
    switch (background) {
      case 'equal':
      case 'equal-app':
        appContentBg = appBg
        break
      case 'equal-content':
        appBg = appContentBg
        break
      case 'equal-reverse':
        appBg = appContentBg
        break
      case 'reverse':
        appBg = theme.appContentBg
        appContentBg = theme.appBg
        break
      default:
        break
    }
  }

  return { appBg, appContentBg }
}
