import React, { ComponentType } from 'react'
import { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import { observer, inject } from '@tarojs/mobx'

import exerciseStore from '../../../store/exerciseStore'


import './index.scss'

const { prefix } = require('../../../config/common')

interface IProps {
  number: number,
  exerciseStore: exerciseStore
}

interface IStates {
  imgSrc: string
}

@inject('exerciseStore')
@observer
class Options extends Component<IProps, IStates> {
  constructor(props: IProps) {
    super(props);
  }

  formatNumber(number: number): string {
    return String.fromCharCode(number + 65)
  }

  onOptionClick(number: number, index: number): void {
    const { exerciseStore: { handleOptionClick } } = this.props;
    handleOptionClick(number, index);
  }

  onConfirmClick(): void {
    const { exerciseStore: { handleConfirmClick } } = this.props;
    handleConfirmClick();
  }

  handleImageUpload(): void {
    const { number, exerciseStore: { exerciseId, handleOptionClick } } = this.props;

     // taro 自身的图片上传api
    Taro.chooseImage({
      count: 1, // 最多可以选择的图片张数
      success: (res) => {
        const filePath = res.tempFilePaths[0] 
        const openid = Taro.getStorageSync('openid')
        // console.log(res)
        Taro.uploadFile({
          url: `${prefix}/upload`,
          filePath, // 要上传文件资源的路径
          name: 'files',
          formData: { // HTTP 请求中其他额外的 form data
            openid,
            exerciseId,
            exerciseIndex: number
          },
          success: (res) => {
            console.log(res)
            this.setState({
              imgSrc: filePath
            })
            Taro.showToast({
              title: `上传成功`,
              icon: 'none'
            })
            // debugger
          },
          fail: () => {
            console.log('接口请求错误')
          }
        })
      },
      fail: () => {
        console.log('图片上传失败')
      }
    })
    handleOptionClick(number, 0)
  }

  render() {
    const { number, exerciseStore: { topicList, optionStatus, fontSize, isFinished, isSubmitted } } = this.props;
    // debugger
    if (!optionStatus[number] || !topicList[number]) return;
    const { topicOptions, isUpload = false } = topicList[number];
    const buttonClassName: string = optionStatus[number].some(_ => _ === 1) && !isSubmitted ? 'confirm' : 'confirm hide';
    const buttonName: string = isFinished ? '完成答题' : '下一题'
    console.log(buttonName)
    const optionClassNames = {
      "-2": "number error",
      "-1": "number omit",
      "0": "number",
      "1": "number active",
      "2": "number correct"
    }
    return (
      <View className='exam-options'>
        {!isUpload ? topicOptions.map((topicOption, index) => {
          const { option, id } = topicOption
          const optionClassName: string = optionClassNames[optionStatus[number][index]]
          return (
            <View className='wrap' key={index} onClick={this.onOptionClick.bind(this, number, index)}>
              <View className={optionClassName}>{this.formatNumber(index)}</View>
              <View className={`content ${fontSize}`}>{option}</View>
            </View>
          )
        }) : (
            <View className="uploader__container">
              请在此上传图片:
              <View className="uploader__wrapper" onClick={this.handleImageUpload.bind(this)}>
                {
                  this.state.imgSrc? <Image src = {this.state.imgSrc}></Image> : 
                  <View className="uploader__icon">
                    +
                  </View>
                } 
              </View>
            </View>
          )}
        <View className={buttonClassName} onClick={this.onConfirmClick.bind(this)}>{buttonName}</View>
      </View>
    )
  }
}

export default Options as ComponentType<IProps>
