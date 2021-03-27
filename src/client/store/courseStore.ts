import { observable, action } from 'mobx'
import Taro from '@tarojs/taro'

import { CourseInfo } from '../modals/courseDetail'

class courseStore {
  @observable courseDetail: CourseInfo = {
    courseAuthor: '',
    publishDate: '',
    courseViews: 0,
    courseDescription: '',
    courseSteps: [],
    courseRate: 0,
    fileLists: []
  }

  @action.bound
  getCourseDetail(id: number, title: string): any {
    return new Promise(async (resolve) => {
      Taro.showLoading({
        title: '加载中...'
      })
      const { data } = await Taro.request({
        url: `http://localhost:3000/courses/${id}`,
        method: 'GET',
      })
      this.courseDetail = data

      const fileLists = await Taro.request({
        url: `http://localhost:3000/resource/${id}`,
        method: 'GET'
      })
      this.courseDetail.fileLists = fileLists.data

      await Taro.navigateTo({
        url: `/pages/courseDetail/index`
      })
      Taro.setNavigationBarTitle({
        title
      })
      Taro.hideLoading()
      resolve()
    })
  }


}

export default courseStore