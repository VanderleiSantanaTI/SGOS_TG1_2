import { Component, OnInit } from '@angular/core';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-configuracoes',
  templateUrl: './configuracoes.page.html',
  styleUrls: ['./configuracoes.page.scss'],
})
export class ConfiguracoesPage implements OnInit {
  constructor(private menuController: MenuController) { }
  ngOnInit() {}
  async openMenu() { await this.menuController.open(); }
}
