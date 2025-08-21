import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import type { DataProduct } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import CompactStats from "@/components/catalog/compact-stats";
import AdvancedFilters from "@/components/catalog/advanced-filters";
import CompactProductCard from "@/components/catalog/compact-product-card";
import ProductTable from "@/components/catalog/product-table";
import EnhancedAddProductModal from "@/components/catalog/enhanced-add-product-modal";
import PendingNotifications from "@/components/catalog/pending-notifications";
import RecentChangesModal from "@/pages/recent-changes";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Plus, Bookmark, History } from "lucide-react";

export default function Catalog() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRecentChangesOpen, setIsRecentChangesOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 12 : 20;

  const { data: allProducts = [], isLoading } = useQuery<DataProduct[]>({
    queryKey: ["/api/data-products"],
  });

  const { data: userFavorites = [] } = useQuery({
    queryKey: ["/api/favorites", "user@example.com"],
    queryFn: () => fetch("/api/favorites/user@example.com").then(res => res.json()),
  });

  // Get favorite product IDs - ensure userFavorites is an array
  const favoriteProductIds = Array.isArray(userFavorites) 
    ? userFavorites.map((fav: any) => fav.productId) 
    : [];

  // Filter products based on selected criteria
  const filteredProducts = allProducts.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      product.owner.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedTypes.length === 0 || selectedTypes.includes(product.type);
    const matchesDomain = selectedDomains.length === 0 || selectedDomains.includes(product.domain);
    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(product.status);
    const matchesFavorites = !showOnlyFavorites || favoriteProductIds.includes(product.id);

    return matchesSearch && matchesType && matchesDomain && matchesStatus && matchesFavorites;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handleFiltersChange = (filters: {
    types: string[];
    domains: string[];
    statuses: string[];
    owners: string[];
    tags: string[];
  }) => {
    setSelectedTypes(filters.types);
    setSelectedDomains(filters.domains);
    setSelectedStatuses(filters.statuses);
    setSelectedOwners(filters.owners);
    setSelectedTags(filters.tags);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedTypes([]);
    setSelectedDomains([]);
    setSelectedStatuses([]);
    setSelectedOwners([]);
    setSelectedTags([]);
    setShowOnlyFavorites(false);
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="space-y-6">
            {/* Header with Compact Stats */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Catálogo de Portfólio Analytics</h1>
                  <p className="text-gray-600">Consulte ou inclua a solução que entrega valor e é entregue pelos times de Analytics</p>
                </div>
                <div className="flex items-center space-x-3">
                  <Button 
                    variant={showOnlyFavorites ? "default" : "outline"} 
                    size="sm" 
                    onClick={() => {
                      setShowOnlyFavorites(!showOnlyFavorites);
                      setCurrentPage(1);
                    }}
                  >
                    <Bookmark className="h-4 w-4 mr-2" />
                    {showOnlyFavorites ? "Todos" : "Favoritos"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsRecentChangesOpen(true)}>
                    <History className="h-4 w-4 mr-2" />
                    Recentes
                  </Button>
                  <Button onClick={() => setIsAddModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </div>
              </div>
              
              <CompactStats onFilterChange={(filter) => {
                if (filter.status) {
                  setSelectedStatuses([filter.status]);
                } else {
                  setSelectedStatuses([]);
                }
              }} />
            </div>
            
            <PendingNotifications />
            
            {/* Advanced Filters */}
            <AdvancedFilters
              searchQuery={searchQuery}
              selectedTypes={selectedTypes}
              selectedDomains={selectedDomains}
              selectedStatuses={selectedStatuses}
              selectedOwners={selectedOwners}
              selectedTags={selectedTags}
              onSearchChange={handleSearchChange}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
            />

            {/* View Toggle and Results Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Products Display */}
            {isLoading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Carregando produtos...</div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Nenhum produto encontrado</div>
                <p className="text-sm text-gray-400 mt-1">
                  Tente ajustar os filtros ou termos de busca
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {currentProducts.map((product) => (
                  <CompactProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <ProductTable products={currentProducts} />
            )}

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Anterior
                </Button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Próximo
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {isAddModalOpen && (
        <EnhancedAddProductModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
        />
      )}

      <RecentChangesModal
        open={isRecentChangesOpen}
        onOpenChange={setIsRecentChangesOpen}
      />
    </div>
  );
}