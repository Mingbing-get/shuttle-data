import { useState } from 'react'
import { Tabs } from 'antd'

import dataModel from './config'
import DataEnumRender from './dataEnum'
import DataModelRender from './dataModel'
import AiRender from './aiRender'

export default function Main() {
  const [activeTab, setActiveTab] = useState('enum')

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <Tabs.TabPane tab="枚举" key="enum">
        <DataEnumRender manager={dataModel.enumManager} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="数据模型" key="model">
        <DataModelRender dataModel={dataModel} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="AI" key="ai">
        <AiRender />
      </Tabs.TabPane>
    </Tabs>
  )
}
