import { Injectable } from '@angular/core';
import { JwtHelper } from 'angular2-jwt';

import { ApiService } from './api.service';

interface HomebridgeUser {
  token: string;
  username?: string;
  name?: string;
  admin?: boolean;
}

@Injectable()
export class AuthService {
  private jwtHelper: JwtHelper = new JwtHelper();

  public formAuth = true;
  public enableAccessories = false;
  public theme: string;
  public user: HomebridgeUser;

  constructor(
    private $api: ApiService
  ) {
    this.loadToken();
    this.getAppSettings();
  }

  isLoggedIn() {
    return this.user && this.user.token && !this.jwtHelper.isTokenExpired(this.user.token);
  }

  login(username: string, password: string) {
    return this.$api.login(username, password).toPromise()
      .then((user: any) => {
        window.localStorage.setItem('token', user.token);
        return this.parseToken(user.token);
      });
  }

  logout() {
    this.user = null;
    window.localStorage.removeItem('token');
    window.location.reload();
  }

  refreshToken() {
    return this.$api.getToken().toPromise()
      .then((user: any) => {
        window.localStorage.setItem('token', user.token);
        return this.parseToken(user.token);
      });
  }

  parseToken(token: string) {
    let decoded;
    try {
       decoded = this.jwtHelper.decodeToken(token);
    } catch (e) {
       return window.localStorage.removeItem('token');
    }

    this.user = {
      token: token,
      username: decoded.username,
      name: decoded.name,
      admin: decoded.admin
    };
  }

  loadToken() {
    const token = window.localStorage.getItem('token');
    if (token) {
      this.parseToken(token);
    }
  }

  getAppSettings() {
    return this.$api.getAppSettings().toPromise()
      .then((data: any) => {
        this.formAuth = data.formAuth;
        this.enableAccessories = data.enableAccessories;
        this.setTheme(data.theme || 'red');
      });
  }

  setTheme(theme: string) {
    this.theme = theme;
    window.document.querySelector('body').classList.add(`config-ui-x-${this.theme}`);
  }
}
