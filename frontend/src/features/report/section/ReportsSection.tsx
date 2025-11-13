import { useEffect, useMemo, useState } from "react";
import { type ReportResult } from "../list/report-card";
import { apiClient } from "@/shared/api/base";
import { useSearchParams } from "react-router-dom";
import { ReportChatCard } from "./ReportChatCard";
import { sendedReportStore } from "./sendedReportStore";
import { observer } from "mobx-react-lite";
import { LoadingSpinner } from "@/shared/ui/kit/loading-spinner";

export const ReportsSection = observer(() => {
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("id") || "";
    const [reports, setReports] = useState<ReportResult[]>([]);
    const sended = sendedReportStore;

    useEffect(() => {
        if (sended.waiting === false) {
            apiClient.gameSessions.getMyReportsSessionsReportsMyGet().then(response => setReports(response.data));
        }
    }, [sended.waiting]);

    const chatReports = useMemo(() => reports.filter((report) => report.session_id === sessionId), [reports, sessionId])

    if (chatReports.length <= 0) {
        return <></>
    }
    return <div className="flex w-xl flex-col gap-4 h-min overflow-auto max-h-[calc(100vh-270px)]">
        <h3>Галлюцинации</h3>{
            chatReports.map((report) => <ReportChatCard data={report} />)
        }
        {
            sended.waiting && <LoadingSpinner />
        }
    </div>
})