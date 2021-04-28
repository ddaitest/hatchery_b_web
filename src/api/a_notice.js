import request from '@/utils/request'
import {Kerrigan,REAL_BASE_URL} from './setting'

export function fetchList(query) {
  return request({
    url: '/notice/biz/list',
    method: 'get',
    params: query,
    baseURL: REAL_BASE_URL
  })
}

export function fetchDetail(post_id) {
  return request({
    url: `notice/info/${post_id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}

export function createObject(data) {
  return request({
    url: '/notice/add',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function updateObject(data) {
  return request({
    url: '/notice/update',
    method: 'post',
    data,
    baseURL: REAL_BASE_URL
  })
}

export function deleteObject(id) {
  return request({
    url: `notice/delete/${id}`,
    method: 'get',
    baseURL: REAL_BASE_URL
  })
}

export function sendPush(id) {
  return request({
    url: 'push/publish/notice',
    method: 'get',
    params: { 'notice_id': id },
    baseURL: REAL_BASE_URL
  })
}
