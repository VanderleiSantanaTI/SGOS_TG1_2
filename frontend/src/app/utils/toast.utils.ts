import { ToastController } from '@ionic/angular';

export class ToastUtils {
  constructor(private toastController: ToastController) {}

  /**
   * Mostra toast de sucesso com cor verde garantida
   */
  async showSuccessToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'success',
      position: 'top',
      cssClass: 'success-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Mostra toast de erro com cor vermelha
   */
  async showErrorToast(message: string, duration: number = 4000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'danger',
      position: 'top',
      cssClass: 'error-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Mostra toast de aviso com cor amarela
   */
  async showWarningToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'warning',
      position: 'top',
      cssClass: 'warning-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  /**
   * Mostra toast de informação com cor azul
   */
  async showInfoToast(message: string, duration: number = 3000): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration,
      color: 'primary',
      position: 'top',
      cssClass: 'info-toast',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }
}
