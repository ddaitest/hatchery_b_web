import request from '@/utils/request'

const REAL_BASE_URL = "http://106.12.147.150:8080/";

export function login(data) {
  console.log("login>>");
  console.log(data);
  return request({
    url: '/user/auth/token',
    method: 'post',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data,
    baseURL: REAL_BASE_URL
  })
}

export function login2(data) {
  return request({
    url: '/vue-element-admin/user/login',
    method: 'post',
    data,
  })
}

export function getInfo(token) {
  return request({
    url: '/vue-element-admin/user/info2',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/vue-element-admin/user/logout',
    method: 'post'
  })
}
