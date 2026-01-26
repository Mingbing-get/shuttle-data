import { useEffect, useRef, useState } from 'react'
import { Button, Modal } from 'antd'
import {
  ModelListRender,
  TableEditorRender,
  TableEditorInstance,
} from '@shuttle-data/render-react'
import { DataModelSchema, DataEnumManager } from '@shuttle-data/client'

interface Props {
  schema: DataModelSchema
  enumManager: DataEnumManager
}

export default function DataModelRender({ schema, enumManager }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  const instance = useRef<TableEditorInstance>(null)
  const [currentEditTableName, setCurrentEditTableName] = useState<string>()

  useEffect(() => {
    if (!showEditor) {
      setCurrentEditTableName(undefined)
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
      <ModelListRender
        schema={schema}
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
                    setCurrentEditTableName(record.name)
                    setShowEditor(true)
                  }}
                >
                  编辑
                </Button>
                <Button danger onClick={() => schema.dropTable(record.name)}>
                  删除
                </Button>
              </div>
            ),
          },
        ]}
      />
      <Modal
        title="添加数据模型"
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
        <TableEditorRender
          ref={instance}
          schema={schema}
          enumManager={enumManager}
          tableName={currentEditTableName}
          dataSourceName="main"
          prefix="test_"
          style={{ maxHeight: 'calc(80vh - 140px)' }}
        />
      </Modal>
    </>
  )
}
