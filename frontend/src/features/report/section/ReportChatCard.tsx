import { useState } from "react";
import { CheckCircle, XCircle, Clock, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import type { ReportResult } from "../list/report-card";
import { Card, CardContent } from "@/shared/ui/shadcn/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/shared/ui/shadcn/ui/collapsible";
import { Button } from "@/shared/ui/shadcn/ui/button";

interface ReportResultCardProps {
    data: ReportResult;
}

export function ReportChatCard({ data }: ReportResultCardProps) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <Card className="w-full max-w-xl min-w-3xs">
            <CardContent>
                {/* Раскрывающийся вердикт */}
                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                    <div className="flex items-center justify-between" onClick={() => setIsOpen(v => !v)}>
                        <div className="flex justify-between items-center pt-4 pb-4">
                            <div className="flex items-center gap-4">
                                <p>

                                    {data.verdict.is_valid ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <XCircle className="h-5 w-5 text-red-500" />
                                    )}
                                </p>
                                <p>
                                    {data.report.incorrect_fact}
                                </p>
                            </div>
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                {isOpen ? (
                                    <ChevronUp className="h-4 w-4" />
                                ) : (
                                    <ChevronDown className="h-4 w-4" />
                                )}
                                <span className="sr-only">Переключить</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>

                    <CollapsibleContent className="space-y-3">
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
                                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline break-words"
                                            >
                                                <ExternalLink className="h-3 w-3 flex-shrink-0" />
                                                <span className="break-all">{source}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CollapsibleContent>
                </Collapsible>

                {/* Мета-информация */}
                <div className="flex justify-between items-center pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {new Date(data.created_at).toLocaleString()}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}