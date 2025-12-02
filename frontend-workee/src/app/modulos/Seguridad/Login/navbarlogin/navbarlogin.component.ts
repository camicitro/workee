import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbarlogin',
  standalone: true,
  imports: [],
  templateUrl: './navbarlogin.component.html',
  styleUrls: ['./navbarlogin.component.css'] 
})
export class NavbarloginComponent {

  constructor(
    private router: Router
  ){
    
  }

  iralogin() {
    this.router.navigate(['login'])
  }


}
