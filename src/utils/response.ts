export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export function successResponse<T>(message: string, data?: T): ApiResponse<T> {
  return {
    success: true,
    message,
    data: data !== undefined ? data : (null as any),
  };
}

export function errorResponse(message: string, errors: any = null): ApiResponse {
  return {
    success: false,
    message,
    errors,
  };
}
