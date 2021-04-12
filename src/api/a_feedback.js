import request from '@/utils/request'
const REAL_BASE_URL = "http://106.12.147.150:8080/";

// 反馈
export function fetchList(query) {
  return request({
    url: '/feedback/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function updateObject(status, id) {
  return request({
    url: `feedback/delete/${id}`,
    method: 'get',
    data: { "status": status },
    baseURL: REAL_BASE_URL
  })
}

export function deleteObject(id) {
  return request({
    url: `feedback/delete/${id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}