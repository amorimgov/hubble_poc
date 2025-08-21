import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Edit, Eye, Download, FileText, Video, Code } from "lucide-react";
import Sidebar from "@/components/layout/sidebar";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const documentations = [
    {
      id: 1,
      title: "API Gateway Integration Guide",
      type: "guide",
      category: "API Documentation",
      version: "v2.1",
      author: "João Silva",
      lastUpdated: "2024-01-15",
      views: 1250,
      status: "current",
      description: "Complete guide for integrating with our API Gateway, including authentication, rate limiting, and best practices.",
      tags: ["api", "integration", "authentication"],
    },
    {
      id: 2,
      title: "Data Model Schema",
      type: "schema",
      category: "Technical Reference",
      version: "v3.0",
      author: "Maria Santos",
      lastUpdated: "2024-01-12",
      views: 890,
      status: "current",
      description: "Comprehensive schema documentation for all data models used across the platform.",
      tags: ["schema", "data-model", "reference"],
    },
    {
      id: 3,
      title: "Dashboard Configuration Tutorial",
      type: "tutorial",
      category: "User Guide",
      version: "v1.5",
      author: "Pedro Costa",
      lastUpdated: "2024-01-10",
      views: 650,
      status: "current",
      description: "Step-by-step tutorial for creating and configuring custom dashboards.",
      tags: ["dashboard", "tutorial", "configuration"],
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "guide":
        return <BookOpen className="h-4 w-4" />;
      case "tutorial":
        return <Video className="h-4 w-4" />;
      case "schema":
        return <Code className="h-4 w-4" />;
      case "reference":
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "current":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "deprecated":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      case "draft":
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
                <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
                <p className="text-muted-foreground">
                  Comprehensive documentation for data products, APIs, and user guides
                </p>
              </div>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Edit className="mr-2 h-4 w-4" />
                Create Doc
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Documentation Library
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-accent/10 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-accent">48</div>
                    <div className="text-sm text-muted-foreground">Total Documents</div>
                  </div>
                  <div className="bg-green-100 dark:bg-green-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">42</div>
                    <div className="text-sm text-muted-foreground">Current</div>
                  </div>
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">5.2k</div>
                    <div className="text-sm text-muted-foreground">Total Views</div>
                  </div>
                  <div className="bg-yellow-100 dark:bg-yellow-900/20 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">6</div>
                    <div className="text-sm text-muted-foreground">Need Updates</div>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search documentation..."
                        className="w-full pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="API Documentation">API Documentation</SelectItem>
                      <SelectItem value="User Guide">User Guide</SelectItem>
                      <SelectItem value="Technical Reference">Technical Reference</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  {documentations
                    .filter((doc) => {
                      const matchesSearch = searchQuery === "" || 
                        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
                        doc.author.toLowerCase().includes(searchQuery.toLowerCase());
                      
                      const matchesCategory = categoryFilter === "all" || doc.category === categoryFilter;
                      
                      return matchesSearch && matchesCategory;
                    })
                    .map((doc) => (
                    <Card key={doc.id} className="border-l-4 border-l-accent">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              {getTypeIcon(doc.type)}
                              <h3 className="text-lg font-semibold">{doc.title}</h3>
                              <Badge variant="outline" className="text-xs">
                                {doc.version}
                              </Badge>
                              <Badge className={`text-xs ${getStatusColor(doc.status)}`}>
                                {doc.status}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm mb-3">
                              {doc.description}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="font-medium">Category:</span> {doc.category}
                              </div>
                              <div>
                                <span className="font-medium">Author:</span> {doc.author}
                              </div>
                              <div>
                                <span className="font-medium">Views:</span> {doc.views}
                              </div>
                              <div>
                                <span className="font-medium">Updated:</span> {doc.lastUpdated}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4" />
                            </Button>
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