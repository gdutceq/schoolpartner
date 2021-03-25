import React, { FC, useState, useEffect, ChangeEvent } from 'react'
import { Table, Button, Popconfirm, Modal, Input, Empty, message, Upload, Select } from 'antd';
const { Option } = Select;
import { ColumnProps } from 'antd/es/table'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import { CustomBreadcrumb } from '@/admin/components'
import { ResourceList } from '@/admin/modals/ResourceList'
import { CourseList } from '@/admin/modals/CourseList'
import { FetchConfig } from '@/admin/modals/http'
import { useService } from '@/admin/hooks'
import http from '@/admin/utils/http'
import { observer } from 'mobx-react'
import { useStore } from '@/admin/hooks/useStore'

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
      dataIndex: 'courseName',
      key: 'courseName',
      width: 120,
      filteredValue: [searchValue],
      onFilter: (_, row) => (
        row.courseName.toString().indexOf(searchValue) !== -1
      )
    }, {
      title: '操作',
      dataIndex: '',
      key: '',
      width: 180,
      render: (_, row) => (
        <span>
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
  
  // 选中行数
  const handleSelectedChange = (selectedRowKeys: number[]) => {
    console.log(selectedRowKeys)
    setSelectedRowKeys(selectedRowKeys)
  }

  const handleSearchChange = (changeEvent: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = changeEvent
    setSearchValue(value)
  }

  // 删除单条
  const handleDeleteClick = async (resourceId: number) => {
    const { data: { msg } } = await http.delete(`/resource/${resourceId}`)
    setFetchFlag(fetchFlag + 1)
    setSelectedRowKeys([])
    message.success(msg)
  }

  // 批量删除
  const handleBatchDelete = async () => {
    console.log(selectedRowKeys)
    const { data: { msg } } = await http.delete(`/resource`, {
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

  // 获取资料列表
  const resourceRes = useService(resourcefetchConfig)?.response
  const dataRes = resourceRes?.data || {}
  const { resourceList = [], total: totalPage = 0 } = dataRes

  // 获取课程
  const { isLoading = false, response } = useService(coursefetchConfig)
  const { data = {} } = response || {}
  const { courseList = [] } = data

  // 选取相关课程
  const [selectId, setSelectId] = useState('')
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setSelectId(value)
  }

  // 手动上传文件
  const [fileList, setFileList] = useState<UploadFile[]>([])
  const uploadProps = {
    onRemove: (file) => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList)
    },
    beforeUpload:  (file) => {
      setFileList([...fileList, file])
      return false;
    },
    fileList,
  }

   // 弹框
   const [isModalVisible, setIsModalVisible] = useState<boolean>(false)
   const [confirmLoading, setConfirmLoading] = useState(false)
   // 获取用户名
   const { userInfoStore } = useStore()
   const { username } = userInfoStore
   const destroyOnClose = true
   const showUploadModal = () => {
     setIsModalVisible(true);
   };

   // 确认上传文件
   const handleOk = async() => {
     console.log(fileList)
     const formData = new FormData();
     fileList.forEach(file => {
       formData.append('file', file);
     });

     // 获取课程名
     const selectCourseName = () => {
      for(let course of courseList) {
        if (course.id == Number(selectId)) {
          return course.courseName
        }
      }
    }

     formData.append('course_id', selectId)
     formData.append('course_name', selectCourseName())
     formData.append('publish_date',(new Date().getTime()).toString())
     formData.append('resource_author', username)
    //  console.log(formData)
     const {data: { msg }} = await http.post('/resource/upload', formData)
     setFetchFlag(fetchFlag + 1)
     setSelectedRowKeys([])
     message.success(msg)

     setIsModalVisible(false);
     setSelectId('')
   };
   const handleCancel = () => {
     setIsModalVisible(false);
     setSelectId('')
   };

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
          dataSource={resourceList}
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
      <Modal title="上传资料" 
        visible={isModalVisible} 
        onOk={handleOk} 
        onCancel={handleCancel}
        confirmLoading={confirmLoading}
        destroyOnClose={destroyOnClose}
        >
        <div className="upload-modal">
        <div className='select-course'>
            <p>请先选择所属课程</p>
            <Select style={{ width: 120 }} onChange={handleChange}>
              {
                courseList.map((course:CourseList) => 
                  <Option key={course.id} value={course.id}>{course.courseName}</Option>
                )
              }
            </Select>
          </div>
          {
            selectId?<Upload {...uploadProps} className='upload-container'>
              <img className='upload-icon' src="../../../../public/img/upload.png"></img>
              <p>点击上传文件</p>
            </Upload> : <p></p>
          }
        </div>
      </Modal>
    </div>
  )
}

export default withRouter(observer(CourseList))