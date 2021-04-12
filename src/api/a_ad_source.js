import request from '@/utils/request'
const REAL_BASE_URL = "http://106.12.147.150:8080/";

// 软文>>>>
export function fetchList(query) {
  return request({
    url: '/advs/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function fetchDetail(post_id) {
  return request({
    url: `advs/info/${post_id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}

export function createObject(data) {
  return request({
    url: '/advs/add',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function updateObject(data) {
  return request({
    url: '/advs/update',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function deleteObject(id) {
  return request({
    url: `advs/delete/${id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}