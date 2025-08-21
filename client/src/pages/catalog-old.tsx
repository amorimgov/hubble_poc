import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DataProduct } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import CompactStats from "@/components/catalog/compact-stats";
import AdvancedFilters from "@/components/catalog/advanced-filters";
import CompactProductCard from "@/components/catalog/compact-product-card";
import ProductTable from "@/components/catalog/product-table";
import EnhancedAddProductModal from "@/components/catalog/enhanced-add-product-modal";
import PendingNotifications from "@/components/catalog/pending-notifications";
import { Button } from "@/components/ui/button";
import { Grid3X3, List, Plus, Bookmark, History } from "lucide-react";

export default function Catalog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedDomains, setSelectedDomains] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === "grid" ? 12 : 20;

  const { data: allProducts = [], isLoading } = useQuery<DataProduct[]>({
    queryKey: ["/api/data-products"],
  });

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

    return matchesSearch && matchesType && matchesDomain && matchesStatus;
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
    setCurrentPage(1);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="space-y-6">
            <Header onAddProduct={() => setIsAddModalOpen(true)} />
            
            <PendingNotifications />
            
            <SearchFilters
              searchQuery={searchQuery}
              typeFilter={typeFilter}
              domainFilter={domainFilter}
              statusFilter={statusFilter}
              viewMode={viewMode}
              onSearch={handleSearch}
              onFiltersChange={handleFilters}
              onViewModeChange={setViewMode}
            />

            <StatsSummary />

            {/* Products Grid */}
            <div className={`${
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
            }`}>
              {isLoading ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-500">Carregando produtos...</div>
                </div>
              ) : currentProducts.length === 0 ? (
                <div className="col-span-full text-center py-8">
                  <div className="text-gray-500">Nenhum produto encontrado</div>
                </div>
              ) : (
                currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} viewMode={viewMode} />
                ))
              )}
            </div>

            {/* Pagination */}
            {products.length > itemsPerPage && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-8 rounded-lg">
                <div className="flex flex-1 justify-between sm:hidden">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Próximo
                  </Button>
                </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{startIndex + 1}</span> até{" "}
                    <span className="font-medium">{Math.min(endIndex, products.length)}</span> de{" "}
                    <span className="font-medium">{products.length}</span> resultados
                  </p>
                </div>
                <div>
                  <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="rounded-r-none"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="rounded-none"
                        >
                          {page}
                        </Button>
                      );
                    })}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-l-none"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </nav>
                </div>
              </div>
            </div>
          )}
          </div>
        </div>
      </main>

      <EnhancedAddProductModal 
        open={isAddModalOpen} 
        onOpenChange={setIsAddModalOpen} 
      />
    </div>
  );
}
