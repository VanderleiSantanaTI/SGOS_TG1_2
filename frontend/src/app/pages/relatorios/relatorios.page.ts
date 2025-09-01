import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-relatorios',
  templateUrl: './relatorios.page.html',
  styleUrls: ['./relatorios.page.scss'],
})
export class RelatoriosPage implements OnInit {
  constructor(private menuController: MenuController) { }
  ngOnInit() {}
  async openMenu() { await this.menuController.open(); }
}
