import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Observable, of } from 'rxjs';
import { SpinnerService } from '../spinner.service';

@Component({
  selector: 'app-spinner',
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {
  @Input() type: 'overlay' | 'inline' | 'small' = 'overlay';
  @Input() message: string = '';

}
