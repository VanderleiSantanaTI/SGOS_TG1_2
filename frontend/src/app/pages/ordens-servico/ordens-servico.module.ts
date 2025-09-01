import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdensServicoPageRoutingModule } from './ordens-servico-routing.module';
import { OrdensServicoPage } from './ordens-servico.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    OrdensServicoPageRoutingModule
  ],
  declarations: [OrdensServicoPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrdensServicoPageModule {}
