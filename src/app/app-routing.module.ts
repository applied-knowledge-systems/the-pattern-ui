import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GraphComponent } from './components/graph/graph.component';
import { landingPageComponent } from './components/landing-page/landing-page.component';
import { NurseViewComponent } from './components/nurse-view/nurse-view.component';


const routes: Routes = [
  { path: '', component: landingPageComponent },
  { path: 'search', component: GraphComponent },
  { path: 'nurse', component: NurseViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
