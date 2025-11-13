import { Button } from "@/shared/ui/shadcn/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/shadcn/ui/card";
import { CheckCircle, Clock, ExternalLink, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ReportData {
    incorrect_fact: string;
    source_url: string;
}

interface VerdictData {
    is_valid: boolean;
    reasoning: string;
    wikipedia_sources: string[];
}


export interface ReportResult {
    session_id: string;
    level_id: string;
    report: ReportData;
    verdict: VerdictData;
    is_valid: boolean;
    created_at: string;
}

interface IProps {
    data: ReportResult;
}

export function ReportResultCard({ data }: IProps) {
    const navigate = useNavigate()

    const openSession = () => {
        navigate(`/chat?id=${data.session_id}`);
    }

    return (
        <Card className="w-full max-w-xl min-w-3xs">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            Результат проверки
                            {data.verdict.is_valid ? (
                                <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                                <XCircle className="h-5 w-5 text-red-500" />
                            )}
                        </CardTitle>
                        <CardDescription>
                            Сессия: {data.session_id} • Уровень: {data.level_id}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Отчет */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Отчет</h3>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm mb-2">
                            <span className="font-medium">Некорректный факт:</span> {data.report.incorrect_fact}
                        </p>
                    </div>
                </div>

                {/* Вердикт */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">Вердикт</h3>
                    <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm mb-3">
                            <span className="font-medium">Обоснование:</span> {data.verdict.reasoning}
                        </p>

                        {data.verdict.wikipedia_sources.length > 0 && (
                            <div>
                                <p className="font-medium text-sm mb-2">Источники Wikipedia:</p>
                                <div className="space-y-1">
                                    {data.verdict.wikipedia_sources.map((source, index) => (
                                        <a
                                            key={index}
                                            href={source}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            {source}
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Мета-информация */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(data.created_at).toLocaleString()}
                    </div>
                    <Button variant="outline" size="sm" onClick={openSession}>
                        Открыть чат
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}