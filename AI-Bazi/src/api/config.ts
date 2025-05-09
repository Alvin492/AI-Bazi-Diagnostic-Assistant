//  # 请求配置
/**
 * axios 配置
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const TIME_OUT = 10000;

// 请求状态码
export const RESPONSE_CODE = {
  SUCCESS: 200, // 成功
  UNAUTHORIZED: 401, // 未授权
  FORBIDDEN: 403, // 禁止访问
  NOT_FOUND: 404, // 资源不存在
  SERVER_ERROR: 500, // 服务器错误
  BAD_GATEWAY: 502, // 网关错误
  SERVICE_UNAVAILABLE: 503, // 服务不可用
};

// 请求content-type类型
export const CONTENT_TYPE = {
  JSON: 'application/json;charset=UTF-8',
  FORM: 'application/x-www-form-urlencoded;charset=UTF-8',
  FORM_DATA: 'multipart/form-data;charset=UTF-8',
};

// 请求头
export const HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
};
