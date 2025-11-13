import { apiClient } from "@/shared/api/base";
import { useEffect, useState } from "react";
import { ReportResultCard, type ReportResult } from "./report-card";


export const ReportsList = () => {
    const [reports, setReports] = useState<ReportResult[]>([]);

    useEffect(() => {
        apiClient.gameSessions.getMyReportsSessionsReportsMyGet().then(response => setReports(response.data));
    }, []);

    return <div className="ml-6 flex flex-wrap gap-4">{reports.map((report) => <ReportResultCard data={report} />)}</div>
}