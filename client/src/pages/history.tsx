import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { History, Search, GitCommit, Edit, Plus, Trash2, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Sidebar from "@/components/layout/sidebar";

export default function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const historyEntries = [
    {
      id: 1,
      action: "created",
      productName: "Customer Analytics Dashboard",
      description: "Created new dashboard product for customer analytics",
      user: "João Silva",
      userInitials: "JS",
      timestamp: new Date("2024-01-15T14:30:00"),
      version: "v1.0",
      changes: {
        added: ["Initial dashboard configuration", "Customer metrics widgets"],
        modified: [],
        removed: [],
      },
    },
    {
      id: 2,
      action: "updated",
      productName: "Sales API Gateway",
      description: "Updated API endpoints and authentication method",
      user: "Maria Santos",
      userInitials: "MS",
      timestamp: new Date("2024-01-15T10:15:00"),
      version: "v2.1",
      changes: {
        added: ["OAuth2 authentication", "Rate limiting configuration"],
        modified: ["Endpoint documentation", "Error handling"],
        removed: ["Basic auth support"],
      },
    },
    {
      id: 3,
      action: "deleted",
      productName: "Legacy Customer Data Pipeline",
      description: "Removed deprecated data pipeline",
      user: "Pedro Costa",
      userInitials: "PC",
      timestamp: new Date("2024-01-14T16:45:00"),
      version: "v1.5",
      changes: {
        added: [],
        modified: [],
        removed: ["Entire pipeline configuration", "Related documentation"],
      },
    },
  ];

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="h-4 w-4 text-green-600" />;
      case "updated":
        return <Edit className="h-4 w-4 text-blue-600" />;
      case "deleted":
        return <Trash2 className="h-4 w-4 text-red-600" />;
      case "restored":
        return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      default:
        return <GitCommit className="h-4 w-4 text-gray-600" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "updated":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "deleted":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "restored":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
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
                <h1 className="text-3xl font-bold tracking-tight">History</h1>
                <p className="text-muted-foreground">
                  Track all changes and modifications to data products across the platform
                </p>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">156</div>
                    <div className="text-sm text-muted-foreground">Total Changes</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">24</div>
                    <div className="text-sm text-muted-foreground">This Week</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">12</div>
                    <div className="text-sm text-muted-foreground">Contributors</div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">5</div>
                    <div className="text-sm text-muted-foreground">Today</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search history..."
                        className="w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Actions</SelectItem>
                      <SelectItem value="created">Created</SelectItem>
                      <SelectItem value="updated">Updated</SelectItem>
                      <SelectItem value="deleted">Deleted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {historyEntries
                    .filter((entry) => {
                      const matchesSearch = searchQuery === "" || 
                        entry.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        entry.user.toLowerCase().includes(searchQuery.toLowerCase());
                      
                      const matchesAction = actionFilter === "all" || entry.action === actionFilter;
                      
                      return matchesSearch && matchesAction;
                    })
                    .map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-accent">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                              {getActionIcon(entry.action)}
                            </div>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold">{entry.productName}</h3>
                              <Badge className={`text-xs ${getActionColor(entry.action)}`}>
                                {entry.action}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                {entry.version}
                              </Badge>
                            </div>
                            
                            <p className="text-muted-foreground text-sm mb-3">
                              {entry.description}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                              {entry.changes.added.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-green-600">Added:</span>
                                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                                    {entry.changes.added.map((item, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="text-green-500 mr-1">+</span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {entry.changes.modified.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-blue-600">Modified:</span>
                                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                                    {entry.changes.modified.map((item, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="text-blue-500 mr-1">~</span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {entry.changes.removed.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-red-600">Removed:</span>
                                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                                    {entry.changes.removed.map((item, i) => (
                                      <li key={i} className="flex items-start">
                                        <span className="text-red-500 mr-1">-</span>
                                        {item}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center space-x-2">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback className="text-xs">
                                    {entry.userInitials}
                                  </AvatarFallback>
                                </Avatar>
                                <span>{entry.user}</span>
                              </div>
                              <span>
                                {formatDistanceToNow(entry.timestamp, { 
                                  addSuffix: true, 
                                  locale: ptBR 
                                })}
                              </span>
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