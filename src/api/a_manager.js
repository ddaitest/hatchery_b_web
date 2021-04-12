import request from '@/utils/request'
const REAL_BASE_URL = "http://106.12.147.150:8080/";


// Super Admin>>>>
export function fetchList(query) {
  return request({
    url: '/user/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function createObject(data) {
  return request({
    url: '/user/merchant/add',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}