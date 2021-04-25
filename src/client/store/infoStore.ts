import { observable, action } from 'mobx'
import Taro from '@tarojs/taro'

interface UserInfo {
  avatarUrl: string,
  city: string,
  country: string,
  gender: number,
  language: string,
  nickName: string,
  province: string,
}

class infoStore {
  @observable openid: string = ''
  @observable userInfo: UserInfo = {
    avatarUrl: '',
    city: '',
    country: '',
    gender: -1,
    language: '',
    nickName: '',
    province: '',
  }
  @observable isLogin: boolean = false

  @action.bound
  handleUserLogin(): any {
    return new Promise(async (resolve) => {
      try {
        const { code } = await Taro.login()
        console.log(code)
        // developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801
        // 4月28日24时后发布的新版本小程序，开发者调用wx.getUserInfo将不再弹出弹窗，直接返回匿名的用户个人信息
        // 新增getUserProfile接口（基础库2.10.4版本开始支持），可获取用户头像、昵称、性别及地区信息
        const { userInfo } = await Taro.getUserInfo()
        console.log(userInfo)
        const { nickName, avatarUrl } = userInfo
        const { data } = await Taro.request({
          url: `http://localhost:3000/login/`,
          method: 'POST',
          data: {
            code,
            nickName,
            avatarUrl
          }
        })
        const { openid = '' } = data
        console.log('login suc')
        Taro.setStorageSync('openid', openid)
        this.openid = openid
        this.userInfo = userInfo
        resolve()
      } catch (e) {
        console.log(e)
        if (e.errMsg === 'getUserInfo:fail scope unauthorized') {
          Taro.redirectTo({
            url: '/pages/login/index'
          })
          resolve()
          return
        }
        // Taro.showToast({
        //   title: '信息加载失败，请重试...',
        //   icon: "none"
        // })
        setTimeout(() => {
          this.handleUserLogin()

        }, 1000)
        // Taro.redirectTo({
        //   url: '/pages/index/index'
        // })
        resolve()
      }
    })
  }

  @action.bound
  setUserInfo(userInfo: UserInfo): any {
    this.userInfo = userInfo
  }

  @action.bound
  setIsLogin(isLogin: boolean): any {
    this.isLogin = isLogin
  }

  // @action.bound
  // getUserInfo(): any {
  //   return new Promise(async (resolve) => {
  //     const { userInfo } = await Taro.getUserInfo({
  //       withCredentials: true
  //     })
  //     this.userInfo = userInfo
  //     resolve()
  //   })
  // }
}

export default infoStore