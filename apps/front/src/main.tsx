import { useState } from 'react'
import { Tabs } from 'antd'

import dataModel from './dataModel'
import DataEnumRender from './dataEnum'

export default function Main() {
  const [activeTab, setActiveTab] = useState('enum')

  return (
    <Tabs activeKey={activeTab} onChange={setActiveTab}>
      <Tabs.TabPane tab="枚举" key="enum">
        <DataEnumRender manager={dataModel.enumManager} />
      </Tabs.TabPane>
      <Tabs.TabPane tab="数据模型" key="model">
        <span>数据模型</span>
        {/* <DataModelRender manager={dataModel.modelManager} /> */}
      </Tabs.TabPane>
    </Tabs>
  )
}
