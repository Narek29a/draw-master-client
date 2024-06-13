import {AfterViewChecked, AfterViewInit, Component, HostListener, OnInit} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {FormBuilder, FormGroup} from "@angular/forms";
import {RectangleService} from "./rectangle.service";
import {RectangleDimension} from "./types";
import {HttpClientModule} from "@angular/common/http";

@Component({
  selector: 'app-rectangle',
  standalone: true,
  imports: [
    MatButton,
    HttpClientModule
  ],
  providers: [RectangleService],
  templateUrl: './rectangle.component.html',
  styleUrl: './rectangle.component.scss'
})
export class RectangleComponent implements OnInit, AfterViewInit, AfterViewChecked {
  drawLayer!: HTMLElement;
  svgContainer!: HTMLElement;
  mouseDown = false;
  drawMode = false;
  resizeThreshold = 10;
  isResizing = false;
  isMouseOverSvgContainer = false;
  rectangleDimension: RectangleDimension = {} as RectangleDimension;
  private _loginForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private rectangleService: RectangleService) {

  }

  ngOnInit(): void {
    this.rectangleService.get().subscribe((rectangleDimension: RectangleDimension) => {
      if (rectangleDimension.width !== 0 && rectangleDimension.height !== 0) {
        this.initSVGContainer(rectangleDimension);
      }
      this.rectangleDimension = rectangleDimension;
      this._loginForm = this.formBuilder.group({
        perimeter: [this.calculatePerimeter(rectangleDimension.width, rectangleDimension.height)],
      });
    });
  }

  ngAfterViewInit(): void {
    this.drawLayer = document.getElementById('drawingLayer')!;
  }

  ngAfterViewChecked(): void {
    this.svgContainer?.addEventListener('mouseover', event => {
      this.isMouseOverSvgContainer = true;
    });
    this.svgContainer?.addEventListener('mouseout', event => {
      this.isMouseOverSvgContainer = false;
    });
  }


  @HostListener('mousedown', ['$event']) mousedown(event: MouseEvent) {
    if (this.drawMode) {
      this.mouseDown = true;
      this.rectangleDimension.x = event.pageX;
      this.rectangleDimension.y = event.pageY;
      this.initSVGContainer({width: 0, height: 0, x: this.rectangleDimension.x, y: this.rectangleDimension.y});
    }
    if (this.svgContainer && this.isInBottomRightCorner(event)) {
      this.isResizing = true;
      this.drawLayer.addEventListener('mousemove', (event: MouseEvent) => {
        if (this.isResizing) {
          this.expand(event);
        }
      });
    }
  }


  initSVGContainer(rectangleDimension: RectangleDimension): void {
    this.svgContainer = document.createElement('div');
    this.svgContainer.setAttribute('id', 'svgContainer');
    this.svgContainer.style.position = 'absolute';
    this.svgContainer.style.display = 'flex';
    this.svgContainer.style.left = `${rectangleDimension.x}px`;
    this.svgContainer.style.top = `${rectangleDimension.y}px`;
    this.svgContainer.style.width = `${rectangleDimension.width}px`;
    this.svgContainer.style.height = `${rectangleDimension.height}px`;
    this.svgContainer.style.outline = '1px dotted black';
    this.svgContainer.innerHTML = `<svg height="100%" width="100%" fill="#0000FF"><rect x='0' y='0' width='100%' height='100%' fill='#0000FF'/></svg>`
    this.drawLayer.appendChild(this.svgContainer);
  }

  expand(event: MouseEvent) {
    if (event.pageX < this.rectangleDimension.x) {
      this.svgContainer.style.left = `${event.pageX}px`;
    }
    if (event.pageY < this.rectangleDimension.y) {
      this.svgContainer.style.top = `${event.pageY}px`;
    }
    this.svgContainer.style.width = `${Math.abs(event.pageX - this.rectangleDimension.x)}px`;
    this.svgContainer.style.height = `${Math.abs(event.pageY - this.rectangleDimension.y)}px`;
    this.rectangleDimension.width = Math.abs(event.pageX - this.rectangleDimension.x);
    this.rectangleDimension.height = Math.abs(event.pageY - this.rectangleDimension.y);
    this.perimeterControl?.setValue(2 * (this.rectangleDimension.width + this.rectangleDimension.height));

  }

  isInBottomRightCorner(event: MouseEvent): boolean {
    const rect = this.svgContainer.getBoundingClientRect();
    return event.clientX > rect.right - this.resizeThreshold
      && event.clientY > rect.bottom - this.resizeThreshold && this.isMouseOverSvgContainer;
  }


  @HostListener('mousemove', ['$event']) mouseMove(event: MouseEvent) {
    if (this.drawMode && this.mouseDown) {
      this.expand(event);
    }
    if (this.svgContainer) {
      this.svgContainer.style.cursor = this.isInBottomRightCorner(event) ? 'nwse-resize' : 'default';
    }
  }

  @HostListener('mouseover', ['$event']) mouseOver(event: MouseEvent) {
    if (this.drawMode) {
      this.drawLayer.style.cursor = 'crosshair';
    }
  }

  @HostListener('mouseup', ['$event']) mouseUp() {
    if (this.drawMode || this.isResizing) {
      this.rectangleService.update(this.rectangleDimension).subscribe();
      this.drawMode = false;
      this.mouseDown = false;
      this.drawLayer.style.cursor = 'default';
      this.svgContainer.style.outline = 'none';
      this.isResizing = false;
    }

  }

  @HostListener('mouseleave', ['$event']) mouseLeave() {
    if (this.drawMode && this.svgContainer) {
      this.drawMode = false;
      this.drawLayer.style.cursor = 'default';
      this.mouseDown = false;
      this.svgContainer.style.outline = '';
    }
    this.isResizing = false;
  }

  startDraw() {
    this.drawMode = true;
    const element = document.getElementById("svgContainer");
    element?.remove();
    this.rectangleDimension.width = 0;
    this.rectangleDimension.height = 0;
    this.perimeterControl?.setValue(0);
  }

  calculatePerimeter(width: number, height: number) {
    return 2 * (width + height);
  }

  public get perimeterControl() {
    return this._loginForm?.get('perimeter');
  }


}
