import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { OrdensServicoPageRoutingModule } from './ordens-servico-routing.module';
import { OrdensServicoPage } from './ordens-servico.page';
import { OSDetailsModalComponent } from './os-details-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    OrdensServicoPageRoutingModule
  ],
  declarations: [OrdensServicoPage, OSDetailsModalComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class OrdensServicoPageModule {}
