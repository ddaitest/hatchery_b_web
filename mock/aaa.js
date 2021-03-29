const Mock = require('mockjs')

const Notices = []
const Articles = []
const Merchants = []
const Managers = []
const count = 100

const baseContent = '<p>I am testing data, I am testing data.</p><p><img src="https://wpimg.wallstcn.com/4c69009c-0fd4-4153-b112-6cb53d1cf943"></p>'
const image_uri = 'https://wpimg.wallstcn.com/e4558086-631c-425c-9430-56ffb46e70b3'

for (let i = 0; i < count; i++) {
  Notices.push(Mock.mock({
    id: '@increment',
    title: '@title(5, 10)',
    'status|1': ['published', 'draft'],
    create_on: +Mock.Random.date('T'),
    update_on: +Mock.Random.date('T'),
    content_type: '@integer(1, 2)',
    content: '',
    content_url: image_uri,
    importance: '@integer(0, 1)',
  }));
  Articles.push(Mock.mock({
    id: '@increment',
    title: '@title(5, 10)',
    'status|1': ['published', 'draft'],
    create_on: +Mock.Random.date('T'),
    update_on: +Mock.Random.date('T'),
    content_type: '@integer(1, 2)',
    content: '',
    content_url: image_uri,
    importance: '@integer(0, 1)',
    avatar: image_uri,
    'service_id|1': ['tab1', 'tab2', 'tab3', 'tab4'],
  }));
  Merchants.push(Mock.mock({
    avatar: image_uri,
    id: '@increment',
    company_name: '@title(5, 10)',
    biz_certif_no: '@title(5, 10)',
    registered_addr: '@title(5, 10)',
    biz_addr: '@title(5, 10)',
    biz_contact_name: '@title(5, 10)',
    biz_contact_number: '@title(5, 10)',
  }));
  Managers.push(Mock.mock({
    id: '@increment',
    email: '@title(5, 10)',
    addr: '@title(5, 10)',
    mobile: '@title(5, 10)',
    nick: '@title(5, 10)',
    username: '@title(5, 10)',
    password: '@title(5, 10)',
    avatar: image_uri,
    client_id: '@title(5, 10)',
  }));
}


module.exports = [
  {
    url: '/vue-element-admin/notice/list',
    type: 'get',
    response: config => {
      const { importance, type, title, page = 1, limit = 20, sort } = config.query

      let mockList = Notices.filter(item => {
        if (item.content_type === 1) {
          item.content = '';
        }
        if (importance && item.importance !== +importance) return false
        if (type && item.type !== type) return false
        if (title && item.title.indexOf(title) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-element-admin/notice/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of Notices) {
        if (article.id === +id) {
          article.content = baseContent;
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },

  //软文>>>
  {
    url: '/vue-element-admin/article/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20 } = config.query

      let mockList = Articles.filter(item => {
        if (item.content_type === 1) {
          item.content = '';
        }
        return true
      })

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/vue-element-admin/article/detail',
    type: 'get',
    response: config => {
      const { id } = config.query
      for (const article of Articles) {
        if (article.id === +id) {
          article.content = baseContent;
          return {
            code: 20000,
            data: article
          }
        }
      }
    }
  },
  {
    url: '/vue-element-admin/wen/create',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/vue-element-admin/wen/update',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  //Super Admin >>>
  {
    url: '/merchant/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20 } = config.query

      let mockList = Merchants

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/user/merchant/list',
    type: 'get',
    response: config => {
      const { page = 1, limit = 20 } = config.query

      let mockList = Managers

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          items: pageList
        }
      }
    }
  },

  {
    url: '/merchant/add',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },

  {
    url: '/user/merchant/add',
    type: 'post',
    response: _ => {
      return {
        code: 20000,
        data: 'success'
      }
    }
  },
]

