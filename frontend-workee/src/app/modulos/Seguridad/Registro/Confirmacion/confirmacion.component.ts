import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-confirmacion',
  templateUrl: './confirmacion.component.html',
  styleUrls: ['./confirmacion.component.css']
})
export class ConfirmacionComponent implements OnInit {
  estado: 'habilitado' | 'error' | 'verificando' = 'verificando';
  clickear: number = 0;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit() {
    
}

confirmarcuenta() {
  const token = this.route.snapshot.queryParamMap.get('token');
  console.log('Token recibido:', token); // Debug
  this.clickear ++;

  if (token) {
    this.authService.confirmarcuenta(token).subscribe({
      next: (res: any) => {
        console.log('Respuesta del backend:', res);
        if (res.estado === 'habilitado') {
          this.estado = 'habilitado';
        } else {
          this.estado = 'error';
        }
      },
      error: (err) => {
        console.error('Error al confirmar cuenta:', err);
        this.estado = 'error';
      }
    });
  } else {
    this.estado = 'error';
  }
}

}

// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { AuthService } from '../../auth.service';
// import { CommonModule } from '@angular/common';

// @Component({
//   selector: 'app-confirmacion',
//   standalone: true,
//   imports: [CommonModule],
//   templateUrl: './confirmacion.component.html',
//   styleUrls: ['./confirmacion.component.css']
// })
// export class ConfirmacionComponent implements OnInit {

//   estado: 'exito' | 'usado' | 'error' | 'verificando' = 'verificando';

//   constructor(
//     private route: ActivatedRoute,
//     private authService: AuthService
//   ) {}

  // ngOnInit() {
  //   const token = this.route.snapshot.queryParamMap.get('token');
  //   if (token) {
  //     this.authService.confirmarCuenta(token).subscribe({
  //       next: (res) => {
  //         if (res.estado === 'habilitado') {
  //           this.estado = 'exito';
  //         } else {
  //           this.estado = 'error';
  //         }
  //       },
  //       error: () => {
  //         this.estado = 'error';
  //       }
  //     });
  //   } else {
  //     this.estado = 'error';
  //   }
  // }
// }

