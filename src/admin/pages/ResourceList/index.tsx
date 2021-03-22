import React, { FC, useState, useEffect, ChangeEvent } from 'react'
import { Table, Button, Popconfirm, Modal, Input, Empty, message, Upload } from 'antd';
import { ColumnProps } from 'antd/es/table'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { CustomBreadcrumb } from '@/admin/components'
import { ResourceList } from '@/admin/modals/ResourceList'
import { FetchConfig } from '@/admin/modals/http'
import { useService } from '@/admin/hooks'
import http from '@/admin/utils/http'

import './index.scss'

const CourseList: FC<RouteComponentProps> = (props: RouteComponentProps) => {
  const [currentPage, setCurrentPage] = useState<number>(0)
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [coursefetchConfig, setCourCeFetchConfig] = useState<FetchConfig>({
    url: '', method: 'GET', params: {}, config: {}
  })
  const [resourcefetchConfig, setResourceFetchConfig] = useState<FetchConfig>({
    url: '', method: 'GET', params: {}, config: {}
  })
  const [fetchFlag, setFetchFlag] = useState<number>(0)
  const hasSelected: boolean = selectedRowKeys.length > 0
  const { history } = props

  useEffect(() => {
    // 获取课程列表
    const courseFetchConfig: FetchConfig = {
      url: '/courses',
      method: 'GET',
      params: {},
      config: {}
    }
    setCourCeFetchConfig(Object.assign({}, courseFetchConfig))
  }, [fetchFlag])

  useEffect(() => {
    // 获取资源列表
    const resourcefetchConfig: FetchConfig = {
      url: '/resource',
      method: 'GET',
      params: {},
      config: {}
    }
    setResourceFetchConfig(Object.assign({}, resourcefetchConfig))
  }, [fetchFlag])
  
  const handleSelectedChange = (selectedRowKeys: number[]) => {
    setSelectedRowKeys(selectedRowKeys)
  }

  const handleSearchChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = changeEvent
    setSearchValue(value)
  }

  const handleEditClick = (courseId: number) => {
    history.push(`/admin/content/course-modify/${courseId}`)
  }

  const handleDeleteClick = async (courseId: number) => {
    const { data: { msg } } = await http.delete(`/courses/${courseId}`)
    setFetchFlag(fetchFlag + 1)
    setSelectedRowKeys([])
    message.success(msg)
  }

  const handleBatchDelete = async () => {
    const { data: { msg } } = await http.delete(`/courses`, {
      data: selectedRowKeys
    })
    setFetchFlag(fetchFlag + 1)
    setSelectedRowKeys([])
    message.success(msg)
  }

  const rowSelection = {
    selectedRowKeys,
    onChange: handleSelectedChange,
  }

  // 弹框
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
  const [confirmLoading, setConfirmLoading] = useState(false);
  const showUploadModal = () => {
    setIsModalVisible(true);
  };
  const handleOk = () => {
    setIsModalVisible(false);
  };
  const handleCancel = () => {
    setIsModalVisible(false);
  };


  const columns: ColumnProps<ResourceList>[] = [
    {
      title: '资料名称',
      dataIndex: 'resourceName',
      key: 'resourceName',
      ellipsis: true,
      // filteredValue: [searchValue],
      // onFilter: (_, row) => (
      //   row.resourceName.toString().indexOf(searchValue) !== -1
      // )
    }, {
      title: '资料类型',
      dataIndex: 'resourceType',
      key: 'resourceType',
      ellipsis: true,
      width: 120,
    }, {
      title: '资料大小',
      dataIndex: 'resourceSize',
      key: 'resourceSize',
      width: 120,
    },
    {
      title: '上传时间',
      dataIndex: 'publishDate',
      key: 'publishDate',
      width: 120,
      render: publishDate => new Date(publishDate).toLocaleDateString(),
      sorter: (a, b) => a.publishDate - b.publishDate
    }, {
      title: '上传作者',
      dataIndex: 'resourceAuthor',
      key: 'resourceAuthor',
      width: 120,
    },
    {
      title: '所属课程',
      dataIndex: 'courseId',
      key: 'courseId',
      width: 120,
      // filteredValue: [searchValue],
      // onFilter: (_, row) => (
      //   row.resourceName.toString().indexOf(searchValue) !== -1
      // )
    }, {
      title: '操作',
      dataIndex: '',
      key: '',
      width: 180,
      render: (_, row) => (
        <span>
          <Button
            type="primary"
            onClick={() => handleEditClick(row.id)}>编辑</Button>
          <Popconfirm
            title="确定删除此资料吗?"
            onConfirm={() => handleDeleteClick(row.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="danger">删除</Button>
          </Popconfirm>
        </span>
      )
    }
  ]
  // 获取资料列表
  // const { isLoading = false, response } = useService(resourcefetchConfig)
  // 获取课程
  const { isLoading = false, response } = useService(coursefetchConfig)
  const { data = {} } = response || {}
  const { courseList = [], total: totalPage = 0 } = data
  return (
    <div>
      <CustomBreadcrumb list={['内容管理', '资料管理']} />
      <div className="course-list__container">
        <div className="course-list__header">
          <Button type="primary" style={{ marginRight: 10 }} onClick={showUploadModal}>上传资料</Button>
          <Popconfirm
            disabled={!hasSelected}
            title="确定删除这些课程吗?"
            onConfirm={handleBatchDelete}
            okText="确定"
            cancelText="取消"
          >
            <Button type="danger" disabled={!hasSelected}>批量删除</Button>
          </Popconfirm>

          <Input.Search
            className="search__container"
            value={searchValue}
            placeholder="请输入要查询相关课程名称"
            onChange={handleSearchChange}
            enterButton />
        </div>
        <Table
          rowSelection={rowSelection}
          dataSource={courseList}
          columns={columns}
          rowKey="id"
          scroll={{
            y: "calc(100vh - 300px)"
          }}
          loading={{
            spinning: isLoading,
            tip: "加载中...",
            size: "large"
          }}
          pagination={{
            pageSize: 10,
            total: totalPage,
            current: currentPage,
            onChange: (pageNo) => setCurrentPage(pageNo)
          }}
          locale={{
            emptyText: <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="暂无数据" />
          }}
        />
      </div>
      <Modal title="Basic Modal" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        >
        <Upload>
          <img src=""></img>
        </Upload>
      </Modal>
    </div>
  )
}

export default withRouter(CourseList)