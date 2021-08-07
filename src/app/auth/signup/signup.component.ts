import { Component, OnDestroy, OnInit } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Subscription } from "rxjs";
import { AuthService } from "../auth.service";

@Component({
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})

export class SignUpComponent implements OnInit, OnDestroy {
  isLoading = false;
  private authStatusSub: Subscription = new Subscription

  constructor(public authService: AuthService){
  }

  ngOnInit(): void {
    this.authStatusSub = this.authService.getAuthStatusListener()
        .subscribe(authStatus => {
          this.isLoading = false;
        });
  }

  ngOnDestroy(): void {
    this.authStatusSub.unsubscribe();
  }

  onSignUp(signUpForm: NgForm){

    if(signUpForm.invalid)
      return;

    this.isLoading = true;
    this.authService
      .createUser(signUpForm.value.email, signUpForm.value.password)
  }

}
