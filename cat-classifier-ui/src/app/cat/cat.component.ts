import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CatRecommendService } from '../cat-recommend.service';
import { AIRecommond,  StatsRecommond, FormCat, MockData} from './cat_data'
import { FormControl } from '@angular/forms';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-cat',
  templateUrl: './cat.component.html',
  styleUrls: ['./cat.component.css']
})
export class CatComponent implements OnInit {

  surveys = MockData.surveys
  survey = null
  custom_survey : string
  categories : string [] = []
  form_cats : FormCat [] = []
  origin_ai: string []
  ai_cats : string [] = []
  stat_cats : string [] = []
  all_cats = MockData.all_cats
  all_slatents = MockData.all_slatents.sort()
  show_menu : boolean = true
  super_latents : string [] = []

  public filteredCatMulti: ReplaySubject<FormCat[]> = new ReplaySubject<FormCat[]>(1);

  catMultiCtrl: FormControl = new FormControl();

  catMultiFilterCtrl: FormControl = new FormControl();

  @ViewChild('multiSelect', { static: true }) multiSelect: MatSelect;

  constructor(private service: CatRecommendService) { 
    Promise.resolve()
    .then(() =>
    this.all_cats.forEach(cat =>{
      this.form_cats.push({"id":cat,"name":cat})
    })).then(() => this.form_cats.sort((a,b) =>a.name.localeCompare(b.name)))
  }

  ngOnInit(): void {

    // this.catMultiCtrl.setValue([])
    // load the initial bank list
    this.filteredCatMulti.next(this.form_cats.slice())

    // listen for search field value changes
    this.catMultiFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterCat();
      });
    this.catMultiCtrl.valueChanges
      .subscribe(x => {
        console.log(x, this.catMultiCtrl.value.length)
        if(this.catMultiCtrl.value.length > 0){
          Promise.resolve().then(() =>
          this.catMultiCtrl.value.filter(e => e != null && e.name != null ).forEach(e =>{
            console.log('in', e)
            if(this.categories.indexOf(e.name) < 0)
              this.categories.push(e.name)
          })
        ).then(()=>{
            console.log('set', this.categories)
            this.catMultiCtrl.setValue([])
            this.loadRecommand()  
            // this.filterCat()    
          })
        }
    })  
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

    /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  protected setInitialValue() {
    // this.filteredCatMulti
    //   .pipe(take(1), takeUntil(this._onDestroy))
    //   .subscribe(() => {
    //     // setting the compareWith property to a comparison function
    //     // triggers initializing the selection according to the initial value of
    //     // the form control (i.e. _initializeSelection())
    //     // this needs to be done after the filteredBanks are loaded initially
    //     // and after the mat-option elements are available
    //     this.multiSelect.compareWith = (a: FormCat, b: FormCat) => a && b && a.id === b.id;
    //   });
  }

  protected _onDestroy = new Subject<void>();

  onRecommond(){
    console.log('call api',this.survey)
    this.service.getAI(this.survey).subscribe(data =>{
      this.origin_ai = data['categories']
      this.ai_cats = this.origin_ai.slice(0)
      this.super_latents = data['slatents']
      console.log(this.ai_cats, data)
    })
    // this.categories = this.catMultiCtrl.value
  }

  catChange(cat: string, add : boolean){
    // console.log(cat)

      if(add){
        let r = {"id":cat,"name":cat}
        // if(null == this.catMultiCtrl.value){
        //   this.categories.push(cat)
        //   // this.catMultiCtrl.setValue([r])
        // }else{
        //   // let c = this.catMultiCtrl.value.slice()
        //   // c.push(r)
        //   // this.catMultiCtrl.setValue(c)
        //   this.categories
        // }
        this.categories.push(cat)
      }else{
        // let c = this.catMultiCtrl.value.slice()
        // c.splice(c.indexOf(cat, 0),1)
        // this.catMultiCtrl.setValue(c)
        this.categories.splice(this.categories.indexOf(cat,0),1)
      }    
      
      //this.categories = this.catMultiCtrl.value.map(e => e.name)
      this.filterCat();
      
      this.loadRecommand()
      // this.ngOnInit()

    // console.log("let me see what we got", this.categories)    
  }


  loadRecommand(){
    if(this.origin_ai != null){
      this.ai_cats = this.origin_ai.slice(0)
    }
    this.categories.forEach( cat => {
      if(this.ai_cats.includes(cat)){
        this.ai_cats.splice(this.ai_cats.indexOf(cat, 0),1)
      }    
    })
    if(null != this.categories && this.categories.length > 0){
      this.stat_cats = []
      this.service.getRel(this.categories).subscribe(data =>{
        this.stat_cats = data as string []
      })
    }
  }

  filterCat() {
    // get the search keyword
    let search = this.catMultiFilterCtrl.value;
    if (!search) {
      this.filteredCatMulti.next(this.form_cats.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredCatMulti.next(
      this.form_cats.filter(cat => cat.name.toLowerCase().indexOf(search) > -1)
    );
  }
  show(survey){
    this.survey = survey
    this.setInitialValue();
    this.show_menu = ! this.show_menu
    this.categories = []
    this.catMultiCtrl.setValue([])
    this.filteredCatMulti.next(this.form_cats.slice());
    this.stat_cats = []
    this.onRecommond()
  }
  debug(){
    console.log(this.catMultiCtrl)
    console.log(this.form_cats)
  }
  loadSurvey(){
    this.show(JSON.parse(this.custom_survey))
  }
  clearAllCats(){
    this.categories=[]
    this.stat_cats = []
    this.loadRecommand()
  }
}
