import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, GitCommit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProductChange {
  id: number;
  productId: number;
  changedBy: string;
  changeType: string;
  fieldName: string | null;
  oldValue: string | null;
  newValue: string | null;
  description: string | null;
  changedAt: string;
}

interface ProductChangelogProps {
  productId: number | null;
}

export default function ProductChangelog({ productId }: ProductChangelogProps) {
  const { data: changes = [], isLoading } = useQuery<ProductChange[]>({
    queryKey: ["/api/product-changes", productId],
    enabled: !!productId,
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (changes.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Nenhum changelog disponível
        </h3>
        <p className="text-gray-600">
          Ainda não há registros de mudanças para este produto.
        </p>
      </div>
    );
  }

  // Group changes by date
  const groupedChanges = changes.reduce((acc, change) => {
    const date = format(new Date(change.changedAt), "yyyy-MM-dd");
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(change);
    return acc;
  }, {} as Record<string, ProductChange[]>);

  return (
    <div className="space-y-8">
      {Object.entries(groupedChanges)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, dayChanges]) => (
          <div key={date} className="space-y-4">
            {/* Date Header */}
            <div className="flex items-center space-x-3 border-b border-gray-200 pb-2">
              <Calendar className="h-5 w-5 text-gray-500" />
              <h3 className="text-lg font-semibold text-gray-900">
                {format(new Date(date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </h3>
            </div>

            {/* Changes for this date */}
            <div className="space-y-3 ml-8">
              {dayChanges.map((change) => (
                <div key={change.id} className="relative">
                  {/* Timeline line */}
                  <div className="absolute -left-6 top-3 w-2 h-2 bg-gray-400 rounded-full"></div>
                  <div className="absolute -left-5 top-5 w-0.5 h-full bg-gray-200"></div>

                  {/* Change content */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getChangeTypeIcon(change.changeType)}</span>
                        <Badge className={`border ${getChangeTypeColor(change.changeType)}`}>
                          {getChangeTypeLabel(change.changeType)}
                        </Badge>
                        {change.fieldName && (
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {change.fieldName}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {change.changedBy}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-3">
                      <p className="text-gray-800 leading-relaxed">
                        {change.description}
                      </p>
                    </div>

                    {/* Value changes */}
                    {change.fieldName && change.oldValue && change.newValue && (
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                        <div className="flex items-center space-x-2 text-sm">
                          <GitCommit className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-700">Alterações:</span>
                        </div>
                        <div className="pl-6 space-y-1 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-red-600 font-mono">-</span>
                            <span className="text-red-700 line-through">{change.oldValue}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-green-600 font-mono">+</span>
                            <span className="text-green-700 font-medium">{change.newValue}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Timestamp */}
                    <div className="mt-3 pt-2 border-t border-gray-100">
                      <span className="text-xs text-gray-500">
                        {format(new Date(change.changedAt), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}