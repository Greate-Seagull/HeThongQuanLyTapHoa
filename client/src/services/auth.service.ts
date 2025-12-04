import { apiClient } from './api-client'
import {
  SignInRequest,
  SignUpRequest,
  CreateEmployeeAccountRequest,
  User,
  Employee,
} from '@/types'

// ======================
// AUTH SERVICE API CALLS
// ======================

/**
 * Customer Sign In
 * POST /accounts/sign-in
 * Body: { phoneNumber: string, password: string }
 * Response: { token: string }
 * 
 * ⚠️ KNOWN ISSUE: Backend only returns token, missing user data
 * TODO: Backend should return { token, user: { id, name, point } }
 */
export interface CustomerSignInRequest {
  phoneNumber: string
  password: string
}

export interface CustomerSignInResponse {
  token: string
  // TODO: Backend should add these fields
  user?: User
}

export const customerSignIn = async (
  data: CustomerSignInRequest
): Promise<CustomerSignInResponse> => {
  try {
    const response = await apiClient.post<CustomerSignInResponse>(
      '/accounts/sign-in',
      data
    )
    
    // Store token in apiClient
    if (response.token) {
      apiClient.setToken(response.token)
    }
    
    return response
  } catch (error: any) {
    console.error('Customer sign-in error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Đăng nhập thất bại. Vui lòng kiểm tra số điện thoại và mật khẩu.'
    )
  }
}

/**
 * Customer Sign Up
 * POST /accounts
 * Body: { name: string, phoneNumber: string, password: string }
 * Response: { token: string }
 * 
 * ⚠️ KNOWN ISSUE: Backend only returns token, missing user data
 * TODO: Backend should return { token, user: { id, name, point } }
 */
export const customerSignUp = async (
  data: SignUpRequest
): Promise<CustomerSignInResponse> => {
  try {
    const response = await apiClient.post<CustomerSignInResponse>(
      '/accounts',
      data
    )
    
    // Store token in apiClient
    if (response.token) {
      apiClient.setToken(response.token)
    }
    
    return response
  } catch (error: any) {
    console.error('Customer sign-up error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Đăng ký thất bại. Vui lòng thử lại.'
    )
  }
}

/**
 * Employee Sign In
 * POST /employee-accounts/sign-in
 * Body: { username: string, password: string }
 * Response: { token: string }
 * 
 * ⚠️ CRITICAL ISSUE: Backend only returns token, MISSING EMPLOYEE DATA
 * Frontend needs: { token, employee: { id, name, position } }
 * Cannot determine staff position (SALES/INVENTORY/RECEIVING) without this data
 */
export interface EmployeeSignInRequest {
  username: string
  password: string
}

export interface EmployeeSignInResponse {
  token: string
  // TODO: Backend MUST add these fields
  employee?: Employee
}

export const employeeSignIn = async (
  data: EmployeeSignInRequest
): Promise<EmployeeSignInResponse> => {
  try {
    const response = await apiClient.post<EmployeeSignInResponse>(
      '/employee-accounts/sign-in',
      data
    )
    
    // Store token in apiClient
    if (response.token) {
      apiClient.setToken(response.token)
    }
    
    return response
  } catch (error: any) {
    console.error('Employee sign-in error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Đăng nhập thất bại. Vui lòng kiểm tra tên đăng nhập và mật khẩu.'
    )
  }
}

/**
 * Employee Sign Up / Create Account
 * POST /employee-accounts
 * Body: { employeeId: number, username: string, password: string }
 * Response: { token: string }
 * 
 * ⚠️ CRITICAL ISSUE: Backend expects employeeId (employee must exist first)
 * Current frontend flow tries to create employee + account in one step
 * 
 * WORKAROUND OPTIONS:
 * 1. Two-step process: Create Employee entity first, then create account
 * 2. Ask backend to add combined endpoint: POST /employee-accounts/register
 *    Body: { name, position, username, password }
 *    Creates both Employee and EmployeeAccount in transaction
 */
export const employeeSignUp = async (
  data: CreateEmployeeAccountRequest
): Promise<EmployeeSignInResponse> => {
  try {
    const response = await apiClient.post<EmployeeSignInResponse>(
      '/employee-accounts',
      data
    )
    
    // Store token in apiClient
    if (response.token) {
      apiClient.setToken(response.token)
    }
    
    return response
  } catch (error: any) {
    console.error('Employee sign-up error:', error)
    throw new Error(
      error.response?.data?.message || 
      'Đăng ký thất bại. Vui lòng thử lại.'
    )
  }
}

/**
 * Owner Sign In
 * ⚠️ CRITICAL ISSUE: NO ENDPOINT EXISTS FOR OWNER AUTHENTICATION
 * 
 * Possible solutions:
 * 1. Create dedicated Owner endpoint: POST /owner/sign-in
 * 2. Use employee endpoint with special ADMIN/OWNER position
 * 3. Add 'role' field to employee-accounts table to distinguish
 */
export interface OwnerSignInRequest {
  username: string
  password: string
}

export const ownerSignIn = async (
  data: OwnerSignInRequest
): Promise<EmployeeSignInResponse> => {
  // TODO: Implement when backend adds owner endpoint
  throw new Error(
    'Owner authentication not yet implemented. Backend needs to add owner sign-in endpoint.'
  )
}

/**
 * Get Current User Profile
 * This would need a new backend endpoint: GET /accounts/me
 * To fetch full user data after token-only login
 * 
 * ⚠️ MISSING ENDPOINT: Backend should add this
 */
export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await apiClient.get<User>('/accounts/me')
    return response
  } catch (error: any) {
    console.error('Get current user error:', error)
    throw new Error('Không thể lấy thông tin người dùng.')
  }
}

/**
 * Get Current Employee Profile
 * This would need a new backend endpoint: GET /employee-accounts/me
 * To fetch full employee data after token-only login
 * 
 * ⚠️ MISSING ENDPOINT: Backend should add this
 */
export const getCurrentEmployee = async (): Promise<Employee> => {
  try {
    const response = await apiClient.get<Employee>('/employee-accounts/me')
    return response
  } catch (error: any) {
    console.error('Get current employee error:', error)
    throw new Error('Không thể lấy thông tin nhân viên.')
  }
}

/**
 * Logout
 * Clear token and redirect to login
 */
export const logout = (): void => {
  apiClient.setToken('')
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('auth-storage')
  }
}
