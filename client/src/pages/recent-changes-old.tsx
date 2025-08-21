import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar, User, GitCommit, Clock, X, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecentChange {
  id: number;
  productId: number;
  productName: string;
  changedBy: string;
  changeType: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  description: string | null;
  changedAt: string;
}

interface RecentChangesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RecentChangesModal({ open, onOpenChange }: RecentChangesModalProps) {
  const { data: changes = [], isLoading } = useQuery<RecentChange[]>({
    queryKey: ["/api/recent-changes"],
    enabled: open,
  });

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "🎉";
      case "updated":
        return "✏️";
      case "status_changed":
        return "🔄";
      default:
        return "📝";
    }
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "bg-green-100 text-green-800 border-green-200";
      case "updated":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "status_changed":
        return "bg-orange-100 text-orange-800 border-orange-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getChangeTypeLabel = (changeType: string) => {
    switch (changeType) {
      case "created":
        return "Added";
      case "updated":
        return "Changed";
      case "status_changed":
        return "Fixed";
      default:
        return "Updated";
    }
  };

  // Group changes by date
  const groupedChanges = changes.reduce((acc, change) => {
    const date = format(new Date(change.changedAt), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(change);
    return acc;
  }, {} as Record<string, RecentChange[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900">
                Mudanças Recentes
              </DialogTitle>
              <p className="text-gray-600 mt-1">
                Acompanhe as últimas modificações nos produtos de dados
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : changes.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma mudança encontrada
              </h3>
              <p className="text-gray-600">
                Ainda não há registros de mudanças nos produtos.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {changes.map((change) => (
                <div
                  key={change.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Badge className={getChangeTypeColor(change.changeType)}>
                        {getChangeTypeLabel(change.changeType)}
                      </Badge>
                      <h4 className="font-semibold text-gray-900">
                        {change.productName}
                      </h4>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDistanceToNow(new Date(change.changedAt), {
                        addSuffix: true,
                        locale: ptBR
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      Alterado por: {change.changedBy}
                    </div>

                    {change.description && (
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {change.description}
                      </p>
                    )}

                    {change.fieldName && (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Valor Anterior:</span>
                          <p className="mt-1 p-2 bg-red-50 border border-red-200 rounded text-red-800">
                            {change.oldValue || "Vazio"}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">Novo Valor:</span>
                          <p className="mt-1 p-2 bg-green-50 border border-green-200 rounded text-green-800">
                            {change.newValue || "Vazio"}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="text-xs text-gray-500 pt-2 border-t">
                      {format(new Date(change.changedAt), "dd/MM/yyyy 'às' HH:mm", {
                        locale: ptBR
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}