import { Page } from '@playwright/test'

export interface LoginCredentials {
  username: string
  password: string
}

export class AuthHelper {
  
  static readonly ADMIN_CREDENTIALS: LoginCredentials = {
    username: 'admin',     
    password: 'petcare123'  
  }

  static async login(page: Page, credentials: LoginCredentials = this.ADMIN_CREDENTIALS): Promise<void> {
    await page.goto('/login.html')
    
    await page.fill('[data-testid="input-usuario"]', credentials.username)
    await page.fill('[data-testid="input-senha"]', credentials.password)
    
    await Promise.all([
      page.waitForURL('**/index.html'),
      page.click('[data-testid="btn-entrar"]')
    ])
  }

  static async logout(page: Page): Promise<void> {
    await page.click('[data-testid="btn-logout"]')
  }
}