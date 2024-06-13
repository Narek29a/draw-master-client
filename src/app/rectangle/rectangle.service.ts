import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {RectangleDimension} from "./types";

@Injectable({
  providedIn: 'root'
})
export class RectangleService {
  constructor(private http: HttpClient) {
  }

  public static readonly URL: string = 'http://localhost:5247/rectangle';

  public get(): Observable<RectangleDimension> {
    return this.http.get<RectangleDimension>(RectangleService.URL);
  }

  public update(rectangle: RectangleDimension): Observable<RectangleDimension> {
    return this.http.put<RectangleDimension>(RectangleService.URL, rectangle);
  }

}
