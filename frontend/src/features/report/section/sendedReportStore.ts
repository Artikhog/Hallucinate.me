import { makeAutoObservable } from 'mobx';
import type { ReportResult } from '../list/report-card';

class SendedReportStore {
    waiting: boolean = false;
    report: string = '';
    result: ReportResult | null = null;

    constructor() {
        makeAutoObservable(this);
    }

    // Метод для установки отчета
    setReport(report: string) {
        this.waiting = true;
        this.report = report;
    }

    // Метод для установки результата
    setResult(result: ReportResult) {
        this.waiting = false;
        this.result = result;
    }

    // Метод для очистки store
    clear() {
        this.waiting = false;
        this.report = '';
        this.result = null;
    }
}

// Создаем и экспортируем экземпляр store
export const sendedReportStore = new SendedReportStore();