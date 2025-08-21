import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, Clock, User } from "lucide-react";
import { Link } from "wouter";

interface ApprovalRequest {
  id: number;
  requestType: string;
  requestedBy: string;
  requestedAt: string;
  proposedChanges: any;
}

export default function PendingNotifications() {
  const { data: pendingRequests = [] } = useQuery<ApprovalRequest[]>({
    queryKey: ["/api/approval-requests/pending"],
  });

  if (pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="mb-6 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-medium text-yellow-800 dark:text-yellow-200">
                Solicitações Pendentes de Aprovação
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {pendingRequests.length} solicitação{pendingRequests.length > 1 ? "ões" : ""} aguardando revisão
              </p>
            </div>
          </div>
          <Link href="/approvals">
            <Button variant="outline" size="sm" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
              Revisar Agora
            </Button>
          </Link>
        </div>
        
        <div className="mt-3 space-y-2">
          {pendingRequests.slice(0, 3).map((request) => (
            <div key={request.id} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <span>{request.proposedChanges?.name || "Novo produto"}</span>
                <Badge variant="outline" className="text-xs">
                  {request.requestType === "create" ? "Criar" : 
                   request.requestType === "update" ? "Atualizar" : "Deletar"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-yellow-700 dark:text-yellow-300">
                <User className="h-3 w-3" />
                <span>{request.requestedBy}</span>
              </div>
            </div>
          ))}
          {pendingRequests.length > 3 && (
            <div className="text-xs text-yellow-600 mt-2">
              +{pendingRequests.length - 3} outras solicitações
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}