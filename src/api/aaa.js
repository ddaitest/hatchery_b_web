import request from '@/utils/request'
const REAL_BASE_URL = "http://106.12.147.150:8080/";

export function fetchNoticeList(query) {
  return request({
    url: '/vue-element-admin/notice/list',
    method: 'get',
    params: query
  })
}

export function fetchNotice(id) {
  return request({
    url: '/vue-element-admin/notice/detail',
    method: 'get',
    params: { id }
  })
}

export function createNotice(data) {
  return request({
    url: '/vue-element-admin/notice/create',
    method: 'post',
    data
  })
}

export function updateNotice(data) {
  return request({
    url: '/vue-element-admin/notice/update',
    method: 'post',
    data
  })
}

export function deleteNotice(data) {
  return request({
    url: '/vue-element-admin/wen/delete',
    method: 'post',
    data
  })
}

// 软文>>>>
export function fetchArticleList(query) {
  return request({
    url: '/post/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function createArticle(data) {
  return request({
    url: '/post/add',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function updateArticle(data) {
  return request({
    url: '/vue-element-admin/article/update',
    method: 'post',
    data
  })
}

export function deleteArticle(data) {
  return request({
    url: '/vue-element-admin/article/delete',
    method: 'post',
    data
  })
}

// Super Admin>>>>
export function fetchMerchantList(query) {
  return request({
    url: '/merchant/list',
    method: 'get',
    params: query,
    // baseURL: REAL_BASE_URL
  })
}

export function createMerchant(data) {
  return request({
    url: '/merchant/add',
    method: 'post',
    data,
    // baseURL: REAL_BASE_URL
  })
}

export function fetchManagerList(query) {
  return request({
    url: '/user/merchant/list',
    method: 'get',
    params: query,
    // baseURL: REAL_BASE_URL
  })
}

export function createMangaer(data) {
  return request({
    url: '/user/merchant/add',
    method: 'post',
    data,
    // baseURL: REAL_BASE_URL
  })
}