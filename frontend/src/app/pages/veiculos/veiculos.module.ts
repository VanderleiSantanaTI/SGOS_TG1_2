import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { VeiculosPageRoutingModule } from './veiculos-routing.module';
import { VeiculosPage } from './veiculos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    VeiculosPageRoutingModule
  ],
  declarations: [VeiculosPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class VeiculosPageModule {}
