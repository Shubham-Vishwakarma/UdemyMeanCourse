import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { AuthData } from "./auth-data.model";
import { environment } from "../../environments/environment";

const BACKEND_URL = environment.url + '/user/'

@Injectable({ providedIn: 'root' })
export class AuthService{

  private token: string = '';
  private authStatusListener = new Subject<boolean>()
  isAuthenticated = false
  private tokenTimer: any;
  private userId: string = '';

  constructor(private http: HttpClient, private router: Router){
  }

  getToken(): string {
    return this.token;
  }

  getUserId(): string {
    return this.userId;
  }

  getAuthStatusListener(){
    return this.authStatusListener.asObservable();
  }

  getAuthStatus(){
    return this.isAuthenticated;
  }

  createUser(email: string, password: string){

    const authData: AuthData = {
      email: email,
      password: password
    }

    this.http
      .post<{ message: string, authData: AuthData }>
      ( BACKEND_URL + 'signup', authData)
      .subscribe(result => {
        console.log(result.message)
        this.router.navigate(["/"])
      }, error => {
        console.log(error)
        this.authStatusListener.next(false)
      })

  }

  login(email: string, password: string){

    const authData: AuthData = {
      email: email,
      password: password
    }

    this.http.post<{ token: string, expiresIn: number, userId: string }>(
      BACKEND_URL + 'login', authData)
      .subscribe(result => {
        const token = result.token;
        this.token = token;
        if(token) {
          const expiresInDuration = result.expiresIn
          this.setAuthTimer(expiresInDuration)
          this.isAuthenticated = true;
          this.userId = result.userId
          this.authStatusListener.next(true);
          const now = new Date()
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000)
          console.log(expirationDate)
          this.saveAuthData(token, expirationDate, result.userId)
          this.router.navigate(['/'])
        }
      }, error => {
        console.log(error)
        this.authStatusListener.next(false)
      })

  }

  autoAuthUser(){
    const authInformation = this.getAuthData()
    if(authInformation){
      const now = new Date()
      const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

      if(expiresIn > 0){
        this.token = authInformation.token
        this.isAuthenticated = true
        this.userId = authInformation.userId
        this.setAuthTimer(expiresIn / 1000)
        this.authStatusListener.next(true)
      }
    }

  }

  private setAuthTimer(duration: number){

    console.log(`Setting Timer = ${duration}`)

    this.tokenTimer = setTimeout(() => {
      this.logout()
    }, duration * 1000)

  }


  logout() {
    this.token = '';
    this.isAuthenticated = false;
    this.userId = ''
    this.authStatusListener.next(false)
    clearTimeout(this.tokenTimer)
    this.clearAuthData()
    this.router.navigate(['/'])
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string){
    localStorage.setItem('token', token);
    localStorage.setItem('expirationDate', expirationDate.toISOString())
    localStorage.setItem('userId', userId)
  }

  private clearAuthData(){
    localStorage.removeItem('token')
    localStorage.removeItem('expirationDate')
    localStorage.removeItem('userId')
  }

  private getAuthData() {
    const token = localStorage.getItem('token')
    const expirationDate = localStorage.getItem('expirationDate')
    const userId = localStorage.getItem('userId')

    if(!token || !expirationDate || !userId){
      return
    }

    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }

}
