// login-page.component.ts
import { Component } from '@angular/core';
import { NavbarloginComponent } from "../navbarlogin/navbarlogin.component";
import { LoginComponent } from "../login/login.component";

@Component({
  selector: 'app-login-page',
  template: `
    <app-navbarlogin></app-navbarlogin>
    <app-login></app-login>
  `,
  styles: [],
  imports: [NavbarloginComponent, LoginComponent]
})
export class LoginPageComponent {}
// This component serves as a container for the login page, including the navbar and the login form.
// It uses the `app-navbarlogin` and `app-login` components to structure the login page.