import { useMemo } from 'react'
import { HttpTransporter } from '@shuttle-ai/client'
import { AgentWorkProvider, AgentWorkRender } from '@shuttle-ai/render-react'

import initAgent from './initAgent'
import dataModel from './config'

import '@shuttle-ai/render-react/style.css'

const transporter = new HttpTransporter({
  baseUrl: 'http://localhost:3100/ai',
  requestHeaders: {
    'content-type': 'application/json',
  },
  revokeMessage: {
    afterSend: async (response) => {
      response.data = response.data.data
    },
  },
})

export default function AiRender() {
  const context = useMemo(() => ({ dataModel }), [])

  return (
    <AgentWorkProvider
      transporter={transporter}
      initAgent={initAgent}
      context={context}
    >
      <AgentWorkRender
        style={{
          boxSizing: 'border-box',
          height: '90vh',
          padding: '0 60px 20px',
        }}
      />
    </AgentWorkProvider>
  )
}
