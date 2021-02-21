import React, { ComponentType } from 'react'
import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'

import './index.scss'

interface IProps {

}

type IRankItem = {
  count: number,
  total: number,
  studentId: number,
  studentName: string,
  studentAvatar: string,
  nickName: string,
  correctRate: string
}

interface IState {
  rankList: IRankItem[]
}

class RankList extends Component<IProps, IState>{
  config: Config = {
    navigationBarTitleText: '排行榜'
  }

  constructor(props: IProps) {
    super(props)
    this.state = {
      rankList: []
    }
  }

  async componentDidMount() {
    const { data } = await Taro.request({
      url: 'http://localhost:3000/exercises-rank'
    })
    const { rankList = [] } = data

    this.setState({
      rankList
    })
  }

  render() {
    // const { rankList } = this.state
    const rankList = [
      { studentAvatar: 'http://cdn.algbb.cn/emoji/32.png', nickName: 'Tom Mark', count: 13122 },
      { studentAvatar: 'http://cdn.algbb.cn/emoji/31.png', nickName: 'Bruce Alex', count: 23124 },
      { studentAvatar: 'http://cdn.algbb.cn/emoji/30.png', nickName: 'Chirs Ford', count: 45631 },
      { studentAvatar: 'http://cdn.algbb.cn/emoji/29.png', nickName: 'Ben Dick', count: 16341 },
      { studentAvatar: 'http://cdn.algbb.cn/emoji/28.png', nickName: 'Martin Hugo', count: 23145 },
      { studentAvatar: 'http://cdn.algbb.cn/emoji/27.png', nickName: 'Lee Oliver', count: 34123 },
      { studentAvatar: 'http://cdn.algbb.cn/emoji/26.png', nickName: 'Mark Rex', count: 56142 }
    ]

    return (
      <View className="rank-list__container">
        <View className="rank-list__background" />
        <View className="rank-list__wrap--champion">
          <Image className="decoration" src="http://cdn.algbb.cn/rank/crown.png" />
          <Image className="avatar" src={rankList[0].studentAvatar} />
          <View>
            <View className="name">{rankList[0].nickName}</View>
            <View className="realname">
              <Text>({rankList[0].nickName})</Text>
              <View className="score">{rankList[0].count}</View>
            </View>
          </View>
        </View>

        {/* <View className="rank-list__wrap rank-list__wrap--header">
          <View className="number"></View>
          <View className="score">做题数</View>
        </View> */}

        {rankList.slice(1).map((rank, index) => {
          const { studentAvatar, nickName, count } = rank
          return (
            <View className="rank-list__wrap" key={index}>
              <View className="number">{index + 2}</View>
              <Image className="avatar" src={studentAvatar} />
              <View className="name">
                {nickName}
                <View className="realname">
                  ({nickName})
                </View>
              </View>
              <View className="score">{count}</View>
            </View>
          )
        })}
      </View>
    )
  }
}

export default RankList as ComponentType