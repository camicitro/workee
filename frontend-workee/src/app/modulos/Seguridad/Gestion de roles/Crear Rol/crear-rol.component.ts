import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { RolService } from '../../usuarios/rol.service';
import { RecargarService } from '../../../../admin/recargar.service';
import { Rol } from '../../rol';
import { permiso } from '../permiso';
import { permisoRol } from '../rol-permiso';
import { PermisoService } from '../permiso.service';
import Swal from 'sweetalert2';
import { CategoriaService } from '../categoria.service';
import { Categoria } from '../../categoria';
import { Console } from 'console';

@Component({
  selector: 'app-crear-rol',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './crear-rol.component.html',
  styleUrl: './crear-rol.component.css'
})
export class CrearRolComponent {
  RolForm: FormGroup;
  modalRef?: NgbModalRef;
  submitForm: boolean = false;
  todosPermisos: permiso[] = [];
  permisosFinales:any;
  permisos: permisoRol[] = [];
  rol:any = {};
  categorias: Categoria [] = [];
  categoriaSeleccionada?: Categoria;

  permisoDeCategoria: permiso[]=[];
  permisosDisponibles: permiso[] = [];             // permisos según la categoría seleccionada
  permisosSeleccionadosID: number[] = [];          // ids elegidos por el usuario



  constructor(
    private modalService: ModalService,
    private RolService: RolService,
    private recargarService: RecargarService,
    private permisoService: PermisoService,
    private categoriaService: CategoriaService
  ){
    this.RolForm = new FormGroup({
      nombreRol: new FormControl('', [Validators.required]),
      categoriaRol:new FormControl('',[Validators.required]),
      permisosRol:new FormControl('',[Validators.required]),
    });
  }

  ngOnInit(){

    this.categoriaService.findAll().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (error) => {
        console.error('Error al obtener categorias', error);
      }
    })
  }

  dismissModalCreacionConfirmada() {
    this.modalService.dismissActiveModal();
  }

  dismissModal() {
  Swal.fire({
    title: '¿Está seguro de que desea volver?',
    text: 'Los cambios realizados no se guardarán.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Sí, volver',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#31A5DD',
    cancelButtonColor: '#697077'
  }).then(result => {
    if (result.isConfirmed) {
      this.modalService.dismissActiveModal();
    }
  });
}

  isCampoInvalido(): boolean {
    const control = this.RolForm.get('nombreRol');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  isCategoriaInvalida(): boolean {
    const control = this.RolForm.get('categoriaRol');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  isPermisosInvalidos(): boolean {
    const control = this.RolForm.get('permisosRol');
    return !!(control?.hasError('required') && (control?.touched || this.submitForm));
  }

  enviarDatos(){
    console.log('Datos del formulario:', this.RolForm.value);
    if (this.RolForm.invalid) {
      this.RolForm.markAllAsTouched();
      console.log(`entro al if`)
      return;
    }
    const nombrerol = this.RolForm.get('nombreRol')?.value.trim();
    const categoriarol = this.RolForm.get('categoriaRol')?.value;
    const categoriaId = this.RolForm.get('categoriaRol')?.value; // ya es el id
    //const categoriarol = 2;

    console.log('Nombre rol:', nombrerol);
    console.log('Categoría rol:', categoriarol);
    console.log('Permisos seleccionados:', this.permisosSeleccionadosID);

    if (!this.permisosSeleccionadosID.length) {
    this.RolForm.get('permisosRol')?.setErrors({ required: true });
    Swal.fire({ toast: true, icon: 'warning', title: 'Seleccione al menos un permiso', position: 'top-end', timer: 3000, showConfirmButton: false });
    return;
    }

    Swal.fire({
      title: '¿Confirmar creación del rol?',
      text: 'Se guardará el nuevo rol con los permisos seleccionados.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, crear',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#70DC73',
      cancelButtonColor: '#697077'
  }).then((result) => {
      if (result.isConfirmed) {
        this.RolService.crearrol(
          nombrerol,
          categoriarol,
          this.permisosSeleccionadosID
        ).subscribe({
              next: () => {
                console.log(nombrerol,categoriarol,this.permisosSeleccionadosID)
                this.recargarService.emitirRecarga();
                this.submitForm = true;
                this.dismissModalCreacionConfirmada(); 
                
                Swal.fire({
                  toast: true,
                  position: "top-end",
                  icon: "success",
                  title: "El Rol se creó correctamente",
                  timer: 3000,
                  showConfirmButton: false,
                })
              },
              error: (error) => {
                if (error.error.message === 'Ya existe un rol con el nombre ingresado') {
                  Swal.fire({
                    toast: true,
                    icon: 'warning',
                    title: 'Ya existe un rol con ese nombre',
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                  });
                } else {
                  Swal.fire({
                    toast: true,
                    icon: 'error',
                    title: 'No pudo crearse el rol',
                    position: 'top-end',
                    timer: 3000,
                    showConfirmButton: false
                  });
                }
                },
              });
      }
  });

  }

  buscarpermisosSegunCategoria() {
    const categoriaId = this.RolForm.get('categoriaRol')?.value; // ya es un number
    console.log("ID de categoría seleccionado:", categoriaId);

    this.permisoService.permisosdeunaCategoria(categoriaId).subscribe({
      next: (permisos) => {
        this.todosPermisos = permisos;
        console.log("Permisos obtenidos:", permisos);
      },
      error: (err) => console.error('Error al obtener permisos', err)
    });

    this.permisos = [];
  }

  mandarPermisosSeleccionados(){
    this.permisosSeleccionadosID = []
  }

  compararCategoria = (r1: Categoria, r2: Categoria) => r1 && r2 ? r1.id === r2.id : r1 === r2;
  compararPermiso = (r1: permiso, r2: permiso) => r1 && r2 ? r1.id === r2.id : r1 === r2;

  onPermisoChange(event: any, idPermiso: number) {
    if (!idPermiso) return;
    if (event.target.checked) {
      this.permisosSeleccionadosID.push(idPermiso); 
      this.RolForm.get('permisosRol')?.setValue(this.permisosSeleccionadosID);
    } else { 
      this.permisosSeleccionadosID = this.permisosSeleccionadosID.filter(id => id !== idPermiso); 
    }
    console.log(this.permisosSeleccionadosID)
  }
}