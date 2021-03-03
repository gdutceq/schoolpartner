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
    const { rankList } = this.state
    // const rankList = [
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/32.png', nickName: 'Tom Mark', studentName: 'Tom Mark', total: 13122 },
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/31.png', nickName: 'Bruce Alex', studentName: 'Bruce Alex', total: 23124 },
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/30.png', nickName: 'Chirs Ford', studentName: 'Chirs Ford', total: 45631 },
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/29.png', nickName: 'Ben Dick', studentName: 'Ben Dick', total: 16341 },
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/28.png', nickName: 'Martin Hugo', studentName: 'Martin Hugo', total: 23145 },
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/27.png', nickName: 'Lee Oliver', studentName: 'Lee Oliver', total: 34123 },
    //   { studentAvatar: 'http://cdn.algbb.cn/emoji/26.png', nickName: 'Mark Rex', studentName: 'Mark Rex', total: 56142 }
    // ]
    console.log(rankList)
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
              <View className="score">{rankList[0].total}</View>
            </View>
          </View>
        </View>

        {/* <View className="rank-list__wrap rank-list__wrap--header">
          <View className="number"></View>
          <View className="score">做题数</View>
        </View> */}

        {rankList.slice(1).map((rank, index) => {
          const { studentAvatar, nickName, total } = rank
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
              <View className="score">{total}</View>
            </View>
          )
        })}
      </View>
    )
  }
}

export default RankList as ComponentType