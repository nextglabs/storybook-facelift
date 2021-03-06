import { themes as nativeThemes, convert } from '@storybook/theming'
import { Parameters, Config } from '../typings'
import { convertParameterThemeToConfigTheme } from '../utils/convert-parameter-theme-to-config-theme'
import { validateThemeForConfig } from '../utils/validate-theme-for-config'

function createNativeTitle(parameters: Parameters.AddonParameters) {
  const title = (parameters.native && parameters.native.title) || 'Native Storybook'

  return title
}

function createNativeTheme(parameters: Parameters.AddonParameters) {
  const nativeTheme: Config.Theme = {
    type: 'native',
    key: 'native',
    light: {
      ...nativeThemes.light,
      ...(parameters.override || {}),
      ...((parameters.native && parameters.native.override) || {}),
    },
    dark: {
      ...nativeThemes.dark,
      ...(parameters.override || {}),
      ...((parameters.native && parameters.native.override) || {}),
    },
    original: {
      light: {
        ...nativeThemes.light,
        ...(parameters.override || {}),
        ...((parameters.native && parameters.native.override) || {}),
      },
      dark: {
        ...nativeThemes.dark,
        ...(parameters.override || {}),
        ...((parameters.native && parameters.native.override) || {}),
      },
    },
    instanciated: {
      light: convert(nativeThemes.light),
      dark: convert(nativeThemes.dark),
    },
  }

  return nativeTheme
}

export function createConfigDefaults(sourceParameters: Parameters.AddonParameters) {
  const parameters = { ...sourceParameters }
  const returnTitles: Config.Titles = { native: createNativeTitle(parameters) }
  const returnThemes: Config.Themes = { native: createNativeTheme(parameters) }

  const { native: nativeParam, themes: themesParam = [] } = parameters

  // parameters: { native: { variants: ["dark"]} }
  // The config indicates that only dark mode is wanted for native
  if (nativeParam && nativeParam.variants && nativeParam.variants.length > 0) {
    const hasLight = nativeParam.variants.includes('light')
    const hasDark = nativeParam.variants.includes('dark')

    if (!hasLight && returnThemes.native) {
      delete returnThemes.native.light
    }

    if (!hasDark && returnThemes.native) {
      delete returnThemes.native.dark
    }
  }

  // Iterate through the given addon parameter themes and validate and convert
  // into a config object for settings.config - Just bail out if no themesParam
  if (!themesParam || themesParam.length === 0) {
    const config: Config.AddonConfig = { titles: returnTitles, themes: returnThemes }

    return config
  }

  themesParam.forEach((themeItem) => {
    const validTheme = validateThemeForConfig(themeItem, parameters)

    if (!validTheme) {
      return
    }

    const themeType = themeItem.type
    const themeKey = themeItem.key

    const themeConverter = parameters.themeConverters[themeType]

    if (themeConverter) {
      const container: {
        light: Config.Theme | null
        dark: Config.Theme | null
      } = { light: null, dark: null }

      const light = convertParameterThemeToConfigTheme({
        parameters,
        themeConfig: themeItem,
        themeVariant: themeItem.variants.light,
        converter: themeConverter,
        themeVariantName: 'light',
      })

      if (light !== null) {
        container.light = {
          key: themeKey,
          type: themeType,
          light: light.converted,
          original: { light: light.original },
          instanciated: { light: light.instanciated },
        }
      }

      const dark = convertParameterThemeToConfigTheme({
        parameters,
        themeConfig: themeItem,
        themeVariant: themeItem.variants.dark,
        converter: themeConverter,
        themeVariantName: 'dark',
      })

      if (dark !== null) {
        container.dark = {
          key: themeKey,
          type: themeType,
          dark: dark.converted,
          original: { dark: dark.original },
          instanciated: { light: dark.instanciated },
        }
      }

      if (light || dark) {
        // eslint-disable-next-line no-multi-assign
        const returnTheme: Config.Theme = (returnThemes[themeKey] = {
          key: themeKey,
          type: themeType,
          original: {},
          instanciated: {},
        })

        if (light) {
          returnTheme.light = light.converted
          returnTheme.original.light = light.original
          returnTheme.instanciated.light = light.instanciated
        }

        if (dark) {
          returnTheme.dark = dark.converted
          returnTheme.original.dark = dark.original
          returnTheme.instanciated.dark = dark.instanciated
        }

        if (!themeItem.previewOnly) {
          returnTitles[themeKey] = themeItem.title
        }
      }
    }
  })

  const config: Config.AddonConfig = { titles: returnTitles, themes: returnThemes }

  return config
}

export function verifyConfig(
  configSource: Config.AddonConfig,
  parametersSource: Parameters.AddonParameters
) {
  const config = { ...configSource }
  const parameters = { ...parametersSource }

  const { themes } = config
  const { defaultTheme } = parameters

  const addedThemesLength = Object.keys(themes).length - 1
  const includeNative = parameters.includeNative === true
  const didAddThemes = addedThemesLength > 0

  if (!includeNative && didAddThemes && defaultTheme !== 'native') {
    delete config.themes.native
    delete config.titles.native
  }

  return config
}
