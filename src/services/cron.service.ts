import cron from 'node-cron';
import { whatsappService } from './whatsapp.service.js';

class CronService {
  private isRunning = false;

  public init() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('[Cron] Initializing 1-minute automated shift reporter...');

    // Runs every minute to check for shift completion
    cron.schedule('* * * * *', async () => {
      const now = new Date();
      // Use IST time zone
      const istString = now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
      const istDate = new Date(istString);
      const hours = istDate.getHours();
      const minutes = istDate.getMinutes();

      // Shift 1: 11:30 PM IST (23:30)
      if (hours === 23 && minutes === 30) {
        console.log('[Cron] Triggering Automated Shift 1 Report (11:30 PM IST)...');
        await whatsappService.sendShiftReport(1, '8328246413').catch(err => {
          console.error('[Cron] Shift 1 report error:', err);
        });
      }

      // Shift 2: 10:00 AM IST (10:00)
      if (hours === 10 && minutes === 0) {
        console.log('[Cron] Triggering Automated Shift 2 Report (10:00 AM IST)...');
        await whatsappService.sendShiftReport(2, '8328246413').catch(err => {
          console.error('[Cron] Shift 2 report error:', err);
        });
      }
    });
  }

  public async triggerTestReport(shiftNum: number, phone: string = '8328246413') {
    return await whatsappService.sendShiftReport(shiftNum, phone);
  }
}

export const cronService = new CronService();
