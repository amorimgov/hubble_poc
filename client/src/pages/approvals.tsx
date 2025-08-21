import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Eye, User, Calendar, FileText, Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";

interface ApprovalRequest {
  id: number;
  productId: number | null;
  requestType: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
  approvedBy: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
  proposedChanges: any;
  currentData: any;
}

export default function Approvals() {
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const queryClient = useQueryClient();

  const { data: approvalRequests = [], isLoading } = useQuery<ApprovalRequest[]>({
    queryKey: ["/api/approval-requests", { status: filterStatus === "all" ? "" : filterStatus }],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, approvedBy, rejectionReason }: { 
      id: number; 
      status: string; 
      approvedBy?: string; 
      rejectionReason?: string; 
    }) => {
      const response = await fetch(`/api/approval-requests/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status, approvedBy, rejectionReason }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error('Failed to update approval request');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/approval-requests"] });
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
      setRejectionReason("");
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "approved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getRequestTypeLabel = (type: string) => {
    switch (type) {
      case "create":
        return "Criar Produto";
      case "update":
        return "Atualizar Produto";
      case "delete":
        return "Deletar Produto";
      default:
        return type;
    }
  };

  const handleApprove = () => {
    if (selectedRequest) {
      updateStatusMutation.mutate({
        id: selectedRequest.id,
        status: "approved",
        approvedBy: "Admin User", // In a real app, this would come from the authenticated user
      });
    }
  };

  const handleReject = () => {
    if (selectedRequest && rejectionReason.trim()) {
      updateStatusMutation.mutate({
        id: selectedRequest.id,
        status: "rejected",
        approvedBy: "Admin User",
        rejectionReason: rejectionReason.trim(),
      });
    }
  };

  const filteredRequests = approvalRequests.filter((request) => {
    const matchesSearch = searchQuery === "" || 
      request.requestedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (request.proposedChanges?.name && request.proposedChanges.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const pendingCount = approvalRequests.filter(r => r.status === "pending").length;
  const approvedCount = approvalRequests.filter(r => r.status === "approved").length;
  const rejectedCount = approvalRequests.filter(r => r.status === "rejected").length;

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Sistema de Aprovação</h1>
                <p className="text-muted-foreground">
                  Gerencie solicitações de mudanças nos produtos de dados
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Solicitações de Aprovação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">{approvalRequests.length}</div>
                    <div className="text-sm text-muted-foreground">Total de Solicitações</div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                    <div className="text-sm text-muted-foreground">Pendentes</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                    <div className="text-sm text-muted-foreground">Aprovadas</div>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                    <div className="text-sm text-muted-foreground">Rejeitadas</div>
                  </div>
                </div>

                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all" onClick={() => setFilterStatus("all")}>Todas</TabsTrigger>
                    <TabsTrigger value="pending" onClick={() => setFilterStatus("pending")}>Pendentes</TabsTrigger>
                    <TabsTrigger value="approved" onClick={() => setFilterStatus("approved")}>Aprovadas</TabsTrigger>
                    <TabsTrigger value="rejected" onClick={() => setFilterStatus("rejected")}>Rejeitadas</TabsTrigger>
                  </TabsList>

                  <TabsContent value={filterStatus} className="space-y-4">
                    <div className="flex gap-4 mb-6">
                      <div className="flex-1">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="Buscar por solicitante ou produto..."
                            className="w-full pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {isLoading ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500">Carregando solicitações...</div>
                        </div>
                      ) : filteredRequests.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-gray-500">Nenhuma solicitação encontrada</div>
                        </div>
                      ) : (
                        filteredRequests.map((request) => (
                          <Card key={request.id} className="border-l-4 border-l-accent">
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    {getStatusIcon(request.status)}
                                    <h3 className="text-lg font-semibold">
                                      {getRequestTypeLabel(request.requestType)}
                                    </h3>
                                    <Badge className={`text-xs ${getStatusColor(request.status)}`}>
                                      {request.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-4">
                                      <div className="flex items-center gap-1">
                                        <User className="h-4 w-4" />
                                        <span>Solicitado por: {request.requestedBy}</span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                          {formatDistanceToNow(new Date(request.requestedAt), { 
                                            addSuffix: true, 
                                            locale: ptBR 
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {request.proposedChanges?.name && (
                                    <div className="text-sm mb-2">
                                      <span className="font-medium">Produto:</span> {request.proposedChanges.name}
                                    </div>
                                  )}

                                  {request.approvedBy && (
                                    <div className="text-xs text-muted-foreground">
                                      Revisado por: {request.approvedBy}
                                      {request.approvedAt && (
                                        <span> em {formatDistanceToNow(new Date(request.approvedAt), { 
                                          addSuffix: true, 
                                          locale: ptBR 
                                        })}</span>
                                      )}
                                    </div>
                                  )}

                                  {request.rejectionReason && (
                                    <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm">
                                      <span className="font-medium text-red-600">Motivo da rejeição:</span> {request.rejectionReason}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center space-x-2 ml-4">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setSelectedRequest(request);
                                      setIsReviewModalOpen(true);
                                    }}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Revisar Solicitação de Mudança</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Tipo de Solicitação</label>
                  <div className="text-sm text-muted-foreground">
                    {getRequestTypeLabel(selectedRequest.requestType)}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Solicitado por</label>
                  <div className="text-sm text-muted-foreground">{selectedRequest.requestedBy}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Mudanças Propostas</label>
                <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap">
                    {JSON.stringify(selectedRequest.proposedChanges, null, 2)}
                  </pre>
                </div>
              </div>

              {selectedRequest.currentData && (
                <div>
                  <label className="text-sm font-medium">Dados Atuais</label>
                  <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap">
                      {JSON.stringify(selectedRequest.currentData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {selectedRequest.status === "pending" && (
                <div>
                  <label htmlFor="rejectionReason" className="text-sm font-medium">
                    Motivo da Rejeição (opcional)
                  </label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Digite o motivo caso queira rejeitar a solicitação..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
              Cancelar
            </Button>
            {selectedRequest?.status === "pending" && (
              <>
                <Button 
                  variant="destructive" 
                  onClick={handleReject}
                  disabled={updateStatusMutation.isPending}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeitar
                </Button>
                <Button 
                  className="bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={handleApprove}
                  disabled={updateStatusMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}