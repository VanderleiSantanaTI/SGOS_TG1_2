import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { PecasServicosPageRoutingModule } from './pecas-servicos-routing.module';
import { PecasServicosPage } from './pecas-servicos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    PecasServicosPageRoutingModule
  ],
  declarations: [PecasServicosPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class PecasServicosPageModule {}
