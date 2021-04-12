import request from '@/utils/request'

const REAL_BASE_URL = "http://106.12.147.150:8080/";

export function login(data) {
  console.log("login>>");
  console.log(data);
  const params = new URLSearchParams()
  params.append('username', data.username)
  params.append('password', data.password)
  params.append('client_id', data.client_id)

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }
  return request.post(
    'http://106.12.147.150:8080/user/auth/token',
    params,
    config,
  )
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
