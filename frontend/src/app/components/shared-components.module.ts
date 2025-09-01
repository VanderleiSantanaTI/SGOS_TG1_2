import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

// Components
import { AppLayoutComponent } from './app-layout/app-layout.component';
import { LoginFormComponent } from './login-form/login-form.component';
import { DashboardStatsComponent } from './dashboard-stats/dashboard-stats.component';

@NgModule({
  declarations: [
    AppLayoutComponent,
    LoginFormComponent,
    DashboardStatsComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonicModule
  ],
  exports: [
    AppLayoutComponent,
    LoginFormComponent,
    DashboardStatsComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class SharedComponentsModule { }
