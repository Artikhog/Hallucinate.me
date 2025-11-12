import { Button } from "@/shared/ui/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/shadcn/ui/dialog";
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from "@/shared/ui/shadcn/ui/field";
import { Input } from "@/shared/ui/shadcn/ui/input";
import { Textarea } from "@/shared/ui/shadcn/ui/textarea";
import type { Message } from "@llamaindex/chat-ui";
import { useState, type FC } from "react";

interface ReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  message: Message;
  onSubmit: (message: Message, reason: string, sourceUrl: string) => void;
}

export const ReportModal: FC<ReportModalProps> = ({
  open,
  onOpenChange,
  message,
  onSubmit,
}) => {
  const [reason, setReason] = useState("");

  const [sourceUrl, setSourceUrl] = useState("");

  const handleSubmit = () => {
    onSubmit(message, reason, sourceUrl);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Сообщить о галлюцинации</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Пожалуйста, укажите причину сообщения о галлюцинации.
        </DialogDescription>
        <FieldGroup>
          <Field>
            <FieldLabel>Причина</FieldLabel>
            <FieldContent>
              <Textarea
                placeholder="Причина сообщения"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel>URL источника (необязательно)</FieldLabel>
            <FieldContent>
              <Input
                placeholder="URL источника"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
              />
            </FieldContent>
          </Field>
        </FieldGroup>
        <DialogFooter>
          <Button onClick={handleSubmit}>Отправить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
