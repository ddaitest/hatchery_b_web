import request from '@/utils/request'
const REAL_BASE_URL = "http://106.12.147.150:8080/";

// 报修
export function fetchList(query) {
  return request({
    url: '/repairs/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function updateObject(status, id) {
  return request({
    url: `repairs/delete/${id}`,
    method: 'get',
    data: { "status": status },
    baseURL: REAL_BASE_URL
  })
}

export function deleteObject(id) {
  return request({
    url: `repairs/delete/${id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}