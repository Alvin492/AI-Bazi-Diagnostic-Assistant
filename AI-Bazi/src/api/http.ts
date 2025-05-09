// axios 实例
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import qs from "qs";
import { BASE_URL, TIME_OUT, RESPONSE_CODE, CONTENT_TYPE, HEADERS } from './config';

// 请求队列
const pendingRequests = new Map();

// 生成请求唯一标识
const generateRequestKey = (config: AxiosRequestConfig) => {
  const { method, url, params, data } = config;
  return [method, url, qs.stringify(params), qs.stringify(data)].join('&');
};

// 添加请求到队列
const addPendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = generateRequestKey(config);
  config.cancelToken =
    config.cancelToken ||
    new axios.CancelToken((cancel) => {
      if (!pendingRequests.has(requestKey)) {
        pendingRequests.set(requestKey, cancel);
      }
    });
};

// 移除请求
const removePendingRequest = (config: AxiosRequestConfig) => {
  const requestKey = generateRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const cancel = pendingRequests.get(requestKey);
    cancel(requestKey);
    pendingRequests.delete(requestKey);
  }
};

class Http {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: BASE_URL,
      timeout: TIME_OUT,
      headers: {
        'Content-Type': CONTENT_TYPE.JSON,
      },
    });

    this.initInterceptors();
  }

  // 初始化拦截器
  public initInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        this.handleRequestCancel(config);

        // 携带token
        const token = localStorage.getItem('token');
        if (token) {
          config.headers = {
            ...config.headers,
            [HEADERS.AUTHORIZATION]: `Bearer ${token}`,
          };
        }

        // 处理content-type
        if (
          config.headers?.['Content-Type'] === CONTENT_TYPE.FORM ||
          config.headers?.['content-type'] === CONTENT_TYPE.FORM
        ) {
          config.data = qs.stringify(config.data);
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        this.handleResponseCancel(response.config);
        return this.handleResponseData(response);
      },
      (error) => {
        this.handleResponseCancel(error.config);
        return this.handleErrorResponse(error);
      }
    );
  }

  // 处理请求取消
  private handleRequestCancel(config: AxiosRequestConfig) {
    // 取消重复请求
    removePendingRequest(config);
    addPendingRequest(config);
  }

  // 处理响应取消
  private handleResponseCancel(config?: AxiosRequestConfig) {
    if (config) {
      removePendingRequest(config);
    }
  }

  // 处理响应数据
  private handleResponseData(response: AxiosResponse) {
    const { data } = response;
    // 业务错误处理
    if (data.code !== RESPONSE_CODE.SUCCESS) {
      return Promise.reject(data);
    }
    return data;
  }

  // 处理错误响应
  private handleErrorResponse(error: any) {
    if (axios.isCancel(error)) {
      console.log('取消请求:', error.message);
      return Promise.reject(error);
    }

    const { response } = error;
    if (response) {
      const { status } = response;
      switch (status) {
        case RESPONSE_CODE.UNAUTHORIZED:
          // TODO: 跳转登录页面
          break;
        case RESPONSE_CODE.FORBIDDEN:
          // TODO: 提示权限不足
          break;
        case RESPONSE_CODE.NOT_FOUND:
          // TODO: 跳转404页面
          break;
        case RESPONSE_CODE.SERVER_ERROR:
        case RESPONSE_CODE.BAD_GATEWAY:
        case RESPONSE_CODE.SERVICE_UNAVAILABLE:
          // TODO: 跳转5xx错误页面
          break;
        default:
          break;
      }
    } else {
      // 网络错误处理
      if (!window.navigator.onLine) {
        // TODO: 网络错误提示
      }
    }
    return Promise.reject(error);
  }

  // GET 请求
  public get<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.get(url, { params, ...config });
  }

  // POST 请求
  public post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, config);
  }

  // PUT 请求
  public put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.put(url, data, config);
  }

  // DELETE 请求
  public delete<T>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.delete(url, { params, ...config });
  }

  // 上传文件
  public upload<T>(url: string, data: FormData, config?: AxiosRequestConfig): Promise<T> {
    return this.instance.post(url, data, {
      headers: {
        'Content-Type': CONTENT_TYPE.FORM_DATA,
      },
      ...config,
    });
  }
}

export const http = new Http();
