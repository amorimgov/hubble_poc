import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Search, Plus, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

export default function DataContracts() {
  const contracts = [
    {
      id: 1,
      name: "Customer Data Contract",
      version: "v2.1",
      status: "active",
      producer: "Sales Team",
      consumer: "Analytics Team",
      sla: "99.9% uptime",
      lastUpdated: "2024-01-15",
      description: "Customer information and transaction data contract",
    },
    {
      id: 2,
      name: "Financial Reporting Contract",
      version: "v1.5",
      status: "pending",
      producer: "Finance Team",
      consumer: "Executive Dashboard",
      sla: "24h refresh",
      lastUpdated: "2024-01-14",
      description: "Monthly and quarterly financial reports contract",
    },
    {
      id: 3,
      name: "Marketing Campaign Contract",
      version: "v3.0",
      status: "violated",
      producer: "Marketing Team",
      consumer: "ML Platform",
      sla: "Real-time",
      lastUpdated: "2024-01-13",
      description: "Campaign performance and attribution data contract",
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "violated":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "violated":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Data Contracts</h1>
                <p className="text-muted-foreground">
                  Manage data contracts and service level agreements between data producers and consumers
                </p>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                New Contract
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Contract Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">12</div>
                    <div className="text-sm text-muted-foreground">Total Contracts</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">8</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">3</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">1</div>
                    <div className="text-sm text-muted-foreground">Violated</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search contracts..."
                        className="w-full pl-10"
                      />
                    </div>
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="violated">Violated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <Card key={contract.id} className="border-l-4 border-l-accent">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(contract.status)}
                              <h3 className="text-lg font-semibold">{contract.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {contract.version}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(contract.status)}`}>
                                {contract.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">
                              {contract.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="font-medium">Producer:</span> {contract.producer}
                              </div>
                              <div>
                                <span className="font-medium">Consumer:</span> {contract.consumer}
                              </div>
                              <div>
                                <span className="font-medium">SLA:</span> {contract.sla}
                              </div>
                              <div>
                                <span className="font-medium">Updated:</span> {contract.lastUpdated}
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}