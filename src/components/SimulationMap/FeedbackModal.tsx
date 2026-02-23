import { useState } from "react";
import { MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface FeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FeedbackModal = ({ open, onOpenChange }: FeedbackModalProps) => {
  const [name, setName] = useState("");
  const [comments, setComments] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !comments.trim()) return;

    const subject = encodeURIComponent(`GoProd Feedback — ${name.trim()}`);
    const body = encodeURIComponent(comments.trim());
    window.location.href = `mailto:goproduniandes@gmail.com?subject=${subject}&body=${body}`;

    setName("");
    setComments("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Enviar Feedback
          </DialogTitle>
          <DialogDescription>
            Comparte tus comentarios. Se abrirá tu cliente de correo con el mensaje listo para enviar.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="student-name">Nombre del estudiante</Label>
            <Input
              id="student-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tu nombre completo"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="comments">Comentarios</Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Escribe tus comentarios aquí..."
              rows={4}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !comments.trim()}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-medium transition-colors"
          >
            Enviar Feedback
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
