import addons, { types } from '@storybook/addons'
import React from 'react'
import { ADDON_ID } from './constants'
import { Facelift } from './Facelift'

addons.register(ADDON_ID, (api) => {
  addons.add(ADDON_ID, {
    title: 'Storybook Facelift',
    type: types.TOOL,
    render: () => {
      return <Facelift api={api} />
    },
  })
})
