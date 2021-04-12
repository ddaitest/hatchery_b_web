import request from '@/utils/request'
const REAL_BASE_URL = "http://106.12.147.150:8080/";

// 联系人>>>>
export function fetchList(query) {
  return request({
    url: '/contacts/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function createObject(data) {
  return request({
    url: '/contacts/contacts/add',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function updateObject(data) {
  return request({
    url: '/contacts/update',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function deleteObject(id) {
  return request({
    url: `contacts/delete/${id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}