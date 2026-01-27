import { useEffect, useRef, useState } from 'react'
import { Button, Modal } from 'antd'
import {
  DataEnumGroupListRender,
  DataEnumGroupEditorRender,
  DataEnumGroupEditorInstance,
} from '@shuttle-data/render-react'
import { DataEnumManager } from '@shuttle-data/client'

interface Props {
  manager: DataEnumManager
}

export default function DataEnumRender({ manager }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  const instance = useRef<DataEnumGroupEditorInstance>(null)
  const [currentEditGroupName, setCurrentEditGroupName] = useState<string>()

  useEffect(() => {
    if (!showEditor) {
      setCurrentEditGroupName(undefined)
    }
  }, [showEditor])

  async function handleSubmit() {
    if (instance.current) {
      await instance.current.submit()
      setShowEditor(false)
    }
  }

  return (
    <>
      <DataEnumGroupListRender
        manager={manager}
        title={() => (
          <Button type="primary" onClick={() => setShowEditor(true)}>
            添加
          </Button>
        )}
        columns={[
          {
            title: '操作',
            render: (_, record) => (
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  type="primary"
                  onClick={() => {
                    setCurrentEditGroupName(record.name)
                    setShowEditor(true)
                  }}
                >
                  编辑
                </Button>
                <Button danger onClick={() => manager.removeGroup(record.name)}>
                  删除
                </Button>
              </div>
            ),
          },
        ]}
      />
      <Modal
        title="添加枚举组"
        open={showEditor}
        onCancel={() => setShowEditor(false)}
        onOk={handleSubmit}
        getContainer={() => document.body}
        width={'80vw'}
        cancelText="取消"
        okText="提交"
        footer={(_, { OkBtn, CancelBtn }) => (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <CancelBtn />
            <OkBtn />
          </div>
        )}
      >
        <DataEnumGroupEditorRender
          ref={instance}
          manager={manager}
          groupName={currentEditGroupName}
          prefix="test_"
          style={{ maxHeight: 'calc(80vh - 140px)' }}
        />
      </Modal>
    </>
  )
}
