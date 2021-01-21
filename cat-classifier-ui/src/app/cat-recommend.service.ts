import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { Observable, of } from 'rxjs';
import {Short_Survey} from './cat/cat_data'
@Injectable({
  providedIn: 'root'
})
export class CatRecommendService {

  constructor(private http: HttpClient) { }

  getRel(q:string[]): Observable<Object> {
    // console.log(q)

    let x = this.http.post('/cats', q)
    return x
  }
  getAI(q): Observable<Object> {
    
    const survey = this.convert(q)
    // console.log(q, survey.channelType)
    let x = this.http.post('/inital', survey )
    return x
  }
  private convert(full_survey) : Short_Survey{
    let s = new Short_Survey()
    s.clientName = full_survey['clientName']
    s.name = full_survey['name']
    s.surveyType = full_survey['surveyType']
    s.channelType = full_survey['channelType']
    s.latents = []
    let l = full_survey['latents']
    if(null != l){
      l.forEach(ls =>{
        s.latents.push(ls)
      })
    }
    return s
  }
}
