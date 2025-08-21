import { useQuery } from "@tanstack/react-query";
import { Heart, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useLocation } from "wouter";
import CompactProductCard from "@/components/catalog/compact-product-card";
import type { DataProduct, UserFavorite } from "@shared/schema";

export default function Favorites() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const userEmail = "user@example.com"; // Default user for demo

  // Fetch user favorites
  const { data: favorites = [], isLoading: favoritesLoading } = useQuery({
    queryKey: ['/api/favorites', userEmail],
    queryFn: async () => {
      const response = await fetch(`/api/favorites/${userEmail}`);
      return response.json();
    },
  });

  // Fetch all products to get details for favorited products
  const { data: allProducts = [], isLoading: productsLoading } = useQuery<DataProduct[]>({
    queryKey: ['/api/data-products'],
  });

  // Get products that are favorited
  const favoriteProductIds = favorites.map((fav: UserFavorite) => fav.productId);
  const favoriteProducts = allProducts.filter((product: DataProduct) => 
    favoriteProductIds.includes(product.id)
  );

  // Filter products based on search
  const filteredProducts = favoriteProducts.filter((product: DataProduct) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isLoading = favoritesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Meus Favoritos</h1>
            <p className="text-gray-600">Produtos que você marcou como favoritos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-40 bg-gray-100 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Heart className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Meus Favoritos</h1>
              <p className="text-gray-600">
                {favoriteProducts.length} {favoriteProducts.length === 1 ? 'produto favoritado' : 'produtos favoritados'}
              </p>
            </div>
          </div>

          {/* Search */}
          {favoriteProducts.length > 0 && (
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar nos favoritos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
        </div>

        {/* Content */}
        {favoriteProducts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <CardTitle className="text-xl text-gray-900 mb-2">
                Nenhum produto favoritado ainda
              </CardTitle>
              <p className="text-gray-600 mb-6">
                Explore o catálogo e marque produtos como favoritos para encontrá-los aqui rapidamente.
              </p>
              <Button onClick={() => setLocation("/catalog")} className="bg-accent hover:bg-accent/90">
                Explorar Catálogo
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Results count */}
            {searchQuery && (
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  {searchQuery && ` para "${searchQuery}"`}
                </p>
              </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <CompactProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : searchQuery ? (
              <Card className="text-center py-8">
                <CardContent>
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">
                    Nenhum favorito encontrado para "{searchQuery}"
                  </p>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSearchQuery("")}
                    className="mt-2"
                  >
                    Limpar busca
                  </Button>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </div>
    </div>
  );
}