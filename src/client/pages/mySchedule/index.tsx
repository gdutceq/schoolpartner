import React, { ComponentType } from 'react'
import { Component, Config } from '@tarojs/taro'
import { observer, inject } from '@tarojs/mobx'
import { View, Image, Button } from '@tarojs/components'
import { AtCalendar, AtModal, AtModalHeader, AtModalContent, AtModalAction, AtInput } from "taro-ui"

import { MarkInfo, TaskInfo } from '../../modals/schedule'
import formatDate from '../../utils/formatDate'

import infoStore from '../../store/infoStore'

import './index.scss'

interface IProps {
  infoStore: infoStore
}

interface IStates {
  markList: Array<MarkInfo>,
  taskList: Array<TaskInfo>,
  currentDayTaskList: Array<TaskInfo>,
  currentDay: string,
  newTaskContent: string
  isModalOpened: boolean
}

@inject('infoStore')
@observer
class MySchedule extends Component<IProps, IStates> {
  config: Config = {
    navigationBarTitleText: '我的日程'
  }

  constructor(props: IProps) {
    super(props)
    this.state = {
      markList: [],
      taskList: [],
      currentDayTaskList: [],
      currentDay: '',
      newTaskContent: '',
      isModalOpened: false
    }
    this.handleDayClick = this.handleDayClick.bind(this)
    this.handleAddClick = this.handleAddClick.bind(this)
    this.handleConfirmClick = this.handleConfirmClick.bind(this)
    this.handleTaskContentChange = this.handleTaskContentChange.bind(this)
  }

  async componentDidMount() {
    // const markList: Array<MarkInfo> = [
    //   { value: '2021-04-08' },
    //   { value: '2021-04-14' },
    //   { value: '2021-04-23' }
    // ]
    
    // const taskList: Array<TaskInfo> = [
    //   { content: '完成web大作业', time: '2021-04-08' },
    //   { content: '准备期末考试', time: '2021-04-08' },
    //   { content: '开始四六级考试', time: '2021-04-14' },
    //   { content: '出去玩出去嗨皮', time: '2021-04-23' },
    // ]

    let markList: Array<MarkInfo> = []
    let taskList: Array<TaskInfo> = []

    const {infoStore: { openid }} = this.props
    await Taro.request({
      method: 'GET',
      url: `http://localhost:3000/schedules/${openid}`,
      success: function (res) {
        const { data } = res.data
        console.log(data)
        taskList = data
      }
    })

    // 去重
    let obj = {};
    const markListObj = taskList.reduce((cur,next) => {
      obj[next.time] ? "" : obj[next.time] = true && cur.push(next);
      return cur;
    },[])

    console.log(markListObj)
    markListObj.forEach( item => {
      markList.push({
        value: item.time
      })
    })
    // const currentDay: string = new Date().toLocaleDateString().replace(/\//g, '-')
    const currentDay: string = formatDate(new Date(),'yyyy-MM-dd')
    const currentDayTaskList: Array<TaskInfo> = taskList.filter((task: TaskInfo) => task.time === currentDay)
    this.setState({
      markList,
      taskList,
      currentDay,
      currentDayTaskList
    })
  }

  handleDayClick({ value: time }: { value: string }): void {
    const { taskList } = this.state
    const currentDayTaskList: Array<TaskInfo> = taskList.filter((task: TaskInfo) => task.time === time)
    // debugger
    console.log(taskList,currentDayTaskList)
    this.setState({
      currentDayTaskList,
      currentDay: time
    })
  }

  handleAddClick(): void {
    this.setState({
      isModalOpened: true
    })
  }

  // 确认添加日程
  async handleConfirmClick() {
    const { currentDay, taskList, markList, newTaskContent } = this.state
    const {infoStore: { openid }} = this.props
    await Taro.request({
      method: 'POST',
      url: 'http://localhost:3000/schedules',
      data: {
        openid,
        content: newTaskContent,
        time: currentDay
      },
      success: function (res) {
        const { data: { msg }} = res.data
        Taro.showToast({
          title: `${msg}`,
        })
      }
    })
    taskList.push({
      content: newTaskContent,
      time: currentDay
    })
    markList.push({
      value: currentDay
    })
    const currentDayTaskList: Array<TaskInfo> = taskList.filter((task: TaskInfo) => task.time === currentDay)

    this.setState({
      isModalOpened: false,
      markList,
      taskList,
      currentDayTaskList,
      newTaskContent: ''
    })
  }

  handleCancelClick(): void {
    this.setState({
      isModalOpened: false
    })
  }

  handleTaskContentChange(value: string): void {
    this.setState({
      newTaskContent: value
    })
  }

  render() {
    const { markList, currentDayTaskList, isModalOpened, newTaskContent } = this.state
    // debugger
    return (
      <View className="schedule__container">
        <AtModal isOpened={isModalOpened}>
          <AtModalHeader>添加活动日程</AtModalHeader>
          <AtModalContent>
            <AtInput
              name="taskContent"
              type='text'
              placeholder='请输入活动日程安排'
              value={newTaskContent}
              onChange={this.handleTaskContentChange}
            />
          </AtModalContent>
          <AtModalAction>
            <Button onClick={this.handleCancelClick}>取消</Button>
            <Button onClick={this.handleConfirmClick}>确定</Button>
          </AtModalAction>
        </AtModal>
        <View className="schedule__calender">
          <AtCalendar marks={markList} onDayClick={this.handleDayClick} />
        </View>
        <View className="schedule__wrap">
          {currentDayTaskList.length !== 0 ?
            currentDayTaskList.map((task: TaskInfo, index: number) => {
              const { content, time } = task
              return (
                <View className="schedule__item" key={index}>
                  <Image className="icon" src="http://cdn.algbb.cn/schedule/task.png" />
                  <View className="content">{content}</View>
                  <View className="time">{time}</View>
                </View>
              )
            }) :
            <View className="schedule__item--empty">暂无日程安排</View>
          }
          <View className="schedule__publish" onClick={this.handleAddClick}>ADD EVENT</View>
        </View>
      </View>
    )
  }
}

export default MySchedule as ComponentType