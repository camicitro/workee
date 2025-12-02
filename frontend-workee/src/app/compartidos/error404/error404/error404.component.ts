import { Component, OnInit } from '@angular/core';
import { SesionService } from '../../../interceptors/sesion.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error404',
  imports: [],
  templateUrl: './error404.component.html',
  styleUrl: './error404.component.css'
})
export class Error404Component implements OnInit {

  isLoggedIn = false;

  constructor(private sesionService: SesionService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn = this.sesionService.isLoggedIn();
  }

  volver(): void {
    if (this.isLoggedIn) {
      this.sesionService.redirectBasedOnCategory();
    } else {
      this.router.navigate(['/login']);
    }
  }
}