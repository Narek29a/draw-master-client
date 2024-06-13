import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {RectangleComponent} from "./rectangle/rectangle.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RectangleComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'svg-rectangle';
}
