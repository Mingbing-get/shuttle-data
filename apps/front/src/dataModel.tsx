import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, Flex, TableColumnsType, Modal } from 'antd'
import {
  ModelListRender,
  TableEditorRender,
  TableEditorInstance,
  DataTable,
  DataForm,
  DataDetail,
} from '@shuttle-data/render-react'
import { DataModel } from '@shuttle-data/client'

interface Props {
  dataModel: DataModel
}

export default function DataModelRender({ dataModel }: Props) {
  const [showEditor, setShowEditor] = useState(false)
  const [showData, setShowData] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [editRecord, setEditRecord] = useState<Record<string, any>>()
  const [editId, setEditId] = useState<string>()
  const instance = useRef<TableEditorInstance>(null)
  const [currentTableName, setCurrentTableName] = useState<string>()

  useEffect(() => {
    if (!showEditor && !showData) {
      setCurrentTableName(undefined)
    }
  }, [showEditor, showData])

  useEffect(() => {
    if (!showForm && !showDetail) {
      setEditRecord(undefined)
      setEditId(undefined)
    }
  }, [showForm, showDetail])

  const dataTableColumns = useMemo(() => {
    const columns: TableColumnsType = [
      {
        title: '操作',
        key: 'action',
        fixed: 'right',
        width: 440,
        render: (_, record) => (
          <Flex gap={8}>
            <Button
              type="primary"
              onClick={() => {
                setEditRecord(record)
                setShowForm(true)
              }}
            >
              编辑
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setEditId(record._id)
                setShowForm(true)
              }}
            >
              编辑-仅ID
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setEditRecord(record)
                setShowDetail(true)
              }}
            >
              详情
            </Button>
            <Button
              type="primary"
              onClick={() => {
                setEditId(record._id)
                setShowDetail(true)
              }}
            >
              详情-仅ID
            </Button>
            <Button
              type="primary"
              danger
              onClick={() => {
                dataModel
                  .crud({
                    modelName: currentTableName || '',
                  })
                  .del({
                    condition: {
                      key: '_id',
                      op: 'eq',
                      value: record._id,
                    },
                  })
              }}
            >
              删除
            </Button>
          </Flex>
        ),
      },
    ]

    return columns
  }, [currentTableName])

  async function handleSubmit() {
    if (instance.current) {
      await instance.current.submit()
      setShowEditor(false)
    }
  }

  return (
    <>
      <ModelListRender
        schema={dataModel.schema}
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
                    setCurrentTableName(record.name)
                    setShowEditor(true)
                  }}
                >
                  编辑
                </Button>
                <Button
                  type="primary"
                  onClick={() => {
                    setCurrentTableName(record.name)
                    setShowData(true)
                  }}
                >
                  数据
                </Button>
                <Button
                  danger
                  onClick={() => dataModel.schema.dropTable(record.name)}
                >
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
          schema={dataModel.schema}
          enumManager={dataModel.enumManager}
          tableName={currentTableName}
          dataSourceName="main"
          prefix="test_"
          style={{ maxHeight: 'calc(80vh - 140px)' }}
        />
      </Modal>
      <Modal
        title="模型数据"
        open={showData}
        onCancel={() => setShowData(false)}
        getContainer={() => document.body}
        width={'80vw'}
        footer={null}
      >
        {currentTableName && (
          <DataTable
            showAll
            headerBlock={() => (
              <div style={{ display: 'flex', marginBottom: 12, gap: 8 }}>
                <Button type="primary" onClick={() => setShowForm(true)}>
                  添加数据
                </Button>
              </div>
            )}
            columns={dataTableColumns}
            dataModel={dataModel}
            tableName={currentTableName}
            scroll={{ y: 'calc(60vh - 140px)' }}
          />
        )}
      </Modal>
      <Modal
        title="编辑数据"
        open={showForm}
        onCancel={() => setShowForm(false)}
        getContainer={() => document.body}
        width={'60vw'}
        footer={null}
      >
        {currentTableName && (
          <DataForm
            dataModel={dataModel}
            tableName={currentTableName}
            value={editRecord || editId}
            afterSubmit={() => {
              setShowForm(false)
            }}
            style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}
          />
        )}
      </Modal>
      <Modal
        title="数据详情"
        open={showDetail}
        onCancel={() => setShowDetail(false)}
        getContainer={() => document.body}
        width={'60vw'}
        footer={null}
      >
        {currentTableName && (
          <DataDetail
            dataModel={dataModel}
            tableName={currentTableName}
            value={editRecord || editId}
            style={{ maxHeight: 'calc(80vh - 140px)', overflowY: 'auto' }}
          />
        )}
      </Modal>
    </>
  )
}
