import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GitBranch, Search, ArrowRight, Database, Settings, BarChart3, Bot } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

export default function Lineage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const lineageData = [
    {
      id: 1,
      source: {
        name: "Customer Database",
        type: "database",
        icon: Database,
      },
      target: {
        name: "Customer Analytics API",
        type: "api_outputs",
        icon: Settings,
      },
      transformations: ["Data cleaning", "Aggregation", "Schema mapping"],
      frequency: "Real-time",
      lastRun: "2024-01-15 14:30",
      status: "active",
    },
    {
      id: 2,
      source: {
        name: "Sales Data Pipeline",
        type: "api_outputs",
        icon: Settings,
      },
      target: {
        name: "Executive Dashboard",
        type: "dashboard_selfservice",
        icon: BarChart3,
      },
      transformations: ["Metric calculation", "Time aggregation"],
      frequency: "Daily",
      lastRun: "2024-01-15 06:00",
      status: "active",
    },
    {
      id: 3,
      source: {
        name: "Marketing Events",
        type: "database",
        icon: Database,
      },
      target: {
        name: "Campaign Optimization Bot",
        type: "ai_agents",
        icon: Bot,
      },
      transformations: ["Feature engineering", "Model preprocessing"],
      frequency: "Hourly",
      lastRun: "2024-01-15 13:00",
      status: "error",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "deprecated":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
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
                <h1 className="text-3xl font-bold tracking-tight">Data Lineage</h1>
                <p className="text-muted-foreground">
                  Track data flow and dependencies across your data ecosystem
                </p>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <GitBranch className="mr-2 h-4 w-4" />
                Analyze Impact
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="h-5 w-5" />
                  Data Flow Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">24</div>
                    <div className="text-sm text-muted-foreground">Total Connections</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">18</div>
                    <div className="text-sm text-muted-foreground">Active Flows</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-muted-foreground">Data Sources</div>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">3</div>
                    <div className="text-sm text-muted-foreground">Issues Found</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search data flows..."
                        className="w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {lineageData
                    .filter((flow) => {
                      const matchesSearch = searchQuery === "" || 
                        flow.source.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        flow.target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        flow.transformations.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
                      
                      const matchesStatus = statusFilter === "all" || flow.status === statusFilter;
                      
                      return matchesSearch && matchesStatus;
                    })
                    .map((flow) => (
                    <Card key={flow.id} className="border-l-4 border-l-accent">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className={`text-xs ${getStatusColor(flow.status)}`}>
                            {flow.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Last run: {flow.lastRun}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <flow.source.icon className="h-6 w-6 text-accent" />
                              <div>
                                <div className="font-medium">{flow.source.name}</div>
                                <div className="text-xs text-muted-foreground">{flow.source.type}</div>
                              </div>
                            </div>
                            
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                            
                            <div className="flex items-center space-x-2">
                              <flow.target.icon className="h-6 w-6 text-accent" />
                              <div>
                                <div className="font-medium">{flow.target.name}</div>
                                <div className="text-xs text-muted-foreground">{flow.target.type}</div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm font-medium">{flow.frequency}</div>
                            <div className="text-xs text-muted-foreground">
                              {flow.transformations.length} transformations
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-3 pt-3 border-t border-muted">
                          <div className="text-xs text-muted-foreground">
                            <span className="font-medium">Transformations:</span>{" "}
                            {flow.transformations.join(", ")}
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