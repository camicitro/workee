import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";
import { Router, RouterModule } from '@angular/router';
import { TipoContrato } from '../../../../admin/ABMTipoContrato/tipo-contrato';
import { TipoContratoService } from '../../../../admin/ABMTipoContrato/tipo-contrato.service';
import Swal from 'sweetalert2';
import { Modalidad } from '../../../../admin/ABMModalidad/modalidad';
import { ModalidadService } from '../../../../admin/ABMModalidad/modalidad.service';
import { Habilidad } from '../../../../admin/ABMHabilidad/habilidad';
import { OfertaHabilidad } from '../../../oferta/oferta-habilidad';
import { HabilidadService } from '../../../../admin/ABMHabilidad/habilidad.service';
import { OfertaService } from '../../../oferta/oferta.service';
import { NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { ModalService } from '../../../../compartidos/modal/modal.service';
import { SeleccionHabilidadesComponent } from '../../../candidato/perfil-candidato/seleccion-habilidades/seleccion-habilidades.component';
import { EtapaService } from '../../../../admin/ABMEtapa/etapa.service';
import { Etapa } from '../../../../admin/ABMEtapa/etapa';
import { SesionService } from '../../../../interceptors/sesion.service';
import { Empleado } from '../../../empresa/empleados/empleado';
import { EmpresaService } from '../../../empresa/empresa/empresa.service';
import { ofertaEtapaDTO } from '../ofertaEtapaDTO';
import { Storage, ref, uploadBytes, getDownloadURL, StorageReference } from '@angular/fire/storage';
import { EmpleadoModalComponent } from '../modal empleados/empleado-modal.component';
import { EmpleadoService } from '../../../empresa/empleados/empleado.service';
import { UsuarioService } from '../../../seguridad/usuarios/usuario.service';

 function noWhitespaceValidator(ctrl: AbstractControl): ValidationErrors | null {
    const v = (ctrl.value ?? '').toString();
    return v.trim().length > 0 ? null : { whitespace: true };
  }
  function lengthBetweenTrim(min: number, max: number): ValidatorFn {
  return (ctrl: AbstractControl): ValidationErrors | null => {
    const v = (ctrl.value ?? '').toString().trim();
    if (!v.length) return null; // required/whitespace se encargan del vacío
    if (v.length < min) return { minlengthTrim: { requiredLength: min, actualLength: v.length } };
    if (v.length > max) return { maxlengthTrim: { requiredLength: max, actualLength: v.length } };
    return null;
  };
}

@Component({
  selector: 'app-crear-oferta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './crear-oferta.component.html',
  styleUrl: './crear-oferta.component.css'
})
export class CrearOfertaComponent implements OnInit {

  faltasEmpleado: number[] = [];
  
  submitted = false;
  crearofertaForm: FormGroup;
  submitForm: boolean = false;
  tipocontratos: TipoContrato[] = [];
  modalidades: Modalidad [] = [];
  modalRef?: NgbModalRef;

  empleadosPorId: Record<number, string> = {};
  private archivosPorEtapa: Record<number, File> = {};
  previewPorEtapa: Record<number, string> = {};
  nombresArchivoPorEtapa: Record<number, string> = {};
  erroresArchivo: Record<number, { formato?: boolean; tamanioInvalido?: boolean }> = {};
  erroresEtapas: Array<{ sinEmpleado?: boolean }> = [];
  

  todasHabilidades: Habilidad[] = [];
  habilidadesSeleccionadasID: number[] = []; // array de ids de las habildiades que le quedaron 
  habilidadesFinales: any; // array de habilidades que le quedaron
  habilidades: OfertaHabilidad[] = [];

  etapasDisponibles: Etapa[] = [];
  etapasSeleccionadas: ofertaEtapaDTO[] = [];

    //PARA Archivo Etapa
    urlArchivoEtapa = '';
    fileArchivoEtapa: any = null;
    docRef!: StorageReference;
    ArchivoEtapaTemporal: any = null;
    today: Date = new Date();
    
  empleado?: Empleado;

  idEmpresaObtenida!: number;
  constructor(
    private router: Router,
    private tipocontratoService: TipoContratoService,
    private modalidadService: ModalidadService,
    private habilidadService: HabilidadService,
    private ofertaService: OfertaService,
    private modalService: ModalService,
    private etapaService: EtapaService,
    private empresaService: EmpresaService,
    private changeDetectorRef: ChangeDetectorRef,
    private storage: Storage,
    private empleadoService: EmpleadoService,
    private sesionService: SesionService,
    private usuarioService: UsuarioService,

  ){
  this.crearofertaForm = new FormGroup({
    titulo: new FormControl<string>('', { 
      nonNullable: true, 
      validators: [Validators.required, noWhitespaceValidator, lengthBetweenTrim(2, 100)] 
    }),
    tipocontrato: new FormControl<any | null>(null, { validators: [Validators.required] }),
    modalidad: new FormControl<any | null>(null, { validators: [Validators.required] }),
    descripcionOferta: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, noWhitespaceValidator, lengthBetweenTrim(5, 350)]
    }),
    responsabilidadesOferta: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required, noWhitespaceValidator, lengthBetweenTrim(5, 350)]
    }),
    habilidadesOferta: new FormControl(''),
  });
  }

  ngOnInit(){
    this.tipocontratoService.findAllActivos().subscribe({
      next: (data) => {
        this.tipocontratos = data;
    },
      error: (error) => {
        console.error('Error al obtener los tipos de contrato', error);
      }
    })

    this.modalidadService.findAllActivas().subscribe({
      next: (data) => {
        this.modalidades = data;
    },
      error: (error) => {
        console.error('Error al obtener las modalidades', error);
      }
    })

    this.habilidadService.findAllActivas().subscribe(habilidades => {
        this.todasHabilidades = habilidades;
    });

    this.habilidades = [];

    this.sesionService.rolUsuario$.subscribe(rol => {
      // console.log("hola ", rol)
      if (!rol) {
        console.error("No se pudo obtener el rol del usuario");
        return;
      }
      if (rol.codigoRol === 'ADMIN_EMPRESA') {
        this.empresaService.getidEmpresabyCorreo()?.subscribe({
          next: (idEmpresa) => {
            this.idEmpresaObtenida = idEmpresa;
            // console.log("el id que consegui es ", this.idEmpresaObtenida)
            this.cargarEtapas(this.idEmpresaObtenida)
          },
          error: (err) => {
            console.error('Error al obtener id de empresa por correo', err);
            // this.isLoading = false;
          }
        });

      } else if (rol.codigoRol === 'EMPLEADO_EMPRESA') {
        this.usuarioService.getUsuario().subscribe({
          next: (usuario) => {
            this.empleado = usuario;
            const idEmpresa = this.empleado.empresa?.id;
            if (idEmpresa) {
              this.idEmpresaObtenida = idEmpresa;
              // console.log("el id que consegui es ", this.idEmpresaObtenida)
              this.cargarEtapas(this.idEmpresaObtenida);
            } else {
              console.error('No se pudo obtener el Id de la empresa a la que pertenece el empleado');
              // this.isLoading = false;
            }
          },
          error: (err) => {
            console.error("Error al obtener el usuario logueado", err);
            // this.isLoading = false;
          }
        });
      } else {
        console.warn('Rol no contemplado en VisualizarOfertasPropias:', rol.nombreRol);
        // this.isLoading = false;
      }
    })

    
    // if (this.empresaService) {
    //   console.log('entra a empresa service')
    //   this.empresaService.getidEmpresabyCorreo()?.subscribe({
    //       next: (idEmpresa) => {
    //         if (idEmpresa !== undefined && idEmpresa !== null) {
    //           this.idEmpresaObtenida = idEmpresa;
    //           console.log('id empresa obtenido: ', idEmpresa);
              
    //         } else {
    //           console.error('El id de empresa obtenido es undefined o null');
    //         }
    //       },
    //       error: (err) => {
    //         console.error('Error al obtener id de empresa por correo', err);
    //       }
    //   });
    // }
  }

  cargarEtapas(idEmpresa: number) {
    this.etapaService.obtenerEtapasDisponiblesParaEmpresa(idEmpresa).subscribe({
      next: (etapas) => {
        const etapasNoUsables = ['PENDIENTE', 'RECHAZADO', 'SELECCIONADO', 'ABANDONADO', 'NO_ACEPTADO'];
        this.etapasDisponibles = etapas.filter(etapa => {
          return etapa.codigoEtapa && !etapasNoUsables.includes(etapa.codigoEtapa);
        })
        //this.etapasDisponibles = etapas;
        console.log('etapas disponibles: ', this.etapasDisponibles)

      },
      error: (err) => {
        console.error('Error al obtener etapas disponibles', err);
      }
    });
  }

  isCampoInvalido(nombre: string): boolean {
    const c = this.crearofertaForm.get(nombre);
    return !!c && c.invalid && (c.touched || this.submitted);
  }

  marcarTodoTocado() {
    Object.values(this.crearofertaForm.controls).forEach(c => c.markAsTouched());
  }

  getMensajeError(nombre: string): string {
    const c = this.crearofertaForm.get(nombre);
    if (!c || !c.errors) return '';
    if (c.errors['required'] || c.errors['whitespace']) return 'Este campo es obligatorio.';
    
    if (c.errors['minlengthTrim'] || c.errors['maxlengthTrim']) {
      if (nombre === 'titulo') {
        return 'Debe tener entre 2 y 100 caracteres.';
      } else {
      return 'Debe tener entre 5 y 350 caracteres.';
    }}
    return 'Campo inválido.';
  }


async enviarDatos() {
  // Se marca el envío como verdadero
  this.submitForm = true;

  // Se valida que todos los campos del formulario estén completos y se muestra un mensaje con el error
  if (this.crearofertaForm.invalid) {
    Swal.fire({ icon: 'warning', title: 'Formulario incompleto', 
      text: 'Por favor, complete todos los campos obligatorios.' });
    return;
  }

  // Se revisan las etapas seleccionadas en la oferta y se muestra un mensaje con el error
  const etapasOk = this.validarEtapas();
  if (this.crearofertaForm.invalid || !etapasOk) {
    Swal.fire({ icon: 'warning', title: 'Sin responsable en etapa', 
      text: 'Las etapas seleccionadas tienen que tener al menos un empleado asignado.' });    
    return;
  }

    // Se revisa si todas las etapas tienen un empleado asignado y se muestra un mensaje con el error
  if (!etapasOk) {
    const detalle = this.faltasEmpleado.length
      ? `Falta asignar un empleado responsable en las etapas: <b>${this.faltasEmpleado.join(', ')}</b>.`
      : 'Revisa los datos de las etapas.';

    Swal.fire({ icon: 'warning', title: 'Asigná responsables', html: detalle
    });
    return;
  }
  
  // Se guardan en variables los datos ingresados en el formulario
  const titulo = (this.crearofertaForm.get('titulo')?.value ?? '').trim();
  const descripcion = (this.crearofertaForm.get('descripcionOferta')?.value ?? '').trim();
  const responsabilidades = (this.crearofertaForm.get('responsabilidadesOferta')?.value ?? '').trim();
  const modalidadSeleccionada = this.crearofertaForm.get('modalidad')?.value.id;
  const tipocontratoSeleccionado = this.crearofertaForm.get('tipocontrato')?.value.id;

  try {
    // Se espera a que se suban los archivos de las etapas (si los hay)
    await this.subirAdjuntosAntesDePost(titulo);

    // Llamado a servicio para crear la oferta con todos los datos
    this.ofertaService.crearOferta(
      titulo,
      descripcion,
      responsabilidades,
      modalidadSeleccionada,
      tipocontratoSeleccionado,
      this.habilidadesSeleccionadasID,
      this.idEmpresaObtenida,
      this.etapasSeleccionadas
    )
    .subscribe({
      next: () => {
        // Si no se recibe error desde el backend, se muestra un mensaje de éxito
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'La oferta se ha creado exitosamente',
          timer: 3000,
          showConfirmButton: false,
        });

        // Se navega a la pantalla  de visualizar ofertas
        this.router.navigate(['/visualizar-oferta']);

        // Se limpia el formulario
        this.archivosPorEtapa = {};
        this.previewPorEtapa = {};
        this.nombresArchivoPorEtapa = {};
      },
      error: (err) => {
        const backendMsg =
          err?.error?.message ||      // típico Spring/REST
          err?.error ||               // a veces el backend manda string plano
          err?.message ||             // HttpErrorResponse.message
          'Revisá los datos e intentá nuevamente.';

        Swal.fire({
          icon: 'error',
          title: 'Error al crear la oferta',
          text: backendMsg
        });
      }
    });
  } catch (e) {
    // Si hay error en la subida de archivos, se muestra un mensaje con el error
    Swal.fire({ icon: 'error', 
      title: 'Error al subir documentos', 
      text: 'Revisá los archivos (PDF, <=5MB) e intentá nuevamente.' });
  }
}


private async subirAdjuntosAntesDePost(titulo: string): Promise<void> {
  // En esta variable se guardan las promesas de subida de archivos
  const tareas: Promise<void>[] = [];
  // Se crea la carpeta en Firebase, con el nombre de la oferta y la fecha actual
  const carpetaOferta = `ofertas/${this.sanitize(titulo)}_${Date.now()}`;

  // Se recorren los archivos seleccionados para cada etapa y se suben a Firebase
  for (const [idxStr, file] of Object.entries(this.archivosPorEtapa)) {
    const i = Number(idxStr);
    const etapa = this.etapasSeleccionadas[i];
    if (!etapa || !file) continue;

    // Se crea una promesa para la subida del archivo
    const tarea = (async () => {
      const path = `${carpetaOferta}/etapa-${etapa.numeroEtapa}/${file.name}`;
      const storageRef = ref(this.storage, path);
      const snapshot = await uploadBytes(storageRef, file);
      const url = await getDownloadURL(snapshot.ref);

      // Se guarda la URL del archivo subido en el DTO de la etapa correspondiente
      etapa.archivoAdjunto = url;
    })();

    // Se agrega la promesa al array de tareas
    tareas.push(tarea);
  }

  // Se espera que se completen todas las tareas antes de continuar
  await Promise.all(tareas);
}

private sanitize(s: string): string {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita acentos
    .replace(/[^a-zA-Z0-9-_ ]/g, '')                  // quita raros
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

  compararTipoContrato = (p1: TipoContrato, p2: TipoContrato) => p1 && p2 ? p1.id === p2.id : p1 === p2;


  seleccionarHabilidades() {
    this.modalRef = this.modalService.open(SeleccionHabilidadesComponent, {
      centered: true,
      scrollable: true,
      size: 'lg'
    });

    this.modalRef.componentInstance.habilidadesSeleccionadas = [...this.habilidades];

    // PARA RECIBIR LAS HABILIDADES ACA Y ENVIARLAS EN LA REQUEST
    this.modalRef.result.then(
      (result) => {
        if (result) {
          this.habilidadesSeleccionadasID = result;

          const habilidadesFinales: OfertaHabilidad[] = result.map((id: number | undefined) => {
            const habilidadEncontrada = this.todasHabilidades.find(h => h.id === id);
            return {
              habilidad: habilidadEncontrada
            } as OfertaHabilidad;
          }).filter((ch: { habilidad: undefined; }) => ch.habilidad !== undefined);

          this.habilidades = habilidadesFinales;
          }
        }
      )
  }

  get habilidadesParaMostrar(): OfertaHabilidad[] {
    return this.habilidadesFinales === undefined ? this.habilidades : this.habilidadesFinales;
  }


  agregarEtapa(etapa: Etapa) {
    // Evitar duplicados
    const yaSeleccionada = this.etapasSeleccionadas.some(e => e.idEtapa === etapa.id);
    if (yaSeleccionada) return;

    const numeroEtapa = this.etapasSeleccionadas.length + 1;

    const nuevaEtapa: ofertaEtapaDTO = {
      numeroEtapa: numeroEtapa,
      adjuntaEnlace: false,                  // por defecto
      idEtapa: etapa.id!,                     // viene de la etapa seleccionada
      idEmpleadoEmpresa: 0,                  // ⚠️ acá tenés que setear el empleado logueado
      archivoAdjunto: '',
      descripcionAdicional: ''
    };

    this.etapasSeleccionadas.push(nuevaEtapa);
    console.log('etapas seleccionadas: ', this.etapasSeleccionadas)
  }


  quitarEtapa(index: number) {
  this.etapasSeleccionadas.splice(index, 1);
  console.log('etapas seleccionadas: ', this.etapasSeleccionadas)

  // Reordenar los números
  this.etapasSeleccionadas = this.etapasSeleccionadas.map((et, idx) => ({
    ...et,
    numeroEtapa: idx + 1
  }));
}

getNombreEtapa(idEtapa: number): string {
  const etapa = this.etapasDisponibles.find(e => e.id === idEtapa);
  return etapa ? etapa.nombreEtapa! : '';
}

abrirSelectorArchivoEtapa(i: number) {
  document.getElementById('fileArchivoEtapa_' + i)?.click();
}

onArchivoEtapaSelected(event: any, i: number ) {
  const inputEl = event.target as HTMLInputElement;
  const file = inputEl.files?.[0];
  if (!file) return;

  // Reset de errores de esa etapa
  this.erroresArchivo[i] = {};

  // Validaciones
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    this.erroresArchivo[i].formato = true;
    this.changeDetectorRef.detectChanges();
    // Limpio el input para permitir reintento inmediato
    inputEl.value = '';
    return;
  }
  if (file.size > 5 * 1024 * 1024) {
    this.erroresArchivo[i].tamanioInvalido = true;
    this.changeDetectorRef.detectChanges();
    inputEl.value = '';
    return;
  }

  // Guardar para subir luego
  this.archivosPorEtapa[i] = file;
  this.previewPorEtapa[i] = URL.createObjectURL(file);
  this.nombresArchivoPorEtapa[i] = file.name;

  // NO metas blob-URL en el DTO
  this.etapasSeleccionadas[i].archivoAdjunto = '';

  // Dejo el input vacío así puedo volver a elegir el mismo archivo si quiero
  inputEl.value = '';

  this.changeDetectorRef.detectChanges();
}


eliminarArchivoEtapa(i: number) {
  delete this.archivosPorEtapa[i];
  delete this.previewPorEtapa[i];
  delete this.nombresArchivoPorEtapa[i];
  delete this.erroresArchivo[i];

  this.etapasSeleccionadas[i].archivoAdjunto = '';

  // Resetear el input file de esa etapa para permitir re-seleccionar el mismo archivo
  const input = document.getElementById('fileArchivoEtapa_' + i) as HTMLInputElement | null;
  if (input) input.value = '';

  this.changeDetectorRef.detectChanges();
}


toggleAdjuntaEnlace(i: number, checked: boolean) {
  const esPrimeraElegida = this.etapasSeleccionadas[i].numeroEtapa === 1;
  this.etapasSeleccionadas[i].adjuntaEnlace = esPrimeraElegida ? checked : false;

 console.log('etapas seleccionadas: ', this.etapasSeleccionadas)
 }



seleccionarEmpleado(i: number) {
  if (!this.idEmpresaObtenida) return;

  this.modalRef = this.modalService.open(EmpleadoModalComponent, {
    centered: true,
    scrollable: true,
    size: 'lg'
  });

  this.modalRef.componentInstance.empresaId = this.idEmpresaObtenida;

  this.modalRef.result
    .then((empleadoId: number) => {
      if (empleadoId != null) {
        // 1) seteo el ID en la etapa (como ya hacías)
        this.etapasSeleccionadas[i].idEmpleadoEmpresa = empleadoId;
        console.log(`Empleado ${empleadoId} asignado a la etapa #${i + 1}`);

        // 2) traigo el nombre UNA vez y lo cacheo para pintar en la vista
        this.empleadoService.findById(empleadoId).subscribe({
          next: (emp: Empleado) => {
            const nombre = [emp?.nombreEmpleadoEmpresa, emp?.apellidoEmpleadoEmpresa].filter(Boolean).join(' ');
            this.empleadosPorId[empleadoId] = nombre || `Empleado ${empleadoId}`;
            this.changeDetectorRef.detectChanges();
          },
          error: () => { 
            // fallback por si falla
            this.empleadosPorId[empleadoId] = `Empleado ${empleadoId}`;
            this.changeDetectorRef.detectChanges();
          }
        });
      }
    })
    .catch(() => {});
}

borrarEmpleado(i: number){
  this.etapasSeleccionadas[i].idEmpleadoEmpresa = 0;
}

private validarEtapas(): boolean {
  // En estas variables se guardará la info de errores y faltantes
  this.erroresEtapas = [];
  this.faltasEmpleado = [];

  if (!this.etapasSeleccionadas || this.etapasSeleccionadas.length === 0) {
    return false; // No hay etapas seleccionadas
  }
  let ok = true; // Se crea variable ok en true

  this.etapasSeleccionadas.forEach((e: any, idx: number) => {
    // Por cada etapa, se crea un objeto de errores vacío
    const err: { sinEmpleado?: boolean } = {};
    if (e.adjuntaEnlace === undefined || e.adjuntaEnlace === null) {
      e.adjuntaEnlace = false; // Si no hay valor, se coloca en false
    }
    if (e.idEtapa == null && e.id != null) {
      e.idEtapa = e.id; // Se asegura que idEtapa tenga el valor correcto
    }
    if (e.idEmpleadoEmpresa == null || e.idEmpleadoEmpresa === 0) {
      err.sinEmpleado = true; // Marca error si no hay empleado asignado
      ok = false;
      this.faltasEmpleado.push((e.numeroEtapa ?? idx + 1)); // Guarda el número de etapa con falta de empleado
    }
    this.erroresEtapas[idx] = err; // Guarda los errores de la etapa actual
  });
  
  return ok; // Devuelve true o false según si todo está ok
}


isEtapaSeleccionada(etapa: Etapa): boolean {
  return this.etapasSeleccionadas.some(e => e.idEtapa === etapa.id);
}

getNumeroEtapa(idEtapa: number): number | null {
  const index = this.etapasSeleccionadas.findIndex(e => e.idEtapa === idEtapa);
  return index !== -1 ? index + 1 : null;
}

lenTrim(nombre: string): number {
  const v = (this.crearofertaForm.get(nombre)?.value ?? '').toString();
  return v.trim().length;
}

tieneErrorLongitud(nombre: string): boolean {
  const c = this.crearofertaForm.get(nombre);
  return !!(c?.errors?.['minlengthTrim'] || c?.errors?.['maxlengthTrim']);
}



}
